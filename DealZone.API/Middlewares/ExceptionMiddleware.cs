using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Http;

namespace DealZone.API.Middlewares
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception occurred.");
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var response = new
            {
                success = false,
                message = exception.Message,
                errors = new string[] { },
                statusCode = (int)HttpStatusCode.BadRequest
            };

            context.Response.ContentType = "application/json";
            // Always 200 so CORS headers are not stripped on business/validation errors
            context.Response.StatusCode = (int)HttpStatusCode.OK;
            return context.Response.WriteAsync(JsonSerializer.Serialize(new
            {
                success = false,
                message = exception.Message,
                errors = Array.Empty<string>()
            }));
        }
    }
}
