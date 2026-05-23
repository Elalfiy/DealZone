using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DealZone.API.Models
{
    public class Company
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = null!;

        [MaxLength(100)]
        public string? TaxNumber { get; set; }

        [MaxLength(500)]
        public string? Address { get; set; }

        [MaxLength(500)]
        public string? LogoUrl { get; set; }

        [Required]
        [MaxLength(50)]
        public string KycStatus { get; set; } = "Pending";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual User User { get; set; } = null!;

        public virtual ICollection<KycDocument> KycDocuments { get; set; } = new List<KycDocument>();
    }
}
