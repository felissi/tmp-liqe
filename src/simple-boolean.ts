import { createToken, Lexer, CstParser } from "chevrotain";

// Define tokens
const And = createToken({ name: "And", pattern: /AND/ });
const Or = createToken({ name: "Or", pattern: /OR/ });
const Identifier = createToken({ name: "Identifier", pattern: /[a-zA-Z]+/ });

// Define lexer
const allTokens = [And, Or, Identifier];
const lexer = new Lexer(allTokens);

// Define parser
class BooleanParser extends CstParser {
  constructor() {
    super(allTokens);
    const $ = this;

    $.RULE("expression", () => {
      $.SUBRULE($.booleanExpression);
    });

    $.RULE("booleanExpression", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.andExpression) },
        { ALT: () => $.SUBRULE($.orExpression) },
      ]);
    });

    $.RULE("andExpression", () => {
      $.CONSUME(Identifier);
      $.CONSUME(And);
      //   $.OR([
      //     { ALT: () => $.CONSUME(Identifier) },
      //     { ALT: () => $.SUBRULE($.booleanExpression) },
      //   ]);
      //   $.SUBRULE($.booleanExpression);
      $.CONSUME2(Identifier);
    });

    $.RULE("orExpression", () => {
      $.CONSUME(Identifier);
      $.CONSUME(Or);
      //   $.OR([
      //     { ALT: () => $.CONSUME(Identifier) },
      //     { ALT: () => $.SUBRULE($.booleanExpression) },
      //   ]);
      $.CONSUME2(Identifier);
    });

    $.performSelfAnalysis();
  }
}

// Create parser instance
const parser = new BooleanParser();

// Parse input
parser.input = lexer.tokenize("aANDb").tokens;
const cst = parser.andExpression();
// const cst = parser.booleanExpression(lexer.tokenize("aANDb").tokens);

console.log({ cst: JSON.stringify(cst, null, 2) });
