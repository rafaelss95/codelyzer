import { ASTWithSource, BoundElementPropertyAst, Interpolation } from '@angular/compiler';
import { IRuleMetadata, Replacement, RuleFailure } from 'tslint/lib';
import { AbstractRule } from 'tslint/lib/rules';
import { SourceFile } from 'typescript/lib/typescript';
import { Config } from './angular/config';
import { NgWalker, NgWalkerConfig } from './angular/ngWalker';
import { BasicTemplateAstVisitor } from './angular/templates/basicTemplateAstVisitor';

const {
  interpolation: [INTERPOLATION_OPEN, INTERPOLATION_CLOSE]
} = Config;
const INTERPOLATION_BASE_FOR_PATTERN = `${INTERPOLATION_OPEN}\\s*(.*?)\\s*${INTERPOLATION_CLOSE}`;
const INTERPOLATION_PATTERN = new RegExp(INTERPOLATION_BASE_FOR_PATTERN, 'g');
const INTERPOLATION_ASSIGNMENT_PATTERN = new RegExp(`(.*)="${INTERPOLATION_BASE_FOR_PATTERN}"`);
const INTERPOLATION_REPLACE_EXPRESSION = '[$1]="$2"';

const getReplacement = (start: number, end: number, text: string): Replacement => {
  const replacedText = text.replace(INTERPOLATION_ASSIGNMENT_PATTERN, INTERPOLATION_REPLACE_EXPRESSION);

  return Replacement.replaceFromTo(start, end, replacedText);
};

export class Rule extends AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Enforces the use of property binding instead of interpolations.',
    options: null,
    optionsDescription: 'Not configurable.',
    ruleName: 'template-prefer-property-binding',
    type: 'maintainability',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING = 'Use property binding instead of interpolations';

  apply(sourceFile: SourceFile): RuleFailure[] {
    const walkerConfig: NgWalkerConfig = {
      templateVisitorCtrl: TemplateVisitorCtrl
    };
    const walker = new NgWalker(sourceFile, this.getOptions(), walkerConfig);

    return this.applyWithWalker(walker);
  }
}

class TemplateVisitorCtrl extends BasicTemplateAstVisitor {
  visitElementProperty(prop: BoundElementPropertyAst, context: any): any {
    this.validateElementProperty(prop);
    super.visitElementProperty(prop, context);
  }

  private generateFailure(prop: BoundElementPropertyAst): void {
    const {
      sourceSpan: {
        end: { offset: endOffset },
        start: { offset: startOffset }
      }
    } = prop;
    const absoluteStartPosition = this.getSourcePosition(startOffset);
    const absoluteEndPosition = absoluteStartPosition + (endOffset - startOffset);
    const failure = Rule.FAILURE_STRING;
    const replacement = getReplacement(absoluteStartPosition, absoluteEndPosition, prop.sourceSpan.toString());

    this.addFailureFromStartToEnd(startOffset, endOffset, failure, replacement);
  }

  private validateElementProperty(prop: BoundElementPropertyAst): void {
    if (!(prop.value instanceof ASTWithSource) || !(prop.value.ast instanceof Interpolation) || !prop.value.source) {
      return;
    }

    const hasMultipleInterpolations = (prop.value.source.match(INTERPOLATION_PATTERN) || []).length > 1;

    if (hasMultipleInterpolations) return;

    this.generateFailure(prop);
  }
}
