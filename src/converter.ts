import { Mutation, QueryBuilder } from "faros-js-client";

export abstract class Converter {
  abstract convert(data: any, qb: QueryBuilder): Array<Mutation>;
}