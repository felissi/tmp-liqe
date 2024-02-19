import { CstParser, createToken, Lexer } from "chevrotain";

const Identifier = createToken({ name: "Identifier", pattern: /[a-zA-Z]\w*/ });
// We specify the "longer_alt" property to resolve keywords vs identifiers ambiguity.
// See: https://github.com/chevrotain/chevrotain/blob/master/examples/lexer/keywords_vs_identifiers/keywords_vs_identifiers.js
const Select = createToken({
  name: "Select",
  pattern: /SELECT/,
  longer_alt: Identifier,
});
const From = createToken({
  name: "From",
  pattern: /FROM/,
  longer_alt: Identifier,
});
const Where = createToken({
  name: "Where",
  pattern: /WHERE/,
  longer_alt: Identifier,
});

const Comma = createToken({ name: "Comma", pattern: /,/ });

const Integer = createToken({ name: "Integer", pattern: /0|[1-9]\d*/ });

const GreaterThan = createToken({ name: "GreaterThan", pattern: />/ });

const LessThan = createToken({ name: "LessThan", pattern: /</ });

const WhiteSpace = createToken({
  name: "WhiteSpace",
  pattern: /\s+/,
  group: Lexer.SKIPPED,
});

const allTokens = [
  WhiteSpace,
  Select,
  From,
  Where,
  Comma,
  Identifier,
  Integer,
  GreaterThan,
  LessThan,
];

class SelectParser extends CstParser {
  constructor() {
    super(allTokens);

    const $ = this;

    $.RULE("selectStatement", () => {
      $.SUBRULE($.selectClause);
      $.SUBRULE($.fromClause);
      $.OPTION(() => {
        $.SUBRULE($.whereClause);
      });
    });

    $.RULE("selectClause", () => {
      $.CONSUME(Select);
      $.AT_LEAST_ONE_SEP({
        SEP: Comma,
        DEF: () => {
          $.CONSUME(Identifier);
        },
      });
    });

    $.RULE("fromClause", () => {
      $.CONSUME(From);
      $.CONSUME(Identifier);
    });

    $.RULE("whereClause", () => {
      $.CONSUME(Where);
      $.SUBRULE($.expression);
    });

    // The "rhs" and "lhs" (Right/Left Hand Side) labels will provide easy
    // to use names during CST Visitor (step 3a).
    $.RULE("expression", () => {
      $.SUBRULE($.atomicExpression, { LABEL: "lhs" });
      $.SUBRULE($.relationalOperator);
      $.SUBRULE2($.atomicExpression, { LABEL: "rhs" }); // note the '2' suffix to distinguish
      // from the 'SUBRULE(atomicExpression)'
      // 2 lines above.
    });

    $.RULE("atomicExpression", () => {
      $.OR([
        { ALT: () => $.CONSUME(Integer) },
        { ALT: () => $.CONSUME(Identifier) },
      ]);
    });

    $.RULE("relationalOperator", () => {
      $.OR([
        { ALT: () => $.CONSUME(GreaterThan) },
        { ALT: () => $.CONSUME(LessThan) },
      ]);
    });

    this.performSelfAnalysis();
  }
}
// ONLY ONCE
const parser = new SelectParser();
console.log({ parser });

let SelectLexer = new Lexer(allTokens);
function parseInput(text) {
  const lexingResult = SelectLexer.tokenize(text);
  console.log({ lexingResult });
  // "input" is a setter which will reset the parser's state.
  parser.input = lexingResult.tokens;
  const cst = parser.selectStatement();
  console.log(JSON.stringify({ cst }, null, 2));

  if (parser.errors.length > 0) {
    throw new Error("sad sad panda, Parsing errors detected");
  }
  return parser.selectStatement();
}

const inputText = "SELECT column1 FROM table2";
let lexingResult = SelectLexer.tokenize(inputText);
console.log(lexingResult);

parseInput(inputText);
console.log(parseInput(inputText));
// console.log(parser.);

const BaseSQLVisitor = parser.getBaseCstVisitorConstructor();

// This BaseVisitor include default visit methods that simply traverse the CST.
const BaseSQLVisitorWithDefaults =
  parser.getBaseCstVisitorConstructorWithDefaults();

// class myCustomVisitor extends BaseSQLVisitor {
//   constructor() {
//     super();
//     // The "validateVisitor" method is a helper utility which performs static analysis
//     // to detect missing or redundant visitor methods
//     this.validateVisitor();
//   }

//   /* Visit methods go here */
// }

// class myCustomVisitorWithDefaults extends BaseSQLVisitorWithDefaults {
//   constructor() {
//     super();
//     this.validateVisitor();
//   }

//   /* Visit methods go here */
// }

// const myVisitorInstance = new myCustomVisitor();
// const myVisitorInstanceWithDefaults = new myCustomVisitorWithDefaults();

class SQLToAstVisitor extends BaseSQLVisitor {
  constructor() {
    super();
    this.validateVisitor();
  }

  selectStatement(ctx) {
    /* as above... */
  }

  selectClause(ctx) {
    /* as above... */
  }

  fromClause(ctx) {
    const tableName = ctx.Identifier[0].image;

    return {
      type: "FROM_CLAUSE",
      table: tableName,
    };
  }

  whereClause(ctx) {
    const condition = this.visit(ctx.expression);

    return {
      type: "WHERE_CLAUSE",
      condition: condition,
    };
  }

  expression(ctx) {
    // Note the usage of the "rhs" and "lhs" labels defined in step 2 in the expression rule.
    const lhs = this.visit(ctx.lhs[0]);
    const operator = this.visit(ctx.relationalOperator);
    const rhs = this.visit(ctx.rhs[0]);

    return {
      type: "EXPRESSION",
      lhs: lhs,
      operator: operator,
      rhs: rhs,
    };
  }

  // these two visitor methods will return a string.
  atomicExpression(ctx) {
    if (ctx.Integer) {
      return ctx.Integer[0].image;
    } else {
      return ctx.Identifier[0].image;
    }
  }

  relationalOperator(ctx) {
    if (ctx.GreaterThan) {
      return ctx.GreaterThan[0].image;
    } else {
      return ctx.LessThan[0].image;
    }
  }
}

// A new parser instance with CST output enabled.
const parserInstance = new SelectParser([], { outputCst: true });
// Our visitor has no state, so a single instance is sufficient.
const toAstVisitorInstance = new SQLToAstVisitor();

function toAst(inputText) {
  // Lex
  const lexResult = SelectLexer.tokenize(inputText);
  parserInstance.input = lexResult.tokens;

  // Automatic CST created when parsing
  const cst = parserInstance.selectStatement();
  if (parserInstance.errors.length > 0) {
    throw Error(
      "Sad sad panda, parsing errors detected!\n" +
        parserInstance.errors[0].message,
    );
  }

  // Visit
  const ast = toAstVisitorInstance.visit(cst);
  return ast;
}
console.log(toAst(inputText));
