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
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace DealZone.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly JwtSettings _jwtSettings;

        public AuthService(ApplicationDbContext context, IOptions<JwtSettings> jwtSettings)
        {
            _context = context;
            _jwtSettings = jwtSettings.Value;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                throw new ApplicationException("Email is already registered.");
            }

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, workFactor: 12);
            var user = new User
            {
                Email = request.Email,
                PasswordHash = passwordHash,
                Role = request.Role,
                IsVerified = request.Role == "Admin" ? true : false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            if (!string.IsNullOrWhiteSpace(request.CompanyName))
            {
                var company = new Company
                {
                    UserId = user.Id,
                    Name = request.CompanyName,
                    TaxNumber = request.TaxNumber,
                    Address = request.Address,
                    KycStatus = "PendingApproval",
                    CreatedAt = DateTime.UtcNow
                };

                _context.Companies.Add(company);
                await _context.SaveChangesAsync();
                user.Company = company;
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

            return new AuthResponseDto
            {
                Token = token,
                RefreshToken = refreshToken,
                User = MapUserProfile(user)
            };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
        {
            var user = await _context.Users.Include(u => u.Company).FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
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

            return new AuthResponseDto
            {
                Token = token,
                RefreshToken = refreshToken,
                User = MapUserProfile(user)
            };
        }

        public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
        {
            var tokenEntry = await _context.RefreshTokens.Include(t => t.User).ThenInclude(u => u.Company)
                .FirstOrDefaultAsync(t => t.Token == refreshToken && !t.Revoked);

            if (tokenEntry == null || tokenEntry.ExpiresAt < DateTime.UtcNow)
            {
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

            return new AuthResponseDto
            {
                Token = newToken,
                RefreshToken = newRefreshToken,
                User = MapUserProfile(user)
            };
        }

        public async Task LogoutAsync(int userId, string refreshToken)
        {
            var tokenEntry = await _context.RefreshTokens.FirstOrDefaultAsync(t => t.Token == refreshToken && t.UserId == userId);
            if (tokenEntry != null)
            {
                tokenEntry.Revoked = true;
                await _context.SaveChangesAsync();
            }
        }

        private string GenerateJwtToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("userId", user.Id.ToString()),
                new Claim("email", user.Email),
                new Claim("role", user.Role)
            };

            if (user.Company != null)
            {
                claims.Add(new Claim("companyId", user.Company.Id.ToString()));
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes);

            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: expires,
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string GenerateRefreshToken()
        {
            return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        }

        private UserProfileDto MapUserProfile(User user)
        {
            return new UserProfileDto
            {
                Id = user.Id,
                Email = user.Email,
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
        }
    }
}
