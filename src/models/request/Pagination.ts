import { ParsedQs } from 'qs'
export interface Pagination extends ParsedQs {
  limit: string
  page: string
}
