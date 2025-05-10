# commander-extended

`commander-extended` adds a few new features to [Commander](https://www.npmjs.com/package/commander). At the moment, only:
- **Option groups**  
    Instead of all options going under a single `Options` heading, you can create multiple named groups of options, each with their own descriptions.
- **Add multiple options to a command at once**  
    Now you can add multiple `Option` instances at once to a command using the new `addOptions` method.

## Installation

Commander v13 is a peer depency, so it has to be installed separately:

```sh
npm i commander@13 commander-extended
```

`commander-extended` is written in TypeScript, so typings come along for free.

### Using with other versions of commander

Since this mucks around in the private guts of Commander's help generation, different major versions will almost certainly break it and minor versions have a decent chance to. As this was made primarily for personal use I provide no guarantees that it'll be kept up to date with Commander's development, or that older versions of Commander will ever be supported. It's probably best to pin your Commander version to avoid unexpected problems. At time of writing, the current version of Commander, and the one `commander-extended` has been built against, is `13.1.0`.

## Usage

`commander-extended` extends the base `Command` class from Commander. To use its features, simply replace any imports of `Command` from Commander with one from `commander-extended`:

```ts
// old
import { Command, Option } from "commander";

// new
import { Command } from "commander-extended";
import { Option } from "commander";
```

Since it extends the base `Command`, it should be a drop-in replacement with no additional changes needed.

### Option groups

```ts
import { Command, OptionGroup } from "commander-extended";
import { Option } from "commander";

const program = new Command("my-command")
  .description("Look, we're adding option groups!")
  .optionGroup("Output Options", "These options are used to control output.",
    new Option("--json", "Output as JSON."),
    new Option("--yaml", "output as YAML."),
  )
  // or
  .addOptionGroup(new OptionGroup("More Options")
    .description("This is another option group.")
    .addOption(new Option("--my-option", "This is my option."))
    .addOptions(
      new Option("--another-option", "Another option."),
      new Option("--yet-another-option", "Yet another option."),
    )
  );
```

Running this command with `--help` will yield:

```txt
Usage: my-command [options]

Look, we're adding option groups!

Options:
  -h, --help            display help for command

Output Options:
  These options are used to control output.

  --json                Output as JSON.
  --yaml                output as YAML.

More Options:
  This is another option group.

  --my-option           This is my option.
  --another-option      Another option.
  --yet-another-option  Yet another option.
```

Options within option groups are added to the command as usual, so you can use them exactly as if you had called `addOption` on the command directly.

Option groups are shown in the help in the order they were added. Ungrouped options always appear first, if any exist. The same is true for global options: all ungrouped options above the current command are aggregated into a single `Global Options` group, and all global groups are displayed below that, with `Global ` prefixed to their header, e.g. the above `Output Options` group would become `Global Output Options`.

So, in summary, groups will appear like this, with the last two only appearing if `showGlobalOptions` is set:

```txt
Options:
[option-group-name]:
Global Options:
Global [option-group-name]:
```

### Adding multiple options at once

A new method has been added to `Command`, `addOptions`, which accepts either an array of `Option` objects or any number of individual `Option` objects. It works exactly the same as calling `addOption` for each command individually.

```ts
import { Command } from "commander-extended";
import { Option } from "commander";

const program = new Command("my-command")
  .addOptions(
    new Option("--json", "Output as JSON."),
    new Option("--yaml", "output as YAML."),
  )
```
