// import test from "ava";
import { filter } from "./filter";
import { parse } from "liqe";
import { expect, test } from "vitest";

type Location = {
  city: string;
};

type Person = {
  attributes?: Record<string, string | null>;
  balance?: number;
  email?: string;
  height: number;
  location?: Location;
  membership?: null;
  name: string;
  nick?: string;
  phoneNumber?: string;
  subscribed?: boolean;
  tags?: string[];
};

const persons: readonly Person[] = [
  {
    height: 180,
    name: "david",
  },
  {
    height: 175,
    name: "john",
  },
  {
    height: 175,
    location: {
      city: "London",
    },
    name: "mike",
  },
  {
    height: 220,
    name: "robert",
    tags: ["member"],
  },
  {
    attributes: {
      member: null,
    },
    balance: 6_364_917,
    email: "noah@john.com",
    height: 225,
    membership: null,
    name: "noah",
    nick: "john",
    phoneNumber: "404-050-2611",
    subscribed: true,
  },
  {
    height: 150,
    name: "foo bar",
    nick: "old dog",
  },
  {
    height: 194,
    name: "fox",
    nick: "quick fox",
  },
];

const testQuery = (t: string, expectedResultNames: string[]) => {
  const matchingPersonNames = filter(parse(t), persons).map((person) => {
    return person.name;
  });

  expect(matchingPersonNames).toEqual(expectedResultNames);
};

test("david", () => testQuery('"david"', ["david"]));

test('name:"da"', () => testQuery('name:"da"', ["david"]));
test('name:"david"', () => testQuery('name:"david"', ["david"]));
test("name:David", () => testQuery("name:David", ["david"]));

test("name:D*d", () => testQuery("name:D*d", ["david"]));
test("name:*avid", () => testQuery("name:*avid", ["david"]));
test("name:a*d", () => testQuery("name:a*d", ["david"]));
test("name:/(david)|(john)/", () =>
  testQuery("name:/(david)|(john)/", ["david", "john"]));
test("name:/(David)|(John)/", () => testQuery("name:/(David)|(John)/", []));
test("name:/(David)|(John)/i", () =>
  testQuery("name:/(David)|(John)/i", ["david", "john"]));

test("height:[200 TO 300]", () =>
  testQuery("height:[200 TO 300]", ["robert", "noah"]));
test("height:[220 TO 300]", () =>
  testQuery("height:[220 TO 300]", ["robert", "noah"]));
test("height:{220 TO 300]", () => testQuery("height:{220 TO 300]", ["noah"]));
test("height:[200 TO 225]", () =>
  testQuery("height:[200 TO 225]", ["robert", "noah"]));
test("height:[200 TO 225}", () => testQuery("height:[200 TO 225}", ["robert"]));
test("height:{220 TO 225}", () => testQuery("height:{220 TO 225}", []));

test("NOT David", () =>
  testQuery("NOT David", ["john", "mike", "robert", "noah", "foo bar", "fox"]));
test("-David", () =>
  testQuery("-David", ["john", "mike", "robert", "noah", "foo bar", "fox"]));
test("David OR John", () => testQuery("David OR John", ["david", "john"]));
test("Noah AND John", () => testQuery("Noah AND John", []));
test("John AND NOT Noah", () => testQuery("John AND NOT Noah", ["john"]));
test("David OR NOT John", () =>
  testQuery("David OR NOT John", [
    "david",
    "mike",
    "robert",
    "noah",
    "foo bar",
    "fox",
  ]));
test("John AND -Noah", () => testQuery("John AND -Noah", ["john"]));
test("David OR -John", () =>
  testQuery("David OR -John", [
    "david",
    "mike",
    "robert",
    "noah",
    "foo bar",
    "fox",
  ]));

test("name:David OR John", () =>
  testQuery("name:David OR John", ["david", "john"]));

test("name:David OR name:John", () =>
  testQuery("name:David OR name:John", ["david", "john"]));
test('name:"david" OR name:"john"', () =>
  testQuery('name:"david" OR name:"john"', ["david", "john"]));
test('name:"David" OR name:"John"', () =>
  testQuery('name:"David" OR name:"John"', []));

test("height:=175", () => testQuery("height:=175", ["john", "mike"]));
test("height:>200", () => testQuery("height:>200", ["robert", "noah"]));
test("height:>220", () => testQuery("height:>220", ["noah"]));
test("height:>=220", () => testQuery("height:>=220", ["robert", "noah"]));

test("height:=175 AND NOT name:mike", () =>
  testQuery("height:=175 AND NOT name:mike", ["john"]));

test('"member"', () => testQuery('"member"', []));

test('tags:"member"', () => testQuery('tags:"member"', ["robert"]));

test('"London"', () => testQuery('"London"', []));
test('city:"London"', () => testQuery('city:"London"', []));
test('location.city:"London"', () =>
  testQuery('location.city:"London"', ["mike"]));

test("membership:null", () => testQuery("membership:null", ["noah"]));
test("attributes.member:null", () =>
  testQuery("attributes.member:null", ["noah"]));

test("subscribed:true", () => testQuery("subscribed:true", ["noah"]));

test("email:/[^.:@\\s](?:[^:@\\s]*[^.:@\\s])?@[^.@\\s]+(?:\\.[^.@\\s]+)*/", () =>
  testQuery(
    "email:/[^.:@\\s](?:[^:@\\s]*[^.:@\\s])?@[^.@\\s]+(?:\\.[^.@\\s]+)*/",

    ["noah"]
  ));

test('phoneNumber:"404-050-2611"', () =>
  testQuery('phoneNumber:"404-050-2611"', ["noah"]));
test("phoneNumber:404", () => testQuery("phoneNumber:404", ["noah"]));

test("balance:364", () => testQuery("balance:364", ["noah"]));
test("balance:abc364", () => testQuery("balance:abc364", ["noah"]));
test('balance:"abc 364 a2d2"', () =>
  testQuery('balance:"abc 364 a2d2"', ["noah"]));

test("(David)", () => testQuery("(David)", ["david"]));
test("(name:david OR name:john)", () =>
  testQuery("(name:david OR name:john)", ["david", "john"]));
test('(name:"foo bar" AND nick:"quick fox") OR name:fox', () =>
  testQuery('(name:"foo bar" AND nick:"quick fox") OR name:fox', ["fox"]));
test('(name:fox OR name:"foo bar" AND nick:"old dog")', () =>
  testQuery('(name:fox OR name:"foo bar" AND nick:"old dog")', ["foo bar"]));
test('(name:fox OR (name:"foo bar" AND nick:"old dog"))', () =>
  testQuery('(name:fox OR (name:"foo bar" AND nick:"old dog"))', [
    "foo bar",
    "fox",
  ]));
