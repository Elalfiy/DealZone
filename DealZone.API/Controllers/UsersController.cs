using DealZone.API.DTOs;
using DealZone.API.Helpers;
using DealZone.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DealZone.API.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [Authorize]
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.GetUserId();
            var profile = await _userService.GetProfileAsync(userId);
            return Ok(new ApiResponse<UserProfileDto> { Data = profile });
        }

        [Authorize]
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UserProfileUpdateDto request)
        {
            var userId = User.GetUserId();
            var profile = await _userService.UpdateProfileAsync(userId, request);
            return Ok(new ApiResponse<UserProfileDto> { Data = profile });
        }
    }
}
