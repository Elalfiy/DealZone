using DealZone.API.Data;
using DealZone.API.DTOs;
using DealZone.API.Helpers;
using DealZone.API.Models;
using DealZone.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DealZone.API.Services
{
    public class OrderService : IOrderService
    {
        private readonly ApplicationDbContext _context;

        public OrderService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PaginatedResult<OrderDto>> GetOrdersAsync(string? status, int page, int pageSize, int userId, string role)
        {
            var query = _context.Orders.Include(o => o.Product).AsQueryable();

            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(o => o.Status == status);

            if (role == "Buyer")
                query = query.Where(o => o.BuyerId == userId);
            else if (role == "Supplier")
                query = query.Where(o => o.SupplierId == userId);

            var total = await query.LongCountAsync();
            var list = await query.OrderByDescending(o => o.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(o => MapOrder(o))
                .ToListAsync();

            return new PaginatedResult<OrderDto>
            {
                Items = list,
                Page = page,
                PageSize = pageSize,
                Total = total
            };
        }

        public async Task<OrderDto> GetOrderByIdAsync(int id, int userId, string role)
        {
            var order = await _context.Orders.Include(o => o.Product).FirstOrDefaultAsync(o => o.Id == id);
            if (order == null)
                throw new ApplicationException("Order not found.");

            if (role == "Buyer" && order.BuyerId != userId)
                throw new ApplicationException("Access denied.");
            if (role == "Supplier" && order.SupplierId != userId)
                throw new ApplicationException("Access denied.");

            return MapOrder(order);
        }

        public async Task<OrderDto> CreateOrderAsync(OrderCreateDto request)
        {
            var buyer = await _context.Users.FindAsync(request.BuyerId);
            if (buyer == null)
                throw new ApplicationException("Buyer not found.");

            var supplier = await _context.Users.FindAsync(request.SupplierId);
            if (supplier == null)
                throw new ApplicationException("Supplier not found.");

            var product = await _context.Products.FindAsync(request.ProductId);
            if (product == null)
                throw new ApplicationException("Product not found.");

            if (request.Quantity <= 0)
                throw new ApplicationException("Quantity must be greater than zero.");

            var order = new Order
            {
                BuyerId = request.BuyerId,
                SupplierId = request.SupplierId,
                ProductId = request.ProductId,
                Quantity = request.Quantity,
                TotalAmount = product.PricePerUnit * request.Quantity,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            return MapOrder(order);
        }

        public async Task<OrderDto> UpdateOrderStatusAsync(int id, UpdateOrderStatusDto request, int userId, string role)
        {
            var order = await _context.Orders.Include(o => o.Product).FirstOrDefaultAsync(o => o.Id == id);
            if (order == null)
                throw new ApplicationException("Order not found.");

            if (role == "Buyer" && order.BuyerId != userId)
                throw new ApplicationException("Access denied.");
            if (role == "Supplier" && order.SupplierId != userId)
                throw new ApplicationException("Access denied.");

            order.Status = request.Status;
            await _context.SaveChangesAsync();
            return MapOrder(order);
        }

        private static OrderDto MapOrder(Order order)
        {
            return new OrderDto
            {
                Id = order.Id,
                BuyerId = order.BuyerId,
                SupplierId = order.SupplierId,
                ProductId = order.ProductId,
                Quantity = order.Quantity,
                TotalAmount = order.TotalAmount,
                Status = order.Status,
                CreatedAt = order.CreatedAt,
                Product = order.Product == null ? null : new ProductDto
                {
                    Id = order.Product.Id,
                    SupplierId = order.Product.SupplierId,
                    CategoryId = order.Product.CategoryId,
                    Name = order.Product.Name,
                    Description = order.Product.Description,
                    Unit = order.Product.Unit,
                    MinOrderQty = order.Product.MinOrderQty,
                    PricePerUnit = order.Product.PricePerUnit,
                    Stock = order.Product.Stock,
                    IsActive = order.Product.IsActive,
                    CreatedAt = order.Product.CreatedAt
                }
            };
        }
    }
}
