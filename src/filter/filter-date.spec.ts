import { filter } from "./filter";
import { parse } from "liqe";
import { expect, test } from "vitest";

const persons = [
  {
    height: 180,
    name: "david",
    createdAt: "2016-09-20 08:32:15",
    lastLoginAt: "2019-05-12 16:45:22",
    fakeData: "chair",
  },
  {
    height: 175,
    name: "john",
    createdAt: "2018-07-04 11:20:36",
    lastLoginAt: "2021-11-28 09:14:57",
    fakeData: "book",
  },
  {
    height: 175,
    location: {
      city: "London",
    },
    name: "mike",
    createdAt: "2015-03-16 19:05:42",
    lastLoginAt: "2018-12-02 14:08:10",
    fakeData: "lamp",
  },
  {
    height: 220,
    name: "robert",
    tags: ["member"],
    createdAt: "2014-11-27 06:12:53",
    lastLoginAt: "2017-06-09 21:30:18",
    fakeData: "table",
  },
  {
    attributes: {
      member: null,
    },
    balance: 6364917,
    email: "noah@john.com",
    height: 225,
    membership: null,
    name: "noah",
    nick: "john",
    phoneNumber: "404-050-2611",
    subscribed: true,
    createdAt: "2017-10-09 13:40:27",
    lastLoginAt: "2021-02-15 10:18:45",
    fakeData: "pencil",
  },
  {
    height: 150,
    name: "foo bar",
    nick: "old dog",
    createdAt: "2013-02-18 17:55:03",
    lastLoginAt: "2016-08-05 22:48:12",
    fakeData: "clock",
  },
  {
    height: 194,
    name: "fox",
    nick: "quick fox",
    createdAt: "2019-08-27 09:28:59",
    lastLoginAt: "2022-10-19 06:20:37",
    fakeData: "table",
  },
];

const testQuery = (t: string, expectedResultNames: string[]) => {
  const matchingPersonNames = filter(parse(t), persons).map((person) => {
    return person.name;
  });

  expect(matchingPersonNames).toEqual(expectedResultNames);
};

test("createdAt:>2019-03-13", () =>
  testQuery("createdAt:>2019-03-13", ["fox"]));
// Test case: createdAt:<2020-01-01
test("createdAt:<2020-01-01", () =>
  testQuery("createdAt:<2020-01-01", [
    "david",
    "john",
    "mike",
    "robert",
    "noah",
    "foo bar",
    "fox",
  ]));

// Test case: lastLoginAt:>2021-01-01
test("lastLoginAt:>2021-01-01", () =>
  testQuery("lastLoginAt:>2021-01-01", ["john", "noah", "fox"]));

// Test case: createdAt:>=2018-07-01
test("createdAt:>=2018-07-01", () =>
  testQuery("createdAt:>=2018-07-01", ["john", "fox"]));

// Test case: lastLoginAt:<=2020-12-31
test("lastLoginAt:<=2020-12-31", () =>
  testQuery("lastLoginAt:<=2020-12-31", [
    "david",
    "mike",
    "robert",
    "foo bar",
  ]));

// Test case: createdAt:2014-11-27
test("createdAt:2014-11-27", () =>
  testQuery("createdAt:2014-11-27", ["robert"]));

// Test case: lastLoginAt:2022-10-19
test("lastLoginAt:2022-10-19", () =>
  testQuery("lastLoginAt:2022-10-19", ["fox"]));
// Test case: createdAt:<2016-09-20
test("createdAt:<2016-09-20", () =>
  testQuery("createdAt:<2016-09-20", ["mike", "robert", "foo bar"]));

// Test case: lastLoginAt:>=2021-02-15
test("lastLoginAt:>=2021-02-15", () =>
  testQuery("lastLoginAt:>=2021-02-15", ["john", "noah", "fox"]));

// Test case: createdAt:2015-03-16
test("createdAt:2015-03-16", () => testQuery("createdAt:2015-03-16", ["mike"]));

// Test case: lastLoginAt:2017-06-09
test("lastLoginAt:2017-06-09", () =>
  testQuery("lastLoginAt:2017-06-09", ["robert"]));

// Test case: createdAt:>=2017-10-01
test("createdAt:>=2017-10-01", () =>
  testQuery("createdAt:>=2017-10-01", ["john", "noah", "fox"]));

// Test case: lastLoginAt:2021-11-28
test("lastLoginAt:2021-11-28", () =>
  testQuery("lastLoginAt:2021-11-28", ["john"]));
// Test case: createdAt:>2013-02-18
test("createdAt:>2013-02-18", () =>
  testQuery("createdAt:>2013-02-18", [
    "david",
    "john",
    "mike",
    "robert",
    "noah",
    "foo bar",
    "fox",
  ]));

// Test case: lastLoginAt:<2022-02-15
test("lastLoginAt:<2022-02-15", () =>
  testQuery("lastLoginAt:<2022-02-15", [
    "david",
    "john",
    "mike",
    "robert",
    "noah",
    "foo bar",
  ]));

// Test case: createdAt:<=2021-01-01
test("createdAt:<=2021-01-01", () =>
  testQuery("createdAt:<=2021-01-01", [
    "david",
    "john",
    "mike",
    "robert",
    "noah",
    "foo bar",
    "fox",
  ]));

// Test case: lastLoginAt:>=2020-01-01
test("lastLoginAt:>=2020-01-01", () =>
  testQuery("lastLoginAt:>=2020-01-01", ["john", "noah", "fox"]));

// Test case: createdAt:<2020-12-31
test("createdAt:<2020-12-31", () =>
  testQuery("createdAt:<2020-12-31", [
    "david",
    "john",
    "mike",
    "robert",
    "noah",
    "foo bar",
    "fox",
  ]));

// Test case: lastLoginAt:<=2022-10-19
test("lastLoginAt:<=2022-10-19", () =>
  testQuery("lastLoginAt:<=2022-10-19", [
    "david",
    "john",
    "mike",
    "robert",
    "noah",
    "foo bar",
  ]));
