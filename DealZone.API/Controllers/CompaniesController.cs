using DealZone.API.DTOs;
using DealZone.API.Helpers;
using DealZone.API.Services.Interfaces;
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

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCompany(int id)
        {
            var company = await _userService.GetCompanyAsync(id);
            return Ok(new ApiResponse<CompanyDto> { Data = company });
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCompany(int id, [FromBody] CompanyUpdateDto request)
        {
            var company = await _userService.UpdateCompanyAsync(id, request);
            return Ok(new ApiResponse<CompanyDto> { Data = company });
        }

        [Authorize]
        [HttpPost("kyc/upload")]
        public async Task<IActionResult> UploadKyc([FromForm] IFormFile file, [FromForm] string docType)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new ApiResponse<object> { Message = "No file provided." });

            // Validate file size (10MB max)
            if (file.Length > 10 * 1024 * 1024)
                return BadRequest(new ApiResponse<object> { Message = "File size must be less than 10MB." });

            // Validate file type
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".pdf" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(fileExtension))
                return BadRequest(new ApiResponse<object> { Message = "Only JPG, PNG, and PDF files are allowed." });

            var userId = User.GetUserId();
            var result = await _userService.UploadKycFileAsync(userId, file, docType);
            return Ok(new ApiResponse<KycStatusDto> { Data = result });
        }

        [Authorize]
        [HttpGet("kyc/status")]
        public async Task<IActionResult> GetKycStatus()
        {
            var userId = User.GetUserId();
            var result = await _userService.GetKycStatusAsync(userId);
            return Ok(new ApiResponse<KycStatusDto> { Data = result });
        }
    }
}
