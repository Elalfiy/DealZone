using DealZone.API.Data;
using DealZone.API.DTOs;
using DealZone.API.Helpers;
using DealZone.API.Models;
using DealZone.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DealZone.API.Services
{
    public class TenderService : ITenderService
    {
        private readonly ApplicationDbContext _context;

        public TenderService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<TenderDto> CreateTenderAsync(int buyerId, TenderCreateDto request)
        {
            if (request.DeadlineAt <= DateTime.UtcNow.AddDays(3))
                throw new ApplicationException("Tender deadline must be at least 3 days from now.");

            var category = await _context.Categories.FindAsync(request.CategoryId);
            if (category == null)
                throw new ApplicationException("Category not found.");

            var tender = new Tender
            {
                BuyerId = buyerId,
                Title = request.Title,
                Description = request.Description,
                CategoryId = request.CategoryId,
                Quantity = request.Quantity,
                BudgetMax = request.BudgetMax,
                DeadlineAt = request.DeadlineAt,
                Status = "Open",
                CreatedAt = DateTime.UtcNow
            };

            _context.Tenders.Add(tender);
            await _context.SaveChangesAsync();
            return await GetTenderByIdAsync(tender.Id);
        }

        public async Task<PaginatedResult<TenderDto>> GetTendersAsync(int? categoryId, string? status, int page, int pageSize)
        {
            var query = _context.Tenders.Include(t => t.Category).AsQueryable();
            if (categoryId.HasValue)
                query = query.Where(t => t.CategoryId == categoryId.Value);

            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(t => t.Status == status);

            var total = await query.LongCountAsync();
            var items = await query.OrderByDescending(t => t.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(t => MapTender(t))
                .ToListAsync();

            return new PaginatedResult<TenderDto>
            {
                Items = items,
                Page = page,
                PageSize = pageSize,
                Total = total
            };
        }

        public async Task<TenderDto> GetTenderByIdAsync(int id)
        {
            var tender = await _context.Tenders.Include(t => t.Category).FirstOrDefaultAsync(t => t.Id == id);
            if (tender == null)
                throw new ApplicationException("Tender not found.");

            return MapTender(tender);
        }

        public async Task<TenderBidDto> SubmitTenderBidAsync(int supplierId, int tenderId, TenderBidCreateDto request)
        {
            var tender = await _context.Tenders.FindAsync(tenderId);
            if (tender == null)
                throw new ApplicationException("Tender not found.");

            var bid = new TenderBid
            {
                TenderId = tenderId,
                SupplierId = supplierId,
                TotalPrice = request.TotalPrice,
                DeliveryDays = request.DeliveryDays,
                Proposal = request.Proposal,
                IsAwarded = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.TenderBids.Add(bid);
            await _context.SaveChangesAsync();
            return MapTenderBid(bid);
        }

        public async Task<IEnumerable<TenderBidDto>> GetTenderBidsAsync(int tenderId)
        {
            return await _context.TenderBids
                .Where(b => b.TenderId == tenderId)
                .OrderBy(b => b.TotalPrice)
                .Select(b => MapTenderBid(b))
                .ToListAsync();
        }

        public async Task AwardTenderBidAsync(int buyerId, int tenderId, int bidId)
        {
            var tender = await _context.Tenders
                .Include(t => t.Bids)
                .FirstOrDefaultAsync(t => t.Id == tenderId && t.BuyerId == buyerId);
            if (tender == null)
                throw new ApplicationException("Tender not found or access denied.");

            var bid = tender.Bids.FirstOrDefault(b => b.Id == bidId);
            if (bid == null)
                throw new ApplicationException("Bid not found.");

            foreach (var existingBid in tender.Bids)
                existingBid.IsAwarded = existingBid.Id == bidId;

            tender.Status = "Awarded";

            var order = new Order
            {
                BuyerId = buyerId,
                SupplierId = bid.SupplierId,
                ProductId = 0,
                Quantity = tender.Quantity,
                TotalAmount = bid.TotalPrice,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
        }

        private static TenderDto MapTender(Tender tender)
        {
            return new TenderDto
            {
                Id = tender.Id,
                BuyerId = tender.BuyerId,
                Title = tender.Title,
                Description = tender.Description,
                CategoryId = tender.CategoryId,
                Quantity = tender.Quantity,
                BudgetMax = tender.BudgetMax,
                DeadlineAt = tender.DeadlineAt,
                Status = tender.Status,
                CreatedAt = tender.CreatedAt,
                Category = tender.Category == null ? null : new CategoryDto
                {
                    Id = tender.Category.Id,
                    Name = tender.Category.Name,
                    NameAr = tender.Category.NameAr,
                    Icon = tender.Category.Icon
                }
            };
        }

        private static TenderBidDto MapTenderBid(TenderBid bid)
        {
            return new TenderBidDto
            {
                Id = bid.Id,
                TenderId = bid.TenderId,
                SupplierId = bid.SupplierId,
                TotalPrice = bid.TotalPrice,
                DeliveryDays = bid.DeliveryDays,
                Proposal = bid.Proposal,
                IsAwarded = bid.IsAwarded,
                CreatedAt = bid.CreatedAt
            };
        }
    }
}
