import { sprintf } from 'sprintf-js';
import * as Lint from 'tslint';
import * as ts from 'typescript';
import { NgWalker } from './angular';
import { ComponentMetadata } from './angular/metadata';
import { F2, Maybe } from './util/function';
import { getReadableList } from './util/getReadableList';
import { Failure } from './walkerFactory/walkerFactory';
import { all, validateComponent } from './walkerFactory/walkerFn';

interface FailureParameters {
  readonly suffixes: ReadonlyArray<string>;
}

const STYLE_GUIDE_LINK = 'https://angular.io/guide/styleguide#style-02-03';

export const getFailureMessage = (failureParameters: FailureParameters = { suffixes: ['Component'] }): string => {
  return sprintf(Rule.FAILURE_STRING, getReadableList(failureParameters.suffixes, 'or'));
};

export class Rule extends Lint.Rules.AbstractRule {
  static readonly metadata: Lint.IRuleMetadata = {
    description: 'Classes decorated with @Component must have suffix "Component" (or custom) in their name.',
    descriptionDetails: `See more at ${STYLE_GUIDE_LINK}.`,
    optionExamples: [true, [true, 'Component', 'View']],
    options: {
      items: {
        type: 'string'
      },
      type: 'array'
    },
    optionsDescription: 'Supply a list of allowed component suffixes. Defaults to "Component".',
    rationale: 'Consistent conventions make it easy to quickly identify and reference assets of different types.',
    ruleName: 'component-class-suffix',
    type: 'style',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING = `The name of a component should be suffixed by %s (${STYLE_GUIDE_LINK})`;

  static walkerBuilder: F2<ts.SourceFile, Lint.IOptions, NgWalker> = all(
    validateComponent((meta: ComponentMetadata, suffixList: string[] = []) =>
      Maybe.lift(meta.controller)
        .fmap(controller => controller.name)
        .fmap(name => {
          const { text } = name!;
          const failures: Failure[] = [];
          const suffixes = suffixList.length > 0 ? suffixList : ['Component'];

          if (!Rule.validate(text, suffixes)) {
            failures.push(new Failure(name!, getFailureMessage({ suffixes })));
          }

          return failures;
        })
    )
  );

  static validate(className: string, suffixList: string[]): boolean {
    return suffixList.some(suffix => className.endsWith(suffix));
  }

  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    const walker = Rule.walkerBuilder(sourceFile, this.getOptions());

    return this.applyWithWalker(walker);
  }
}
