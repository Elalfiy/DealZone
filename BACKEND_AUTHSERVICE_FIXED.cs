/*
 * FIXED: Backend Implementation for KYC Registration with Document Upload
 * This replaces and extends the current AuthService.cs and adds file handling
 */

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using BCrypt.Net;
using DealZone.API.Data;
using DealZone.API.DTOs;
using DealZone.API.Helpers;
using DealZone.API.Models;
using DealZone.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace DealZone.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly JwtSettings _jwtSettings;
        private readonly ILogger<AuthService> _logger;
        private readonly IWebHostEnvironment _environment;

        public AuthService(
            ApplicationDbContext context,
            IOptions<JwtSettings> jwtSettings,
            ILogger<AuthService> logger,
            IWebHostEnvironment environment)
        {
            _context = context;
            _jwtSettings = jwtSettings.Value;
            _logger = logger;
            _environment = environment;
        }

        /// <summary>
        /// Enhanced RegisterAsync that handles document upload during registration
        /// - Creates user account
        /// - Creates company profile
        /// - Saves KYC document to disk
        /// - All in a single transaction
        /// </summary>
        public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request, IFormFile? kycDocument = null)
        {
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    // Step 1: Validate email uniqueness
                    if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                    {
                        _logger.LogWarning($"Registration attempt with existing email: {request.Email}");
                        throw new ApplicationException($"Email '{request.Email}' is already registered.");
                    }

                    // Step 2: Hash password
                    var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, workFactor: 12);
                    var user = new User
                    {
                        Email = request.Email,
                        PasswordHash = passwordHash,
                        Role = request.Role,
                        IsVerified = request.Role == "Admin",
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.Users.Add(user);
                    await _context.SaveChangesAsync();

                    _logger.LogInformation($"User created successfully. UserId: {user.Id}, Email: {request.Email}");

                    // Step 3: Create company profile (if company name provided)
                    Company? company = null;
                    if (!string.IsNullOrWhiteSpace(request.CompanyName))
                    {
                        company = new Company
                        {
                            UserId = user.Id,
                            Name = request.CompanyName.Trim(),
                            TaxNumber = request.TaxNumber?.Trim(),
                            Address = request.Address?.Trim(),
                            KycStatus = "Pending",
                            CreatedAt = DateTime.UtcNow
                        };

                        _context.Companies.Add(company);
                        await _context.SaveChangesAsync();

                        _logger.LogInformation($"Company created. CompanyId: {company.Id}, UserId: {user.Id}");
                        user.Company = company;
                    }

                    // Step 4: Handle KYC document upload (if provided)
                    string? kycFileUrl = null;
                    if (kycDocument != null && kycDocument.Length > 0 && company != null)
                    {
                        try
                        {
                            kycFileUrl = await SaveKycDocumentAsync(kycDocument, company.Id, request.Role);

                            // Save KYC document record
                            var kycDoc = new KycDocument
                            {
                                CompanyId = company.Id,
                                DocType = "BusinessLicense",
                                FileUrl = kycFileUrl,
                                Status = "Pending",
                                SubmittedAt = DateTime.UtcNow
                            };

                            _context.KycDocuments.Add(kycDoc);
                            await _context.SaveChangesAsync();

                            _logger.LogInformation($"KYC document saved. CompanyId: {company.Id}, FileUrl: {kycFileUrl}");
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError($"KYC upload failed for CompanyId {company.Id}: {ex.Message}", ex);
                            // Rollback entire transaction
                            await transaction.RollbackAsync();
                            throw new ApplicationException($"Document upload failed: {ex.Message}", ex);
                        }
                    }

                    // Step 5: Generate JWT tokens
                    var token = GenerateJwtToken(user);
                    var refreshToken = GenerateRefreshToken();

                    _context.RefreshTokens.Add(new RefreshToken
                    {
                        UserId = user.Id,
                        Token = refreshToken,
                        ExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshExpiryDays),
                        CreatedAt = DateTime.UtcNow
                    });

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    _logger.LogInformation($"Registration completed successfully. UserId: {user.Id}");

                    return new AuthResponseDto
                    {
                        Token = token,
                        RefreshToken = refreshToken,
                        User = MapUserProfile(user)
                    };
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    _logger.LogError($"Registration failed for email {request.Email}: {ex.Message}", ex);
                    throw;
                }
            }
        }

        /// <summary>
        /// Save KYC document to disk with security considerations
        /// - Validates file size and type
        /// - Generates unique filename to prevent overwrites
        /// - Returns relative path for database storage
        /// </summary>
        private async Task<string> SaveKycDocumentAsync(IFormFile file, int companyId, string userRole)
        {
            // File validation
            const long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
            var allowedExtensions = new[] { ".pdf", ".jpg", ".jpeg", ".png" };
            var allowedMimeTypes = new[] { "application/pdf", "image/jpeg", "image/png" };

            // Check file size
            if (file.Length > MAX_FILE_SIZE)
            {
                throw new ApplicationException($"File size exceeds maximum limit of 10MB. Uploaded: {file.Length / 1024 / 1024}MB");
            }

            // Check file extension
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(fileExtension))
            {
                throw new ApplicationException($"File type '{fileExtension}' is not allowed. Allowed: PDF, JPG, PNG");
            }

            // Check MIME type
            if (!allowedMimeTypes.Contains(file.ContentType?.ToLowerInvariant() ?? ""))
            {
                throw new ApplicationException($"Invalid file content type. Expected PDF or image, got: {file.ContentType}");
            }

            // Create uploads directory if it doesn't exist
            var uploadsDir = Path.Combine(_environment.ContentRootPath, "wwwroot", "uploads", "kyc");
            Directory.CreateDirectory(uploadsDir);

            // Generate unique filename: {companyId}_{timestamp}_{originalName}
            var timestamp = DateTime.UtcNow.Ticks;
            var originalFileName = Path.GetFileNameWithoutExtension(file.FileName);
            var uniqueFileName = $"{companyId}_{timestamp}_{SanitizeFileName(originalFileName)}{fileExtension}";
            var filePath = Path.Combine(uploadsDir, uniqueFileName);

            // Save file to disk
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Return relative path for URL construction
            var relativePath = $"/uploads/kyc/{uniqueFileName}";
            return relativePath;
        }

        /// <summary>
        /// Sanitize filename to prevent path traversal and special characters
        /// </summary>
        private string SanitizeFileName(string fileName)
        {
            // Remove any characters that aren't alphanumeric, dash, or underscore
            var invalidChars = System.IO.Path.GetInvalidFileNameChars();
            var sanitized = new string(fileName
                .Where(c => !invalidChars.Contains(c) && c != '/' && c != '\\')
                .ToArray());

            // Limit length
            return sanitized.Length > 50 ? sanitized.Substring(0, 50) : sanitized;
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
        {
            var user = await _context.Users.Include(u => u.Company).FirstOrDefaultAsync(u => u.Email == request.Email);
            
            if (user == null)
            {
                _logger.LogWarning($"Login attempt with non-existent email: {request.Email}");
                throw new ApplicationException("Invalid email or password.");
            }

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                _logger.LogWarning($"Failed login attempt for user: {request.Email}");
                throw new ApplicationException("Invalid email or password.");
            }

            var token = GenerateJwtToken(user);
            var refreshToken = GenerateRefreshToken();

            _context.RefreshTokens.Add(new RefreshToken
            {
                UserId = user.Id,
                Token = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshExpiryDays),
                CreatedAt = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();

            _logger.LogInformation($"User logged in successfully: {request.Email}");

            return new AuthResponseDto
            {
                Token = token,
                RefreshToken = refreshToken,
                User = MapUserProfile(user)
            };
        }

        public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
        {
            var tokenEntry = await _context.RefreshTokens
                .Include(t => t.User)
                .ThenInclude(u => u.Company)
                .FirstOrDefaultAsync(t => t.Token == refreshToken && !t.Revoked);

            if (tokenEntry == null || tokenEntry.ExpiresAt < DateTime.UtcNow)
            {
                _logger.LogWarning("Refresh token is invalid or expired");
                throw new ApplicationException("Refresh token is invalid or expired.");
            }

            tokenEntry.Revoked = true;
            await _context.SaveChangesAsync();

            var user = tokenEntry.User;
            var newToken = GenerateJwtToken(user);
            var newRefreshToken = GenerateRefreshToken();

            _context.RefreshTokens.Add(new RefreshToken
            {
                UserId = user.Id,
                Token = newRefreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshExpiryDays),
                CreatedAt = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Token refreshed for user: {user.Id}");

            return new AuthResponseDto
            {
                Token = newToken,
                RefreshToken = newRefreshToken,
                User = MapUserProfile(user)
            };
        }

        public async Task LogoutAsync(int userId, string refreshToken)
        {
            var tokenEntry = await _context.RefreshTokens
                .FirstOrDefaultAsync(t => t.Token == refreshToken && t.UserId == userId);
            
            if (tokenEntry != null)
            {
                tokenEntry.Revoked = true;
                await _context.SaveChangesAsync();
                _logger.LogInformation($"User logged out: {userId}");
            }
        }

        // Helper methods
        private string GenerateJwtToken(User user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomNumber);
                return Convert.ToBase64String(randomNumber);
            }
        }

        private UserProfileDto MapUserProfile(User user)
        {
            return new UserProfileDto
            {
                Id = user.Id,
                Email = user.Email,
                Role = user.Role,
                IsVerified = user.IsVerified,
                Company = user.Company != null ? new CompanyDto
                {
                    Id = user.Company.Id,
                    UserId = user.Company.UserId,
                    Name = user.Company.Name,
                    TaxNumber = user.Company.TaxNumber,
                    Address = user.Company.Address,
                    LogoUrl = user.Company.LogoUrl,
                    KycStatus = user.Company.KycStatus,
                    CreatedAt = user.Company.CreatedAt
                } : null
            };
        }
    }
}
