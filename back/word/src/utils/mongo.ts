import { Query } from 'mongoose';

export async function createPaginateData<T>(page: number, limit: number, query: Query<any, T>) {
  const queryClone = query.clone();

  const totalDocs = await queryClone.count().exec();
  const totalPages = Math.floor(totalDocs / limit);
  const pagingCounter = (page - 1) * limit + 1;
  const hasPrevPage = page * limit - limit > 0;
  const hasNextPage = page * limit + limit <= totalDocs;
  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;

  const docs = await query
    .limit(limit)
    .skip(limit * (page - 1))
    .exec();

  return {
    docs,
    totalDocs,
    totalPages,
    pagingCounter,
    hasNextPage,
    hasPrevPage,
    prevPage,
    nextPage,
  };
}
