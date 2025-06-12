import { allMarks } from "../marks.ts";

const marks = await allMarks();

for (const mark of marks) {
  console.log("mark", mark);
}

console.log("total marks", marks.length);
