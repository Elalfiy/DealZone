namespace DealZone.API.Helpers
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; } = true;
        public T? Data { get; set; }
        public string Message { get; set; } = "OK";
        public object[] Errors { get; set; } = Array.Empty<object>();
        public Pagination? Pagination { get; set; }
    }

    public class Pagination
    {
        public int Page { get; set; }
        public int PageSize { get; set; }
        public long Total { get; set; }
    }
}
