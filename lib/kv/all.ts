import { allMarks } from "../marks.ts";
import { kvValues } from "./kv.ts";

const marks = await allMarks();

for (const mark of marks) {
  console.log("mark", mark);
}

console.log("total marks", marks.length);
