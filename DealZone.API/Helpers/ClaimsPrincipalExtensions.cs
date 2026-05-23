using System.Security.Claims;

namespace DealZone.API.Helpers
{
    public static class ClaimsPrincipalExtensions
    {
        public static int GetUserId(this ClaimsPrincipal principal)
        {
            var claim = principal.FindFirst("userId") ?? principal.FindFirst(ClaimTypes.NameIdentifier);
            return int.TryParse(claim?.Value, out var id) ? id : 0;
        }

        public static string GetRole(this ClaimsPrincipal principal)
        {
            return principal.FindFirst(ClaimTypes.Role)?.Value ?? principal.FindFirst("role")?.Value ?? string.Empty;
        }
    }
}
