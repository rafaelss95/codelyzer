import { sprintf } from 'sprintf-js';
import { IOptions, IRuleMetadata, RuleFailure, Rules, Utils } from 'tslint/lib';
import { Decorator, PropertyDeclaration, SourceFile } from 'typescript';
import { NgWalker } from './angular/ngWalker';
import { getReadableList } from './util/getReadableList';

export class Rule extends Rules.AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Input names should not be prefixed by the configured disallowed prefixes.',
    optionExamples: [[true, 'can', 'is', 'should']],
    options: {
      items: [
        {
          type: 'string'
        }
      ],
      minLength: 1,
      type: 'array'
    },
    optionsDescription: 'Options accept a string array of disallowed input prefixes.',
    rationale: Utils.dedent`
      HTML attributes are not prefixed. It's considered best not to prefix inputs.
      * Example: 'enabled' is prefered over 'isEnabled'.
    `,
    ruleName: 'no-input-prefix',
    type: 'maintainability',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING = '@Inputs should not be prefixed by %s';

  apply(sourceFile: SourceFile): RuleFailure[] {
    const walker = new Walker(sourceFile, this.getOptions());

    return this.applyWithWalker(walker);
  }

  isEnabled(): boolean {
    const {
      metadata: {
        options: { minLength }
      }
    } = Rule;
    const { length } = this.ruleArguments;

    return super.isEnabled() && length >= minLength;
  }
}

export const getFailureMessage = (prefixes: string[]): string => {
  return sprintf(Rule.FAILURE_STRING, getReadableList(prefixes, 'or'));
};

class Walker extends NgWalker {
  private readonly blacklistedPrefixes: string[];

  constructor(source: SourceFile, options: IOptions) {
    super(source, options);
    this.blacklistedPrefixes = options.ruleArguments;
  }

  protected visitNgInput(property: PropertyDeclaration, input: Decorator, args: string[]): void {
    this.validatePrefix(property);
    super.visitNgInput(property, input, args);
  }

  private validatePrefix(property: PropertyDeclaration): void {
    const memberName = property.name.getText();
    const isBlackListedPrefix = this.blacklistedPrefixes.some(x => x === memberName || new RegExp(`^${x}[^a-z]`).test(memberName));

    if (!isBlackListedPrefix) return;

    const failure = getFailureMessage(this.blacklistedPrefixes);

    this.addFailureAtNode(property, failure);
  }
}
