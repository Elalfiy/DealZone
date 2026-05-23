using System.Text.Json;
using DealZone.API.DTOs;
using DealZone.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DealZone.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// Register — accepts JSON or multipart/form-data (with optional KYC file).
    /// Frontend field names: email, password, role, companyName, taxNumber/taxId, address, phone,
    /// contactPerson, businessLicense, kycDocument.
    /// </summary>
    [HttpPost("register")]
    [AllowAnonymous]
    [RequestSizeLimit(20 * 1024 * 1024)]
    public async Task<IActionResult> Register()
    {
        try
        {
            var (request, kycFile) = await ParseRegisterRequestAsync();
            if (request == null)
                return Ok(new { success = false, message = "طلب غير صالح" });

            if (string.IsNullOrWhiteSpace(request.Email))
                return Ok(new { success = false, message = "البريد الإلكتروني مطلوب" });
            if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
                return Ok(new { success = false, message = "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });

            var result = await _authService.RegisterAsync(request, kycFile);
            return Ok(BuildAuthPayload(result, "تم التسجيل بنجاح"));
        }
        catch (ApplicationException ex)
        {
            _logger.LogWarning(ex, "Registration validation failed");
            return Ok(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Registration error");
            return Ok(new { success = false, message = "حدث خطأ أثناء التسجيل. الرجاء المحاولة مرة أخرى.", debug = ex.Message });
        }
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login()
    {
        try
        {
            var loginRequest = await ParseLoginRequestAsync();
            if (loginRequest == null)
                return Ok(new { success = false, message = "طلب غير صالح" });

            var result = await _authService.LoginAsync(loginRequest);
            return Ok(BuildAuthPayload(result, "تم تسجيل الدخول بنجاح"));
        }
        catch (ApplicationException ex)
        {
            return Ok(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Login error");
            return Ok(new { success = false, message = "حدث خطأ أثناء تسجيل الدخول.", debug = ex.Message });
        }
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMe()
    {
        var userIdClaim = User.FindFirst("userId")?.Value
            ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        if (!int.TryParse(userIdClaim, out var userId))
            return Ok(new { success = false, message = "رمز غير صالح" });

        try
        {
            var profile = await HttpContext.RequestServices
                .GetRequiredService<IUserService>()
                .GetProfileAsync(userId);

            return Ok(new
            {
                success = true,
                data = new
                {
                    profile.Id,
                    profile.Email,
                    profile.FirstName,
                    profile.LastName,
                    Role = profile.Role,
                    profile.IsVerified,
                    profile.Phone,
                    type = MapFrontendType(profile.Role),
                    profile.Company
                }
            });
        }
        catch (ApplicationException ex)
        {
            return Ok(new { success = false, message = ex.Message });
        }
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenDto dto)
    {
        try
        {
            if (dto == null || string.IsNullOrEmpty(dto.RefreshToken))
                return Ok(new { success = false, message = "رمز التحديث مطلوب" });

            var result = await _authService.RefreshTokenAsync(dto.RefreshToken);
            return Ok(new
            {
                success = true,
                message = "تم تحديث الجلسة",
                data = new { token = result.Token, refreshToken = result.RefreshToken, user = result.User }
            });
        }
        catch (ApplicationException ex)
        {
            return Ok(new { success = false, message = ex.Message });
        }
    }

    private async Task<(RegisterRequestDto? request, IFormFile? kycFile)> ParseRegisterRequestAsync()
    {
        if (Request.HasFormContentType)
        {
            var request = new RegisterRequestDto
            {
                Email = FormValue("email"),
                Password = FormValue("password"),
                Role = FormValue("role"),
                Type = FormValue("type"),
                CompanyName = FormValue("companyName"),
                TaxNumber = FormValue("taxNumber", "taxId"),
                Address = FormValue("address"),
                Phone = FormValue("phone"),
                ContactPerson = FormValue("contactPerson")
            };

            var kycFile = Request.Form.Files.GetFile("businessLicense")
                ?? Request.Form.Files.GetFile("kycDocument")
                ?? Request.Form.Files.GetFile("KycDocument")
                ?? Request.Form.Files.GetFile("BusinessLicense");

            return (request, kycFile);
        }

        using var reader = new StreamReader(Request.Body);
        var body = await reader.ReadToEndAsync();
        _logger.LogInformation("Register JSON body length: {Length}", body?.Length ?? 0);

        if (string.IsNullOrWhiteSpace(body))
            return (null, null);

        var dto = JsonSerializer.Deserialize<RegisterDto>(body,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        if (dto == null)
            return (null, null);

        var registerRequest = new RegisterRequestDto
        {
            Email = dto.Email,
            Password = dto.Password,
            Role = dto.Role,
            CompanyName = dto.CompanyName,
            TaxNumber = dto.TaxId,
            Address = dto.Address,
            Phone = dto.Phone,
            ContactPerson = dto.ContactPerson
        };

        return (registerRequest, null);
    }

    private async Task<LoginRequestDto?> ParseLoginRequestAsync()
    {
        if (Request.HasFormContentType)
        {
            return new LoginRequestDto
            {
                Email = FormValue("email"),
                Password = FormValue("password")
            };
        }

        using var reader = new StreamReader(Request.Body);
        var body = await reader.ReadToEndAsync();
        if (string.IsNullOrWhiteSpace(body))
            return null;

        return JsonSerializer.Deserialize<LoginRequestDto>(body,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    }

    private string FormValue(params string[] keys)
    {
        foreach (var key in keys)
        {
            if (Request.Form.ContainsKey(key))
                return Request.Form[key].ToString().Trim();
        }
        return string.Empty;
    }

    private static object BuildAuthPayload(AuthResponseDto result, string message) => new
    {
        success = true,
        message,
        data = new
        {
            token = result.Token,
            refreshToken = result.RefreshToken,
            user = new
            {
                result.User?.Id,
                result.User?.Email,
                result.User?.FirstName,
                result.User?.LastName,
                Role = result.User?.Role,
                result.User?.IsVerified,
                result.User?.Phone,
                type = MapFrontendType(result.User?.Role ?? ""),
                status = result.User?.IsVerified == true ? "Verified" : "PendingApproval",
                company = result.User?.Company
            }
        }
    };

    private static string MapFrontendType(string role)
    {
        if (role.Equals("Admin", StringComparison.OrdinalIgnoreCase)) return "admin";
        if (role.Equals("Supplier", StringComparison.OrdinalIgnoreCase)) return "supplier";
        if (role.Equals("Manufacturer", StringComparison.OrdinalIgnoreCase)) return "manufacturer";
        return "manufacturer";
    }

    private static bool IsValidRole(string role) =>
        role.Equals("Buyer", StringComparison.OrdinalIgnoreCase)
        || role.Equals("Supplier", StringComparison.OrdinalIgnoreCase)
        || role.Equals("Manufacturer", StringComparison.OrdinalIgnoreCase)
        || role.Equals("Admin", StringComparison.OrdinalIgnoreCase);
}
