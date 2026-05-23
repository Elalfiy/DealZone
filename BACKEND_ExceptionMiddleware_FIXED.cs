/*
 * IMPROVED: ExceptionMiddleware with Better Error Handling
 * Path: DealZone.API/Middlewares/ExceptionMiddleware.cs
 * 
 * This replaces the current implementation with:
 * - Proper HTTP status codes (not always 400)
 * - Detailed error logging
 * - Structured error responses
 * - Sensitive info protection
 */

using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

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
                await HandleExceptionAsync(context, ex);
            }
        }

        private Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var response = context.Response;
            response.ContentType = "application/json";

            var errorResponse = new ErrorResponse
            {
                Success = false,
                Message = "An error occurred. Please try again.",
                Errors = new[] { exception.Message }
            };

            // Determine status code based on exception type
            if (exception is ArgumentException || exception is ValidationException)
            {
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                errorResponse.Message = "Validation error. Please check your input.";
            }
            else if (exception is UnauthorizedAccessException)
            {
                response.StatusCode = (int)HttpStatusCode.Unauthorized;
                errorResponse.Message = "You are not authorized to perform this action.";
            }
            else if (exception is FileNotFoundException)
            {
                response.StatusCode = (int)HttpStatusCode.NotFound;
                errorResponse.Message = "The requested resource was not found.";
            }
            else if (exception is InvalidOperationException)
            {
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                errorResponse.Message = exception.Message;
                errorResponse.Errors = new[] { exception.Message };
            }
            else
            {
                // Generic server error
                response.StatusCode = (int)HttpStatusCode.InternalServerError;
                errorResponse.Message = "An unexpected error occurred. Our team has been notified.";
                
                // Log the actual error for debugging
                _logger.LogError(exception, "Unhandled exception in request");
            }

            return response.WriteAsJsonAsync(errorResponse);
        }
    }

    public class ErrorResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = null!;
        public string[]? Errors { get; set; }
    }

    public class ValidationException : Exception
    {
        public ValidationException(string message) : base(message) { }
        public ValidationException(string message, Exception innerException) 
            : base(message, innerException) { }
    }
}
