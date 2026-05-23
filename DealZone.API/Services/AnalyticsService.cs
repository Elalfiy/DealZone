using DealZone.API.Data;
using DealZone.API.DTOs;
using DealZone.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DealZone.API.Services
{
    public class AnalyticsService : IAnalyticsService
    {
        private readonly ApplicationDbContext _context;

        public AnalyticsService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<AnalyticsSummaryDto> GetSummaryAsync(int userId, string role)
        {
            var query = _context.Orders.AsQueryable();
            if (role == "Buyer")
                query = query.Where(o => o.BuyerId == userId);
            else if (role == "Supplier")
                query = query.Where(o => o.SupplierId == userId);

            var ordersCount = await query.CountAsync();
            var revenue = await query.Where(o => o.Status != "Disputed").SumAsync(o => (decimal?)o.TotalAmount) ?? 0;
            var pendingRfqs = await _context.RFQs.CountAsync(r => r.BuyerId == userId && r.Status == "Open");
            var activeProducts = await _context.Products.CountAsync(p => p.IsActive && p.SupplierId == userId);

            return new AnalyticsSummaryDto
            {
                OrdersCount = ordersCount,
                Revenue = revenue,
                PendingRfqs = pendingRfqs,
                ActiveProducts = activeProducts
            };
        }

        public async Task<IEnumerable<ChartPointDto>> GetOrdersChartAsync(int userId, string role)
        {
            var start = DateTime.UtcNow.AddMonths(-5);
            var query = _context.Orders.AsQueryable();
            if (role == "Buyer")
                query = query.Where(o => o.BuyerId == userId);
            else if (role == "Supplier")
                query = query.Where(o => o.SupplierId == userId);

            return await query
                .Where(o => o.CreatedAt >= start)
                .GroupBy(o => new { Year = o.CreatedAt.Year, Month = o.CreatedAt.Month })
                .Select(g => new ChartPointDto
                {
                    Label = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM yyyy"),
                    Value = g.Count()
                })
                .OrderBy(p => p.Label)
                .ToListAsync();
        }

        public async Task<IEnumerable<ChartPointDto>> GetRevenueChartAsync(int userId, string role)
        {
            var start = DateTime.UtcNow.AddMonths(-5);
            var query = _context.Orders.AsQueryable();
            if (role == "Buyer")
                query = query.Where(o => o.BuyerId == userId);
            else if (role == "Supplier")
                query = query.Where(o => o.SupplierId == userId);

            return await query
                .Where(o => o.CreatedAt >= start)
                .GroupBy(o => new { Year = o.CreatedAt.Year, Month = o.CreatedAt.Month })
                .Select(g => new ChartPointDto
                {
                    Label = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM yyyy"),
                    Value = g.Sum(o => o.TotalAmount)
                })
                .OrderBy(p => p.Label)
                .ToListAsync();
        }

        public async Task<IEnumerable<SupplierSummaryDto>> GetTopSuppliersAsync(int buyerId)
        {
            return await _context.Orders
                .Where(o => o.BuyerId == buyerId)
                .GroupBy(o => o.SupplierId)
                .Select(g => new SupplierSummaryDto
                {
                    SupplierId = g.Key,
                    SupplierEmail = _context.Users.Where(u => u.Id == g.Key).Select(u => u.Email).FirstOrDefault() ?? string.Empty,
                    OrdersCount = g.Count(),
                    TotalRevenue = g.Sum(o => o.TotalAmount)
                })
                .OrderByDescending(x => x.TotalRevenue)
                .Take(10)
                .ToListAsync();
        }

        public async Task<IEnumerable<PriceTrendDto>> GetPriceTrendsAsync(int? categoryId)
        {
            var query = _context.Products.AsQueryable();
            if (categoryId.HasValue)
                query = query.Where(p => p.CategoryId == categoryId.Value);

            return await query
                .GroupBy(p => p.Category)
                .Select(g => new PriceTrendDto
                {
                    CategoryName = g.Key!.Name,
                    AveragePrice = g.Average(p => p.PricePerUnit)
                })
                .ToListAsync();
        }
    }
}
