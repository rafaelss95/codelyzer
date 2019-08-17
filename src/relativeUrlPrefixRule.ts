import { IRuleMetadata, RuleFailure } from 'tslint/lib';
import { AbstractRule } from 'tslint/lib/rules';
import { isArrayLiteralExpression, isStringLiteral, SourceFile } from 'typescript/lib/typescript';
import { ComponentMetadata } from './angular';
import { NgWalker } from './angular/ngWalker';
import { getDecoratorPropertyInitializer } from './util/utils';

const STYLE_GUIDE_LINK = 'https://angular.io/styleguide#style-05-04';
const PATTERN = /^\.\/[^\.\/|\.\.\/]/;

export class Rule extends AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: "The ./ prefix is standard syntax for relative URLs; don't depend on Angular's current ability to do without that prefix.",
    descriptionDetails: `See more at ${STYLE_GUIDE_LINK}.`,
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: 'A component relative URL requires no change when you move the component files, as long as the files stay together.',
    ruleName: 'relative-url-prefix',
    type: 'maintainability',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING = `The ./ prefix is standard syntax for relative URLs. (${STYLE_GUIDE_LINK})`;

  apply(sourceFile: SourceFile): RuleFailure[] {
    const walker = new Walker(sourceFile, this.getOptions());

    return this.applyWithWalker(walker);
  }
}

class Walker extends NgWalker {
  protected visitNgComponent(metadata: ComponentMetadata): void {
    this.validateComponent(metadata);
    super.visitNgComponent(metadata);
  }

  private validateComponent(metadata: ComponentMetadata): void {
    const { decorator } = metadata;
    const styleUrlsExpression = getDecoratorPropertyInitializer(decorator, 'styleUrls');
    const templateUrlExpression = getDecoratorPropertyInitializer(decorator, 'templateUrl');

    this.validateStyleUrls(styleUrlsExpression);
    this.validateTemplateUrl(templateUrlExpression);
  }

  private validateStyleUrls(expression: ReturnType<typeof getDecoratorPropertyInitializer>): void {
    if (!expression || !isArrayLiteralExpression(expression)) return;

    for (const element of expression.elements) {
      if (!isStringLiteral(element) || PATTERN.test(element.text)) continue;

      this.addFailureAtNode(element, Rule.FAILURE_STRING);
    }
  }

  private validateTemplateUrl(expression: ReturnType<typeof getDecoratorPropertyInitializer>): void {
    if (!expression || !isStringLiteral(expression) || PATTERN.test(expression.text)) return;

    this.addFailureAtNode(expression, Rule.FAILURE_STRING);
  }
}
