using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DealZone.API.Models
{
    public class TenderBid
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int TenderId { get; set; }

        [Required]
        public int SupplierId { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalPrice { get; set; }

        [Range(1, int.MaxValue)]
        public int DeliveryDays { get; set; }

        [MaxLength(2000)]
        public string? Proposal { get; set; }

        public bool IsAwarded { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual Tender Tender { get; set; } = null!;

        public virtual User Supplier { get; set; } = null!;
    }
}
