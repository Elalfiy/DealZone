using DealZone.API.Data;
using DealZone.API.DTOs;
using DealZone.API.Models;
using DealZone.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DealZone.API.Services
{
    public class EscrowService : IEscrowService
    {
        private readonly ApplicationDbContext _context;

        public EscrowService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<EscrowDto> GetEscrowAsync(int orderId, int userId, string role)
        {
            var escrow = await _context.EscrowAccounts.Include(e => e.Order).FirstOrDefaultAsync(e => e.OrderId == orderId);
            if (escrow == null)
                throw new ApplicationException("Escrow account not found.");

            if (role == "Buyer" && escrow.Order.BuyerId != userId)
                throw new ApplicationException("Access denied.");
            if (role == "Supplier" && escrow.Order.SupplierId != userId)
                throw new ApplicationException("Access denied.");

            return MapEscrow(escrow);
        }

        public async Task<EscrowDto> ReleaseEscrowAsync(int orderId, int userId)
        {
            var escrow = await _context.EscrowAccounts.Include(e => e.Order).FirstOrDefaultAsync(e => e.OrderId == orderId);
            if (escrow == null)
                throw new ApplicationException("Escrow account not found.");

            if (escrow.Order.BuyerId != userId)
                throw new ApplicationException("Only the buyer can confirm delivery.");

            escrow.Status = "Released";
            escrow.ReleasedAt = DateTime.UtcNow;
            escrow.Order.Status = "Completed";
            await _context.SaveChangesAsync();
            return MapEscrow(escrow);
        }

        public async Task<EscrowDto> DisputeEscrowAsync(int orderId, int userId, EscrowDisputeDto request)
        {
            var escrow = await _context.EscrowAccounts.Include(e => e.Order).FirstOrDefaultAsync(e => e.OrderId == orderId);
            if (escrow == null)
                throw new ApplicationException("Escrow account not found.");

            if (escrow.Order.BuyerId != userId)
                throw new ApplicationException("Only the buyer can raise a dispute.");

            var dispute = new Dispute
            {
                OrderId = orderId,
                RaisedById = userId,
                Reason = request.Reason,
                Status = "Open",
                CreatedAt = DateTime.UtcNow
            };

            escrow.Status = "Held";
            escrow.Order.Status = "Disputed";
            _context.Disputes.Add(dispute);
            await _context.SaveChangesAsync();

            return MapEscrow(escrow);
        }

        private static EscrowDto MapEscrow(EscrowAccount escrow)
        {
            return new EscrowDto
            {
                Id = escrow.Id,
                OrderId = escrow.OrderId,
                Amount = escrow.Amount,
                Status = escrow.Status,
                HeldAt = escrow.HeldAt,
                ReleasedAt = escrow.ReleasedAt
            };
        }
    }
}
