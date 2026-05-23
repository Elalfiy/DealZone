using DealZone.API.DTOs;
using DealZone.API.Helpers;
using DealZone.API.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DealZone.API.Controllers
{
    [ApiController]
    [Route("api/companies")]
    public class CompaniesController : ControllerBase
    {
        private readonly IUserService _userService;

        public CompaniesController(IUserService userService)
        {
            _userService = userService;
        }

        /// <summary>Public list of KYC-approved companies (suppliers &amp; manufacturers).</summary>
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetCompanies()
        {
            var companies = await _userService.GetApprovedCompaniesAsync();
            return Ok(new { success = true, data = companies });
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCompany(int id)
        {
            var company = await _userService.GetCompanyAsync(id);
            return Ok(new DealZone.API.Helpers.ApiResponse<CompanyDto> { Data = company });
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCompany(int id, [FromBody] CompanyUpdateDto request)
        {
            var company = await _userService.UpdateCompanyAsync(id, request);
            return Ok(new DealZone.API.Helpers.ApiResponse<CompanyDto> { Data = company });
        }

        [Authorize]
        [HttpPost("kyc/upload")]
        public async Task<IActionResult> UploadKyc([FromForm] IFormFile file, [FromForm] string docType)
        {
            if (file == null || file.Length == 0)
                return Ok(new { success = false, message = "لم يتم إرفاق ملف." });

            if (file.Length > 10 * 1024 * 1024)
                return Ok(new { success = false, message = "حجم الملف يجب أن يكون أقل من 10 ميجابايت." });

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(fileExtension))
                return Ok(new { success = false, message = "الملفات المسموحة: JPG, PNG, PDF, DOC." });

            var userId = User.GetUserId();
            if (userId == 0)
                return Ok(new { success = false, message = "يجب تسجيل الدخول أولاً." });

            try
            {
                var result = await _userService.UploadKycFileAsync(userId, file, docType);
                return Ok(new { success = true, message = result.Message, data = result });
            }
            catch (ApplicationException ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("kyc/status")]
        public async Task<IActionResult> GetKycStatus()
        {
            var userId = User.GetUserId();
            var result = await _userService.GetKycStatusAsync(userId);
            return Ok(new DealZone.API.Helpers.ApiResponse<KycStatusDto> { Data = result });
        }
    }
}
