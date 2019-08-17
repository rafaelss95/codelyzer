import { MethodCall, PropertyRead, SafeMethodCall, FunctionCall, ImplicitReceiver } from '@angular/compiler';
import { IRuleMetadata, RuleFailure } from 'tslint';
import { AbstractRule } from 'tslint/lib/rules';
import { SourceFile } from 'typescript';
import { NgWalker, NgWalkerConfig } from './angular/ngWalker';
import { BasicTemplateAstVisitor } from './angular/templates/basicTemplateAstVisitor';
import { RecursiveAngularExpressionVisitor } from './angular/templates/recursiveAngularExpressionVisitor';

const ANY_TYPE_CAST_FUNCTION_NAME = '$any';

const isAnyTypeCastFunction = (ast: MethodCall | SafeMethodCall): boolean => ast.name === ANY_TYPE_CAST_FUNCTION_NAME;

const isNgAnyTypeCastFunction = (ast: MethodCall | SafeMethodCall): boolean =>
  isAnyTypeCastFunction(ast) && ast.receiver instanceof ImplicitReceiver;

export class Rule extends AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Disallows calling expressions in templates, except for output handlers.',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: 'Calling expressions in templates causes it to run on every change detection cycle and may cause performance issues.',
    ruleName: 'template-no-call-expression',
    type: 'maintainability',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING = 'Avoid calling expressions in templates';

  apply(sourceFile: SourceFile): RuleFailure[] {
    const walkerConfig: NgWalkerConfig = {
      expressionVisitorCtrl: ExpressionVisitorCtrl
      // templateVisitorCtrl: TemplateVisitorCtrl
    };
    const walker = new NgWalker(sourceFile, this.getOptions(), walkerConfig);

    return this.applyWithWalker(walker);
  }
}

class TemplateVisitorCtrl extends BasicTemplateAstVisitor {
  visitEvent(): any {}
}

class ExpressionVisitorCtrl extends RecursiveAngularExpressionVisitor {
  visitMethodCall(ast: MethodCall, context: any): any {
    this.validateMethodCall(ast);
    super.visitMethodCall(ast, context);
  }

  visitSafeMethodCall(ast: SafeMethodCall, context: any): any {
    this.validateMethodCall(ast);
    super.visitSafeMethodCall(ast, context);
  }
  // visit(ast, context): any {
  //   console.log(ast);
  //   super.visit(ast, context);
  // }
  // visitFunctionCall(ast: FunctionCall, context: any): any {
  //   console.log('123123123', ast);
  //   console.log('123123', ast.span.toString());
  //   console.log('vvvv', ast.toString());
  //   console.log('heba', ast.target!.span.toString());
  //   // console.log('hebaObj', (ast.target as any).obj.span.tos);
  //   // console.log('hebaObj.1', (ast.target as any).obj.toString());
  //   console.log('hebaKey', (ast.target as any).key);
  //   // console.log('hebaKey.1', (ast.target as any).key.toString());
  //   // console.log('hebaKey.2', (ast.target as any).key.span);
  //   // console.log('hebaKey.2.1', (ast.target as any).key.span.toString());
  //   console.log('hebaKey.3', Object.keys((ast.target as any).key.receiver));
  //   // console.log('hebaKey.3.1', (ast.target as any).receiver.toString());
  //   super.visitFunctionCall(ast, context);
  // }

  private generateFailure(ast: MethodCall | SafeMethodCall): void {
    const {
      span: { end: endSpan, start: startSpan }
    } = ast;
    // console.log('ast', ast.name.toString());
    // console.log('ast1', ast.receiver.toString());
    this.createFailure(startSpan, endSpan, Rule.FAILURE_STRING);
    // this.addFailureFromStartToEnd(startSpan, endSpan, Rule.FAILURE_STRING);
    // console.log('vv', this.getFailures());
  }

  private validateMethodCall(ast: MethodCall | SafeMethodCall): void {
    // const isAnyTypeCastFunction = ast.name === ANY_TYPE_CAST_FUNCTION_NAME;
    // const isNgAnyTypeCastFunction = !(ast.receiver instanceof PropertyRead);
    // const isNgAnyTypeCastFunction = ast.receiver instanceof ImplicitReceiver;

    console.log('ast', isNgAnyTypeCastFunction(ast));
    // console.log('isNgAnyTypeCastFunction(ast)', isNgAnyTypeCastFunction(ast));
    if (isNgAnyTypeCastFunction(ast)) return;
    // console.log('passed');

    this.generateFailure(ast);
  }
}
