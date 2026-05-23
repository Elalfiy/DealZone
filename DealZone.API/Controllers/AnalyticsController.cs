using DealZone.API.DTOs;
using DealZone.API.Helpers;
using DealZone.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DealZone.API.Controllers
{
    [ApiController]
    [Route("api/analytics")]
    public class AnalyticsController : ControllerBase
    {
        private readonly IAnalyticsService _analyticsService;

        public AnalyticsController(IAnalyticsService analyticsService)
        {
            _analyticsService = analyticsService;
        }

        [Authorize]
        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var userId = User.GetUserId();
            var role = User.GetRole();
            var summary = await _analyticsService.GetSummaryAsync(userId, role);
            return Ok(new DealZone.API.Helpers.ApiResponse<AnalyticsSummaryDto> { Data = summary });
        }

        [Authorize]
        [HttpGet("orders-chart")]
        public async Task<IActionResult> GetOrdersChart()
        {
            var userId = User.GetUserId();
            var role = User.GetRole();
            var chart = await _analyticsService.GetOrdersChartAsync(userId, role);
            return Ok(new DealZone.API.Helpers.ApiResponse<IEnumerable<ChartPointDto>> { Data = chart });
        }

        [Authorize]
        [HttpGet("revenue-chart")]
        public async Task<IActionResult> GetRevenueChart()
        {
            var userId = User.GetUserId();
            var role = User.GetRole();
            var chart = await _analyticsService.GetRevenueChartAsync(userId, role);
            return Ok(new DealZone.API.Helpers.ApiResponse<IEnumerable<ChartPointDto>> { Data = chart });
        }

        [Authorize(Roles = "Buyer,Manufacturer")]
        [HttpGet("top-suppliers")]
        public async Task<IActionResult> GetTopSuppliers()
        {
            var buyerId = User.GetUserId();
            var result = await _analyticsService.GetTopSuppliersAsync(buyerId);
            return Ok(new DealZone.API.Helpers.ApiResponse<IEnumerable<SupplierSummaryDto>> { Data = result });
        }

        [Authorize]
        [HttpGet("price-trends")]
        public async Task<IActionResult> GetPriceTrends([FromQuery] int? categoryId)
        {
            var result = await _analyticsService.GetPriceTrendsAsync(categoryId);
            return Ok(new DealZone.API.Helpers.ApiResponse<IEnumerable<PriceTrendDto>> { Data = result });
        }
    }
}
