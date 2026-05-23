using DealZone.API.Data;
using DealZone.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DealZone.API.Services;

/// <summary>
/// Saves KYC files to wwwroot/uploads/kyc and persists KycDocument rows.
/// </summary>
public class KycFileStorageService
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<KycFileStorageService> _logger;

    private static readonly string[] AllowedExtensions = { ".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx" };
    private static readonly string[] AllowedMimeTypes =
    {
        "application/pdf", "image/jpeg", "image/png", "image/jpg",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    };

    public KycFileStorageService(
        ApplicationDbContext context,
        IWebHostEnvironment environment,
        ILogger<KycFileStorageService> logger)
    {
        _context = context;
        _environment = environment;
        _logger = logger;
    }

    public async Task<KycDocument> SaveForCompanyAsync(int companyId, IFormFile file, string docType)
    {
        ValidateFile(file);

        var uploadsDir = Path.Combine(_environment.ContentRootPath, "wwwroot", "uploads", "kyc");
        Directory.CreateDirectory(uploadsDir);

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var safeName = SanitizeFileName(Path.GetFileNameWithoutExtension(file.FileName));
        var uniqueFileName = $"{companyId}_{DateTime.UtcNow.Ticks}_{safeName}{extension}";
        var physicalPath = Path.Combine(uploadsDir, uniqueFileName);

        await using (var stream = new FileStream(physicalPath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var relativePath = $"/uploads/kyc/{uniqueFileName}";
        var kycDoc = new KycDocument
        {
            CompanyId = companyId,
            DocType = string.IsNullOrWhiteSpace(docType) ? "business_license" : docType,
            FileUrl = relativePath,
            Status = "Pending",
            SubmittedAt = DateTime.UtcNow
        };

        _context.KycDocuments.Add(kycDoc);

        var company = await _context.Companies.FindAsync(companyId);
        if (company != null)
        {
            company.KycStatus = "PendingApproval";
            company.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation("KYC saved for company {CompanyId}: {Path}", companyId, relativePath);

        return kycDoc;
    }

    private static void ValidateFile(IFormFile file)
    {
        const long maxSize = 10 * 1024 * 1024;
        if (file.Length <= 0)
            throw new ApplicationException("الملف فارغ.");

        if (file.Length > maxSize)
            throw new ApplicationException("حجم الملف يتجاوز 10 ميجابايت.");

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(extension))
            throw new ApplicationException("نوع الملف غير مدعوم. المسموح: PDF, JPG, PNG, DOC.");

        var mime = file.ContentType?.ToLowerInvariant() ?? "";
        if (!string.IsNullOrEmpty(mime) && !AllowedMimeTypes.Contains(mime))
            throw new ApplicationException("نوع محتوى الملف غير مدعوم.");
    }

    private static string SanitizeFileName(string fileName)
    {
        var invalid = Path.GetInvalidFileNameChars();
        var cleaned = new string(fileName.Select(c => invalid.Contains(c) ? '_' : c).ToArray());
        return string.IsNullOrWhiteSpace(cleaned) ? "document" : cleaned;
    }
}
