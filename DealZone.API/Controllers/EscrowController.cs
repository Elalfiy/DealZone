using DealZone.API.DTOs;
using DealZone.API.Helpers;
using DealZone.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DealZone.API.Controllers
{
    [ApiController]
    [Route("api/escrow")]
    public class EscrowController : ControllerBase
    {
        private readonly IEscrowService _escrowService;

        public EscrowController(IEscrowService escrowService)
        {
            _escrowService = escrowService;
        }

        [Authorize]
        [HttpGet("{orderId}")]
        public async Task<IActionResult> GetEscrow(int orderId)
        {
            var userId = User.GetUserId();
            var role = User.GetRole();
            var escrow = await _escrowService.GetEscrowAsync(orderId, userId, role);
            return Ok(new ApiResponse<EscrowDto> { Data = escrow });
        }

        [Authorize(Roles = "Buyer")]
        [HttpPost("{orderId}/release")]
        public async Task<IActionResult> ReleaseEscrow(int orderId)
        {
            var userId = User.GetUserId();
            var escrow = await _escrowService.ReleaseEscrowAsync(orderId, userId);
            return Ok(new ApiResponse<EscrowDto> { Data = escrow });
        }

        [Authorize(Roles = "Buyer")]
        [HttpPost("{orderId}/dispute")]
        public async Task<IActionResult> DisputeEscrow(int orderId, [FromBody] EscrowDisputeDto request)
        {
            var userId = User.GetUserId();
            var escrow = await _escrowService.DisputeEscrowAsync(orderId, userId, request);
            return Ok(new ApiResponse<EscrowDto> { Data = escrow });
        }
    }
}
