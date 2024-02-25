import * as N from "fp-ts/number";
import { Ord, gt, lt } from "fp-ts/Ord";
// import { Range } from "liqe/dist/src/types";

type Range<T> = {
  max: T;
  maxInclusive: boolean;
  min: T;
  minInclusive: boolean;
};

const _inBound = <T>(x: T, range: Range<T>, ord: Ord<T>) => {
  if (lt(ord)(x, range.min)) {
    return false;
  }
  if (ord.equals(x, range.min) && !range.minInclusive) {
    return false;
  }

  if (gt(ord)(x, range.max)) {
    return false;
  }
  if (ord.equals(x, range.max) && !range.maxInclusive) {
    return false;
  }
  return true;
};

export const _rangePredicate = <T>(x: T, range: Range<T>) => {
  if (typeof x === "number") {
    return _inBound(x, range as Range<number>, N.Ord);
  }

  return false;
};
