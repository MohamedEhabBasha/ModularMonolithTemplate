namespace MwGoods.IntegrationTests.Helpers;

public static class Concurrently
{
    public static Task<T[]> Run<T>(int count, Func<Task<T>> action)
        => Run(count, _ => action());

    public static async Task<T[]> Run<T>(int count, Func<int, Task<T>> action)
    {
        // Every task waits on this gate, then they all start together
        var gate = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);

        var tasks = Enumerable.Range(0, count)
            .Select(async i =>
            {
                await gate.Task;
                return await action(i);
            })
            .ToArray();

        gate.SetResult();
        return await Task.WhenAll(tasks);
    }
}