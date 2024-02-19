import type { LiqeQuery, ComparisonOperatorToken } from "liqe";
import * as P from "fp-ts/Predicate";

/**
 *  default field
 *  default operator
 *  default logical operator
 *
 *  field limit allow list
 *
 *  date -> [0-9]:+ "-" [0-9]:+ "-" [0-9]:+ {% d => new Date(d[0].join('')+d[1]+d[2].join('')+d[3]+d[4].join('')) %}
 */
const operatorMap: Record<ComparisonOperatorToken["operator"], string> = {
  ":": "",
  ":<": "",
  ":<=": "",
  ":=": "",
  ":>": "",
  ":>=": "",
};

const termToPredicate = (ast: LiqeQuery) => {
  if (ast.type !== "Tag") {
    throw new Error("Expected a tag expression.");
  }

  if (ast.field.type === "ImplicitField") {
    return;
  }

  /** Other fields */
  ast.field.name;
  ast.operator.operator;
  if (ast.expression.type === "EmptyExpression") {
    return;
  }
  if (ast.expression.type === "LiteralExpression") {
    ast.expression.value;
    return;
  }
  if (ast.expression.type === "RangeExpression") {
    return;
  }
  if (ast.expression.type === "RegexExpression") {
    ast.expression.value;

    return;
  }
};

const toPredicate = <T extends Object>(
  ast: LiqeQuery
  //   rows: readonly T[],
  //   path: readonly string[] = []
): ((x: T) => boolean) => {
  if (ast.type === "Tag") {
    if (ast.field.type === "ImplicitField") {
    }
    return;
  }

  if (ast.type === "UnaryOperator") {
    return P.not(toPredicate(ast.operand));
  }

  if (ast.type === "ParenthesizedExpression") {
    return toPredicate(ast.expression);
  }

  if (ast.type === "EmptyExpression") {
    return () => true;
  }

  if (ast.type !== "LogicalExpression") {
    throw new Error("Expected a tag expression.");
  }
  if (!ast.left) {
    throw new Error("Expected left to be defined.");
  }
  if (!ast.right) {
    throw new Error("Expected right to be defined.");
  }

  const leftPredicate = toPredicate(ast.left);
  const rightPredicate = toPredicate(ast.right);
  if (ast.operator.type === "ImplicitBooleanOperator") {
    return P.and(leftPredicate)(rightPredicate);
  }
  if (ast.operator.operator === "OR") {
    return P.or(leftPredicate)(rightPredicate);
  }
  if (ast.operator.operator === "AND") {
    return P.and(leftPredicate)(rightPredicate);
  }

  throw new Error("Unexpected state.");
};
