using DealZone.API.DTOs;
using DealZone.API.Helpers;
using DealZone.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DealZone.API.Controllers
{
    [ApiController]
    [Route("api/rfqs")]
    public class RFQsController : ControllerBase
    {
        private readonly IRFQService _rfqService;

        public RFQsController(IRFQService rfqService)
        {
            _rfqService = rfqService;
        }

        [Authorize(Roles = "Buyer,Manufacturer")]
        [HttpPost]
        public async Task<IActionResult> CreateRFQ([FromBody] RFQCreateDto request)
        {
            var buyerId = User.GetUserId();
            var rfq = await _rfqService.CreateRFQAsync(buyerId, request);
            return Ok(new DealZone.API.Helpers.ApiResponse<RFQDto> { Data = rfq });
        }

        [Authorize(Roles = "Buyer,Manufacturer")]
        [HttpGet]
        public async Task<IActionResult> GetMyRFQs([FromQuery] string? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var buyerId = User.GetUserId();
            var result = await _rfqService.GetMyRFQsAsync(buyerId, status, page, pageSize);
            return Ok(new DealZone.API.Helpers.ApiResponse<PaginatedResult<RFQDto>> { Data = result });
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetRFQ(int id)
        {
            var rfq = await _rfqService.GetRFQByIdAsync(id);
            return Ok(new DealZone.API.Helpers.ApiResponse<RFQDto> { Data = rfq });
        }

        [Authorize(Roles = "Supplier")]
        [HttpGet("incoming")]
        public async Task<IActionResult> GetIncomingRFQs([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var supplierId = User.GetUserId();
            var result = await _rfqService.GetIncomingRFQsAsync(supplierId, page, pageSize);
            return Ok(new DealZone.API.Helpers.ApiResponse<PaginatedResult<RFQDto>> { Data = result });
        }

        [Authorize(Roles = "Supplier")]
        [HttpPost("{id}/bids")]
        public async Task<IActionResult> SubmitBid(int id, [FromBody] RFQBidCreateDto request)
        {
            var supplierId = User.GetUserId();
            var bid = await _rfqService.SubmitBidAsync(supplierId, id, request);
            return Ok(new DealZone.API.Helpers.ApiResponse<RFQBidDto> { Data = bid });
        }

        [Authorize]
        [HttpGet("{id}/bids")]
        public async Task<IActionResult> GetBids(int id)
        {
            var bids = await _rfqService.GetBidsAsync(id);
            return Ok(new DealZone.API.Helpers.ApiResponse<IEnumerable<RFQBidDto>> { Data = bids });
        }

        [Authorize(Roles = "Buyer,Manufacturer")]
        [HttpPut("{id}/bids/{bidId}/award")]
        public async Task<IActionResult> AwardBid(int id, int bidId)
        {
            var buyerId = User.GetUserId();
            await _rfqService.AwardBidAsync(buyerId, id, bidId);
            return Ok(new DealZone.API.Helpers.ApiResponse<object> { Data = null, Message = "Bid awarded and order created." });
        }
    }
}
