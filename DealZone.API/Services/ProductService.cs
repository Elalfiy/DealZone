using DealZone.API.Data;
using DealZone.API.DTOs;
using DealZone.API.Helpers;
using DealZone.API.Models;
using DealZone.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DealZone.API.Services
{
    public class ProductService : IProductService
    {
        private readonly ApplicationDbContext _context;

        public ProductService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CategoryDto>> GetCategoriesAsync()
        {
            return await _context.Categories
                .OrderBy(c => c.Name)
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    NameAr = c.NameAr,
                    Icon = c.Icon
                })
                .ToListAsync();
        }

        public async Task<PaginatedResult<ProductDto>> GetProductsAsync(int? categoryId, string? search, decimal? minPrice, decimal? maxPrice, int page, int pageSize)
        {
            var query = _context.Products.Include(p => p.Category).AsQueryable();

            if (categoryId.HasValue)
                query = query.Where(p => p.CategoryId == categoryId.Value);

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(p => p.Name.Contains(search) || p.Description!.Contains(search));

            if (minPrice.HasValue)
                query = query.Where(p => p.PricePerUnit >= minPrice.Value);

            if (maxPrice.HasValue)
                query = query.Where(p => p.PricePerUnit <= maxPrice.Value);

            var total = await query.LongCountAsync();
            var items = await query
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new ProductDto
                {
                    Id = p.Id,
                    SupplierId = p.SupplierId,
                    CategoryId = p.CategoryId,
                    Name = p.Name,
                    Description = p.Description,
                    Unit = p.Unit,
                    MinOrderQty = p.MinOrderQty,
                    PricePerUnit = p.PricePerUnit,
                    Stock = p.Stock,
                    IsActive = p.IsActive,
                    CreatedAt = p.CreatedAt,
                    Category = p.Category == null ? null : new CategoryDto
                    {
                        Id = p.Category.Id,
                        Name = p.Category.Name,
                        NameAr = p.Category.NameAr,
                        Icon = p.Category.Icon
                    }
                })
                .ToListAsync();

            return new PaginatedResult<ProductDto>
            {
                Items = items,
                Page = page,
                PageSize = pageSize,
                Total = total
            };
        }

        public async Task<ProductDto> GetProductByIdAsync(int id)
        {
            var product = await _context.Products.Include(p => p.Category).FirstOrDefaultAsync(p => p.Id == id);
            if (product == null)
                throw new ApplicationException("Product not found.");

            return new ProductDto
            {
                Id = product.Id,
                SupplierId = product.SupplierId,
                CategoryId = product.CategoryId,
                Name = product.Name,
                Description = product.Description,
                Unit = product.Unit,
                MinOrderQty = product.MinOrderQty,
                PricePerUnit = product.PricePerUnit,
                Stock = product.Stock,
                IsActive = product.IsActive,
                CreatedAt = product.CreatedAt,
                Category = product.Category == null ? null : new CategoryDto
                {
                    Id = product.Category.Id,
                    Name = product.Category.Name,
                    NameAr = product.Category.NameAr,
                    Icon = product.Category.Icon
                }
            };
        }

        public async Task<ProductDto> CreateProductAsync(int supplierId, ProductCreateDto request)
        {
            var supplier = await _context.Users.FindAsync(supplierId);
            if (supplier == null)
                throw new ApplicationException("Supplier not found.");

            var category = await _context.Categories.FindAsync(request.CategoryId);
            if (category == null)
                throw new ApplicationException("Category not found.");

            var product = new Product
            {
                SupplierId = supplierId,
                CategoryId = request.CategoryId,
                Name = request.Name,
                Description = request.Description,
                Unit = request.Unit,
                MinOrderQty = request.MinOrderQty,
                PricePerUnit = request.PricePerUnit,
                Stock = request.Stock,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return await GetProductByIdAsync(product.Id);
        }

        public async Task<ProductDto> UpdateProductAsync(int supplierId, int id, ProductUpdateDto request)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null || product.SupplierId != supplierId)
                throw new ApplicationException("Product not found or access denied.");

            if (request.CategoryId != product.CategoryId)
            {
                var category = await _context.Categories.FindAsync(request.CategoryId);
                if (category == null)
                    throw new ApplicationException("Category not found.");
            }

            product.Name = request.Name;
            product.Description = request.Description;
            product.Unit = request.Unit;
            product.MinOrderQty = request.MinOrderQty;
            product.PricePerUnit = request.PricePerUnit;
            product.Stock = request.Stock;
            product.IsActive = request.IsActive;
            product.CategoryId = request.CategoryId;

            await _context.SaveChangesAsync();
            return await GetProductByIdAsync(product.Id);
        }

        public async Task DeleteProductAsync(int supplierId, int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null || product.SupplierId != supplierId)
                throw new ApplicationException("Product not found or access denied.");

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
        }
    }
}
