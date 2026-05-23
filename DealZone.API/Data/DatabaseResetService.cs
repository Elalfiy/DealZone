using Microsoft.EntityFrameworkCore;

namespace DealZone.API.Data;

/// <summary>
/// Removes all application data while preserving schema/migrations.
/// </summary>
public static class DatabaseResetService
{
    public static async Task ClearAllDataAsync(ApplicationDbContext context)
    {
        await context.Database.MigrateAsync();

        await context.Reviews.ExecuteDeleteAsync();
        await context.Disputes.ExecuteDeleteAsync();
        await context.Shipments.ExecuteDeleteAsync();
        await context.EscrowAccounts.ExecuteDeleteAsync();
        await context.RFQBids.ExecuteDeleteAsync();
        await context.TenderBids.ExecuteDeleteAsync();
        await context.Orders.ExecuteDeleteAsync();
        await context.RFQs.ExecuteDeleteAsync();
        await context.Tenders.ExecuteDeleteAsync();
        await context.Products.ExecuteDeleteAsync();
        await context.KycDocuments.ExecuteDeleteAsync();
        await context.Notifications.ExecuteDeleteAsync();
        await context.RefreshTokens.ExecuteDeleteAsync();
        await context.Companies.ExecuteDeleteAsync();
        await context.Users.ExecuteDeleteAsync();
        await context.Categories.ExecuteDeleteAsync();
    }
}
