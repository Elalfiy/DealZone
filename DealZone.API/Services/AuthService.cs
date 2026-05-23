using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using DealZone.API.Data;
using DealZone.API.DTOs;
using DealZone.API.Helpers;
using DealZone.API.Models;
using DealZone.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace DealZone.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly JwtSettings _jwtSettings;
        private readonly KycFileStorageService _kycStorage;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            ApplicationDbContext context,
            IOptions<JwtSettings> jwtSettings,
            KycFileStorageService kycStorage,
            ILogger<AuthService> logger)
        {
            _context = context;
            _jwtSettings = jwtSettings.Value;
            _kycStorage = kycStorage;
            _logger = logger;
        }

        public Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
            => RegisterAsync(request, null);

        public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request, IFormFile? kycDocument)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var email = request.Email.Trim().ToLowerInvariant();
                if (await _context.Users.AnyAsync(u => u.Email.ToLower() == email))
                    throw new ApplicationException("البريد الإلكتروني مسجل مسبقاً. الرجاء تسجيل الدخول.");

                var role = NormalizeRole(request.Role, request.Type);
                var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, workFactor: 12);

                var user = new User
                {
                    Email = email,
                    PasswordHash = passwordHash,
                    Role = role,
                    Phone = request.Phone,
                    FirstName = "User",
                    LastName = "DealZone",
                    IsVerified = role.Equals("Admin", StringComparison.OrdinalIgnoreCase),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                Company? company = null;
                var needsCompany = !string.IsNullOrWhiteSpace(request.CompanyName)
                    || role.Equals("Supplier", StringComparison.OrdinalIgnoreCase)
                    || role.Equals("Manufacturer", StringComparison.OrdinalIgnoreCase);

                if (needsCompany)
                {
                    company = new Company
                    {
                        UserId = user.Id,
                        Name = string.IsNullOrWhiteSpace(request.CompanyName)
                            ? $"{request.Email.Split('@')[0]} Company"
                            : request.CompanyName.Trim(),
                        TaxNumber = request.TaxNumber?.Trim(),
                        Address = string.IsNullOrWhiteSpace(request.Address) ? null : request.Address.Trim(),
                        KycStatus = "PendingApproval",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    _context.Companies.Add(company);
                    await _context.SaveChangesAsync();
                    user.Company = company;
                }

                var file = kycDocument ?? request.BusinessLicense ?? request.KycDocument;
                if (file != null && file.Length > 0)
                {
                    if (company == null)
                    {
                        company = new Company
                        {
                            UserId = user.Id,
                            Name = string.IsNullOrWhiteSpace(request.CompanyName)
                                ? $"{request.Email.Split('@')[0]} Company"
                                : request.CompanyName!.Trim(),
                            TaxNumber = request.TaxNumber?.Trim(),
                            Address = request.Address?.Trim(),
                            KycStatus = "PendingApproval",
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };
                        _context.Companies.Add(company);
                        await _context.SaveChangesAsync();
                        user.Company = company;
                    }

                    await _kycStorage.SaveForCompanyAsync(company.Id, file, "business_license");
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
                await transaction.CommitAsync();

                _logger.LogInformation("User registered: {Email} as {Role}", email, role);

                return new AuthResponseDto
                {
                    Success = true,
                    Message = "تم التسجيل بنجاح",
                    Token = token,
                    RefreshToken = refreshToken,
                    User = MapUserProfile(user),
                    Data = new AuthDataDto
                    {
                        Token = token,
                        RefreshToken = refreshToken,
                        User = MapUserDto(user)
                    }
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Registration failed for {Email}", request.Email);
                throw;
            }
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
        {
            var email = request.Email.Trim().ToLowerInvariant();
            var user = await _context.Users.Include(u => u.Company)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                throw new ApplicationException("البريد الإلكتروني أو كلمة المرور غير صحيحة");

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

            return new AuthResponseDto
            {
                Success = true,
                Message = "تم تسجيل الدخول بنجاح",
                Token = token,
                RefreshToken = refreshToken,
                User = MapUserProfile(user),
                Data = new AuthDataDto
                {
                    Token = token,
                    RefreshToken = refreshToken,
                    User = MapUserDto(user)
                }
            };
        }

        public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
        {
            var tokenEntry = await _context.RefreshTokens.Include(t => t.User).ThenInclude(u => u.Company)
                .FirstOrDefaultAsync(t => t.Token == refreshToken && !t.Revoked);

            if (tokenEntry == null || tokenEntry.ExpiresAt < DateTime.UtcNow)
                throw new ApplicationException("Refresh token is invalid or expired.");

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

            return new AuthResponseDto
            {
                Success = true,
                Token = newToken,
                RefreshToken = newRefreshToken,
                User = MapUserProfile(user),
                Data = new AuthDataDto
                {
                    Token = newToken,
                    RefreshToken = newRefreshToken,
                    User = MapUserDto(user)
                }
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
            }
        }

        private static string NormalizeRole(string? role, string? type)
        {
            var value = (role ?? type ?? "Buyer").Trim();
            if (value.Equals("manufacturer", StringComparison.OrdinalIgnoreCase))
                return "Manufacturer";
            if (value.Equals("supplier", StringComparison.OrdinalIgnoreCase))
                return "Supplier";
            if (value.Equals("admin", StringComparison.OrdinalIgnoreCase))
                return "Admin";
            if (value.Equals("buyer", StringComparison.OrdinalIgnoreCase))
                return "Buyer";
            if (value.Equals("Manufacturer", StringComparison.OrdinalIgnoreCase)
                || value.Equals("Supplier", StringComparison.OrdinalIgnoreCase)
                || value.Equals("Admin", StringComparison.OrdinalIgnoreCase)
                || value.Equals("Buyer", StringComparison.OrdinalIgnoreCase))
                return value;
            return "Buyer";
        }

        private string GenerateJwtToken(User user)
        {
            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new(JwtRegisteredClaimNames.Email, user.Email),
                new(ClaimTypes.Role, user.Role),
                new("userId", user.Id.ToString()),
                new("email", user.Email),
                new("role", user.Role)
            };

            if (user.Company != null)
                claims.Add(new Claim("companyId", user.Company.Id.ToString()));

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static string GenerateRefreshToken()
            => Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

        private static UserProfileDto MapUserProfile(User user) => new()
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Phone = user.Phone,
            Role = user.Role,
            IsVerified = user.IsVerified,
            Company = user.Company == null ? null : new CompanyDto
            {
                Id = user.Company.Id,
                UserId = user.Company.UserId,
                Name = user.Company.Name,
                TaxNumber = user.Company.TaxNumber,
                Address = user.Company.Address,
                LogoUrl = user.Company.LogoUrl,
                KycStatus = user.Company.KycStatus,
                CreatedAt = user.Company.CreatedAt
            }
        };

        private static UserDto MapUserDto(User user) => new()
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName ?? "User",
            LastName = user.LastName ?? "DealZone",
            Role = user.Role,
            IsVerified = user.IsVerified,
            Phone = user.Phone,
            Status = user.IsVerified ? "Verified" : "PendingApproval"
        };
    }
}
