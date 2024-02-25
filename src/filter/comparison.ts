import type { ComparisonOperator } from "liqe/dist/src/types";
import * as N from "fp-ts/number";
import { Ord, gt, lt, geq, leq } from "fp-ts/Ord";

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

export const _comparisonRangePredicate = (
  query: number,
  value: number,
  operator: ComparisonOperator
): boolean => {
  return _compare(query, value, operator, N.Ord);
};
