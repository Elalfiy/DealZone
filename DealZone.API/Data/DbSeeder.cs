using BCrypt.Net;
using DealZone.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DealZone.API.Data;

public static class DbSeeder
{
    private const string DefaultPassword = "DealZone2026!";
    private const string KycApproved = "Approved";

    public static async Task ResetAndSeedAsync(ApplicationDbContext context, bool resetDatabase)
    {
        await context.Database.MigrateAsync();

        if (resetDatabase)
            await DatabaseResetService.ClearAllDataAsync(context);

        if (await context.Users.AnyAsync())
            return;

        await SeedAsync(context);
    }

    public static async Task SeedAsync(ApplicationDbContext context)
    {
        var now = DateTime.UtcNow;
        var categories = SeedCategories(now);
        await context.Categories.AddRangeAsync(categories);
        await context.SaveChangesAsync();

        // ── Admin (single account) ──
        var admin = new User
        {
            Email = "dealzone@gmail.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("DealZone_2026", workFactor: 12),
            FirstName = "DealZone",
            LastName = "Admin",
            Phone = "01122771347",
            Role = "Admin",
            IsVerified = true,
            CreatedAt = now,
            UpdatedAt = now
        };
        context.Users.Add(admin);
        await context.SaveChangesAsync();

        var supplierAccounts = SeedCompanyUsers(GetSupplierProfiles(), "Supplier", now);
        var manufacturerAccounts = SeedCompanyUsers(GetManufacturerProfiles(), "Manufacturer", now);

        await context.Users.AddRangeAsync(supplierAccounts.Select(s => s.User));
        await context.Users.AddRangeAsync(manufacturerAccounts.Select(m => m.User));
        await context.SaveChangesAsync();

        var companyPairs = new List<(User User, Company Company)>();
        foreach (var account in supplierAccounts.Concat(manufacturerAccounts))
        {
            account.Company.UserId = account.User.Id;
            companyPairs.Add(account);
        }

        await context.Companies.AddRangeAsync(companyPairs.Select(c => c.Company));
        await context.SaveChangesAsync();

        foreach (var (_, company) in supplierAccounts)
        {
            context.KycDocuments.Add(new KycDocument
            {
                CompanyId = company.Id,
                DocType = "commercial_register",
                FileUrl = $"/uploads/kyc/seed-{company.Id}-register.pdf",
                Status = KycApproved,
                SubmittedAt = now.AddDays(-30)
            });
        }

        await context.SaveChangesAsync();

        await SeedSupplierProductsAsync(context, categories, supplierAccounts.Select(s => s.User).ToList(), now);

        await context.SaveChangesAsync();
    }

    private static List<Category> SeedCategories(DateTime now) => new()
    {
        new() { Name = "Metals", NameAr = "معادن", Icon = "fas fa-industry" },
        new() { Name = "Electronics", NameAr = "إلكترونيات", Icon = "fas fa-plug" },
        new() { Name = "Chemicals", NameAr = "مواد كيميائية", Icon = "fas fa-flask" },
        new() { Name = "Textiles", NameAr = "منسوجات", Icon = "fas fa-tshirt" },
        new() { Name = "Packaging", NameAr = "تغليف", Icon = "fas fa-box" },
        new() { Name = "Machinery", NameAr = "آلات", Icon = "fas fa-cogs" },
        new() { Name = "Construction", NameAr = "مواد بناء", Icon = "fas fa-hard-hat" },
        new() { Name = "Plastics", NameAr = "بلاستيك", Icon = "fas fa-recycle" }
    };

    private static List<(User User, Company Company)> SeedCompanyUsers(
        IReadOnlyList<CompanyProfile> profiles, string role, DateTime now)
    {
        var result = new List<(User, Company)>();
        foreach (var p in profiles)
        {
            var user = new User
            {
                Email = p.Email.ToLowerInvariant(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(DefaultPassword, workFactor: 12),
                FirstName = p.ContactFirstName,
                LastName = p.ContactLastName,
                Phone = p.Phone,
                Role = role,
                IsVerified = true,
                CreatedAt = now,
                UpdatedAt = now
            };

            var company = new Company
            {
                Name = p.CompanyName,
                TaxNumber = p.TaxId,
                Address = p.Address,
                KycStatus = KycApproved,
                CreatedAt = now,
                UpdatedAt = now
            };

            result.Add((user, company));
        }

        return result;
    }

    private static async Task SeedSupplierProductsAsync(
        ApplicationDbContext context,
        List<Category> categories,
        List<User> suppliers,
        DateTime now)
    {
        var productCatalog = new[]
        {
            ("Galvanized Steel Coil", "Metals", "ton", 5, 14200m, 120, "معادن مجلفنة للبناء والتشييد"),
            ("Copper Electrical Cable 2.5mm", "Electronics", "meter", 500, 38m, 15000, "كابلات نحاس معزولة للتمديدات الصناعية"),
            ("Industrial LED High Bay 150W", "Electronics", "piece", 10, 1280m, 200, "إضاءة LED للمستودعات والمصانع"),
            ("Polypropylene Woven Bags", "Packaging", "piece", 1000, 6.5m, 50000, "شكائر بولي بروبلين للتعبئة الصناعية"),
            ("Sodium Hydroxide Flakes", "Chemicals", "kg", 500, 22m, 8000, "قلوي صودا لصناعات التنظيف والورق"),
            ("Hydraulic Gear Pump", "Machinery", "piece", 2, 18500m, 35, "مضخات هيدروليكية للمعدات الثقيلة"),
            ("Portland Cement Grade 42.5", "Construction", "ton", 20, 2100m, 500, "أسمنت بورتلاند للمقاولات"),
            ("HDPE Plastic Granules", "Plastics", "kg", 1000, 18m, 25000, "حبيبات بولي إيثيلين للحقن البلاستيكي"),
            ("Cotton Workwear Fabric", "Textiles", "meter", 300, 85m, 6000, "أقمشة قطنية لملابس العمل"),
            ("Stainless Steel Sheets 304", "Metals", "sheet", 20, 9200m, 80, "صفائح ستانلس ضد الصدأ")
        };

        var random = new Random(42);
        var products = new List<Product>();
        var supplierIndex = 0;

        foreach (var supplier in suppliers)
        {
            for (var i = 0; i < 4; i++)
            {
                var item = productCatalog[(supplierIndex * 4 + i) % productCatalog.Length];
                var category = categories.First(c => c.Name == item.Item2);
                products.Add(new Product
                {
                    SupplierId = supplier.Id,
                    CategoryId = category.Id,
                    Name = item.Item1,
                    Description = item.Item7,
                    Unit = item.Item3,
                    MinOrderQty = item.Item4,
                    PricePerUnit = item.Item5,
                    Stock = item.Item6,
                    IsActive = true,
                    CreatedAt = now.AddDays(-random.Next(10, 90))
                });
            }

            supplierIndex++;
        }

        await context.Products.AddRangeAsync(products);
    }

    private static List<CompanyProfile> GetSupplierProfiles() => new()
    {
        new("Nile Metal Works", "sales@nilemetalworks.eg", "Mohamed", "Hassan", "01001234567", "100234567890003", "14 El-Tahrir St, Nasr City, Cairo, Egypt"),
        new("Delta Steel Industries", "info@deltasteel.eg", "Ahmed", "Farouk", "01002345678", "100345678901004", "22 Industrial Zone, 6th of October City, Giza, Egypt"),
        new("Alexandria Industrial Supply", "contact@alexindustrialsupply.eg", "Karim", "Said", "01003456789", "100456789012005", "18 El-Horreya Rd, Smouha, Alexandria, Egypt"),
        new("Cairo Packaging Solutions", "orders@cairopack.eg", "Youssef", "Nabil", "01004567890", "100567890123006", "7 Ahmed Fakhry St, Nasr City, Cairo, Egypt"),
        new("Giza Chemicals Co.", "sales@gizachemicals.eg", "Hani", "Adel", "01005678901", "100678901234007", "55 Pyramids Road, Giza, Egypt"),
        new("Suez Machinery Trading", "info@suezmachinery.eg", "Tarek", "Osman", "01006789012", "100789012345008", "12 Port Tawfik District, Suez, Egypt"),
        new("Mansoura Textiles Export", "export@mansouratextiles.eg", "Samir", "Lotfy", "01007890123", "100890123456009", "33 Gamal Abdel Nasser St, Mansoura, Dakahlia, Egypt"),
        new("Tanta Plastics Manufacturing", "hello@tantaplastics.eg", "Walid", "Gamal", "01008901234", "100901234567010", "9 El-Galaa St, Tanta, Gharbia, Egypt"),
        new("Helwan Electronics Wholesale", "trade@helwanelectronics.eg", "Amr", "Fathy", "01009012345", "101012345678011", "4 Corniche El-Maadi, Cairo, Egypt"),
        new("Obour Construction Materials", "supply@obourmaterials.eg", "Khaled", "Morsy", "01010123456", "101123456789012", "Plot 88, Obour Industrial City, Qalyubia, Egypt")
    };

    private static List<CompanyProfile> GetManufacturerProfiles() => new()
    {
        new("Al Nasr Construction Group", "procurement@alnasrgroup.eg", "Mahmoud", "Ibrahim", "01111234567", "200234567890103", "90 Corniche El-Nile, Garden City, Cairo, Egypt"),
        new("Egyptian Foods Manufacturing", "purchasing@egyptianfoods.eg", "Hassan", "Ali", "01112345678", "200345678901204", "15 Ring Road, 6th of October, Giza, Egypt"),
        new("Delta Beverage Factory", "buyers@deltabeverage.eg", "Omar", "Reda", "01113456789", "200456789012305", "42 Alexandria Desert Rd, Amreya, Alexandria, Egypt"),
        new("Cairo Furniture Industries", "orders@cairofurniture.eg", "Sherif", "Kamal", "01114567890", "200567890123406", "27 Autostrad Rd, Heliopolis, Cairo, Egypt"),
        new("Giza Pharma Manufacturing", "procurement@gizapharma.eg", "Nader", "Salem", "01115678901", "200678901234507", "8 Ahmed Zewail St, Dokki, Giza, Egypt"),
        new("Alexandria Garments Co.", "sourcing@alexgarments.eg", "Bassem", "Hafez", "01116789012", "200789012345608", "61 Port Said St, Miami, Alexandria, Egypt"),
        new("Suez Petrochemical Products", "materials@suezpetro.eg", "Ehab", "Nagy", "01117890123", "200890123456709", "3 Petrochemical Complex, Suez, Egypt"),
        new("Mansoura Agri Processing", "buyers@mansouraagri.eg", "Fady", "Zaki", "01118901234", "200901234567810", "21 El-Gomhouria St, Mansoura, Dakahlia, Egypt"),
        new("Tanta Dairy Manufacturing", "supply@tantadairy.eg", "Ramy", "Sobhy", "01119012345", "201012345678911", "5 El-Bahr St, Tanta, Gharbia, Egypt"),
        new("Red Sea Hotels Procurement", "procurement@redseahotels.eg", "Islam", "Barakat", "01120123456", "201123456789012", "12 Salam Rd, Hurghada, Red Sea, Egypt")
    };

    private sealed record CompanyProfile(
        string CompanyName,
        string Email,
        string ContactFirstName,
        string ContactLastName,
        string Phone,
        string TaxId,
        string Address);
}
