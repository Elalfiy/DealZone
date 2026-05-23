/*
 * FIXED: AuthController with proper file upload handling
 * Changes:
 * - Register endpoint now accepts FormData with optional KYC document
 * - Better error handling and validation
 * - Proper status codes (400 for validation, 409 for conflict, 500 for server errors)
 */

using DealZone.API.DTOs;
using DealZone.API.Helpers;
using DealZone.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DealZone.API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IUserService _userService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, IUserService userService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _userService = userService;
            _logger = logger;
        }

        /// <summary>
        /// Register new user with optional KYC document upload
        /// 
        /// Accepts FormData with:
        /// - email (required)
        /// - password (required)
        /// - role (required: "Buyer" or "Supplier")
        /// - companyName (optional)
        /// - taxNumber (optional)
        /// - address (optional)
        /// - kycDocument (optional file: PDF/JPG/PNG, max 10MB)
        /// 
        /// Returns:
        /// - 200: Success with { token, refreshToken, user }
        /// - 400: Validation error
        /// - 409: Email already exists
        /// - 500: Server error
        /// </summary>
        [HttpPost("register")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Register([FromForm] RegisterFormDto request)
        {
            try
            {
                // Validate required fields
                if (string.IsNullOrWhiteSpace(request.Email))
                {
                    _logger.LogWarning("Registration attempt with missing email");
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Email is required.",
                        Errors = new[] { "Email is required." }
                    });
                }

                if (string.IsNullOrWhiteSpace(request.Password))
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Password is required.",
                        Errors = new[] { "Password is required." }
                    });
                }

                // Validate password strength
                if (request.Password.Length < 8)
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Password must be at least 8 characters long.",
                        Errors = new[] { "Password must be at least 8 characters long." }
                    });
                }

                if (!request.Password.Any(char.IsDigit))
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Password must contain at least one number.",
                        Errors = new[] { "Password must contain at least one number." }
                    });
                }

                // Create RegisterRequestDto from form data
                var registerRequest = new RegisterRequestDto
                {
                    Email = request.Email.Trim(),
                    Password = request.Password,
                    Role = string.IsNullOrWhiteSpace(request.Role) ? "Buyer" : request.Role,
                    CompanyName = request.CompanyName?.Trim(),
                    TaxNumber = request.TaxNumber?.Trim(),
                    Address = request.Address?.Trim()
                };

                // Validate file if provided
                if (request.KycDocument != null && request.KycDocument.Length > 0)
                {
                    const long MAX_FILE_SIZE = 10 * 1024 * 1024;
                    if (request.KycDocument.Length > MAX_FILE_SIZE)
                    {
                        _logger.LogWarning($"File upload exceeded size limit: {request.KycDocument.Length / 1024 / 1024}MB");
                        return BadRequest(new ApiResponse<object>
                        {
                            Success = false,
                            Message = $"File size exceeds 10MB limit. Uploaded: {request.KycDocument.Length / 1024 / 1024}MB",
                            Errors = new[] { "File too large" }
                        });
                    }

                    var allowedExtensions = new[] { ".pdf", ".jpg", ".jpeg", ".png" };
                    var fileExtension = Path.GetExtension(request.KycDocument.FileName).ToLowerInvariant();
                    if (!allowedExtensions.Contains(fileExtension))
                    {
                        return BadRequest(new ApiResponse<object>
                        {
                            Success = false,
                            Message = $"File type '{fileExtension}' is not allowed. Allowed: PDF, JPG, PNG",
                            Errors = new[] { "Invalid file type" }
                        });
                    }
                }

                // Call service with file (if provided)
                var result = await _authService.RegisterAsync(registerRequest, request.KycDocument);

                _logger.LogInformation($"User registered successfully: {request.Email}");

                return Ok(new ApiResponse<AuthResponseDto>
                {
                    Success = true,
                    Message = "Registration successful. Please verify your email.",
                    Data = result
                });
            }
            catch (ApplicationException ex) when (ex.Message.Contains("already registered"))
            {
                _logger.LogWarning($"Registration attempt with existing email: {request.Email}");
                return Conflict(new ApiResponse<object>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new[] { ex.Message }
                });
            }
            catch (ApplicationException ex) when (ex.Message.Contains("Document upload failed"))
            {
                _logger.LogError($"KYC upload failed: {ex.Message}", ex);
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new[] { ex.InnerException?.Message ?? ex.Message }
                });
            }
            catch (ApplicationException ex)
            {
                _logger.LogError($"Registration validation error: {ex.Message}");
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new[] { ex.Message }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Unexpected error during registration: {ex.Message}", ex);
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An unexpected error occurred during registration. Please try again later.",
                    Errors = new[] { "Internal server error" }
                });
            }
        }

        /// <summary>
        /// User login endpoint
        /// </summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Email and password are required.",
                        Errors = new[] { "Missing credentials" }
                    });
                }

                var result = await _authService.LoginAsync(request);

                _logger.LogInformation($"User logged in: {request.Email}");

                return Ok(new ApiResponse<AuthResponseDto>
                {
                    Success = true,
                    Message = "Login successful.",
                    Data = result
                });
            }
            catch (ApplicationException ex)
            {
                _logger.LogWarning($"Login failed for {request.Email}: {ex.Message}");
                return Unauthorized(new ApiResponse<object>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new[] { "Invalid credentials" }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Unexpected error during login: {ex.Message}", ex);
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An unexpected error occurred during login.",
                    Errors = new[] { "Internal server error" }
                });
            }
        }

        /// <summary>
        /// Refresh JWT token
        /// </summary>
        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequestDto request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.RefreshToken))
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Refresh token is required.",
                        Errors = new[] { "Missing refresh token" }
                    });
                }

                var result = await _authService.RefreshTokenAsync(request.RefreshToken);

                return Ok(new ApiResponse<AuthResponseDto>
                {
                    Success = true,
                    Message = "Token refreshed successfully.",
                    Data = result
                });
            }
            catch (ApplicationException ex)
            {
                _logger.LogWarning($"Token refresh failed: {ex.Message}");
                return Unauthorized(new ApiResponse<object>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new[] { "Invalid or expired token" }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Unexpected error during token refresh: {ex.Message}", ex);
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An unexpected error occurred during token refresh.",
                    Errors = new[] { "Internal server error" }
                });
            }
        }

        /// <summary>
        /// Logout user
        /// </summary>
        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout([FromBody] RefreshTokenRequestDto request)
        {
            try
            {
                var userId = User.GetUserId();
                await _authService.LogoutAsync(userId, request.RefreshToken);

                _logger.LogInformation($"User logged out: {userId}");

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Logged out successfully.",
                    Data = null
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Logout error: {ex.Message}", ex);
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred during logout.",
                    Errors = new[] { "Internal server error" }
                });
            }
        }

        /// <summary>
        /// Get current user profile
        /// </summary>
        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            try
            {
                var userId = User.GetUserId();
                var profile = await _userService.GetProfileAsync(userId);

                return Ok(new ApiResponse<UserProfileDto>
                {
                    Success = true,
                    Data = profile
                });
            }
            catch (ApplicationException ex)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = ex.Message,
                    Errors = new[] { ex.Message }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching user profile: {ex.Message}", ex);
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred while fetching profile.",
                    Errors = new[] { "Internal server error" }
                });
            }
        }
    }

    // Additional DTO for form data with file
    public class RegisterFormDto
    {
        public string? Email { get; set; }
        public string? Password { get; set; }
        public string? Role { get; set; }
        public string? CompanyName { get; set; }
        public string? TaxNumber { get; set; }
        public string? Address { get; set; }
        public IFormFile? KycDocument { get; set; }
    }

    public class RefreshTokenRequestDto
    {
        public string RefreshToken { get; set; } = null!;
    }

    // Update ApiResponse to include Success flag
    public class ApiResponse<T>
    {
        public bool Success { get; set; } = true;
        public string Message { get; set; } = "Success";
        public T? Data { get; set; }
        public string[]? Errors { get; set; }
    }
}
