using System.ComponentModel.DataAnnotations;

namespace DealZone.API.Models
{
    public class Shipment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int OrderId { get; set; }

        [MaxLength(200)]
        public string? TrackingNumber { get; set; }

        [MaxLength(200)]
        public string? Carrier { get; set; }

        [MaxLength(100)]
        public string? Status { get; set; }

        public DateTime? EstimatedDelivery { get; set; }

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual Order Order { get; set; } = null!;
    }
}
