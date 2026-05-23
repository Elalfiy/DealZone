namespace DealZone.API.Helpers
{
    public class PaginatedResult<T>
    {
        public IEnumerable<T> Items { get; set; } = Array.Empty<T>();
        public int Page { get; set; }
        public int PageSize { get; set; }
        public long Total { get; set; }
    }
}
