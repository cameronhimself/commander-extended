import { Option } from "commander";
import { Command, OptionGroup } from "..";

const expectedHelp = (help: string) => {
  if (help[0] === "\n") {
    help = help.slice(1);
  }
  const indentMatch = help.match(/^\s*/);
  const indent = indentMatch ? indentMatch[0] : "";
  return help.split("\n").map(s => s.slice(indent.length)).join("\n").trim() + "\n";
}

export const programs: Record<string, { command: Command, expected: string, args?: Array<string> }> = {
  "with single argument": {
    command: new Command("test")
      .argument("<foobar>", "Do something cool"),
    expected: expectedHelp(`
      Usage: test [options] <foobar>

      Arguments:
        foobar      Do something cool

      Options:
        -h, --help  display help for command
    `),
  },

  "with single option": {
    command: new Command("test")
      .option("--foobar", "Do something cool"),
    expected: expectedHelp(`
      Usage: test [options]

      Options:
        --foobar    Do something cool
        -h, --help  display help for command
    `),
  },

  "with multiple options": {
    command: new Command("test")
      .option("--foobar", "Do something cool")
      .option("-b, --baz", "Do something else"),
    expected: expectedHelp(`
      Usage: test [options]

      Options:
        --foobar    Do something cool
        -b, --baz   Do something else
        -h, --help  display help for command
    `),
  },

  "with grouped options": {
    command: new Command("test")
      .addOptionGroup(new OptionGroup("Output Options", "These options are used to change the output format.")
        .addOptions(
          new Option("--json <indent>", "Output as JSON"),
          new Option("--yaml", "Output as YAML"),
        )
      ),
    expected: expectedHelp(`
      Usage: test [options]

      Options:
        -h, --help       display help for command

      Output Options:
        These options are used to change the output format.

        --json <indent>  Output as JSON
        --yaml           Output as YAML
    `),
  },

  "with multiple grouped options": {
    command: new Command("test")
      .addOptionGroup(new OptionGroup("Output Options")
        .addOptions(
          new Option("--json", "Output as JSON"),
          new Option("--yaml", "Output as YAML"),
        )
      )
      .addOptionGroup(new OptionGroup("Verbosity Options")
        .addOptions(
          new Option("--verbose <level>", "More detailed output"),
          new Option("-q, --quiet", "Suppress output"),
        )
      ),
    expected: expectedHelp(`
      Usage: test [options]

      Options:
        -h, --help         display help for command

      Output Options:
        --json             Output as JSON
        --yaml             Output as YAML

      Verbosity Options:
        --verbose <level>  More detailed output
        -q, --quiet        Suppress output
      `),
  },

  "with subcommand": {
    command: new Command("test")
      .addCommand(new Command("subtest").description("Do a sub-test.")),
    expected: expectedHelp(`
      Usage: test [options] [command]

      Options:
        -h, --help      display help for command

      Commands:
        subtest         Do a sub-test.
        help [command]  display help for command
    `),
  },

  
  "with subcommand with grouped options": {
    command: new Command("test")
      .addCommand(new Command("subtest").description("Do a sub-test.")
        .addOptionGroup(new OptionGroup("Verbosity Options")
          .addOptions(
            new Option("--verbose <level>", "More detailed output"),
            new Option("-q, --quiet", "Suppress output"),
          )
        ),
      ),
    expected: expectedHelp(`
      Usage: test [options] [command]

      Options:
        -h, --help         display help for command

      Commands:
        subtest [options]  Do a sub-test.
        help [command]     display help for command
    `),
  },

  "with subcommand with grouped options and grouped options on parent command": {
    command: new Command("test")
      .addOptionGroup(new OptionGroup("Verbosity Options")
        .addOptions(
          new Option("--verbose <level>", "More detailed output"),
          new Option("-q, --quiet", "Suppress output"),
        )
      )
      .addCommand(new Command("subtest").description("Do a sub-test.")
        .configureHelp({ showGlobalOptions: true })
        .addOptionGroup(new OptionGroup("I/O Options")
          .addOptions(
            new Option("-i, --input <path>", "The input path"),
            new Option("-o, --output", "The output path"),
          )
        ),
      ),
    args: ["help", "subtest"],
    expected: expectedHelp(`
      Usage: test subtest [options]

      Do a sub-test.

      Options:
        -h, --help          display help for command

      I/O Options:
        -i, --input <path>  The input path
        -o, --output        The output path

      Global Verbosity Options:
        --verbose <level>   More detailed output
        -q, --quiet         Suppress output
    `),
  },

};
