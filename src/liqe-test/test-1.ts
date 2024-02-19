import { filter, highlight, parse, SyntaxError } from "liqe";

const persons = [
  {
    height: 180,
    name: "John Morton",
  },
  {
    height: 175,
    name: "David Barker",
  },
  {
    height: 170,
    name: "Thomas Castro",
  },
  {
    height: 170,
    name: "小明",
  },
];
const a1 = filter(parse("name:/小/"), persons);
const s1 = "小明";
function isNonASCII(str) {
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    if (charCode > 127) {
      return true; // Non-ASCII character found
    }
  }
  return false; // No non-ASCII characters found
}
try {
  parse(s1);
} catch (error) {
  if (error instanceof SyntaxError) {
    console.error({
      // Syntax error at line 1 column 5
      message: error.message,
      // 4
      offset: error.offset,
      // 1
      line: error.line,
      // 5
      column: error.column,
    });
    try {
      if (isNonASCII(s1)) {
        console.log("revised", parse(`/${s1}/`));
      }
    } catch (error) {
      throw error;
    }
  } else {
    throw error;
  }
}
console.log(parse("name:Dav"));
// const a2 = filter(parse("小明"), persons);
// [
//   {
//     height: 180,
//     name: 'John Morton',
//   },
//   {
//     height: 175,
//     name: 'David Barker',
//   },
// ]
console.log(a1);

const ast1 = parse("name:abc");
// ast1.
