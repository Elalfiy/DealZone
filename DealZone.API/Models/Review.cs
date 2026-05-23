using System.ComponentModel.DataAnnotations;

namespace DealZone.API.Models
{
    public class Review
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int OrderId { get; set; }

        [Required]
        public int ReviewerId { get; set; }

        [Required]
        public int SupplierId { get; set; }

        [Range(1, 5)]
        public int Rating { get; set; }

        [MaxLength(2000)]
        public string? Comment { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual Order Order { get; set; } = null!;

        public virtual User Reviewer { get; set; } = null!;

        public virtual User Supplier { get; set; } = null!;
    }
}
