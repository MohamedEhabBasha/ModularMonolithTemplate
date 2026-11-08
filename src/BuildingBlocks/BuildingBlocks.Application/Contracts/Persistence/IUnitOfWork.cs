namespace BuildingBlocks.Application.Contracts.Persistence;

public interface IUnitOfWork
{
    Task<bool> CommitAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Runs the operation inside one database transaction.
    /// Commits if it returns true; rolls back if it returns false or throws.
    /// </summary>
    Task<bool> ExecuteInTransactionAsync(Func<Task<bool>> operation, CancellationToken cancellationToken = default);

}
