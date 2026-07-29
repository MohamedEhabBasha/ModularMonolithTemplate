using BuildingBlocks.Application.Contracts.Persistence;

namespace BuildingBlocks.Application.Pagination;

public static class Pagination
{
    public static async Task<PagedResult<T>> CreatePagedResult<T>(IGenericRepository<T> repo,
      ISpecification<T> spec, int pageIndex, int pageSize) where T : BaseEntity
    {
        var items = await repo.ListAsync(spec);
        var count = await repo.CountAsync(spec);

        return new PagedResult<T>(items, count, pageIndex, pageSize);
    }
}
