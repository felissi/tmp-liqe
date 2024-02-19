import { expect, test } from "vitest";
import { parse, serialize } from "liqe";

test("", () => {
  const ast = parse("name:Peter");
  expect(ast.type).toEqual("Tag");

  expect(ast).haveOwnPropertyDescriptor("field");
  expect(ast).haveOwnPropertyDescriptor("expression");
  expect(ast).haveOwnPropertyDescriptor("location");
  expect(ast).haveOwnPropertyDescriptor("operator");
  expect(ast).haveOwnPropertyDescriptor("type");
  expect(Object.keys(ast).length).toEqual(5);
  if (ast.type === "Tag") {
    // ast.
  }
  //   expect(ast).toEqual({});
});
test("", () => {
  const ast = parse("name:Peter AND thing:Ray");
  //   expect(parse("name:Peter AND thing:Ray")).toEqual({});

  expect(ast).haveOwnPropertyDescriptor("right");
  expect(ast).haveOwnPropertyDescriptor("left");
  expect(ast).haveOwnPropertyDescriptor("operator");
  expect(ast).haveOwnPropertyDescriptor("type");
  expect(ast).haveOwnPropertyDescriptor("location");
  expect(Object.keys(ast).length).toEqual(5);
  //   expect(ast).haveOwnPropertyDescriptor("field");
  //   expect(ast).haveOwnPropertyDescriptor("expression");
  //   expect(ast)
  expect(ast.type).toEqual("LogicalExpression");
  if (ast.type === "LogicalExpression") {
    // ast.
  }
});
test("", () => {
  const ast = parse("name:Peter AND (thing:Ray OR job:engineer)");
  expect(ast).haveOwnPropertyDescriptor("right");
  expect(ast).haveOwnPropertyDescriptor("left");
  expect(ast).haveOwnPropertyDescriptor("operator");
  expect(ast).haveOwnPropertyDescriptor("type");
  expect(ast).haveOwnPropertyDescriptor("location");
  expect(Object.keys(ast).length).toEqual(5);

  expect(ast.type).toEqual("LogicalExpression");
});
test("", () => {
  const ast = parse("name:  Peter  ");
  expect(ast).toEqual();
});
