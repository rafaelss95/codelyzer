import {
  ASTWithSource,
  BoundDirectivePropertyAst,
  BoundElementPropertyAst,
  BoundEventAst,
  BoundTextAst,
  TextAst,
  ParseLocation,
  ParseSourceSpan
} from '@angular/compiler';
import { Fix, IRuleMetadata, Replacement, RuleFailure, Rules, IOptions } from 'tslint/lib';
import { SourceFile } from 'typescript/lib/typescript';
import { NgWalker, NgWalkerConfig } from './angular/ngWalker';
import { BasicTemplateAstVisitor } from './angular/templates/basicTemplateAstVisitor';

// const PATTERN = /(?<!\.)this([\?\!]?\.)|(\[$)/g;
// const PATTERN = /(?<![\.\]])(this[\?\!]?\.).*/g;
// const PATTERN = /(?<![\.\]])(this[\?\!]?(\.|\[['"](.*)['"]\])).*/g;
const PATTERN = /(?<!\.\s*)(this\s*[\?\!]?\.)/g;
let currentOffset = 0;

const isSameParseLocation = (location1: ParseLocation, location2: ParseLocation): boolean => {
  return ['col', 'line', 'offset'].every(key => location1[key] === location2[key]);
  // return location1.col === location2.col && location1.line === location2.line && location1.offset === location2.offset;
};

const replaceBetween = (value: string, start: number, end: number, replaceValue = ''): string => {
  return `${value.slice(0, start)}${replaceValue}${value.slice(end)}`;
};

export class Rule extends Rules.AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: '',
    options: 'Not configurable',
    optionsDescription: '',
    rationale: '',
    ruleName: 'template-no-this',
    type: 'maintainability',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING = 'RSRS';

  apply(sourceFile: SourceFile): RuleFailure[] {
    currentOffset = 0;

    const walkerConfig: NgWalkerConfig = {
      templateVisitorCtrl: TemplateVisitor
    };
    const walker = new NgWalker(sourceFile, this.getOptions(), walkerConfig);

    return this.applyWithWalker(walker);
  }
}

class TemplateVisitor extends BasicTemplateAstVisitor {
  lintedSourceSpans: ReadonlyArray<ParseSourceSpan> = [];

  visitBoundText(text: BoundTextAst, context: any): any {
    this.validate(text);
    super.visitBoundText(text, context);
  }

  visitDirectiveProperty(prop: BoundDirectivePropertyAst, context: any): any {
    this.validate(prop);
    super.visitDirectiveProperty(prop, context);
  }

  visitElementProperty(prop: BoundElementPropertyAst, context: any): any {
    this.validate(prop);
    super.visitElementProperty(prop, context);
  }

  visitEvent(ast: BoundEventAst, context: any): any {
    this.validate(ast);
    super.visitEvent(ast, context);
  }

  visitText(text: TextAst, context: any): any {
    this.validate(text);
    super.visitText(text, context);
  }

  private validate(ast: BoundDirectivePropertyAst | BoundElementPropertyAst | BoundEventAst | BoundTextAst | TextAst): void {
    const {
      sourceSpan: { end: endSourceSpan, start: startSourceSpan }
    } = ast;

    const wasSourceSpanLinted = this.lintedSourceSpans.find(
      lintedSourceSpan =>
        isSameParseLocation(lintedSourceSpan.end, endSourceSpan) && isSameParseLocation(lintedSourceSpan.start, startSourceSpan)
    );

    if (wasSourceSpanLinted) return;

    const { offset: startOffset } = startSourceSpan;
    const absoluteStartPosition = this.getSourcePosition(startOffset);
    const sourceSpanStr = ast.sourceSpan.toString();
    let match: ReturnType<RegExp['exec']>;

    this.lintedSourceSpans = this.lintedSourceSpans.concat(ast.sourceSpan);

    while ((match = PATTERN.exec(sourceSpanStr))) {
      // const { [0]: matchFull, [1]: matchCapturedGroup, [3]: matchReplace, index: matchIndex, input: matchInput } = match;
      const { [1]: matchCapturedGroup, index: matchIndex } = match;
      // const replacedText = replaceBetween(sourceSpanStr, matchIndex, matchIndex + matchCapturedGroup.length, matchReplace);
      const fix: Fix = Replacement.deleteText(absoluteStartPosition + matchIndex, matchCapturedGroup.length);

      // precisa verificar ngModelChange, evento e diretiva sendo disparados
      // console.log('sourceSpanStr', sourceSpanStr);
      // console.log('startOffset', startOffset);
      // console.log('matchFull', matchFull);
      // console.log('matchCapturedGroup', matchCapturedGroup);
      // console.log('matchReplace', matchReplace);
      // console.log('matchIndex', matchIndex);
      // console.log('matchInput', matchInput);
      // console.log('replacedText', replacedText);
      // console.log('fix', fix);

      this.addFailureAt(startOffset + matchIndex, matchCapturedGroup.length, Rule.FAILURE_STRING, fix);
    }
  }
}
