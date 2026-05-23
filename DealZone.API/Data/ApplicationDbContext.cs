using DealZone.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DealZone.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Company> Companies { get; set; } = null!;
        public DbSet<Category> Categories { get; set; } = null!;
        public DbSet<Product> Products { get; set; } = null!;
        public DbSet<RFQ> RFQs { get; set; } = null!;
        public DbSet<RFQBid> RFQBids { get; set; } = null!;
        public DbSet<Tender> Tenders { get; set; } = null!;
        public DbSet<TenderBid> TenderBids { get; set; } = null!;
        public DbSet<Order> Orders { get; set; } = null!;
        public DbSet<EscrowAccount> EscrowAccounts { get; set; } = null!;
        public DbSet<Dispute> Disputes { get; set; } = null!;
        public DbSet<Shipment> Shipments { get; set; } = null!;
        public DbSet<Review> Reviews { get; set; } = null!;
        public DbSet<KycDocument> KycDocuments { get; set; } = null!;
        public DbSet<Notification> Notifications { get; set; } = null!;
        public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            builder.Entity<Company>()
                .HasOne(c => c.User)
                .WithOne(u => u.Company)
                .HasForeignKey<Company>(c => c.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Company>()
                .HasMany(c => c.KycDocuments)
                .WithOne(d => d.Company)
                .HasForeignKey(d => d.CompanyId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Category>()
                .HasMany(c => c.Products)
                .WithOne(p => p.Category)
                .HasForeignKey(p => p.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Product>()
                .HasOne(p => p.Supplier)
                .WithMany(u => u.Products)
                .HasForeignKey(p => p.SupplierId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Category>()
                .HasMany(c => c.Tenders)
                .WithOne(t => t.Category)
                .HasForeignKey(t => t.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<RFQ>()
                .HasMany(r => r.Bids)
                .WithOne(b => b.RFQ)
                .HasForeignKey(b => b.RFQId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Tender>()
                .HasMany(t => t.Bids)
                .WithOne(b => b.Tender)
                .HasForeignKey(b => b.TenderId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Tender>()
                .HasOne(t => t.Buyer)
                .WithMany(u => u.Tenders)
                .HasForeignKey(t => t.BuyerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<RFQ>()
                .HasOne(r => r.Buyer)
                .WithMany(u => u.RFQs)
                .HasForeignKey(r => r.BuyerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Order>()
                .HasOne(o => o.EscrowAccount)
                .WithOne(e => e.Order)
                .HasForeignKey<EscrowAccount>(e => e.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Order>()
                .HasOne(o => o.Shipment)
                .WithOne(s => s.Order)
                .HasForeignKey<Shipment>(s => s.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Order>()
                .HasOne(o => o.Review)
                .WithOne(r => r.Order)
                .HasForeignKey<Review>(r => r.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Order>()
                .HasOne(o => o.Dispute)
                .WithOne(d => d.Order)
                .HasForeignKey<Dispute>(d => d.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<RefreshToken>()
                .HasOne(r => r.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<RFQBid>()
                .HasOne(b => b.Supplier)
                .WithMany(u => u.RFQBids)
                .HasForeignKey(b => b.SupplierId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<TenderBid>()
                .HasOne(b => b.Supplier)
                .WithMany(u => u.TenderBids)
                .HasForeignKey(b => b.SupplierId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Order>()
                .HasOne(o => o.Buyer)
                .WithMany(u => u.BuyerOrders)
                .HasForeignKey(o => o.BuyerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Order>()
                .HasOne(o => o.Supplier)
                .WithMany(u => u.SupplierOrders)
                .HasForeignKey(o => o.SupplierId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Dispute>()
                .HasOne(d => d.RaisedBy)
                .WithMany(u => u.Disputes)
                .HasForeignKey(d => d.RaisedById)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Review>()
                .HasOne(r => r.Reviewer)
                .WithMany(u => u.WrittenReviews)
                .HasForeignKey(r => r.ReviewerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Review>()
                .HasOne(r => r.Supplier)
                .WithMany(u => u.ReceivedReviews)
                .HasForeignKey(r => r.SupplierId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
