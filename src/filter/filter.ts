import type { LiqeQuery, ComparisonOperatorToken } from "liqe";
import * as P from "fp-ts/Predicate";
import * as A from "fp-ts/Array";
import { pipe } from "fp-ts/function";
import get from "lodash/get";
import { _rangePredicate } from "./range";
import { _comparisonRangePredicate } from "./comparison";

/**
 *  default field
 *  default operator/operation (Number, boolean, date, string/regex=contain, null=exact, range(inclusive or not))
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

const allowedFields: string[] = [];

const fieldMap = {};

/* ============================ */
const WILDCARD_RULE = /(\*+)|(\?)/g;

export const convertWildcardToRegex = (pattern: string): RegExp => {
  return new RegExp(
    pattern.replace(WILDCARD_RULE, (_match, p1) => {
      return p1 ? "(.+?)" : "(.)";
    })
  );
};
/* ============================ */
const ESCAPE_RULE = /[$()*+.?[\\\]^{|}]/g;
const DASH_RULE = /-/g;

export const escapeRegexString = (subject: string): string => {
  return subject.replace(ESCAPE_RULE, "\\$&").replace(DASH_RULE, "\\x2d");
};
/* ============================ */
const RegExpRule = /(\/?)(.+)\1([a-z]*)/;
const FlagRule = /^(?!.*?(.).*?\1)[AJUXgimsux]+$/;

export const parseRegex = (subject: string): RegExp => {
  const match = RegExpRule.exec(subject);

  if (!match) {
    throw new Error("Invalid RegExp.");
  }

  if (match[3] && !FlagRule.test(match[3])) {
    return new RegExp(subject);
  }

  return new RegExp(match[2], match[3]);
};

/* ============================ */

export const _toRegexPredicate = (str: string): P.Predicate<string> => {
  const rule = parseRegex(str);
  return (subject?: string) => !!subject?.match?.(rule);
};

export const _toStringPredicate = (ast: LiqeQuery): P.Predicate<string> => {
  if (ast.type !== "Tag") {
    throw new Error("Expected a tag expression.");
  }

  const { expression } = ast;
  {
    if (expression.type === "RangeExpression") {
      throw new Error("Unexpected range expression.");
    }

    if (expression.type === "RegexExpression") {
      return _toRegexPredicate(expression.value);
    }
    if (expression.type !== "LiteralExpression") {
      throw new Error("Expected a literal expression.");
    }
  }
  const value = String(expression.value);

  if (
    (value.includes("*") || value.includes("?")) &&
    expression.quoted === false
  ) {
    return _toRegexPredicate(String(convertWildcardToRegex(value)) + "ui");
  } else {
    return _toRegexPredicate(
      "/(" + escapeRegexString(value) + ")/" + (expression.quoted ? "u" : "ui")
    );
  }
};

const toDefaultPredicate = (ast: LiqeQuery) => {
  return _toStringPredicate(ast);
};

/**
 *
 *  Turn term into predicate only by the value, not the field.
 *
 */
export const termToPredicateAtom = (ast: LiqeQuery) => {
  if (ast.type !== "Tag") {
    throw new Error("Expected a tag expression.");
  }

  const { expression } = ast;

  if (expression.type === "RangeExpression") {
    return (x) => _rangePredicate(x, expression.range);
  }

  if (expression.type === "EmptyExpression") {
    return () => false;
  }

  const expressionValue = expression.value;

  /**
   * Implicit field has no specific operator
   */
  if (ast.operator == null) {
    return toDefaultPredicate(ast);
  }
  if (ast?.operator?.operator !== ":") {
    const operator = ast.operator;

    // TODO:
    /**
     * Date are comparable
     */
    // if (typeof expressionValue !== "number") {
    //   throw new TypeError(
    //     `Debug ${JSON.stringify(
    //       operator
    //     )}  ${expressionValue} ${typeof expressionValue}`
    //   );
    //   throw new TypeError("Expected a number.");
    // }

    return (x: unknown) =>
      _comparisonRangePredicate(expressionValue, x, operator.operator);
  } else if (typeof expressionValue === "boolean") {
    return (x: unknown) => !!x === expressionValue;
  } else if (expressionValue === null) {
    return (x: unknown) => x === null;
  } else {
    /** Why ? */
    // const stringPredicate = _toStringPredicate({}, ast);
    // return (x) => stringPredicate(x);
    // throw new Error(typeof expressionValue);
    if (typeof expressionValue === "number") {
      return (x: number) => _comparisonRangePredicate(expressionValue, x, ":");
    }
    return _toStringPredicate(ast);
  }
};

/**
 *
 * Consider the field
 *
 *
 */
export const termToPredicate = <T>(ast: LiqeQuery): P.Predicate<T> => {
  if (ast.type !== "Tag") {
    throw new Error("Expected a tag expression.");
  }

  /** Other fields */
  // ast.field.name;
  // ast.operator.operator;

  if (ast.expression.type === "EmptyExpression") {
    return () => false;
  }

  /**
   * // TODO
   * Field access control,
   * field rename for decoupling
   */
  const filterFieldName = (fieldName: string): string => {
    return fieldName;
  };
  const transformFieldName = (fieldName: string): string => {
    return fieldName;
  };

  const fieldName =
    ast.field.type === "ImplicitField"
      ? "name"
      : pipe(
          ast.field.name, //
          filterFieldName,
          transformFieldName
        );

  return pipe(
    termToPredicateAtom(ast),
    P.contramap((_) => get(_, fieldName))
  );
};

function getImplicitPredicate<A>(left: P.Predicate<A>, right: P.Predicate<A>) {
  return P.and(left)(right);
}

const toPredicate = <T>(
  ast: LiqeQuery,
  rows: readonly T[]
  //   path: readonly string[] = []
): ((x: T) => boolean) => {
  if (ast.type === "Tag") {
    return termToPredicate<T>(ast);
  }

  if (ast.type === "UnaryOperator") {
    return P.not(toPredicate(ast.operand, rows));
  }

  if (ast.type === "ParenthesizedExpression") {
    return toPredicate(ast.expression, rows);
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

  const leftPredicate = toPredicate(ast.left, rows);
  const rightPredicate = toPredicate(ast.right, rows);
  if (ast.operator.type === "ImplicitBooleanOperator") {
    return getImplicitPredicate(leftPredicate, rightPredicate);
  }
  if (ast.operator.operator === "OR") {
    return P.or(leftPredicate)(rightPredicate);
  }
  if (ast.operator.operator === "AND") {
    return P.and(leftPredicate)(rightPredicate);
  }

  throw new Error("Unexpected state.");
};

export const filter = <T>(ast: LiqeQuery, rows: T[]) => {
  const predicate = toPredicate(ast, rows);
  return pipe(
    rows, //
    A.filter(predicate)
  );
};
