import { programs } from "./tests";

const mockToRun = process.argv.splice(2, 1)[0];
const program = programs[mockToRun];
if (program && program.command) {
  program.command.parse();
}
