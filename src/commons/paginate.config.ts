import {
  FilterOperator,
  PaginateConfig,
  PaginationType,
} from 'nestjs-paginate';
import { SortBy } from 'nestjs-paginate/lib/helper';

function createPaginateConfig<T>(
  config?: PaginateConfig<T>,
): PaginateConfig<T> {
  return {
    paginationType: PaginationType.LIMIT_AND_OFFSET,
    defaultLimit: config?.defaultLimit || 10,
    sortableColumns: config?.sortableColumns || ['id', 'name', 'email'],
    defaultSortBy:
      config?.defaultSortBy || ([['createdAt', 'DESC']] as SortBy<T>),
    select: config?.select || ['id', 'name', 'email', 'createdAt', 'updatedAt'],
    filterableColumns: config?.filterableColumns || {
      name: [FilterOperator.EQ, FilterOperator.ILIKE],
      email: [FilterOperator.EQ, FilterOperator.ILIKE],
    },
    ...config,
  };
}
export { createPaginateConfig };
