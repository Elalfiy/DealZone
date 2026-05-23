using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DealZone.API.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [EmailAddress]
        [MaxLength(200)]
        public string Email { get; set; } = null!;

        [Required]
        public string PasswordHash { get; set; } = null!;

        [Required]
        [MaxLength(50)]
        public string Role { get; set; } = "Buyer";

        public bool IsVerified { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual Company? Company { get; set; }

        public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();

        public virtual ICollection<Product> Products { get; set; } = new List<Product>();

        public virtual ICollection<RFQ> RFQs { get; set; } = new List<RFQ>();

        public virtual ICollection<RFQBid> RFQBids { get; set; } = new List<RFQBid>();

        public virtual ICollection<Tender> Tenders { get; set; } = new List<Tender>();

        public virtual ICollection<TenderBid> TenderBids { get; set; } = new List<TenderBid>();

        public virtual ICollection<Order> BuyerOrders { get; set; } = new List<Order>();

        public virtual ICollection<Order> SupplierOrders { get; set; } = new List<Order>();

        public virtual ICollection<Dispute> Disputes { get; set; } = new List<Dispute>();

        public virtual ICollection<Review> WrittenReviews { get; set; } = new List<Review>();

        public virtual ICollection<Review> ReceivedReviews { get; set; } = new List<Review>();

        public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    }
}
