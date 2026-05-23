using DealZone.API.Data;
using DealZone.API.DTOs;
using DealZone.API.Helpers;
using DealZone.API.Models;
using DealZone.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DealZone.API.Services
{
    public class RFQService : IRFQService
    {
        private readonly ApplicationDbContext _context;

        public RFQService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<RFQDto> CreateRFQAsync(int buyerId, RFQCreateDto request)
        {
            var product = await _context.Products.FindAsync(request.ProductId);
            if (product == null)
                throw new ApplicationException("Product not found.");

            if (request.DeliveryDate <= DateTime.UtcNow)
                throw new ApplicationException("Delivery date must be a future date.");

            var rfq = new RFQ
            {
                BuyerId = buyerId,
                ProductId = request.ProductId,
                Quantity = request.Quantity,
                DeliveryDate = request.DeliveryDate,
                Notes = request.Notes,
                Status = "Open",
                CreatedAt = DateTime.UtcNow
            };

            _context.RFQs.Add(rfq);
            await _context.SaveChangesAsync();
            return await GetRFQByIdAsync(rfq.Id);
        }

        public async Task<PaginatedResult<RFQDto>> GetMyRFQsAsync(int buyerId, string? status, int page, int pageSize)
        {
            var query = _context.RFQs
                .Include(r => r.Product)
                .ThenInclude(p => p.Category)
                .Where(r => r.BuyerId == buyerId);

            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(r => r.Status == status);

            var total = await query.LongCountAsync();
            var list = await query.OrderByDescending(r => r.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(r => MapRFQ(r))
                .ToListAsync();

            return new PaginatedResult<RFQDto>
            {
                Items = list,
                Page = page,
                PageSize = pageSize,
                Total = total
            };
        }

        public async Task<RFQDto> GetRFQByIdAsync(int id)
        {
            var rfq = await _context.RFQs
                .Include(r => r.Product)
                .ThenInclude(p => p.Category)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (rfq == null)
                throw new ApplicationException("RFQ not found.");

            return MapRFQ(rfq);
        }

        public async Task<PaginatedResult<RFQDto>> GetIncomingRFQsAsync(int supplierId, int page, int pageSize)
        {
            var query = _context.RFQs
                .Include(r => r.Product)
                .ThenInclude(p => p.Category)
                .Where(r => r.Product.SupplierId == supplierId);

            var total = await query.LongCountAsync();
            var list = await query.OrderByDescending(r => r.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(r => MapRFQ(r))
                .ToListAsync();

            return new PaginatedResult<RFQDto>
            {
                Items = list,
                Page = page,
                PageSize = pageSize,
                Total = total
            };
        }

        public async Task<RFQBidDto> SubmitBidAsync(int supplierId, int rfqId, RFQBidCreateDto request)
        {
            var rfq = await _context.RFQs.Include(r => r.Product).FirstOrDefaultAsync(r => r.Id == rfqId);
            if (rfq == null)
                throw new ApplicationException("RFQ not found.");

            if (rfq.Product.SupplierId == supplierId)
                throw new ApplicationException("Supplier cannot bid on own product.");

            var bid = new RFQBid
            {
                RFQId = rfqId,
                SupplierId = supplierId,
                PricePerUnit = request.PricePerUnit,
                DeliveryDays = request.DeliveryDays,
                Notes = request.Notes,
                IsAwarded = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.RFQBids.Add(bid);
            await _context.SaveChangesAsync();
            return MapRFQBid(bid);
        }

        public async Task<IEnumerable<RFQBidDto>> GetBidsAsync(int rfqId)
        {
            return await _context.RFQBids
                .Where(b => b.RFQId == rfqId)
                .OrderBy(b => b.PricePerUnit)
                .Select(b => MapRFQBid(b))
                .ToListAsync();
        }

        public async Task AwardBidAsync(int buyerId, int rfqId, int bidId)
        {
            var rfq = await _context.RFQs
                .Include(r => r.Bids)
                .FirstOrDefaultAsync(r => r.Id == rfqId && r.BuyerId == buyerId);
            if (rfq == null)
                throw new ApplicationException("RFQ not found or access denied.");

            var bid = rfq.Bids.FirstOrDefault(b => b.Id == bidId);
            if (bid == null)
                throw new ApplicationException("Bid not found.");

            foreach (var existingBid in rfq.Bids)
            {
                existingBid.IsAwarded = existingBid.Id == bidId;
            }

            rfq.Status = "Awarded";

            var order = new Order
            {
                BuyerId = buyerId,
                SupplierId = bid.SupplierId,
                ProductId = rfq.ProductId,
                Quantity = rfq.Quantity,
                TotalAmount = bid.PricePerUnit * rfq.Quantity,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
        }

        private static RFQDto MapRFQ(RFQ rfq)
        {
            return new RFQDto
            {
                Id = rfq.Id,
                BuyerId = rfq.BuyerId,
                ProductId = rfq.ProductId,
                Quantity = rfq.Quantity,
                DeliveryDate = rfq.DeliveryDate,
                Notes = rfq.Notes,
                Status = rfq.Status,
                CreatedAt = rfq.CreatedAt,
                Product = rfq.Product == null ? null : new ProductDto
                {
                    Id = rfq.Product.Id,
                    SupplierId = rfq.Product.SupplierId,
                    CategoryId = rfq.Product.CategoryId,
                    Name = rfq.Product.Name,
                    Description = rfq.Product.Description,
                    Unit = rfq.Product.Unit,
                    MinOrderQty = rfq.Product.MinOrderQty,
                    PricePerUnit = rfq.Product.PricePerUnit,
                    Stock = rfq.Product.Stock,
                    IsActive = rfq.Product.IsActive,
                    CreatedAt = rfq.Product.CreatedAt,
                    Category = rfq.Product.Category == null ? null : new CategoryDto
                    {
                        Id = rfq.Product.Category.Id,
                        Name = rfq.Product.Category.Name,
                        NameAr = rfq.Product.Category.NameAr,
                        Icon = rfq.Product.Category.Icon
                    }
                }
            };
        }

        private static RFQBidDto MapRFQBid(RFQBid bid)
        {
            return new RFQBidDto
            {
                Id = bid.Id,
                RFQId = bid.RFQId,
                SupplierId = bid.SupplierId,
                PricePerUnit = bid.PricePerUnit,
                DeliveryDays = bid.DeliveryDays,
                Notes = bid.Notes,
                IsAwarded = bid.IsAwarded,
                CreatedAt = bid.CreatedAt
            };
        }
    }
}
