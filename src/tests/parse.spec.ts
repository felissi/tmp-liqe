import { expect, test } from "vitest";
import { parse } from "liqe";

test("name:Peter", () => {
  const ast = parse("name:Peter");
  expect(ast.type).toEqual("Tag");

  expect(ast).haveOwnPropertyDescriptor("field");
  expect(ast).haveOwnPropertyDescriptor("expression");
  expect(ast).haveOwnPropertyDescriptor("location");
  expect(ast).haveOwnPropertyDescriptor("operator");
  expect(ast).haveOwnPropertyDescriptor("type");
  expect(Object.keys(ast).length).toEqual(5);
  if (ast.type === "Tag") {
  }
});
test("name:Peter AND thing:Ray", () => {
  const ast = parse("name:Peter AND thing:Ray");

  expect(ast).haveOwnPropertyDescriptor("right");
  expect(ast).haveOwnPropertyDescriptor("left");
  expect(ast).haveOwnPropertyDescriptor("operator");
  expect(ast).haveOwnPropertyDescriptor("type");
  expect(ast).haveOwnPropertyDescriptor("location");
  expect(Object.keys(ast).length).toEqual(5);
  expect(ast.type).toEqual("LogicalExpression");
  if (ast.type === "LogicalExpression") {
  }
});
test("name:Peter AND (thing:Ray OR job:engineer)", () => {
  const ast = parse("name:Peter AND (thing:Ray OR job:engineer)");
  expect(ast).haveOwnPropertyDescriptor("right");
  expect(ast).haveOwnPropertyDescriptor("left");
  expect(ast).haveOwnPropertyDescriptor("operator");
  expect(ast).haveOwnPropertyDescriptor("type");
  expect(ast).haveOwnPropertyDescriptor("location");
  expect(Object.keys(ast).length).toEqual(5);

  expect(ast.type).toEqual("LogicalExpression");
});
test("name:  Peter  ", () => {
  const ast = parse("name:  Peter  ");

  /** => name:Empty AND Implicit:Peter */

  expect(ast.type).toEqual("LogicalExpression");

  expect(ast.right).haveOwnPropertyDescriptor("field");
  expect(ast.right).haveOwnPropertyDescriptor("expression");
  expect(ast.right).haveOwnPropertyDescriptor("location");
  expect(ast.right).haveOwnPropertyDescriptor("type");
  expect(ast.right!.expression.value).toEqual("Peter");
  expect(Object.keys(ast).length).toEqual(5);
});
