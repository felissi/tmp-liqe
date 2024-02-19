import { CstParser, createToken, Lexer } from "chevrotain";

const GreaterThan = createToken({ name: "GreaterThan", pattern: />/ });

const LessThan = createToken({ name: "LessThan", pattern: /</ });

const Contain = createToken({ name: "Contain", pattern: /:/ });

const WhiteSpace = createToken({
  name: "WhiteSpace",
  pattern: /\s+/,
  // group: Lexer.SKIPPED,
});
const Title = createToken({
  name: "Title",
  pattern: /title/,
});
function matchNonSpace(text: string, startOffset: number) {
  let endOffset = startOffset;
  let charCode = text.charCodeAt(endOffset);
  // 0-9 digits
  while (!isNaN(charCode) && charCode !== 32) {
    endOffset++;
    charCode = text.charCodeAt(endOffset);
    console.log(isNaN(charCode));
  }

  // No match, must return null to conform with the RegExp.prototype.exec signature
  if (endOffset === startOffset) {
    return null;
  } else {
    let matchedString = text.substring(startOffset, endOffset);
    // according to the RegExp.prototype.exec API the first item in the returned array must be the whole matched string.
    console.log([matchedString]);
    return [matchedString];
  }
}
const Value = createToken({
  name: "Value",
  pattern: { exec: matchNonSpace },
});

const allTokens = [
  WhiteSpace,
  // Select,
  // From,
  // Where,
  // Comma,
  // Identifier,
  // Integer,
  GreaterThan,
  LessThan,
  Contain,
  Title,
  Value,
];
class SelectParser extends CstParser {
  constructor() {
    super(allTokens);

    const $ = this;

    $.RULE("query", () => {
      $.MANY_SEP({
        SEP: WhiteSpace,
        DEF: () => {
          $.SUBRULE($.selectClause);
        },
      });
    });

    $.RULE("selectClause", () => {
      $.CONSUME(Title);
      // $.AT_LEAST_ONE_SEP({
      //   SEP: WhiteSpace,
      //   DEF: () => {
      //     $.CONSUME(Contain);
      //   },
      // });
      $.CONSUME(Contain);
      $.CONSUME(Value);
    });

    // $.RULE("fromClause", () => {
    //   $.CONSUME(From);
    //   $.CONSUME(Identifier);
    // });

    // $.RULE("whereClause", () => {
    //   $.CONSUME(Where);
    //   $.SUBRULE($.expression);
    // });

    // // The "rhs" and "lhs" (Right/Left Hand Side) labels will provide easy
    // // to use names during CST Visitor (step 3a).
    // $.RULE("expression", () => {
    //   $.SUBRULE($.atomicExpression, { LABEL: "lhs" });
    //   $.SUBRULE($.relationalOperator);
    //   $.SUBRULE2($.atomicExpression, { LABEL: "rhs" }); // note the '2' suffix to distinguish
    //   // from the 'SUBRULE(atomicExpression)'
    //   // 2 lines above.
    // });

    // $.RULE("atomicExpression", () => {
    //   $.OR([
    //     { ALT: () => $.CONSUME(Integer) },
    //     { ALT: () => $.CONSUME(Identifier) },
    //   ]);
    // });

    // $.RULE("relationalOperator", () => {
    //   $.OR([
    //     { ALT: () => $.CONSUME(GreaterThan) },
    //     { ALT: () => $.CONSUME(LessThan) },
    //   ]);
    // });

    this.performSelfAnalysis();
  }
}

const inputText = "title:中文123english    title:第二句";

const parser = new SelectParser();
const selectLexer = new Lexer(allTokens);
// console.log(selectLexer.tokenize(inputText));

parser.input = selectLexer.tokenize(inputText).tokens;
const cst = parser.query();
console.log(cst);
// console.log(JSON.stringify({ cst }, null, 2));
