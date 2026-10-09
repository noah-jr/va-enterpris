export interface PaginationQueryDTO {
  page?: number
  perPage?: number
  search?: string
  status?: string
  categoria?: string
}

export interface PaginationMeta {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
  firstPage: number
}

export interface PaginatedResult<T> {
  meta: PaginationMeta
  data: T[]
}

export class PaginationHelper {
  public static normalizeParams(
    inputPage: unknown,
    inputPerPage: unknown,
    defaultPerPage: number = 10,
    maxPerPage: number = 100
  ): { page: number; perPage: number } {
    const pageNum = Number(inputPage)
    const perPageNum = Number(inputPerPage)

    const page = !isNaN(pageNum) && pageNum > 0 ? Math.floor(pageNum) : 1
    let perPage = !isNaN(perPageNum) && perPageNum > 0 ? Math.floor(perPageNum) : defaultPerPage

    if (perPage > maxPerPage) {
      perPage = maxPerPage
    }

    return { page, perPage }
  }

  public static formatResult<T>(
    data: T[],
    total: number,
    page: number,
    perPage: number
  ): PaginatedResult<T> {
    const lastPage = Math.max(1, Math.ceil(total / perPage))
    return {
      meta: {
        total,
        perPage,
        currentPage: page,
        lastPage,
        firstPage: 1,
      },
      data,
    }
  }
}
