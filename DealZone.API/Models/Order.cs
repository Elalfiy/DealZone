using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DealZone.API.Models
{
    public class Order
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int BuyerId { get; set; }

        [Required]
        public int SupplierId { get; set; }

        [Required]
        public int ProductId { get; set; }

        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "Pending";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual User Buyer { get; set; } = null!;

        public virtual User Supplier { get; set; } = null!;

        public virtual Product Product { get; set; } = null!;

        public virtual EscrowAccount? EscrowAccount { get; set; }

        public virtual Shipment? Shipment { get; set; }

        public virtual Review? Review { get; set; }

        public virtual Dispute? Dispute { get; set; }
    }
}
