export interface PaginatedResult<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}
