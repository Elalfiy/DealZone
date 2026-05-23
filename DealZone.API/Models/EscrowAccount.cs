using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DealZone.API.Models
{
    public class EscrowAccount
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int OrderId { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "Held";

        public DateTime HeldAt { get; set; } = DateTime.UtcNow;

        public DateTime? ReleasedAt { get; set; }

        public virtual Order Order { get; set; } = null!;
    }
}
