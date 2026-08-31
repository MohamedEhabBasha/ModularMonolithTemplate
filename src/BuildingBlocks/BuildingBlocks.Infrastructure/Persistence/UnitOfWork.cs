using BuildingBlocks.Application.Contracts.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace BuildingBlocks.Infrastructure.Persistence;

public class UnitOfWork<TContext>(TContext context) : IUnitOfWork where TContext : DbContext
{
    public async Task<bool> CommitAsync(CancellationToken cancellationToken = default)
        => await context.SaveChangesAsync(cancellationToken) > 0;
}
