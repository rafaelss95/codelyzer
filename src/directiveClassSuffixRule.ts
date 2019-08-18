import { sprintf } from 'sprintf-js';
import * as Lint from 'tslint';
import * as ts from 'typescript';
import { DirectiveMetadata } from './angular/metadata';
import { NgWalker } from './angular/ngWalker';
import { getReadableList } from './util/getReadableList';
import { getDeclaredInterfaceNames } from './util/utils';

interface FailureParameters {
  readonly suffixes: ReadonlyArray<string>;
}

const STYLE_GUIDE_LINK = 'https://angular.io/guide/styleguide#style-02-03';
const ValidatorSuffix = 'Validator';

export const getFailureMessage = (failureParameters: FailureParameters = { suffixes: ['Directive'] }): string => {
  return sprintf(Rule.FAILURE_STRING, getReadableList(failureParameters.suffixes, 'or'));
};

export class Rule extends Lint.Rules.AbstractRule {
  static readonly metadata: Lint.IRuleMetadata = {
    description: 'Classes decorated with @Directive must have suffix "Directive" (or custom) in their name.',
    descriptionDetails: `See more at ${STYLE_GUIDE_LINK}.`,
    optionExamples: [true, [true, 'Directive', 'MySuffix']],
    options: {
      items: {
        type: 'string'
      },
      type: 'array'
    },
    optionsDescription: 'Supply a list of allowed component suffixes. Defaults to "Directive".',
    rationale: 'Consistent conventions make it easy to quickly identify and reference assets of different types.',
    ruleName: 'directive-class-suffix',
    type: 'style',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING = `The name of a directive should be suffixed by %s (${STYLE_GUIDE_LINK})`;

  static validate(className: string, suffixes: string[]): boolean {
    return suffixes.some(s => className.endsWith(s));
  }

  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    const walker = new Walker(sourceFile, this.getOptions());

    return this.applyWithWalker(walker);
  }
}

class Walker extends NgWalker {
  protected visitNgDirective(metadata: DirectiveMetadata): void {
    const name = metadata.controller.name!;
    const className = name.text;
    const options = this.getOptions();
    const suffixes: string[] = options.length ? options : ['Directive'];

    const declaredInterfaceNames = getDeclaredInterfaceNames(metadata.controller);
    const hasValidatorInterface = declaredInterfaceNames.some(interfaceName => interfaceName.endsWith(ValidatorSuffix));

    if (hasValidatorInterface) {
      suffixes.push(ValidatorSuffix);
    }

    if (!Rule.validate(className, suffixes)) {
      this.addFailureAtNode(name, getFailureMessage({ suffixes }));
    }

    super.visitNgDirective(metadata);
  }
}
