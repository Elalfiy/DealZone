using DealZone.API.Data;
using DealZone.API.DTOs;
using DealZone.API.Models;
using DealZone.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DealZone.API.Services
{
    public class ReviewService : IReviewService
    {
        private readonly ApplicationDbContext _context;

        public ReviewService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ReviewDto> CreateReviewAsync(int buyerId, ReviewCreateDto request)
        {
            var order = await _context.Orders.FindAsync(request.OrderId);
            if (order == null)
                throw new ApplicationException("Order not found.");

            if (order.BuyerId != buyerId)
                throw new ApplicationException("Only the buyer can submit a review.");

            if (order.Status != "Delivered" && order.Status != "Completed")
                throw new ApplicationException("Review can only be submitted after delivery.");

            if (await _context.Reviews.AnyAsync(r => r.OrderId == request.OrderId))
                throw new ApplicationException("A review already exists for this order.");

            var review = new Review
            {
                OrderId = request.OrderId,
                ReviewerId = buyerId,
                SupplierId = order.SupplierId,
                Rating = request.Rating,
                Comment = request.Comment,
                CreatedAt = DateTime.UtcNow
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();
            return MapReview(review);
        }

        public async Task<IEnumerable<ReviewDto>> GetReviewsBySupplierAsync(int supplierId)
        {
            return await _context.Reviews
                .Where(r => r.SupplierId == supplierId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => MapReview(r))
                .ToListAsync();
        }

        private static ReviewDto MapReview(Review review)
        {
            return new ReviewDto
            {
                Id = review.Id,
                OrderId = review.OrderId,
                ReviewerId = review.ReviewerId,
                SupplierId = review.SupplierId,
                Rating = review.Rating,
                Comment = review.Comment,
                CreatedAt = review.CreatedAt
            };
        }
    }
}
