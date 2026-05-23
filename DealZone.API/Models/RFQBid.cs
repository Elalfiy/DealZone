using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DealZone.API.Models
{
    public class RFQBid
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int RFQId { get; set; }

        [Required]
        public int SupplierId { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal PricePerUnit { get; set; }

        [Range(1, int.MaxValue)]
        public int DeliveryDays { get; set; }

        [MaxLength(1000)]
        public string? Notes { get; set; }

        public bool IsAwarded { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual RFQ RFQ { get; set; } = null!;

        public virtual User Supplier { get; set; } = null!;
    }
}
