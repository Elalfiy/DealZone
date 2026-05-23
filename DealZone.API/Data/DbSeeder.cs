using BCrypt.Net;
using DealZone.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DealZone.API.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(ApplicationDbContext context)
        {
            await context.Database.MigrateAsync();

            if (await context.Users.AnyAsync())
            {
                return;
            }

            var categories = new List<Category>
            {
                new Category { Name = "Metals", NameAr = "معادن", Icon = "fas fa-industry" },
                new Category { Name = "Electronics", NameAr = "إلكترونيات", Icon = "fas fa-plug" },
                new Category { Name = "Chemicals", NameAr = "مواد كيميائية", Icon = "fas fa-flask" },
                new Category { Name = "Textiles", NameAr = "منسوجات", Icon = "fas fa-tshirt" },
                new Category { Name = "Packaging", NameAr = "تغليف", Icon = "fas fa-box" },
                new Category { Name = "Machinery", NameAr = "آلات", Icon = "fas fa-cogs" }
            };

            await context.Categories.AddRangeAsync(categories);
            await context.SaveChangesAsync();

            var random = new Random();

            var supplier1 = new User
            {
                Email = "sales@nilemetalworks.eg",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("NileSupply2026!", workFactor: 12),
                Role = "Supplier",
                IsVerified = true,
                CreatedAt = DateTime.UtcNow
            };

            var supplier2 = new User
            {
                Email = "contact@alexindustriessupply.eg",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("AlexSupply2026!", workFactor: 12),
                Role = "Supplier",
                IsVerified = true,
                CreatedAt = DateTime.UtcNow
            };

            var buyer1 = new User
            {
                Email = "procurement@alnasrgroup.eg",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("NasrBuyer2026!", workFactor: 12),
                Role = "Buyer",
                IsVerified = true,
                CreatedAt = DateTime.UtcNow
            };

            var buyer2 = new User
            {
                Email = "purchasing@deltapackages.eg",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("DeltaBuyer2026!", workFactor: 12),
                Role = "Buyer",
                IsVerified = true,
                CreatedAt = DateTime.UtcNow
            };

            await context.Users.AddRangeAsync(new[] { supplier1, supplier2, buyer1, buyer2 });
            await context.SaveChangesAsync();

            var companies = new List<Company>
            {
                new Company
                {
                    UserId = supplier1.Id,
                    Name = "Nile Metal Works",
                    TaxNumber = "1234567890",
                    Address = "14 El Tahrir Street, Nasr City, Cairo, Egypt",
                    LogoUrl = "/images/logos/nile-metal-works.png",
                    KycStatus = "Verified",
                    CreatedAt = DateTime.UtcNow
                },
                new Company
                {
                    UserId = supplier2.Id,
                    Name = "Alex Industrial Solutions",
                    TaxNumber = "0987654321",
                    Address = "24 El Horreya Road, Alexandria, Egypt",
                    LogoUrl = "/images/logos/alex-industrial-solutions.png",
                    KycStatus = "Verified",
                    CreatedAt = DateTime.UtcNow
                },
                new Company
                {
                    UserId = buyer1.Id,
                    Name = "Al Nasr Construction Supplies",
                    TaxNumber = "1122334455",
                    Address = "90 Corniche El Nile, Cairo, Egypt",
                    LogoUrl = "/images/logos/al-nasr-construction.png",
                    KycStatus = "Verified",
                    CreatedAt = DateTime.UtcNow
                },
                new Company
                {
                    UserId = buyer2.Id,
                    Name = "Delta Packaging & Logistics",
                    TaxNumber = "5566778899",
                    Address = "18 Salah Salem, Giza, Egypt",
                    LogoUrl = "/images/logos/delta-packaging.png",
                    KycStatus = "Verified",
                    CreatedAt = DateTime.UtcNow
                }
            };

            await context.Companies.AddRangeAsync(companies);
            await context.SaveChangesAsync();

            var productDefinitions = new[]
            {
                new { Name = "Galvanized Steel Coil", Category = "Metals", Unit = "kg", MinOrder = 100, Price = 14500m, Stock = 520, Description = "Cold-rolled galvanized steel coils for heavy construction and infrastructure applications." },
                new { Name = "Stainless Steel Sheets 304", Category = "Metals", Unit = "sheet", MinOrder = 10, Price = 8900m, Stock = 120, Description = "High-quality 304 stainless steel sheets for corrosion-resistant fabrication." },
                new { Name = "Carbon Steel Round Bar", Category = "Metals", Unit = "ton", MinOrder = 1, Price = 13250m, Stock = 35, Description = "Forged carbon steel bars for machinery shafts and structural components." },
                new { Name = "Aluminum Extruded Profiles", Category = "Metals", Unit = "meter", MinOrder = 200, Price = 70m, Stock = 650, Description = "Custom aluminum profiles for frames, windows, and industrial enclosures." },
                new { Name = "Copper Electrical Cable", Category = "Electronics", Unit = "meter", MinOrder = 500, Price = 42m, Stock = 2300, Description = "PVC-insulated copper cable for industrial power distribution." },
                new { Name = "LED High Bay Fixtures", Category = "Electronics", Unit = "piece", MinOrder = 20, Price = 1350m, Stock = 180, Description = "Energy-efficient LED high bay lights for warehouses and production halls." },
                new { Name = "Industrial PLC Controller", Category = "Electronics", Unit = "piece", MinOrder = 5, Price = 22000m, Stock = 42, Description = "Programmable logic controller for factory automation systems." },
                new { Name = "Metal Detector Sensor", Category = "Electronics", Unit = "piece", MinOrder = 10, Price = 5500m, Stock = 88, Description = "Sensor modules for industrial metal detection and quality control." },
                new { Name = "Polyester Woven Fabric", Category = "Textiles", Unit = "meter", MinOrder = 1000, Price = 38m, Stock = 12800, Description = "Durable polyester woven fabric for industrial uniforms and packaging." },
                new { Name = "Non-woven Geotextile", Category = "Textiles", Unit = "meter", MinOrder = 800, Price = 14m, Stock = 9400, Description = "High-strength geotextile fabric for civil engineering and drainage." },
                new { Name = "Industrial Cotton Canvas", Category = "Textiles", Unit = "meter", MinOrder = 300, Price = 92m, Stock = 710, Description = "Heavy-duty canvas for tarpaulins, covers, and protective equipment." },
                new { Name = "Nylon Conveyor Belt", Category = "Textiles", Unit = "meter", MinOrder = 150, Price = 105m, Stock = 430, Description = "Wear-resistant conveyor belts for material handling systems." },
                new { Name = "Corrugated Carton Boxes", Category = "Packaging", Unit = "piece", MinOrder = 1000, Price = 7.5m, Stock = 26000, Description = "Custom corrugated boxes for packaging and shipping operations." },
                new { Name = "Stretch Wrap Film", Category = "Packaging", Unit = "roll", MinOrder = 80, Price = 420m, Stock = 520, Description = "Machine-grade stretch film for pallet stabilization and export packing." },
                new { Name = "Foam Protective Inserts", Category = "Packaging", Unit = "piece", MinOrder = 500, Price = 18m, Stock = 4200, Description = "Protective foam inserts for fragile shipments and electronics." },
                new { Name = "Industrial Strapping Tape", Category = "Packaging", Unit = "roll", MinOrder = 120, Price = 170m, Stock = 300, Description = "High-strength strapping tape for securing pallets and crates." },
                new { Name = "Hydraulic Power Pack", Category = "Machinery", Unit = "piece", MinOrder = 2, Price = 49000m, Stock = 20, Description = "Hydraulic power packs for industrial presses and mobile equipment." },
                new { Name = "Gearbox Reducer", Category = "Machinery", Unit = "piece", MinOrder = 4, Price = 16800m, Stock = 38, Description = "Precision gearbox reducers for conveyor and material handling applications." },
                new { Name = "Industrial Air Compressor", Category = "Machinery", Unit = "piece", MinOrder = 1, Price = 78000m, Stock = 16, Description = "Oil-free industrial air compressor for production facilities." },
                new { Name = "Pneumatic Actuator", Category = "Machinery", Unit = "piece", MinOrder = 10, Price = 3950m, Stock = 120, Description = "Pneumatic actuator for automated valves and positioning systems." },
                new { Name = "Packaging Adhesive", Category = "Chemicals", Unit = "liter", MinOrder = 50, Price = 180m, Stock = 2200, Description = "Industrial adhesive for corrugated carton assembly and lamination." },
                new { Name = "Sodium Hypochlorite", Category = "Chemicals", Unit = "liter", MinOrder = 200, Price = 28m, Stock = 5100, Description = "Concentrated sodium hypochlorite for sanitation and wastewater treatment." },
                new { Name = "Industrial Detergent", Category = "Chemicals", Unit = "liter", MinOrder = 100, Price = 65m, Stock = 3400, Description = "Heavy-duty detergent for industrial cleaning and maintenance." },
                new { Name = "Polypropylene Pallet", Category = "Packaging", Unit = "piece", MinOrder = 50, Price = 620m, Stock = 540, Description = "Heavy-duty polypropylene pallets for export logistics." },
                new { Name = "Crimped Steel Wire", Category = "Metals", Unit = "kg", MinOrder = 200, Price = 68m, Stock = 1100, Description = "Crimped steel wire for fencing and reinforcement." },
                new { Name = "PVC Insulated Copper Tubing", Category = "Electronics", Unit = "meter", MinOrder = 250, Price = 28m, Stock = 3300, Description = "PVC insulated copper tubing for plumbing and instrumentation." },
                new { Name = "Aluminum Composite Panel", Category = "Metals", Unit = "sheet", MinOrder = 40, Price = 1680m, Stock = 260, Description = "Composite panels for architectural facades and signage." },
                new { Name = "Temperature Sensor Module", Category = "Electronics", Unit = "piece", MinOrder = 25, Price = 1950m, Stock = 180, Description = "Industrial temperature sensor modules for manufacturing process control." },
                new { Name = "Antistatic Fabric", Category = "Textiles", Unit = "meter", MinOrder = 600, Price = 54m, Stock = 7800, Description = "Antistatic textile fabric for electronics assembly and cleanrooms." },
                new { Name = "Corrugated Pallet Sleeves", Category = "Packaging", Unit = "piece", MinOrder = 300, Price = 95m, Stock = 4200, Description = "Reusable corrugated sleeves for pallet load containment." },
                new { Name = "Transformer Oil", Category = "Chemicals", Unit = "liter", MinOrder = 100, Price = 325m, Stock = 1600, Description = "Insulating transformer oil for electrical distribution equipment." },
                new { Name = "Industrial Lubricant", Category = "Chemicals", Unit = "liter", MinOrder = 80, Price = 145m, Stock = 3100, Description = "High-performance lubricant for heavy machinery and bearings." },
                new { Name = "Bulk Wool Yarn", Category = "Textiles", Unit = "kg", MinOrder = 150, Price = 95m, Stock = 1400, Description = "Wool yarn for textile and upholstery production." },
                new { Name = "Industrial Bubble Wrap", Category = "Packaging", Unit = "roll", MinOrder = 30, Price = 240m, Stock = 650, Description = "High-impact bubble wrap for secure goods protection." },
                new { Name = "Machine Control Panel", Category = "Electronics", Unit = "piece", MinOrder = 5, Price = 32000m, Stock = 26, Description = "Custom machine control panel assembly for manufacturing automation." },
                new { Name = "Steel Fasteners Kit", Category = "Metals", Unit = "box", MinOrder = 20, Price = 760m, Stock = 1220, Description = "Assorted steel fasteners for assembly and installation." },
                new { Name = "Honeycomb Cardboard Inserts", Category = "Packaging", Unit = "piece", MinOrder = 200, Price = 55m, Stock = 5900, Description = "Honeycomb cardboard inserts for heavy packaging reinforcement." },
                new { Name = "Coated Fabric Roll", Category = "Textiles", Unit = "meter", MinOrder = 500, Price = 132m, Stock = 7200, Description = "Polyurethane-coated fabric for outdoor covers and tarpaulins." },
                new { Name = "Remote Monitoring Sensor", Category = "Electronics", Unit = "piece", MinOrder = 15, Price = 4450m, Stock = 95, Description = "Remote monitoring sensors for industrial asset tracking." },
                new { Name = "Industrial Paint Thinner", Category = "Chemicals", Unit = "liter", MinOrder = 100, Price = 52m, Stock = 4000, Description = "Solvent-based thinner for industrial paint and coatings." },
                new { Name = "BOPP Packing Film", Category = "Packaging", Unit = "roll", MinOrder = 60, Price = 320m, Stock = 610, Description = "Biaxially oriented polypropylene film for wrapping and packaging." },
                new { Name = "Stainless Steel Fastener Set", Category = "Metals", Unit = "box", MinOrder = 30, Price = 1250m, Stock = 860, Description = "Stainless steel fasteners for corrosion-resistant construction." },
                new { Name = "Industrial Level Transmitter", Category = "Electronics", Unit = "piece", MinOrder = 8, Price = 17900m, Stock = 42, Description = "Level transmitters for liquid storage and process measurement." }
            };

            var products = new List<Product>();
            var productIndex = 0;

            foreach (var definition in productDefinitions)
            {
                var category = categories.First(c => c.Name == definition.Category);
                var supplier = productIndex % 2 == 0 ? supplier1 : supplier2;
                products.Add(new Product
                {
                    SupplierId = supplier.Id,
                    CategoryId = category.Id,
                    Name = definition.Name,
                    Description = definition.Description,
                    Unit = definition.Unit,
                    MinOrderQty = definition.MinOrder,
                    PricePerUnit = definition.Price,
                    Stock = definition.Stock,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-random.Next(30, 120))
                });
                productIndex++;
            }

            await context.Products.AddRangeAsync(products);
            await context.SaveChangesAsync();

            var productsByName = products.ToDictionary(p => p.Name, p => p);

            var rfqs = new List<RFQ>
            {
                new RFQ
                {
                    BuyerId = buyer1.Id,
                    ProductId = productsByName["Galvanized Steel Coil"].Id,
                    Quantity = 220,
                    DeliveryDate = DateTime.UtcNow.AddDays(28),
                    Notes = "Supply galvanized steel coils for an upcoming bridge reinforcement project.",
                    Status = "Open",
                    CreatedAt = DateTime.UtcNow.AddDays(-18)
                },
                new RFQ
                {
                    BuyerId = buyer2.Id,
                    ProductId = productsByName["Aluminum Extruded Profiles"].Id,
                    Quantity = 820,
                    DeliveryDate = DateTime.UtcNow.AddDays(35),
                    Notes = "Profiles needed for new furniture assembly and industrial shelving units.",
                    Status = "Open",
                    CreatedAt = DateTime.UtcNow.AddDays(-14)
                },
                new RFQ
                {
                    BuyerId = buyer1.Id,
                    ProductId = productsByName["LED High Bay Fixtures"].Id,
                    Quantity = 65,
                    DeliveryDate = DateTime.UtcNow.AddDays(20),
                    Notes = "Warehouse lighting upgrade for the northern logistics hub.",
                    Status = "Awarded",
                    CreatedAt = DateTime.UtcNow.AddDays(-22)
                },
                new RFQ
                {
                    BuyerId = buyer2.Id,
                    ProductId = productsByName["Industrial Air Compressor"].Id,
                    Quantity = 2,
                    DeliveryDate = DateTime.UtcNow.AddDays(45),
                    Notes = "New air compressors for the production facility maintenance line.",
                    Status = "Open",
                    CreatedAt = DateTime.UtcNow.AddDays(-10)
                }
            };

            await context.RFQs.AddRangeAsync(rfqs);
            await context.SaveChangesAsync();

            var bids = new List<RFQBid>
            {
                new RFQBid
                {
                    RFQId = rfqs[0].Id,
                    SupplierId = supplier1.Id,
                    PricePerUnit = 13800m,
                    DeliveryDays = 22,
                    Notes = "Ready stock with prioritized loading for bridge project delivery.",
                    IsAwarded = false,
                    CreatedAt = DateTime.UtcNow.AddDays(-17)
                },
                new RFQBid
                {
                    RFQId = rfqs[1].Id,
                    SupplierId = supplier2.Id,
                    PricePerUnit = 69m,
                    DeliveryDays = 30,
                    Notes = "Full quality inspection and batch certification included.",
                    IsAwarded = false,
                    CreatedAt = DateTime.UtcNow.AddDays(-13)
                },
                new RFQBid
                {
                    RFQId = rfqs[2].Id,
                    SupplierId = supplier2.Id,
                    PricePerUnit = 1240m,
                    DeliveryDays = 18,
                    Notes = "Warehouse-ready fixtures with full shipping insurance.",
                    IsAwarded = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-21)
                },
                new RFQBid
                {
                    RFQId = rfqs[2].Id,
                    SupplierId = supplier1.Id,
                    PricePerUnit = 1310m,
                    DeliveryDays = 20,
                    Notes = "Alternative supplier bid available with delivery buffer.",
                    IsAwarded = false,
                    CreatedAt = DateTime.UtcNow.AddDays(-20)
                }
            };

            await context.RFQBids.AddRangeAsync(bids);
            await context.SaveChangesAsync();

            var awardedOrder = new Order
            {
                BuyerId = buyer1.Id,
                SupplierId = supplier2.Id,
                ProductId = productsByName["LED High Bay Fixtures"].Id,
                Quantity = rfqs[2].Quantity,
                TotalAmount = bids.First(b => b.RFQId == rfqs[2].Id && b.IsAwarded).PricePerUnit * rfqs[2].Quantity,
                Status = "Completed",
                CreatedAt = DateTime.UtcNow.AddDays(-20)
            };

            await context.Orders.AddAsync(awardedOrder);
            await context.SaveChangesAsync();

            var escrow = new EscrowAccount
            {
                OrderId = awardedOrder.Id,
                Amount = awardedOrder.TotalAmount,
                Status = "Released",
                HeldAt = DateTime.UtcNow.AddDays(-20),
                ReleasedAt = DateTime.UtcNow.AddDays(-5)
            };

            var shipment = new Shipment
            {
                OrderId = awardedOrder.Id,
                TrackingNumber = "EGX-AX123456789",
                Carrier = "Egypt Post Logistics",
                Status = "Delivered",
                EstimatedDelivery = DateTime.UtcNow.AddDays(-7),
                UpdatedAt = DateTime.UtcNow.AddDays(-5)
            };

            var review = new Review
            {
                OrderId = awardedOrder.Id,
                ReviewerId = buyer1.Id,
                SupplierId = supplier2.Id,
                Rating = 5,
                Comment = "Delivery and quality were excellent. The supplier handled the order professionally and met the delivery schedule.",
                CreatedAt = DateTime.UtcNow.AddDays(-4)
            };

            await context.EscrowAccounts.AddAsync(escrow);
            await context.Shipments.AddAsync(shipment);
            await context.Reviews.AddAsync(review);
            await context.SaveChangesAsync();

            var notifications = new List<Notification>
            {
                new Notification
                {
                    UserId = supplier2.Id,
                    Title = "New RFQ awarded",
                    Message = "Your bid for LED High Bay Fixtures was awarded and the order has been created.",
                    CreatedAt = DateTime.UtcNow.AddDays(-20)
                },
                new Notification
                {
                    UserId = buyer1.Id,
                    Title = "Escrow released",
                    Message = "Payment for the completed order has been released from escrow.",
                    CreatedAt = DateTime.UtcNow.AddDays(-5)
                },
                new Notification
                {
                    UserId = buyer2.Id,
                    Title = "RFQ published",
                    Message = "Your RFQ for Aluminum Extruded Profiles is now open and accepting supplier bids.",
                    CreatedAt = DateTime.UtcNow.AddDays(-14)
                },
                new Notification
                {
                    UserId = supplier1.Id,
                    Title = "Incoming RFQ",
                    Message = "A new RFQ for Galvanized Steel Coil is available for your product catalog.",
                    CreatedAt = DateTime.UtcNow.AddDays(-18)
                }
            };

            await context.Notifications.AddRangeAsync(notifications);
            await context.SaveChangesAsync();
        }
    }
}
