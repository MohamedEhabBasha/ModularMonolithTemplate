using BuildingBlocks.Application.Contracts.Persistence;
using Microsoft.EntityFrameworkCore;

namespace BuildingBlocks.Infrastructure.Persistence;

public class UnitOfWork<TContext>(TContext context) : IUnitOfWork where TContext : DbContext
{
    public async Task<bool> CommitAsync(CancellationToken cancellationToken = default)
        => await context.SaveChangesAsync(cancellationToken) > 0;

    public async Task<bool> ExecuteInTransactionAsync(Func<Task<bool>> operation, CancellationToken cancellationToken = default)
    {
        // Works whether or not EnableRetryOnFailure is turned on.
        var strategy = context.Database.CreateExecutionStrategy();

        return await strategy.ExecuteAsync(async () =>
        {
            await using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);

            if (!await operation())
            {
                await transaction.RollbackAsync(cancellationToken);
                return false;
            }

            await transaction.CommitAsync(cancellationToken);
            return true;
        });
    }
}
