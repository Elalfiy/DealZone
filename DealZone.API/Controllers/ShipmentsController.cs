using DealZone.API.DTOs;
using DealZone.API.Helpers;
using DealZone.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DealZone.API.Controllers
{
    [ApiController]
    [Route("api/shipments")]
    public class ShipmentsController : ControllerBase
    {
        private readonly IShipmentService _shipmentService;

        public ShipmentsController(IShipmentService shipmentService)
        {
            _shipmentService = shipmentService;
        }

        [Authorize]
        [HttpGet("{orderId}")]
        public async Task<IActionResult> GetShipment(int orderId)
        {
            var userId = User.GetUserId();
            var role = User.GetRole();
            var shipment = await _shipmentService.GetShipmentAsync(orderId, userId, role);
            return Ok(new DealZone.API.Helpers.ApiResponse<ShipmentDto> { Data = shipment });
        }

        [Authorize(Roles = "Supplier")]
        [HttpPut("{orderId}")]
        public async Task<IActionResult> UpdateShipment(int orderId, [FromBody] ShipmentUpdateDto request)
        {
            var userId = User.GetUserId();
            var shipment = await _shipmentService.UpdateShipmentAsync(orderId, userId, request);
            return Ok(new DealZone.API.Helpers.ApiResponse<ShipmentDto> { Data = shipment });
        }
    }
}
