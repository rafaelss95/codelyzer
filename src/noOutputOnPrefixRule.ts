import { sprintf } from 'sprintf-js';
import { IRuleMetadata, RuleFailure } from 'tslint';
import { AbstractRule } from 'tslint/lib/rules';
import { Decorator, PropertyDeclaration, SourceFile } from 'typescript';
import { NgWalker } from './angular/ngWalker';
import { getClassName } from './util/utils';

const STYLE_GUIDE_LINK = 'https://angular.io/guide/styleguide#style-05-16';

export class Rule extends AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Name events without the prefix on.',
    descriptionDetails: `See more at ${STYLE_GUIDE_LINK}.`,
    options: null,
    optionsDescription: 'Not configurable.',
    rationale:
      'Angular allows for an alternative syntax on-*. If the event itself was prefixed with on this would result in an on-onEvent binding expression.',
    ruleName: 'no-output-on-prefix',
    type: 'maintainability',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING = `A directive output property should not be prefixed with 'on' (${STYLE_GUIDE_LINK})`;

  apply(sourceFile: SourceFile): RuleFailure[] {
    const walker = new Walker(sourceFile, this.getOptions());

    return this.applyWithWalker(walker);
  }
}

class Walker extends NgWalker {
  protected visitNgOutput(property: PropertyDeclaration, output: Decorator, args: string[]): void {
    this.validateOutput(property);
    super.visitNgOutput(property, output, args);
  }

  private validateOutput(property: PropertyDeclaration): void {
    const className = getClassName(property);
    const memberName = property.name.getText();

    if (!memberName || !/^on((?![a-z])|(?=$))/.test(memberName)) return;

    const failure = sprintf(Rule.FAILURE_STRING, className, memberName);

    this.addFailureAtNode(property, failure);
  }
}
