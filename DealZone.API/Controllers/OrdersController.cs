using DealZone.API.DTOs;
using DealZone.API.Helpers;
using DealZone.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DealZone.API.Controllers
{
    [ApiController]
    [Route("api/orders")]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetOrders([FromQuery] string? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var userId = User.GetUserId();
            var role = User.GetRole();
            var result = await _orderService.GetOrdersAsync(status, page, pageSize, userId, role);
            return Ok(new DealZone.API.Helpers.ApiResponse<PaginatedResult<OrderDto>> { Data = result });
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrder(int id)
        {
            var userId = User.GetUserId();
            var role = User.GetRole();
            var order = await _orderService.GetOrderByIdAsync(id, userId, role);
            return Ok(new DealZone.API.Helpers.ApiResponse<OrderDto> { Data = order });
        }

        [Authorize(Roles = "Buyer,Manufacturer")]
        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] OrderCreateDto request)
        {
            var order = await _orderService.CreateOrderAsync(request);
            return Ok(new DealZone.API.Helpers.ApiResponse<OrderDto> { Data = order });
        }

        [Authorize]
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateOrderStatusDto request)
        {
            var userId = User.GetUserId();
            var role = User.GetRole();
            var order = await _orderService.UpdateOrderStatusAsync(id, request, userId, role);
            return Ok(new DealZone.API.Helpers.ApiResponse<OrderDto> { Data = order });
        }
    }
}
