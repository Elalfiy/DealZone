using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace DealZone.API.DTOs
{
    public class RegisterRequestDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;

        [Required]
        public string Password { get; set; } = null!;

        private string _role = "Buyer";

        public string Role
        {
            get => _role;
            set => _role = string.IsNullOrWhiteSpace(value) ? "Buyer" : value;
        }

        public string? Type
        {
            get => Role;
            set
            {
                if (!string.IsNullOrWhiteSpace(value))
                {
                    Role = value;
                }
            }
        }

        public string? CompanyName { get; set; }

        public string? TaxNumber { get; set; }

        public string? TaxId
        {
            get => TaxNumber;
            set => TaxNumber = value;
        }

        public string? Address { get; set; }

        public string? Phone { get; set; }

        public string? ContactPerson { get; set; }

        public IFormFile? BusinessLicense { get; set; }
    }
}
