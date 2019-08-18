import { sprintf } from 'sprintf-js';
import { IOptions, IRuleMetadata, RuleFailure } from 'tslint/lib/language/rule/rule';
import { AbstractRule } from 'tslint/lib/rules';
import { dedent } from 'tslint/lib/utils';
import { Decorator, PropertyDeclaration, SourceFile } from 'typescript';
import { NgWalker } from './angular/ngWalker';

const STYLE_GUIDE_LINK = 'https://angular.io/guide/styleguide#style-05-16';

export class Rule extends AbstractRule {
  static metadata: IRuleMetadata = {
    description: 'Disallows output names to be prefixed with a configured pattern.',
    descriptionDetails: `See more at ${STYLE_GUIDE_LINK}.`,
    optionExamples: [[true, '"^on"'], [true, '"^(on|yes)[A-Z]+"']],
    options: {
      items: [
        {
          type: 'string'
        }
      ],
      maxLength: 1,
      minLength: 1,
      type: 'array'
    },
    optionsDescription: 'Options accept a string defining ignore pattern for this rule, being parsed by new RegExp().',
    rationale: dedent`
      It's considered best not to prefix Outputs.
      * Example: 'savedTheDay' is prefered over 'onSavedTheDay'.
    `,
    ruleName: 'no-output-prefix',
    type: 'maintainability',
    typescriptOnly: true
  };

  static FAILURE_STRING = `@Outputs should not match the prefix pattern %s (${STYLE_GUIDE_LINK})`;

  static getFailureMessage(pattern: string): string {
    return sprintf(Rule.FAILURE_STRING, pattern);
  }

  apply(sourceFile: SourceFile): RuleFailure[] {
    const walker = new Walker(sourceFile, this.getOptions());

    return this.applyWithWalker(walker);
  }

  isEnabled(): boolean {
    const {
      metadata: {
        options: { maxLength, minLength }
      }
    } = Rule;
    const { length, [0]: prefixPattern } = this.ruleArguments;

    return super.isEnabled() && length >= minLength && length <= maxLength && prefixPattern && prefixPattern.trim();
  }
}

class Walker extends NgWalker {
  private readonly prefixPatternAsString: string;

  constructor(source: SourceFile, options: IOptions) {
    super(source, options);
    this.prefixPatternAsString = options.ruleArguments[0];
  }

  protected visitNgOutput(property: PropertyDeclaration, output: Decorator, args: string[]): void {
    this.validatePrefix(property);
    super.visitNgOutput(property, output, args);
  }

  private validatePrefix(property: PropertyDeclaration): void {
    const outputName = property.name.getText();
    const prefixPattern = new RegExp(`^${this.prefixPatternAsString}([^a-z]|$)`);
    const outputMatchPrefixPattern = prefixPattern.test(outputName);

    if (!outputMatchPrefixPattern) return;

    const failureMessage = Rule.getFailureMessage(this.prefixPatternAsString);
    this.addFailureAtNode(property, failureMessage);
  }
}
