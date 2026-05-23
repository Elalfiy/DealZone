using DealZone.API.DTOs;
using DealZone.API.Helpers;
using DealZone.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DealZone.API.Controllers
{
    [ApiController]
    [Route("api/products")]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductsController(IProductService productService)
        {
            _productService = productService;
        }

        [HttpGet]
        public async Task<IActionResult> GetProducts([FromQuery] int? categoryId, [FromQuery] string? search, [FromQuery] decimal? minPrice,
            [FromQuery] decimal? maxPrice, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var results = await _productService.GetProductsAsync(categoryId, search, minPrice, maxPrice, page, pageSize);
            return Ok(new DealZone.API.Helpers.ApiResponse<PaginatedResult<ProductDto>> { Data = results });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProduct(int id)
        {
            var product = await _productService.GetProductByIdAsync(id);
            return Ok(new DealZone.API.Helpers.ApiResponse<ProductDto> { Data = product });
        }

        [Authorize(Roles = "Supplier")]
        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] ProductCreateDto request)
        {
            var supplierId = User.GetUserId();
            var product = await _productService.CreateProductAsync(supplierId, request);
            return Ok(new DealZone.API.Helpers.ApiResponse<ProductDto> { Data = product });
        }

        [Authorize(Roles = "Supplier")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] ProductUpdateDto request)
        {
            var supplierId = User.GetUserId();
            var product = await _productService.UpdateProductAsync(supplierId, id, request);
            return Ok(new DealZone.API.Helpers.ApiResponse<ProductDto> { Data = product });
        }

        [Authorize(Roles = "Supplier")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var supplierId = User.GetUserId();
            await _productService.DeleteProductAsync(supplierId, id);
            return Ok(new DealZone.API.Helpers.ApiResponse<object> { Data = null, Message = "Product deleted." });
        }
    }
}
