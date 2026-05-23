namespace DealZone.API.DTOs;

public class CompanyUpdateDto
{
    public string? Name { get; set; }
    public string? Address { get; set; }
}

public class EscrowDisputeDto
{
    public string? Reason { get; set; }
}

public class OrderCreateDto
{
    public int BuyerId { get; set; }
    public int SupplierId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
}

public class UpdateOrderStatusDto
{
    public string Status { get; set; } = string.Empty;
}

public class ProductCreateDto
{
    public int CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Unit { get; set; } = string.Empty;
    public int MinOrderQty { get; set; }
    public decimal PricePerUnit { get; set; }
    public int Stock { get; set; }
}

public class ProductUpdateDto
{
    public int CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Unit { get; set; } = string.Empty;
    public int MinOrderQty { get; set; }
    public decimal PricePerUnit { get; set; }
    public int Stock { get; set; }
    public bool IsActive { get; set; }
}

public class ReviewCreateDto
{
    public int OrderId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
}

public class UserProfileUpdateDto
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Phone { get; set; }
}

public class RFQCreateDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public DateTime DeliveryDate { get; set; }
    public string? Notes { get; set; }
}

public class RFQBidCreateDto
{
    public decimal PricePerUnit { get; set; }
    public int DeliveryDays { get; set; }
    public string? Notes { get; set; }
}

public class ShipmentUpdateDto
{
    public string? TrackingNumber { get; set; }
    public string? Carrier { get; set; }
    public string? Status { get; set; }
    public DateTime? EstimatedDelivery { get; set; }
}

public class TenderCreateDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int CategoryId { get; set; }
    public int Quantity { get; set; }
    public decimal BudgetMax { get; set; }
    public DateTime DeadlineAt { get; set; }
}

public class TenderBidCreateDto
{
    public decimal TotalPrice { get; set; }
    public int DeliveryDays { get; set; }
    public string? Proposal { get; set; }
}

public class NotificationDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class EscrowDto
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime HeldAt { get; set; }
    public DateTime? ReleasedAt { get; set; }
}

public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? NameAr { get; set; }
    public string? Icon { get; set; }
}

public class ProductDto
{
    public int Id { get; set; }
    public int SupplierId { get; set; }
    public int CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Unit { get; set; }
    public int MinOrderQty { get; set; }
    public decimal PricePerUnit { get; set; }
    public int Stock { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public CategoryDto? Category { get; set; }
    public string? SupplierName { get; set; }
    public string? SupplierEmail { get; set; }
    public string? SupplierLocation { get; set; }
    public bool SupplierVerified { get; set; }
}

public class OrderDto
{
    public int Id { get; set; }
    public int BuyerId { get; set; }
    public int SupplierId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public ProductDto? Product { get; set; }
}

public class TenderDto
{
    public int Id { get; set; }
    public int BuyerId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int CategoryId { get; set; }
    public int Quantity { get; set; }
    public decimal BudgetMax { get; set; }
    public DateTime DeadlineAt { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public CategoryDto? Category { get; set; }
}

public class TenderBidDto
{
    public int Id { get; set; }
    public int TenderId { get; set; }
    public int SupplierId { get; set; }
    public decimal TotalPrice { get; set; }
    public int DeliveryDays { get; set; }
    public string? Proposal { get; set; }
    public bool IsAwarded { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class RFQDto
{
    public int Id { get; set; }
    public int BuyerId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public DateTime DeliveryDate { get; set; }
    public string? Notes { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public ProductDto? Product { get; set; }
}

public class RFQBidDto
{
    public int Id { get; set; }
    public int RFQId { get; set; }
    public int SupplierId { get; set; }
    public decimal PricePerUnit { get; set; }
    public int DeliveryDays { get; set; }
    public string? Notes { get; set; }
    public bool IsAwarded { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ShipmentDto
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public string? TrackingNumber { get; set; }
    public string? Carrier { get; set; }
    public string? Status { get; set; }
    public DateTime? EstimatedDelivery { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class ReviewDto
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int ReviewerId { get; set; }
    public int SupplierId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CompanyDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? TaxNumber { get; set; }
    public string? LogoUrl { get; set; }
    public string? KycStatus { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UserProfileDto
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Phone { get; set; }
    public string Role { get; set; } = string.Empty;
    public bool IsVerified { get; set; }
    public CompanyDto? Company { get; set; }
}

public class KycUploadDto
{
    public string? DocumentType { get; set; }
    public string? FileName { get; set; }
    public byte[]? FileContent { get; set; }
}

public class KycStatusDto
{
    public string Status { get; set; } = string.Empty;
    public string? Message { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class AnalyticsSummaryDto
{
    public int OrdersCount { get; set; }
    public decimal Revenue { get; set; }
    public int PendingRfqs { get; set; }
    public int ActiveProducts { get; set; }
}

public class ChartPointDto
{
    public string Label { get; set; } = string.Empty;
    public decimal Value { get; set; }
}

public class PriceTrendDto
{
    public string CategoryName { get; set; } = string.Empty;
    public decimal AveragePrice { get; set; }
}

public class SupplierSummaryDto
{
    public int SupplierId { get; set; }
    public string SupplierEmail { get; set; } = string.Empty;
    public int OrdersCount { get; set; }
    public decimal TotalRevenue { get; set; }
}
