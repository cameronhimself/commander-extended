import {
  Option as BaseOption,
  Command as BaseCommand,
  Help as BaseHelp,
  HelpConfiguration,
} from "commander";


export class OptionGroup {
  public name: string = "";
  private _description: string = "";
  public readonly options: Array<BaseOption> = [];

  constructor(name: string, description?: string) {
    this.name = name;
    this._description = description || this._description;
  }

  description(desc: string): this;
  description(): string;
  description(desc?: string): this | string {
    if (desc) {
      this._description = desc;
      return this;
    }
    return this._description;
  }

  addOption(option: BaseOption): this {
    this.options.push(option);
    return this;
  }

  addOptions(...options: BaseOption[]): this;
  addOptions(options: BaseOption[]): this;
  addOptions(...args: any[]): this {
    const options: BaseOption[] = Array.isArray(args[0]) ? args[0] : args;
    this.options.push(...options);
    return this;
  }
}

export class GroupedOptionsHelp extends BaseHelp {
  private formatGroupDescription(helper: BaseHelp, desc: string): string {
    if (!desc) {
      return "";
    }
    const indentation = 2;
    const wrapped = this.boxWrap(desc, (helper.helpWidth ?? 80) - indentation);
    return wrapped
      .split("\n")
      .map(line => `${" ".repeat(indentation)}${line}`)
      .join("\n")
      .concat("\n");
  }

  private stripOptions(helper: BaseHelp, output: string): [string, string] {
    const optionsMatch = output.match(new RegExp(`\\n${helper.styleTitle("Options:")}`));
    const commandsMatch = output.match(new RegExp(`\\n${helper.styleTitle("Commands:")}`));
    let before = "";
    let after = "";
    if (optionsMatch && optionsMatch.index) {
      before = output.slice(0, optionsMatch.index)
    }
    if (commandsMatch && commandsMatch.index) {
      after = output.slice(commandsMatch.index, output.length);
    }
    return [before.trim(), after.trim()];
  }

  private formatOptionGroup(cmd: Command, helper: BaseHelp, group: OptionGroup): string {
    let output: Array<string> = [];
    const termWidth = helper.padWidth(cmd, helper);
    function callFormatItem(term: string, description: string) {
      return helper.formatItem(term, termWidth, description, helper);
    }

    const optionList = group.options.map((option) => {
      return callFormatItem(
        helper.styleOptionTerm(helper.optionTerm(option)),
        helper.styleOptionDescription(helper.optionDescription(option)),
      );
    });
    if (optionList.length > 0) {
      output = output.concat([
        helper.styleTitle(`${group.name}:`),
        ...(group.description() ? [this.formatGroupDescription(helper, group.description())] : []),
        ...optionList,
        '',
      ]);
    }

    return output.join("\n");
  }

  protected getGlobalOptionGroups(cmd: Command) {
    const globalOptionGroups: Array<OptionGroup> = [];
    for (let ancestorCmd = cmd.parent; ancestorCmd; ancestorCmd = ancestorCmd.parent) {
      if (ancestorCmd instanceof Command) {
        globalOptionGroups.push(...ancestorCmd.optionGroups);
      }
    }
    return globalOptionGroups;
  }

  protected formatOptionGroups(cmd: Command, helper: BaseHelp): string {
    const groups: Array<OptionGroup> = [];
    const visibleOptions = helper.visibleOptions(cmd);
    const visibleGlobalOptions = helper.visibleGlobalOptions(cmd);
    const globalOptionGroups = this.getGlobalOptionGroups(cmd);

    // 1. Ungrouped options for this command
    const ungroupedOptions = visibleOptions.filter(opt => {
      const isInGroup = cmd.optionGroups.find(group => group.options.includes(opt));
      return !isInGroup;
    });
    groups.push(new OptionGroup("Options").addOptions(ungroupedOptions));

    // 2. Grouped options for this command
    for (const group of cmd.optionGroups) {
      // in-place filter
      group.options.splice(0, group.options.length, ...group.options.filter(opt => {
        return visibleOptions.includes(opt);
      }));
      if (group.options.length) {
        groups.push(group);
      }
    }

    if (this.showGlobalOptions) {
      // 3. Ungrouped global options
      const ungroupedGlobalOptions = visibleGlobalOptions.filter(opt => 
        !globalOptionGroups.find(group => group.options.find(groupOpt => groupOpt === opt))
      );
      if (ungroupedGlobalOptions.length) {
        groups.push(new OptionGroup("Global Options").addOptions(ungroupedGlobalOptions));
      }

      // 4. Grouped global options
      for (const group of globalOptionGroups) {
        // in-place filter
        group.options.splice(0, group.options.length, ...group.options.filter(opt => {
          return visibleGlobalOptions.includes(opt);
        }));
        if (group.options.length) {
          group.name = `Global ${group.name}`;
          groups.push(group);
        }
      }
    }

    return groups.map(group => 
      this.formatOptionGroup(cmd, helper, group)
    ).join("\n").trim();
  }

  public formatHelp(cmd: Command, helper: BaseHelp): string {
    const base = super.formatHelp(cmd, helper);
    const [before, after] = this.stripOptions(helper, base);
    const optionsOutput = this.formatOptionGroups(cmd, helper);
    return [before, optionsOutput, after].filter(Boolean).join("\n\n") + "\n";
  }
}

export class Command extends BaseCommand {
  public readonly optionGroups: Array<OptionGroup> = [];

  constructor(name?: string) {
    super(name);
  }

  public addOptions(...options: Array<BaseOption>): this;
  public addOptions(options: Array<BaseOption>): this;
  public addOptions(...args: Array<any>): this {
    const options: BaseOption[] = Array.isArray(args[0]) ? args[0] : args;
    options.forEach(option => {
      this.addOption(option);
    });
    return this;
  }

  public optionGroup(name: string, description: string, ...options: Array<BaseOption>): this;
  public optionGroup(name: string, ...options: Array<BaseOption>): this;
  public optionGroup(name: string, description?: string | BaseOption, ...options: Array<BaseOption>): this {
    const group = new OptionGroup(name);
    if (typeof description === "string") {
      group.description(description);
    }
    const allOptions = [
      ...(description instanceof BaseOption ? [description] : []),
      ...options,
    ];
    group.addOptions(allOptions);
    this.addOptionGroup(group);
    return this;
  }

  public addOptionGroup(group: OptionGroup): this {
    this.optionGroups.push(group);
    this.addOptions(group.options);
    return this;
  }

  public addOptionGroups(...groups: Array<OptionGroup>): this;
  public addOptionGroups(groups: Array<OptionGroup>): this;
  public addOptionGroups(...args: Array<any>): this {
    const groups: Array<OptionGroup> = Array.isArray(args[0]) ? args[0] : args;
    groups.forEach(group => {
      this.addOptionGroup(group);
    });
    return this;
  }

  public createHelp() {
    return Object.assign(new GroupedOptionsHelp(), this.configureHelp());
  }
}
