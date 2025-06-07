export type ApiResponsePagination = {
  currentPage: number;
  itemCount: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
};

export type ApiPaginateResponse<T> = {
  data: T[];
  meta: {
    pagination: ApiResponsePagination;
  };
};
