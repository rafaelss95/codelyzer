import { ElementAst, PropertyBindingType, TemplateAst } from '@angular/compiler';
import { IRuleMetadata, Replacement, RuleFailure } from 'tslint';
import { AbstractRule } from 'tslint/lib/rules';
import { isPropertyAccessExpression, SourceFile } from 'typescript';
import { ComponentMetadata, StyleMetadata } from './angular/metadata';
import { NgWalker, NgWalkerConfig } from './angular/ngWalker';
import { BasicCssAstVisitor } from './angular/styles/basicCssAstVisitor';
import { CssAst, CssSelectorAst, CssSelectorRuleAst } from './angular/styles/cssAst';
import { BasicTemplateAstVisitor } from './angular/templates/basicTemplateAstVisitor';
import { parseTemplate } from './angular/templates/templateParser';
import { getDecoratorPropertyInitializer } from './util/utils';

interface Strategy {
  attribute(ast: ElementAst): boolean;
  class(ast: ElementAst): boolean;
  id(ast: ElementAst): boolean;
}

const CSS_SELECTOR_TOKENIZER = require('css-selector-tokenizer');
const CSSAURON = require('cssauron');
const DEEP_SELECTOR_PATTERN = /(.*)[\/>]$/; // Matches "/deep/" or ">>>"
const HOST_SELECTOR_PATTERN = /^:/; // Matches ":host" or ":host-context"
const PSEUDO_ELEMENT_PATTERN = /::/g; // Matches "after", "::before", "::first-letter", "first-line" or "::selection"

// Initialize the selector accessors
const CSSSAURON_LANGUAGE = CSSAURON({
  attr(node: ElementAst, attrName: string): string | undefined {
    const targetAttr = node.attrs.find(a => a.name === attrName);

    return targetAttr ? targetAttr.value : undefined;
  },
  children(node: ElementAst): TemplateAst[] {
    return node.children;
  },
  class(node: ElementAst): string {
    const classAttr = node.attrs.find(a => a.name.toLowerCase() === 'class');
    const classBindings = (node.inputs || [])
      .filter(input => input.type === PropertyBindingType.Class)
      .map(input => input.name)
      .join(' ');

    return classAttr ? `${classAttr.value} ${classBindings}` : classBindings;
  },
  id(node: ElementAst): string | undefined {
    return this.attr(node, 'id');
  },
  parent(node: ElementAst & { parentNode: ElementAst }): ElementAst {
    return node.parentNode;
  },
  tag(node: ElementAst): string {
    return node.name.toLowerCase();
  }
});

const STRATEGIES: Strategy = {
  attribute(ast: ElementAst): boolean {
    return (ast.inputs || []).some(input => input.type === PropertyBindingType.Attribute);
  },
  class(ast: ElementAst): boolean {
    return (ast.inputs || []).some(input => /^(className|ngClass)$/.test(input.name));
  },
  id(ast: ElementAst): boolean {
    return (ast.inputs || []).some(input => input.name === 'id');
  }
};

// Finds out if selector of given type has been used
const hasSelector = (node: Record<string, any>, type: string): boolean =>
  node && (/^selectors?$/.test(node.type) ? (node.nodes || []).some(node => hasSelector(node, type)) : node.type === type);

export class Rule extends AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: "Disallows having an unused CSS rule in the component's stylesheet.",
    hasFix: true,
    options: null,
    optionsDescription: 'Not configurable.',
    ruleName: 'no-unused-css',
    type: 'maintainability',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING = 'Unused styles';

  apply(sourceFile: SourceFile): RuleFailure[] {
    const walkerConfig: NgWalkerConfig = { cssVisitorCtrl: CssVisitorCtrl };
    const walker = new Walker(sourceFile, this.getOptions(), walkerConfig);

    return this.applyWithWalker(walker);
  }
}

// Visitor which normalizes the elements and finds out if we have a match
class ElementVisitor extends BasicTemplateAstVisitor {
  visitElement(ast: ElementAst, fn: Function): any {
    this.validateElement(ast, fn);
    super.visitElement(ast, fn);
  }

  private validateElement(ast: ElementAst, fn: Function): void {
    fn(ast);

    ast.children.forEach(child => {
      (child as ElementAst & { parentNode: ElementAst }).parentNode = ast;

      this.visit!(child, fn);
    });
  }
}

// Filters elements following the strategies:
// - If has selector by id and any of the elements has a dynamically set id we just skip it.
// - If has selector by class and any of the elements has a dynamically set class we just skip it.
// - If has selector by attribute and any of the elements has a dynamically set attribute we just skip it.
class ElementFilterVisitor extends BasicTemplateAstVisitor {
  shouldVisit(ast: ElementAst, strategies: Strategy, selectorTypes: object): boolean {
    return (
      Object.keys(strategies).every(strategyKey => !selectorTypes[strategyKey] || !strategies[strategyKey](ast)) &&
      (ast.children || []).every(child => this.shouldVisit(child as ElementAst, strategies, selectorTypes))
    );
  }
}

class CssVisitorCtrl extends BasicCssAstVisitor {
  templateAst!: TemplateAst;

  visitCssSelector(ast: CssSelectorAst): boolean {
    if (!this.templateAst) return true;

    let parts = '';

    for (const selectorPart of ast.selectorParts) {
      const strValue = (selectorPart.strValue = selectorPart.strValue.split(PSEUDO_ELEMENT_PATTERN)[0]);
      const isDeepSelector = DEEP_SELECTOR_PATTERN.test(strValue);

      if (isDeepSelector) {
        parts = parts.concat(strValue, ' ');
        break;
      }

      const isHostSelector = HOST_SELECTOR_PATTERN.test(strValue);

      if (!isHostSelector) {
        parts = parts.concat(strValue, ' ');
      }
    }

    if (parts.length === 0) return true;

    const elementFilterVisitor = new ElementFilterVisitor(this.getSourceFile(), this._originalOptions, this.context, 0);
    const tokenized = CSS_SELECTOR_TOKENIZER.parse(parts);
    const selectorTypesCache = Object.keys(STRATEGIES).reduce<Record<string, boolean>>((a, key) => {
      a[key] = hasSelector(tokenized, key);

      return a;
    }, {});

    if (!elementFilterVisitor.shouldVisit(this.templateAst as ElementAst, STRATEGIES, selectorTypesCache)) {
      return true;
    }

    const visitor = new ElementVisitor(this.getSourceFile(), this._originalOptions, this.context, 0);
    let matchFound = false;

    const selector = (element: ElementAst) => {
      if (CSSSAURON_LANGUAGE(parts)(element)) {
        matchFound = true;
        return true;
      }

      return false;
    };

    visitor.visit!(this.templateAst, selector);

    return matchFound;
  }

  visitCssSelectorRule(ast: CssSelectorRuleAst): any {
    this.validateCssSelectorRule(ast);
    super.visitCssSelectorRule(ast);
  }

  private validateCssSelectorRule(ast: CssSelectorRuleAst): void {
    const match = ast.selectors.some(s => this.visitCssSelector(s));

    if (match) return;

    const {
      end: { offset: endOffset },
      start: { offset: startOffset }
    } = ast;
    const length = endOffset - startOffset + 1;

    this.addFailureAt(startOffset, length, Rule.FAILURE_STRING, Replacement.deleteText(startOffset - 1, length + 1));
  }
}

// Finds the template and wrapes the parsed content into a root element
class Walker extends NgWalker {
  private templateAst!: TemplateAst;

  protected visitNgComponent(metadata: ComponentMetadata): void {
    this.validateComponent(metadata);
    super.visitNgComponent(metadata);
  }

  protected visitNgStyleHelper(style: CssAst, context: ComponentMetadata, styleMetadata: StyleMetadata, baseStart: number): void {
    this.validateStyles(style, context, styleMetadata, baseStart);
    super.visitNgStyleHelper(style, context, styleMetadata, baseStart);
  }

  private validateComponent(metadata: ComponentMetadata): void {
    if (!metadata.template || !metadata.template.template) return;

    this.templateAst = new ElementAst(
      '*',
      [],
      [],
      [],
      [],
      [],
      [],
      false,
      [],
      parseTemplate(metadata.template.template.code),
      0,
      null!,
      null
    );
  }

  private validateStyles(style: CssAst, context: ComponentMetadata, styleMetadata: StyleMetadata, baseStart: number): void {
    const visitor = new CssVisitorCtrl(this.getSourceFile(), this._originalOptions, context, styleMetadata, baseStart);
    const encapsulationValue = getDecoratorPropertyInitializer(context.decorator, 'encapsulation');
    const isEncapsulationEnabled =
      !encapsulationValue || (isPropertyAccessExpression(encapsulationValue) && encapsulationValue.name.text !== 'None');

    visitor.templateAst = this.templateAst;
    style.visit(visitor);

    if (!isEncapsulationEnabled) return;

    visitor.getFailures().forEach(ruleFailure => {
      const endPositionNumber = ruleFailure.getEndPosition().getPosition();
      const startPositionNumber = ruleFailure.getStartPosition().getPosition();
      const strFailure = ruleFailure.getFailure();
      const fix = ruleFailure.getFix();

      this.addFailureFromStartToEnd(startPositionNumber, endPositionNumber, strFailure, fix);
    });
  }
}
