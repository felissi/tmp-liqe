import { createToken, Lexer, CstParser } from "chevrotain";

// Tokens
const And = createToken({ name: "And", pattern: /AND/ });
const Or = createToken({ name: "Or", pattern: /OR/ });
const Not = createToken({ name: "Not", pattern: /NOT|-/ });

const Identifier = createToken({ name: "Identifier", pattern: /[a-zA-Z]+/ });
const whiteSpace = createToken({
  name: "WhiteSpace",
  pattern: /\s+/,
  group: Lexer.SKIPPED,
});

// Lexer
const allTokens = [And, Or, Not, Identifier, whiteSpace];
const lexer = new Lexer(allTokens);

// Parser
class BooleanParser extends CstParser {
  constructor() {
    super(allTokens);

    this.RULE("booleanExpression", () => {
      let result = this.SUBRULE(this.booleanTerm);

      this.MANY(() => {
        this.CONSUME(Or);
        const right = this.SUBRULE2(this.booleanTerm);

        result = {
          OR: { children: [result, right] },
        };
      });

      return result;
    });

    this.RULE("booleanTerm", () => {
      let result = this.SUBRULE(this.booleanFactor);

      this.MANY(() => {
        this.CONSUME(And);
        const right = this.SUBRULE2(this.booleanFactor);

        result = {
          AND: { children: [result, right] },
        };
      });

      return result;
    });

    this.RULE("booleanFactor", () => {
      let result;
      this.OPTION(() => {
        this.CONSUME(Not);
        result = this.SUBRULE(this.booleanAtom);

        result = { NOT: result };
      });

      return result;
    });

    this.RULE("booleanAtom", () => {
      return this.CONSUME(Identifier).image;
    });

    this.performSelfAnalysis();
  }
  //   public booleanTerm = this.RULE("booleanTerm", () => {
  //     let result = this.SUBRULE(this.booleanFactor);

  //     this.MANY(() => {
  //       this.CONSUME(And);
  //       const right = this.SUBRULE2(this.booleanFactor);

  //       result = {
  //         AND: { children: [result, right] },
  //       };
  //     });

  //     return result;
  //   });

  //   public booleanFactor = this.RULE("booleanFactor", () => {
  //     return this.CONSUME(Identifier).image;
  //   });
}

// Usage
const parser = new BooleanParser();

function parseBooleanAlgebra(expression: string): object {
  const lexingResult = lexer.tokenize(expression);
  console.log({ lexingResult });

  if (lexingResult.errors.length > 0) {
    throw new Error(`Lexer errors: ${lexingResult.errors}`);
  }

  parser.input = lexingResult.tokens;
  const cst = parser.booleanExpression();

  return cst;
}

// Example usage
const expression = "a AND b AND c OR d";
const cst = parseBooleanAlgebra(expression);
// console.log(JSON.stringify(cst, null, 2));
console.log({ cst });
