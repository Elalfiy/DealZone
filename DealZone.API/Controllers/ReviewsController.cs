using DealZone.API.DTOs;
using DealZone.API.Helpers;
using DealZone.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DealZone.API.Controllers
{
    [ApiController]
    [Route("api/reviews")]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewsController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        [Authorize(Roles = "Buyer,Manufacturer")]
        [HttpPost]
        public async Task<IActionResult> CreateReview([FromBody] ReviewCreateDto request)
        {
            var buyerId = User.GetUserId();
            var review = await _reviewService.CreateReviewAsync(buyerId, request);
            return Ok(new DealZone.API.Helpers.ApiResponse<ReviewDto> { Data = review });
        }

        [HttpGet("supplier/{supplierId}")]
        public async Task<IActionResult> GetSupplierReviews(int supplierId)
        {
            var result = await _reviewService.GetReviewsBySupplierAsync(supplierId);
            return Ok(new DealZone.API.Helpers.ApiResponse<IEnumerable<ReviewDto>> { Data = result });
        }
    }
}
