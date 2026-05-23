using DealZone.API.DTOs;
using DealZone.API.Helpers;
using DealZone.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DealZone.API.Controllers
{
    [ApiController]
    [Route("api/tenders")]
    public class TendersController : ControllerBase
    {
        private readonly ITenderService _tenderService;

        public TendersController(ITenderService tenderService)
        {
            _tenderService = tenderService;
        }

        [Authorize(Roles = "Buyer,Manufacturer")]
        [HttpPost]
        public async Task<IActionResult> CreateTender([FromBody] TenderCreateDto request)
        {
            var buyerId = User.GetUserId();
            var tender = await _tenderService.CreateTenderAsync(buyerId, request);
            return Ok(new DealZone.API.Helpers.ApiResponse<TenderDto> { Data = tender });
        }

        [HttpGet]
        public async Task<IActionResult> GetTenders([FromQuery] int? categoryId, [FromQuery] string? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var result = await _tenderService.GetTendersAsync(categoryId, status, page, pageSize);
            return Ok(new DealZone.API.Helpers.ApiResponse<PaginatedResult<TenderDto>> { Data = result });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTender(int id)
        {
            var tender = await _tenderService.GetTenderByIdAsync(id);
            return Ok(new DealZone.API.Helpers.ApiResponse<TenderDto> { Data = tender });
        }

        [Authorize(Roles = "Supplier")]
        [HttpPost("{id}/bids")]
        public async Task<IActionResult> SubmitTenderBid(int id, [FromBody] TenderBidCreateDto request)
        {
            var supplierId = User.GetUserId();
            var bid = await _tenderService.SubmitTenderBidAsync(supplierId, id, request);
            return Ok(new DealZone.API.Helpers.ApiResponse<TenderBidDto> { Data = bid });
        }

        [HttpGet("{id}/bids")]
        public async Task<IActionResult> GetTenderBids(int id)
        {
            var bids = await _tenderService.GetTenderBidsAsync(id);
            return Ok(new DealZone.API.Helpers.ApiResponse<IEnumerable<TenderBidDto>> { Data = bids });
        }

        [Authorize(Roles = "Buyer,Manufacturer")]
        [HttpPut("{id}/bids/{bidId}/award")]
        public async Task<IActionResult> AwardTenderBid(int id, int bidId)
        {
            var buyerId = User.GetUserId();
            await _tenderService.AwardTenderBidAsync(buyerId, id, bidId);
            return Ok(new DealZone.API.Helpers.ApiResponse<object> { Data = null, Message = "Tender bid awarded and order created." });
        }
    }
}
