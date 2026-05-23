using DealZone.API.Data;
using DealZone.API.DTOs;
using DealZone.API.Models;
using DealZone.API.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace DealZone.API.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;
        private readonly KycFileStorageService _kycStorage;

        public UserService(ApplicationDbContext context, KycFileStorageService kycStorage)
        {
            _context = context;
            _kycStorage = kycStorage;
        }

        public async Task<UserProfileDto> GetProfileAsync(int userId)
        {
            var user = await _context.Users.Include(u => u.Company).FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                throw new ApplicationException("المستخدم غير موجود.");

            return MapUser(user);
        }

        public async Task<UserProfileDto> UpdateProfileAsync(int userId, UserProfileUpdateDto request)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new ApplicationException("المستخدم غير موجود.");

            user.FirstName = request.FirstName ?? user.FirstName;
            user.LastName = request.LastName ?? user.LastName;
            user.Phone = request.Phone ?? user.Phone;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return MapUser(user);
        }

        public async Task<IEnumerable<CompanyDto>> GetApprovedCompaniesAsync()
        {
            return await _context.Companies
                .Include(c => c.User)
                .Where(c => c.KycStatus == "Approved" || c.KycStatus == "Verified")
                .OrderBy(c => c.Name)
                .Select(c => new CompanyDto
                {
                    Id = c.Id,
                    UserId = c.UserId,
                    Name = c.Name,
                    Address = c.Address,
                    TaxNumber = c.TaxNumber,
                    KycStatus = c.KycStatus,
                    CreatedAt = c.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<CompanyDto> GetCompanyAsync(int companyId)
        {
            var company = await _context.Companies.FindAsync(companyId);
            if (company == null)
                throw new ApplicationException("الشركة غير موجودة.");

            return MapCompany(company);
        }

        public async Task<CompanyDto> UpdateCompanyAsync(int companyId, CompanyUpdateDto request)
        {
            var company = await _context.Companies.FindAsync(companyId);
            if (company == null)
                throw new ApplicationException("الشركة غير موجودة.");

            company.Name = request.Name ?? company.Name;
            company.Address = request.Address ?? company.Address;
            company.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return MapCompany(company);
        }

        public async Task<KycStatusDto> UploadKycDocumentAsync(int userId, KycUploadDto request)
        {
            var company = await _context.Companies.FirstOrDefaultAsync(c => c.UserId == userId);
            if (company == null)
                throw new ApplicationException("لا توجد شركة مرتبطة بهذا المستخدم.");

            return new KycStatusDto
            {
                Status = company.KycStatus,
                Message = "تم استلام المستند.",
                UpdatedAt = DateTime.UtcNow
            };
        }

        public async Task<KycStatusDto> UploadKycFileAsync(int userId, IFormFile file, string docType)
        {
            var company = await _context.Companies.FirstOrDefaultAsync(c => c.UserId == userId);
            if (company == null)
                throw new ApplicationException("لا توجد شركة مرتبطة بهذا المستخدم. أكمل التسجيل أولاً.");

            await _kycStorage.SaveForCompanyAsync(company.Id, file, docType);

            return new KycStatusDto
            {
                Status = company.KycStatus,
                Message = "تم رفع المستند بنجاح.",
                UpdatedAt = DateTime.UtcNow
            };
        }

        public async Task<KycStatusDto> GetKycStatusAsync(int userId)
        {
            var company = await _context.Companies.FirstOrDefaultAsync(c => c.UserId == userId);
            return new KycStatusDto
            {
                Status = company?.KycStatus ?? "Pending",
                Message = company == null ? "لا توجد شركة." : "حالة التحقق",
                UpdatedAt = DateTime.UtcNow
            };
        }

        private static UserProfileDto MapUser(User user)
        {
            return new UserProfileDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Phone = user.Phone,
                Role = user.Role,
                IsVerified = user.IsVerified,
                Company = user.Company == null ? null : MapCompany(user.Company)
            };
        }

        private static CompanyDto MapCompany(Company company)
        {
            return new CompanyDto
            {
                Id = company.Id,
                UserId = company.UserId,
                Name = company.Name,
                Address = company.Address,
                TaxNumber = company.TaxNumber,
                KycStatus = company.KycStatus,
                CreatedAt = company.CreatedAt
            };
        }
    }
}
