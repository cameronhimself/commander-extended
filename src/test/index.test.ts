import "mocha";
import { assert } from "chai";
import { execSync } from "child_process";
import path from "path";
import { programs } from "./tests";

const runnerPath = path.resolve(__dirname, "runner.ts");
const runTestProgram = (testName: string, ...args: Array<string>) =>
  execSync(`npx tsx ${runnerPath} '${testName}' ${args ? args.join(" ") : ""}`).toString("utf-8");

describe("commander-extended", () => {
  Object.keys(programs).forEach(testName => {
    it(testName, () => {
      const args = programs[testName].args || ["--help"];
      const result = runTestProgram(testName, ...args)
      assert.equal(result, programs[testName].expected);
    });
  });
});
