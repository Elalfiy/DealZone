using System.ComponentModel.DataAnnotations;

namespace DealZone.API.Models
{
    public class RefreshToken
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public string Token { get; set; } = null!;

        public DateTime ExpiresAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool Revoked { get; set; }

        public virtual User User { get; set; } = null!;
    }
}
