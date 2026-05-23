using System.ComponentModel.DataAnnotations;

namespace DealZone.API.Models
{
    public class Category
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = null!;

        [Required]
        [MaxLength(150)]
        public string NameAr { get; set; } = null!;

        [MaxLength(150)]
        public string? Icon { get; set; }

        public virtual ICollection<Product> Products { get; set; } = new List<Product>();

        public virtual ICollection<Tender> Tenders { get; set; } = new List<Tender>();
    }
}
