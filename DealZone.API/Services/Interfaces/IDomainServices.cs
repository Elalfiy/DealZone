using DealZone.API.DTOs;
using DealZone.API.Helpers;

namespace DealZone.API.Services.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request);
        Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request, IFormFile? kycDocument);
        Task<AuthResponseDto> LoginAsync(LoginRequestDto request);
        Task<AuthResponseDto> RefreshTokenAsync(string refreshToken);
        Task LogoutAsync(int userId, string refreshToken);
    }

    public interface IUserService
    {
        Task<UserProfileDto> GetProfileAsync(int userId);
        Task<UserProfileDto> UpdateProfileAsync(int userId, UserProfileUpdateDto request);
        Task<IEnumerable<CompanyDto>> GetApprovedCompaniesAsync();
        Task<CompanyDto> GetCompanyAsync(int companyId);
        Task<CompanyDto> UpdateCompanyAsync(int companyId, CompanyUpdateDto request);
        Task<KycStatusDto> UploadKycDocumentAsync(int userId, KycUploadDto request);
        Task<KycStatusDto> UploadKycFileAsync(int userId, IFormFile file, string docType);
        Task<KycStatusDto> GetKycStatusAsync(int userId);
    }

    public interface IProductService
    {
        Task<PaginatedResult<ProductDto>> GetProductsAsync(int? categoryId, string? search, decimal? minPrice, decimal? maxPrice, int page, int pageSize);
        Task<ProductDto> GetProductByIdAsync(int id);
        Task<ProductDto> CreateProductAsync(int supplierId, ProductCreateDto request);
        Task<ProductDto> UpdateProductAsync(int supplierId, int id, ProductUpdateDto request);
        Task DeleteProductAsync(int supplierId, int id);
        Task<IEnumerable<CategoryDto>> GetCategoriesAsync();
    }

    public interface IRFQService
    {
        Task<RFQDto> CreateRFQAsync(int buyerId, RFQCreateDto request);
        Task<PaginatedResult<RFQDto>> GetMyRFQsAsync(int buyerId, string? status, int page, int pageSize);
        Task<RFQDto> GetRFQByIdAsync(int id);
        Task<PaginatedResult<RFQDto>> GetIncomingRFQsAsync(int supplierId, int page, int pageSize);
        Task<RFQBidDto> SubmitBidAsync(int supplierId, int rfqId, RFQBidCreateDto request);
        Task<IEnumerable<RFQBidDto>> GetBidsAsync(int rfqId);
        Task AwardBidAsync(int buyerId, int rfqId, int bidId);
    }

    public interface ITenderService
    {
        Task<TenderDto> CreateTenderAsync(int buyerId, TenderCreateDto request);
        Task<PaginatedResult<TenderDto>> GetTendersAsync(int? categoryId, string? status, int page, int pageSize);
        Task<TenderDto> GetTenderByIdAsync(int id);
        Task<TenderBidDto> SubmitTenderBidAsync(int supplierId, int tenderId, TenderBidCreateDto request);
        Task<IEnumerable<TenderBidDto>> GetTenderBidsAsync(int tenderId);
        Task AwardTenderBidAsync(int buyerId, int tenderId, int bidId);
    }

    public interface IOrderService
    {
        Task<PaginatedResult<OrderDto>> GetOrdersAsync(string? status, int page, int pageSize, int userId, string role);
        Task<OrderDto> GetOrderByIdAsync(int id, int userId, string role);
        Task<OrderDto> CreateOrderAsync(OrderCreateDto request);
        Task<OrderDto> UpdateOrderStatusAsync(int id, UpdateOrderStatusDto request, int userId, string role);
    }

    public interface IEscrowService
    {
        Task<EscrowDto> GetEscrowAsync(int orderId, int userId, string role);
        Task<EscrowDto> ReleaseEscrowAsync(int orderId, int userId);
        Task<EscrowDto> DisputeEscrowAsync(int orderId, int userId, EscrowDisputeDto request);
    }

    public interface IShipmentService
    {
        Task<ShipmentDto> GetShipmentAsync(int orderId, int userId, string role);
        Task<ShipmentDto> UpdateShipmentAsync(int orderId, int userId, ShipmentUpdateDto request);
    }

    public interface IAnalyticsService
    {
        Task<AnalyticsSummaryDto> GetSummaryAsync(int userId, string role);
        Task<IEnumerable<ChartPointDto>> GetOrdersChartAsync(int userId, string role);
        Task<IEnumerable<ChartPointDto>> GetRevenueChartAsync(int userId, string role);
        Task<IEnumerable<SupplierSummaryDto>> GetTopSuppliersAsync(int buyerId);
        Task<IEnumerable<PriceTrendDto>> GetPriceTrendsAsync(int? categoryId);
    }

    public interface IReviewService
    {
        Task<ReviewDto> CreateReviewAsync(int buyerId, ReviewCreateDto request);
        Task<IEnumerable<ReviewDto>> GetReviewsBySupplierAsync(int supplierId);
    }

    public interface INotificationService
    {
        Task<IEnumerable<NotificationDto>> GetNotificationsAsync(int userId);
        Task MarkReadAsync(int userId, int notificationId);
        Task MarkAllReadAsync(int userId);
    }
}
