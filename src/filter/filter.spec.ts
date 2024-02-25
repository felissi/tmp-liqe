import { expect, test, describe } from "vitest";
import * as F from "./filter";
import { parse } from "liqe";

describe("Primitive 1: get predicate from a regex", async () => {
  test("simple case 1", async () => {
    expect(F._toRegexPredicate("Peter")).toBeTypeOf("function");
    expect(F._toRegexPredicate("Pet")("Pete")).toEqual(true);
  });
  test("chinese", async () => {
    expect(F._toRegexPredicate("中")).toBeTypeOf("function");
    expect(F._toRegexPredicate("中")("中文")).toEqual(true);
  });
});

describe("Primitive 2: get predicate from a single term", async () => {
  test("simple case", async () => {
    const term = parse("name:Pete");
    expect(F._toStringPredicate(term)).toBeTypeOf("function");
    expect(F._toStringPredicate(term)("Peter")).toEqual(true);
  });
  test("chinese", async () => {
    const term = parse("name:小明");
    expect(F._toStringPredicate(term)).toBeTypeOf("function");
    expect(F._toStringPredicate(term)("小小明")).toEqual(true);
  });
  test("regex", async () => {
    const term = parse("name:/abc/");
    expect(F._toStringPredicate(term)).toBeTypeOf("function");
    expect(F._toStringPredicate(term)("abcd")).toEqual(true);
  });
  test("wildcard `*`", async () => {
    const term = parse("name:abc*");
    expect(F._toStringPredicate(term)).toBeTypeOf("function");
    expect(F._toStringPredicate(term)("abcd")).toEqual(true);
  });
  test("wildcard `?`", async () => {
    const term = parse("name:abc?e");
    expect(F._toStringPredicate(term)).toBeTypeOf("function");
    expect(F._toStringPredicate(term)("abcde")).toEqual(true);
  });
  test("single quoted", async () => {
    const term = parse("name:'abc'");
    expect(F._toStringPredicate(term)).toBeTypeOf("function");
    expect(F._toStringPredicate(term)("abcd")).toEqual(true);
  });
  test("double quoted", async () => {
    const term = parse(`name:"abc"`);
    expect(F._toStringPredicate(term)).toBeTypeOf("function");
    expect(F._toStringPredicate(term)("abcd")).toEqual(true);
  });
});
describe("Primitive 3.1: termToPredicateAtom - branch string", async () => {
  const term = parse(`name:"abc"`);
  expect(F.termToPredicateAtom(term)).toBeTypeOf("function");
  expect(F.termToPredicateAtom(term)("abcd")).toEqual(true);
});
describe("Primitive 3.2: termToPredicateAtom - branch boolean", async () => {
  test("true", async () => {
    const term = parse(`name:true`);
    expect(F.termToPredicateAtom(term)).toBeTypeOf("function");
    expect(F.termToPredicateAtom(term)(true)).toEqual(true);
    expect(F.termToPredicateAtom(term)("")).toEqual(false);
    expect(F.termToPredicateAtom(term)(undefined)).toEqual(false);
    expect(F.termToPredicateAtom(term)(null)).toEqual(false);
    expect(F.termToPredicateAtom(term)(" ")).toEqual(true);
    expect(F.termToPredicateAtom(term)(false)).toEqual(false);
    expect(F.termToPredicateAtom(term)(0)).toEqual(false);
  });
});
describe("Primitive 3.3: termToPredicateAtom - branch null", async () => {
  test("true", async () => {
    const term = parse(`name:null`);
    expect(F.termToPredicateAtom(term)).toBeTypeOf("function");
    expect(F.termToPredicateAtom(term)(true)).toEqual(false);
    expect(F.termToPredicateAtom(term)("")).toEqual(false);
    expect(F.termToPredicateAtom(term)(undefined)).toEqual(false);
    expect(F.termToPredicateAtom(term)(null)).toEqual(true);
    expect(F.termToPredicateAtom(term)(" ")).toEqual(false);
    expect(F.termToPredicateAtom(term)(false)).toEqual(false);
    expect(F.termToPredicateAtom(term)(0)).toEqual(false);
  });
});
describe("Primitive 4: termToPredicate - branch string", async () => {
  test("true", async () => {
    const term = parse(`name:Peter`);
    expect(F.termToPredicate(term)).toBeTypeOf("function");
    expect(F.termToPredicate(term)({ name: "PeterMan" })).toEqual(true);
    // expect(F.termToPredicate(term)(true)).toEqual(false);
    // expect(F.termToPredicate(term)("")).toEqual(false);
    // expect(F.termToPredicate(term)(undefined)).toEqual(false);
    // expect(F.termToPredicate(term)(null)).toEqual(true);
    // expect(F.termToPredicate(term)(" ")).toEqual(false);
    // expect(F.termToPredicate(term)(false)).toEqual(false);
    // expect(F.termToPredicate(term)(0)).toEqual(false);
  });
});
