using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DealZone.API.Models
{
    public class Product
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int SupplierId { get; set; }

        [Required]
        public int CategoryId { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = null!;

        [MaxLength(1000)]
        public string? Description { get; set; }

        [MaxLength(50)]
        public string? Unit { get; set; }

        [Range(1, int.MaxValue)]
        public int MinOrderQty { get; set; } = 1;

        [Column(TypeName = "decimal(18,2)")]
        public decimal PricePerUnit { get; set; }

        public int Stock { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual User Supplier { get; set; } = null!;

        public virtual Category Category { get; set; } = null!;

        public virtual ICollection<RFQ> RFQs { get; set; } = new List<RFQ>();

        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}
