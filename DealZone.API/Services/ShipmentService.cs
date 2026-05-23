using DealZone.API.Data;
using DealZone.API.DTOs;
using DealZone.API.Models;
using DealZone.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DealZone.API.Services
{
    public class ShipmentService : IShipmentService
    {
        private readonly ApplicationDbContext _context;

        public ShipmentService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ShipmentDto> GetShipmentAsync(int orderId, int userId, string role)
        {
            var shipment = await _context.Shipments.Include(s => s.Order).FirstOrDefaultAsync(s => s.OrderId == orderId);
            if (shipment == null)
                throw new ApplicationException("Shipment not found.");

            EnsureOrderAccess(shipment.Order, userId, role);
            return MapShipment(shipment);
        }

        public async Task<ShipmentDto> UpdateShipmentAsync(int orderId, int userId, ShipmentUpdateDto request)
        {
            var shipment = await _context.Shipments.Include(s => s.Order).FirstOrDefaultAsync(s => s.OrderId == orderId);
            if (shipment == null)
                throw new ApplicationException("Shipment not found.");

            if (shipment.Order.SupplierId != userId)
                throw new ApplicationException("Access denied.");

            shipment.TrackingNumber = request.TrackingNumber ?? shipment.TrackingNumber;
            shipment.Carrier = request.Carrier ?? shipment.Carrier;
            shipment.Status = request.Status ?? shipment.Status;
            shipment.EstimatedDelivery = request.EstimatedDelivery ?? shipment.EstimatedDelivery;
            shipment.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return MapShipment(shipment);
        }

        private static void EnsureOrderAccess(Order order, int userId, string role)
        {
            if (role == "Buyer" && order.BuyerId != userId)
                throw new ApplicationException("Access denied.");
            if (role == "Supplier" && order.SupplierId != userId)
                throw new ApplicationException("Access denied.");
        }

        private static ShipmentDto MapShipment(Shipment shipment)
        {
            return new ShipmentDto
            {
                Id = shipment.Id,
                OrderId = shipment.OrderId,
                TrackingNumber = shipment.TrackingNumber,
                Carrier = shipment.Carrier,
                Status = shipment.Status,
                EstimatedDelivery = shipment.EstimatedDelivery,
                UpdatedAt = shipment.UpdatedAt
            };
        }
    }
}
