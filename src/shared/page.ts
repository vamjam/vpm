export function calculateOffset(page: number, pageSize: number): number {
  return Math.max(0, (page - 1) * pageSize)
}

export class Paged<T> {
  page: number
  pageSize: number
  total: number
  data: T[]

  constructor(page: number, pageSize: number, total: number, data: T[]) {
    this.page = page
    this.pageSize = pageSize
    this.total = total
    this.data = data
  }
}
