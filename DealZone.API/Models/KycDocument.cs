using System.ComponentModel.DataAnnotations;

namespace DealZone.API.Models
{
    public class KycDocument
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int CompanyId { get; set; }

        [Required]
        [MaxLength(100)]
        public string DocType { get; set; } = null!;

        [Required]
        [MaxLength(500)]
        public string FileUrl { get; set; } = null!;

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "Pending";

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        public virtual Company Company { get; set; } = null!;
    }
}
