import { Option, Help } from "commander";
import { Command, OptionGroup } from "./index";


const opt = new Option("--everywhere");

const program = new Command()
  .configureHelp({ showGlobalOptions: true, helpWidth: 80 })
  .description("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt.")
  .option("--foo")
  .argument("bar", "do a thing")
  .addOptionGroup(new OptionGroup("Output Options", "xxx These are the fields available to write. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.")
    .addOption(new Option("--json", "Format output as JSON."))
    .addOption(new Option("--yaml", "Format output as YAML."))
  )
  .addOptionGroup(new OptionGroup("Fields", "These are the available fields.")
    .addOptions(
      new Option("--app-id", "The application ID.")
    )
  );

const subCommand = new Command()
  .configureHelp({ showGlobalOptions: true })
  .name("sub")
  .description("A sub command")
  .option("--sub-foo")

subCommand.addCommand(new Command()
  .configureHelp({ showGlobalOptions: true })
  .name("subsub")
  .description("A sub-sub command")
  .option("--sub-foo-bar")
);

program.addCommand(subCommand);

program.parse();
