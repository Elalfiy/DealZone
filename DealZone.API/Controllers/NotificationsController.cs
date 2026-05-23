using DealZone.API.DTOs;
using DealZone.API.Helpers;
using DealZone.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DealZone.API.Controllers
{
    [ApiController]
    [Route("api/notifications")]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationsController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            var userId = User.GetUserId();
            var result = await _notificationService.GetNotificationsAsync(userId);
            return Ok(new DealZone.API.Helpers.ApiResponse<IEnumerable<NotificationDto>> { Data = result });
        }

        [Authorize]
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkRead(int id)
        {
            var userId = User.GetUserId();
            await _notificationService.MarkReadAsync(userId, id);
            return Ok(new DealZone.API.Helpers.ApiResponse<object> { Data = null, Message = "Notification marked as read." });
        }

        [Authorize]
        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllRead()
        {
            var userId = User.GetUserId();
            await _notificationService.MarkAllReadAsync(userId);
            return Ok(new DealZone.API.Helpers.ApiResponse<object> { Data = null, Message = "All notifications marked as read." });
        }
    }
}
