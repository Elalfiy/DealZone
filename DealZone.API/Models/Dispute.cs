using System.ComponentModel.DataAnnotations;

namespace DealZone.API.Models
{
    public class Dispute
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int OrderId { get; set; }

        [Required]
        public int RaisedById { get; set; }

        [Required]
        [MaxLength(1000)]
        public string Reason { get; set; } = null!;

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "Open";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual Order Order { get; set; } = null!;

        public virtual User RaisedBy { get; set; } = null!;
    }
}
