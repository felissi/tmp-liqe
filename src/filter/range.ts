import * as N from "fp-ts/number";
import * as S from "fp-ts/string";
import { type Ord, gt, lt } from "fp-ts/Ord";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
// import { Range } from "liqe/dist/src/types";

type Range<T> = {
  max: T;
  maxInclusive: boolean;
  min: T;
  minInclusive: boolean;
};

type DateLike = Dayjs | Date;
export const isDate = (x: unknown): x is DateLike => {
  const formats = ["YYYY-MM-DD"];
  return formats.map((_) => dayjs(x, _).isValid()).some((_) => _);
};
export const DayjsOrd: Ord<Dayjs> = {
  compare: (x, y) => (DayjsOrd.equals(x, y) ? 0 : x.isBefore(y) ? -1 : 1),
  equals: (x, y) => x.isSame(y),
};

const _isInBound = <T>(x: T, range: Range<T>, ord: Ord<T>) => {
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
  const isNumber = (x: unknown): x is number => {
    const numericPattern = /^-?\d*\.?\d+$/;
    return numericPattern.test(x) && !isNaN(parseFloat(x));
  };
  if (isNumber(range.min) && isNumber(range.max) && typeof x === "number") {
    return _isInBound(
      x,
      {
        ...range,
        min: parseFloat(range.min),
        max: parseFloat(range.max),
      } as Range<number>,
      N.Ord
    );
  }
  if (isDate(range.min) && isDate(range.max)) {
    return _isInBound(
      dayjs(x),
      {
        ...range,
        min: dayjs(range.min),
        max: dayjs(range.max),
      } as Range<Dayjs>,
      DayjsOrd
    );
  }
  return _isInBound(
    x,
    {
      ...range,
      min: String(range.min),
      max: String(range.max),
    } as Range<string>,
    S.Ord
  );

  return false;
};
