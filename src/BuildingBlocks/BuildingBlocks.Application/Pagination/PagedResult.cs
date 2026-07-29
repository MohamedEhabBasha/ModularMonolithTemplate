namespace BuildingBlocks.Application.Pagination;

public class PagedResult<T>(IReadOnlyList<T> items, int totalCount, int pageIndex, int pageSize)
{
    public IReadOnlyList<T> Items { get; } = items;

    public int TotalCount { get; } = totalCount;

    public int PageIndex { get; } = pageIndex;

    public int PageSize { get; } = pageSize;

    public int TotalPages { get; } = (int)Math.Ceiling(totalCount / (double)pageSize);
}
