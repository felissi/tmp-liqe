import type { ComparisonOperator } from "liqe/dist/src/types";
import * as S from "fp-ts/string";
import * as N from "fp-ts/number";
import { Ord, gt, lt, geq, leq } from "fp-ts/Ord";
import { DayjsOrd, isDate } from "./range";
import dayjs from "dayjs";

const _compare = <T>(
  query: T,
  value: T,
  operator: ComparisonOperator,
  ord: Ord<T>
) => {
  switch (operator) {
    case ":=":
    case ":":
      return ord.equals(value, query);
    case ":>":
      return gt(ord)(value, query);
    case ":<":
      return lt(ord)(value, query);
    case ":>=":
      return geq(ord)(value, query);
    case ":<=":
      return leq(ord)(value, query);
    default:
      throw new Error(`Unimplemented comparison operator: ${operator}`);
  }
};

export const _comparisonRangePredicate = <T>(
  query: T,
  value: T,
  operator: ComparisonOperator
): boolean => {
  if (typeof query === "number") {
    return _compare(query, value, operator, N.Ord);
  }
  if (isDate(query)) {
    return _compare(dayjs(query), dayjs(value), operator, DayjsOrd);
  }
  return _compare(query, value, operator, S.Ord);
};
