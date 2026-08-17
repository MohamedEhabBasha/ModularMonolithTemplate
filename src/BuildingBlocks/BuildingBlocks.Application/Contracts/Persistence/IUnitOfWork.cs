namespace BuildingBlocks.Application.Contracts.Persistence;

public interface IUnitOfWork
{
    Task<bool> CommitAsync(CancellationToken cancellationToken = default);
}
