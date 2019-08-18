import { expect } from 'chai';
import { Replacement } from 'tslint';
import { Rule } from '../src/templateNoThisRule';
import { assertAnnotated, assertSuccess } from './testHelper';

const {
  FAILURE_STRING,
  metadata: { ruleName }
} = Rule;

describe.only(ruleName, () => {
  describe('failure', () => {
    describe('bound text', () => {
      describe('variable', () => {
        it('should fail if a property is accessed within interpolation', () => {
          const source = `
            @Component({
              selector: 'test',
              template: '{{ this.foo }}'
                            ~~~~~
            })
            class Test {}
          `;
          const ruleFailures = assertAnnotated({
            message: FAILURE_STRING,
            ruleName,
            source
          });

          if (!Array.isArray(ruleFailures)) return;

          const replacement = Replacement.applyFixes(source, ruleFailures.map(ruleFailure => ruleFailure.getFix()!));
          const expectedSource = `
            @Component({
              selector: 'test',
              template: '{{ foo }}'
                            ~~~~~
            })
            class Test {}
          `;

          expect(replacement).to.eq(expectedSource);
        });

        it('should fail if a property is accessed and negated within interpolation', () => {
          const source = `
            @Component({
              selector: 'test',
              template: '{{ !this.foo }}'
                             ~~~~~
            })
            class Test {}
          `;
          const ruleFailures = assertAnnotated({
            message: FAILURE_STRING,
            ruleName,
            source
          });

          if (!Array.isArray(ruleFailures)) return;

          const replacement = Replacement.applyFixes(source, ruleFailures.map(ruleFailure => ruleFailure.getFix()!));
          const expectedSource = `
            @Component({
              selector: 'test',
              template: '{{ !foo }}'
                             ~~~~~
            })
            class Test {}
          `;

          expect(replacement).to.eq(expectedSource);
        });

        it('should fail if a nested property is accessed within interpolation', () => {
          const source = `
            @Component({
              selector: 'test',
              template: '{{ this.foo. this.    baz }}'
                            ~~~~~
            })
            class Test {}
          `;
          const ruleFailures = assertAnnotated({
            message: FAILURE_STRING,
            ruleName,
            source
          });

          if (!Array.isArray(ruleFailures)) return;

          const replacement = Replacement.applyFixes(source, ruleFailures.map(ruleFailure => ruleFailure.getFix()!));
          const expectedSource = `
            @Component({
              selector: 'test',
              template: '{{ foo. this.    baz }}'
                            ~~~~~
            })
            class Test {}
          `;

          expect(replacement).to.eq(expectedSource);
        });

        it('should fail if a property is accessed and passed to a pipe within interpolation', () => {
          const source = `
            @Component({
              selector: 'test',
              template: \`
                <div>
                  {{ this.  foo$ | async }}
                     ~~~~~
                </div>
              \`
            })
            class Test {}
          `;
          const ruleFailures = assertAnnotated({
            message: FAILURE_STRING,
            ruleName,
            source
          });

          if (!Array.isArray(ruleFailures)) return;

          const replacement = Replacement.applyFixes(source, ruleFailures.map(ruleFailure => ruleFailure.getFix()!));
          const expectedSource = `
            @Component({
              selector: 'test',
              template: \`
                <div>
                  {{   foo$ | async }}
                     ~~~~~
                </div>
              \`
            })
            class Test {}
          `;

          expect(replacement).to.eq(expectedSource);
        });

        it('should fail if a property is accessed and passed to a pipe chain within interpolation', () => {
          const source = `
            @Component({
              selector: 'test',
              template: \`
                <div>
                  {{ this.foo$ | async | json | custom }}
                     ~~~~~
                </div>
              \`
            })
            class Test {}
          `;
          const ruleFailures = assertAnnotated({
            message: FAILURE_STRING,
            ruleName,
            source
          });

          if (!Array.isArray(ruleFailures)) return;

          const replacement = Replacement.applyFixes(source, ruleFailures.map(ruleFailure => ruleFailure.getFix()!));
          const expectedSource = `
            @Component({
              selector: 'test',
              template: \`
                <div>
                  {{ foo$ | async | json | custom }}
                     ~~~~~
                </div>
              \`
            })
            class Test {}
          `;

          expect(replacement).to.eq(expectedSource);
        });

        it('should fail if a property is accessed and passed as an argument to a pipe within interpolation', () => {
          const source = `
            @Component({
              selector: 'test',
              template: \`
                <div>
                  {{ foo$ | custom: this.value }}
                                    ~~~~~
                </div>
              \`
            })
            class Test {}
          `;
          const ruleFailures = assertAnnotated({
            message: FAILURE_STRING,
            ruleName,
            source
          });

          if (!Array.isArray(ruleFailures)) return;

          const replacement = Replacement.applyFixes(source, ruleFailures.map(ruleFailure => ruleFailure.getFix()!));
          const expectedSource = `
            @Component({
              selector: 'test',
              template: \`
                <div>
                  {{ foo$ | custom: value }}
                                    ~~~~~
                </div>
              \`
            })
            class Test {}
          `;

          expect(replacement).to.eq(expectedSource);
        });

        it('should fail if a property is accessed and passed as an argument to a pipe chain within interpolation', () => {
          const source = `
            @Component({
              selector: 'test',
              template: \`
                <div>
                  {{ foo$ | async | json | custom: this.value }}
                                                   ~~~~~
                </div>
              \`
            })
            class Test {}
          `;
          const ruleFailures = assertAnnotated({
            message: FAILURE_STRING,
            ruleName,
            source
          });

          if (!Array.isArray(ruleFailures)) return;

          const replacement = Replacement.applyFixes(source, ruleFailures.map(ruleFailure => ruleFailure.getFix()!));
          const expectedSource = `
            @Component({
              selector: 'test',
              template: \`
                <div>
                  {{ foo$ | async | json | custom: value }}
                                                   ~~~~~
                </div>
              \`
            })
            class Test {}
          `;

          expect(replacement).to.eq(expectedSource);
        });

        it('should fail if a property is accessed and used in a conditional within interpolation', () => {
          const source = `
            @Component({
              selector: 'test',
              template: \`
                <div>
                  {{ this.foo ? bar : baz }}
                     ~~~~~
                </div>
              \`
            })
            class Test {}
          `;
          const ruleFailures = assertAnnotated({
            message: FAILURE_STRING,
            ruleName,
            source
          });

          if (!Array.isArray(ruleFailures)) return;

          const replacement = Replacement.applyFixes(source, ruleFailures.map(ruleFailure => ruleFailure.getFix()!));
          const expectedSource = `
            @Component({
              selector: 'test',
              template: \`
                <div>
                  {{ foo ? bar : baz }}
                     ~~~~~
                </div>
              \`
            })
            class Test {}
          `;

          expect(replacement).to.eq(expectedSource);
        });

        it('should fail if a property is accessed and used as a true expression of a conditional within interpolation', () => {
          const source = `
            @Component({
              selector: 'test',
              template: \`
                <div>
                  {{ bar ? this.foo : baz }}
                           ~~~~~
                </div>
              \`
            })
            class Test {}
          `;
          const ruleFailures = assertAnnotated({
            message: FAILURE_STRING,
            ruleName,
            source
          });

          if (!Array.isArray(ruleFailures)) return;

          const replacement = Replacement.applyFixes(source, ruleFailures.map(ruleFailure => ruleFailure.getFix()!));
          const expectedSource = `
            @Component({
              selector: 'test',
              template: \`
                <div>
                  {{ bar ? foo : baz }}
                           ~~~~~
                </div>
              \`
            })
            class Test {}
          `;

          expect(replacement).to.eq(expectedSource);
        });

        it('should fail if a property is accessed and used as a false expression of a conditional within interpolation', () => {
          const source = `
            @Component({
              selector: 'test',
              template: \`
                <div>
                  {{ foo ? bar : this.baz }}
                                 ~~~~~
                </div>
              \`
            })
            class Test {}
          `;
          const ruleFailures = assertAnnotated({
            message: FAILURE_STRING,
            ruleName,
            source
          });

          if (!Array.isArray(ruleFailures)) return;

          const replacement = Replacement.applyFixes(source, ruleFailures.map(ruleFailure => ruleFailure.getFix()!));
          const expectedSource = `
            @Component({
              selector: 'test',
              template: \`
                <div>
                  {{ foo ? bar : baz }}
                                 ~~~~~
                </div>
              \`
            })
            class Test {}
          `;

          expect(replacement).to.eq(expectedSource);
        });

        it('should fail if a nested property is accessed using elvis operator and used in a conditional within interpolation', () => {
          const source = `
            @Component({
              selector: 'test',
              template: \`
                <div>
                  Value {{ this?.a?.b['c']?.d ? 'Found' : 'Not found' }}
                           ~~~~~~
                </div>
              \`
            })
            class Test {}
          `;
          const ruleFailures = assertAnnotated({
            message: FAILURE_STRING,
            ruleName,
            source
          });

          if (!Array.isArray(ruleFailures)) return;

          const replacement = Replacement.applyFixes(source, ruleFailures.map(ruleFailure => ruleFailure.getFix()!));
          const expectedSource = `
            @Component({
              selector: 'test',
              template: \`
                <div>
                  Value {{ a?.b['c']?.d ? 'Found' : 'Not found' }}
                           ~~~~~~
                </div>
              \`
            })
            class Test {}
          `;

          expect(replacement).to.eq(expectedSource);
        });

        it.only('should fail if a property is accessed using non-null assertion and used in a conditional within interpolation', () => {
          const source = `
            @Component({
              selector: 'test',
              template: \`
                <div>
                  Value {{ this!.a!.b!.c!.d ? 'Found' : 'Not found' }}
                           ~~~~~~
                </div>
              \`
            })
            class Test {}
          `;
          const ruleFailures = assertAnnotated({
            message: FAILURE_STRING,
            ruleName,
            source
          });

          if (!Array.isArray(ruleFailures)) return;

          const replacement = Replacement.applyFixes(source, ruleFailures.map(ruleFailure => ruleFailure.getFix()!));
          const expectedSource = `
            @Component({
              selector: 'test',
              template: \`
                <div>
                  Value {{ a!.b!.c!.d ? 'Found' : 'Not found' }}
                           ~~~~~~
                </div>
              \`
            })
            class Test {}
          `;

          expect(replacement).to.eq(expectedSource);
        });
      });

      describe('method', () => {
        it('should fail if a method is accessed within interpolation', () => {
          const source = `
            @Component({
              selector: 'test',
              template: '{{ this.foo }}'
                            ~~~~~
            })
            class Test {}
          `;
          const ruleFailures = assertAnnotated({
            message: FAILURE_STRING,
            ruleName,
            source
          });

          if (!Array.isArray(ruleFailures)) return;

          const replacement = Replacement.applyFixes(source, ruleFailures.map(ruleFailure => ruleFailure.getFix()!));
          const expectedSource = `
            @Component({
              selector: 'test',
              template: '{{ foo }}'
                            ~~~~~
            })
            class Test {}
          `;

          expect(replacement).to.eq(expectedSource);
        });

        it('should fail if a method is accessed and negated within interpolation', () => {
          const source = `
            @Component({
              selector: 'test',
              template: '{{ !this.foo() }}'
                             ~~~~~
            })
            class Test {}
          `;
          const ruleFailures = assertAnnotated({
            message: FAILURE_STRING,
            ruleName,
            source
          });

          if (!Array.isArray(ruleFailures)) return;

          const replacement = Replacement.applyFixes(source, ruleFailures.map(ruleFailure => ruleFailure.getFix()!));
          const expectedSource = `
            @Component({
              selector: 'test',
              template: '{{ !foo() }}'
                             ~~~~~
            })
            class Test {}
          `;

          expect(replacement).to.eq(expectedSource);
        });

        it('should fail if a nested method is accessed within interpolation', () => {
          const source = `
            @Component({
              selector: 'test',
              template: '{{ this.foo(). this.    baz() }}'
                            ~~~~~
            })
            class Test {}
          `;
          const ruleFailures = assertAnnotated({
            message: FAILURE_STRING,
            ruleName,
            source
          });

          if (!Array.isArray(ruleFailures)) return;

          const replacement = Replacement.applyFixes(source, ruleFailures.map(ruleFailure => ruleFailure.getFix()!));
          const expectedSource = `
            @Component({
              selector: 'test',
              template: '{{ foo(). this.    baz() }}'
                            ~~~~~
            })
            class Test {}
          `;

          expect(replacement).to.eq(expectedSource);
        });

        it('should fail if a method is accessed and passed to a pipe within interpolation', () => {
          const source = `
            @Component({
              selector: 'test',
              template: \`
                <div>
                  {{ this.  foo$() | async }}
                     ~~~~~
                </div>
              \`
            })
            class Test {}
          `;
          const ruleFailures = assertAnnotated({
            message: FAILURE_STRING,
            ruleName,
            source
          });

          if (!Array.isArray(ruleFailures)) return;

          const replacement = Replacement.applyFixes(source, ruleFailures.map(ruleFailure => ruleFailure.getFix()!));
          const expectedSource = `
            @Component({
              selector: 'test',
              template: \`
                <div>
                  {{   foo$() | async }}
                     ~~~~~
                </div>
              \`
            })
            class Test {}
          `;

          expect(replacement).to.eq(expectedSource);
        });

        it('should fail if a method is accessed and passed to a pipe chain within interpolation', () => {
          const source = `
            @Component({
              selector: 'test',
              template: \`
                <div>
                  {{ this.foo$() | async | json | custom }}
                     ~~~~~
                </div>
              \`
            })
            class Test {}
          `;
          const ruleFailures = assertAnnotated({
            message: FAILURE_STRING,
            ruleName,
            source
          });

          if (!Array.isArray(ruleFailures)) return;

          const replacement = Replacement.applyFixes(source, ruleFailures.map(ruleFailure => ruleFailure.getFix()!));
          const expectedSource = `
            @Component({
              selector: 'test',
              template: \`
                <div>
                  {{ foo$() | async | json | custom }}
                     ~~~~~
                </div>
              \`
            })
            class Test {}
          `;

          expect(replacement).to.eq(expectedSource);
        });

        it('should fail if a method is accessed and passed as an argument to a pipe within interpolation', () => {
          const source = `
            @Component({
              selector: 'test',
              template: \`
                <div>
                  {{ foo$() | custom: this.value }}
                                      ~~~~~
                </div>
              \`
            })
            class Test {}
          `;
          const ruleFailures = assertAnnotated({
            message: FAILURE_STRING,
            ruleName,
            source
          });

          if (!Array.isArray(ruleFailures)) return;

          const replacement = Replacement.applyFixes(source, ruleFailures.map(ruleFailure => ruleFailure.getFix()!));
          const expectedSource = `
            @Component({
              selector: 'test',
              template: \`
                <div>
                  {{ foo$() | custom: value }}
                                      ~~~~~
                </div>
              \`
            })
            class Test {}
          `;

          expect(replacement).to.eq(expectedSource);
        });

        it('should fail if a method is accessed and passed as an argument to a pipe chain within interpolation', () => {
          const source = `
            @Component({
              selector: 'test',
              template: \`
                <div>
                  {{ foo$() | async | json | custom: this.value }}
                                                     ~~~~~
                </div>
              \`
            })
            class Test {}
          `;
          const ruleFailures = assertAnnotated({
            message: FAILURE_STRING,
            ruleName,
            source
          });

          if (!Array.isArray(ruleFailures)) return;

          const replacement = Replacement.applyFixes(source, ruleFailures.map(ruleFailure => ruleFailure.getFix()!));
          const expectedSource = `
            @Component({
              selector: 'test',
              template: \`
                <div>
                  {{ foo$() | async | json | custom: value }}
                                                     ~~~~~
                </div>
              \`
            })
            class Test {}
          `;

          expect(replacement).to.eq(expectedSource);
        });

        it('should fail if a method is accessed and used in a conditional within interpolation', () => {
          const source = `
            @Component({
              selector: 'test',
              template: \`
                <div>
                  {{ this.foo() ? bar : baz }}
                     ~~~~~
                </div>
              \`
            })
            class Test {}
          `;
          const ruleFailures = assertAnnotated({
            message: FAILURE_STRING,
            ruleName,
            source
          });

          if (!Array.isArray(ruleFailures)) return;

          const replacement = Replacement.applyFixes(source, ruleFailures.map(ruleFailure => ruleFailure.getFix()!));
          const expectedSource = `
            @Component({
              selector: 'test',
              template: \`
                <div>
                  {{ foo() ? bar : baz }}
                     ~~~~~
                </div>
              \`
            })
            class Test {}
          `;

          expect(replacement).to.eq(expectedSource);
        });

        it('should fail if a method is accessed and used as a true expression of a conditional within interpolation', () => {
          const source = `
            @Component({
              selector: 'test',
              template: \`
                <div>
                  {{ bar ? this.foo() : baz }}
                           ~~~~~
                </div>
              \`
            })
            class Test {}
          `;
          const ruleFailures = assertAnnotated({
            message: FAILURE_STRING,
            ruleName,
            source
          });

          if (!Array.isArray(ruleFailures)) return;

          const replacement = Replacement.applyFixes(source, ruleFailures.map(ruleFailure => ruleFailure.getFix()!));
          const expectedSource = `
            @Component({
              selector: 'test',
              template: \`
                <div>
                  {{ bar ? foo() : baz }}
                           ~~~~~
                </div>
              \`
            })
            class Test {}
          `;

          expect(replacement).to.eq(expectedSource);
        });

        it('should fail if a method is accessed and used as a false expression of a conditional within interpolation', () => {
          const source = `
            @Component({
              selector: 'test',
              template: \`
                <div>
                  {{ foo ? bar : this.baz() }}
                                 ~~~~~
                </div>
              \`
            })
            class Test {}
          `;
          const ruleFailures = assertAnnotated({
            message: FAILURE_STRING,
            ruleName,
            source
          });

          if (!Array.isArray(ruleFailures)) return;

          const replacement = Replacement.applyFixes(source, ruleFailures.map(ruleFailure => ruleFailure.getFix()!));
          const expectedSource = `
            @Component({
              selector: 'test',
              template: \`
                <div>
                  {{ foo ? bar : baz() }}
                                 ~~~~~
                </div>
              \`
            })
            class Test {}
          `;

          expect(replacement).to.eq(expectedSource);
        });

        it('should fail if a nested method is accessed using elvis operator and used in a conditional within interpolation', () => {
          const source = `
            @Component({
              selector: 'test',
              template: \`
                <div>
                  Value {{ this?.a?().b['c']()?.d ? 'Found' : 'Not found' }}
                           ~~~~~~
                </div>
              \`
            })
            class Test {}
          `;
          const ruleFailures = assertAnnotated({
            message: FAILURE_STRING,
            ruleName,
            source
          });

          if (!Array.isArray(ruleFailures)) return;

          const replacement = Replacement.applyFixes(source, ruleFailures.map(ruleFailure => ruleFailure.getFix()!));
          const expectedSource = `
            @Component({
              selector: 'test',
              template: \`
                <div>
                  Value {{ a?().b['c']()?.d ? 'Found' : 'Not found' }}
                           ~~~~~~
                </div>
              \`
            })
            class Test {}
          `;

          expect(replacement).to.eq(expectedSource);
        });

        it('should fail if a method is accessed using non-null assertion and used in a conditional within interpolation', () => {
          const source = `
            @Component({
              selector: 'test',
              template: \`
                <div>
                  Value {{ this!.a()!.b()!.c!.d() ? 'Found' : 'Not found' }}
                           ~~~~~~
                </div>
              \`
            })
            class Test {}
          `;
          const ruleFailures = assertAnnotated({
            message: FAILURE_STRING,
            ruleName,
            source
          });

          if (!Array.isArray(ruleFailures)) return;

          const replacement = Replacement.applyFixes(source, ruleFailures.map(ruleFailure => ruleFailure.getFix()!));
          const expectedSource = `
            @Component({
              selector: 'test',
              template: \`
                <div>
                  Value {{ a()!.b()!.c!.d() ? 'Found' : 'Not found' }}
                           ~~~~~~
                </div>
              \`
            })
            class Test {}
          `;

          expect(replacement).to.eq(expectedSource);
        });
      });
    });

    describe('directive property', () => {
      it('should fail if a variable is accessed within *ngFor directive', () => {
        const source = `
          @Component({
            selector: 'test',
            template: \`
              <div *ngFor="let item of this.items">
                                       ~~~~~
              </div>
            \`
          })
          class Test {}
        `;
        const ruleFailures = assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });

        if (!Array.isArray(ruleFailures)) return;

        const replacement = Replacement.applyFixes(source, ruleFailures.map(ruleFailure => ruleFailure.getFix()!));
        const expectedSource = `
          @Component({
            selector: 'test',
            template: \`
              <div *ngFor="let item of items">
                                       ~~~~~
              </div>
            \`
          })
          class Test {}
        `;

        expect(replacement).to.eq(expectedSource);
      });

      it('should fail if a variable is accessed within [ngFor] directive', () => {
        const source = `
          @Component({
            selector: 'test',
            template: \`
              <ng-template ngFor let-item [ngForOf]="this.items" let-i="index" [ngForTrackBy]="trackByFn">
                                                     ~~~~~
                {{ item }}
              </ng-template>
            \`
          })
          class Test {}
        `;
        const ruleFailures = assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });

        if (!Array.isArray(ruleFailures)) return;

        const replacement = Replacement.applyFixes(source, ruleFailures.map(ruleFailure => ruleFailure.getFix()!));
        const expectedSource = `
          @Component({
            selector: 'test',
            template: \`
              <ng-template ngFor let-item [ngForOf]="items" let-i="index" [ngForTrackBy]="trackByFn">
                                                     ~~~~~
                {{ item }}
              </ng-template>
            \`
          })
          class Test {}
        `;

        expect(replacement).to.eq(expectedSource);
      });

      it('should fail if a variable is accessed within *ngIf directive', () => {
        const source = `
          @Component({
            selector: 'test',
            template: \`
              <div *ngIf="this.canShowMainDiv()">
                          ~~~~~
              </div>
            \`
          })
          class Test {}
        `;
        const ruleFailures = assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });

        if (!Array.isArray(ruleFailures)) return;

        const replacement = Replacement.applyFixes(source, ruleFailures.map(ruleFailure => ruleFailure.getFix()!));
        const expectedSource = `
          @Component({
            selector: 'test',
            template: \`
              <div *ngIf="canShowMainDiv()">
                          ~~~~~
              </div>
            \`
          })
          class Test {}
        `;

        expect(replacement).to.eq(expectedSource);
      });

      it('should fail if a variable is accessed within [ngIf] directive', () => {
        const source = `
          @Component({
            selector: 'test',
            template: \`
              <ng-template [ngIf]="this.canShowMainDiv()">
                                   ~~~~~
              </ng-template>
            \`
          })
          class Test {}
        `;
        const ruleFailures = assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });

        if (!Array.isArray(ruleFailures)) return;

        const replacement = Replacement.applyFixes(source, ruleFailures.map(ruleFailure => ruleFailure.getFix()!));
        const expectedSource = `
          @Component({
            selector: 'test',
            template: \`
              <ng-template [ngIf]="canShowMainDiv()">
                                   ~~~~~
              </ng-template>
            \`
          })
          class Test {}
        `;

        expect(replacement).to.eq(expectedSource);
      });

      it('should fail if a variable is accessed within [ngSwitch] directive', () => {
        const source = `
          @Component({
            selector: 'test',
            template: \`
              <div [ngSwitch]="this.foo"
                               ~~~~~
                <span *ngSwitchCase="1">
                  1
                </div>
                <span *ngSwitchCase="2">
                  2
                </div>
              </div>
            \`
          })
          class Test {}
        `;
        const ruleFailures = assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });

        if (!Array.isArray(ruleFailures)) return;

        const replacement = Replacement.applyFixes(source, ruleFailures.map(ruleFailure => ruleFailure.getFix()!));
        const expectedSource = `
          @Component({
            selector: 'test',
            template: \`
              <div [ngSwitch]="foo"
                               ~~~~~
                <span *ngSwitchCase="1">
                  1
                </div>
                <span *ngSwitchCase="2">
                  2
                </div>
              </div>
            \`
          })
          class Test {}
        `;

        expect(replacement).to.eq(expectedSource);
      });

      it('should fail if a variable is accessed within *ngSwitchCase directive', () => {
        const source = `
          @Component({
            selector: 'test',
            template: \`
              <div [ngSwitch]="value"
                <span *ngSwitchCase="this.foo">
                                     ~~~~~
                  1
                </div>
                <span *ngSwitchCase="2">
                  2
                </div>
              </div>
            \`
          })
          class Test {}
        `;
        const ruleFailures = assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });

        if (!Array.isArray(ruleFailures)) return;

        const replacement = Replacement.applyFixes(source, ruleFailures.map(ruleFailure => ruleFailure.getFix()!));
        const expectedSource = `
          @Component({
            selector: 'test',
            template: \`
              <div [ngSwitch]="value"
                <span *ngSwitchCase="foo">
                                     ~~~~~
                  1
                </div>
                <span *ngSwitchCase="2">
                  2
                </div>
              </div>
            \`
          })
          class Test {}
        `;

        expect(replacement).to.eq(expectedSource);
      });
    });

    describe('element property', () => {
      it('should fail if a variable is accessed within interpolation in element property', () => {
        const source = `
          @Component({
            selector: 'test',
            template: \`
              <a href="{{ this.url }}">Go to Google!</a>
                          ~~~~~
            \`
          })
          class Test {}
        `;
        const ruleFailures = assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });

        if (!Array.isArray(ruleFailures)) return;

        const replacement = Replacement.applyFixes(source, ruleFailures.map(ruleFailure => ruleFailure.getFix()!));
        const expectedSource = `
          @Component({
            selector: 'test',
            template: \`
              <a href="{{ url }}">Go to Google!</a>
                          ~~~~~
            \`
          })
          class Test {}
        `;

        expect(replacement).to.eq(expectedSource);
      });

      it('should fail if a variable is accessed within canonical form', () => {
        const source = `
          @Component({
            selector: 'test',
            template: \`
              <a bind-href="this.url">Go to Google!</a>
                            ~~~~~
            \`
          })
          class Test {}
        `;
        const ruleFailures = assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });

        if (!Array.isArray(ruleFailures)) return;

        const replacement = Replacement.applyFixes(source, ruleFailures.map(ruleFailure => ruleFailure.getFix()!));
        const expectedSource = `
          @Component({
            selector: 'test',
            template: \`
              <a bind-href="url">Go to Google!</a>
                            ~~~~~
            \`
          })
          class Test {}
        `;

        expect(replacement).to.eq(expectedSource);
      });

      it('should fail if a variable is accessed within property binding', () => {
        const source = `
          @Component({
            selector: 'test',
            template: \`
              <a [href]="this.url">Go to Google!</a>
                         ~~~~~
            \`
          })
          class Test {}
        `;
        const ruleFailures = assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });

        if (!Array.isArray(ruleFailures)) return;

        const replacement = Replacement.applyFixes(source, ruleFailures.map(ruleFailure => ruleFailure.getFix()!));
        const expectedSource = `
          @Component({
            selector: 'test',
            template: \`
              <a [href]="url">Go to Google!</a>
                         ~~~~~
            \`
          })
          class Test {}
        `;

        expect(replacement).to.eq(expectedSource);
      });

      it('should fail if a variable is accessed within property binding for animation expression', () => {
        const source = `
          @Component({
            selector: 'test',
            template: \`
              <div [@.disabled]="disabled">
                <div [@childAnimation]="this.exp"></div>
                                        ~~~~~
              </div>
            \`
          })
          class Test {}
        `;
        const ruleFailures = assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });

        if (!Array.isArray(ruleFailures)) return;

        const replacement = Replacement.applyFixes(source, ruleFailures.map(ruleFailure => ruleFailure.getFix()!));
        const expectedSource = `
          @Component({
            selector: 'test',
            template: \`
              <div [@.disabled]="disabled">
                <div [@childAnimation]="exp"></div>
                                        ~~~~~
              </div>
            \`
          })
          class Test {}
        `;

        expect(replacement).to.eq(expectedSource);
      });
    });

    describe('event', () => {
      it('should fail if a property is accessed within output', () => {
        const source = `
          @Component({
            selector: 'test',
            template: \`
              <input [ngModel]="value" (ngModelChange)="this.value =      $event.target.value">
                                                        ~~~~~
            \`
          })
          class Test {}
        `;
        const ruleFailures = assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });

        if (!Array.isArray(ruleFailures)) return;

        const replacement = Replacement.applyFixes(source, ruleFailures.map(ruleFailure => ruleFailure.getFix()!));
        const expectedSource = `
          @Component({
            selector: 'test',
            template: \`
              <input [ngModel]="value" (ngModelChange)="value =      $event.target.value">
                                                        ~~~~~
            \`
          })
          class Test {}
        `;

        expect(replacement).to.eq(expectedSource);
      });

      it('should fail if a property is accessed within output (using on-*)', () => {
        const source = `
          @Component({
            selector: 'test',
            template: \`
              <input [ngModel]="value" on-ngModelChange="this.      value = $event.target.value">
                                                         ~~~~~
            \`
          })
          class Test {}
        `;
        const ruleFailures = assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });

        if (!Array.isArray(ruleFailures)) return;

        const replacement = Replacement.applyFixes(source, ruleFailures.map(ruleFailure => ruleFailure.getFix()!));
        const expectedSource = `
          @Component({
            selector: 'test',
            template: \`
              <input [ngModel]="value" on-ngModelChange="      value = $event.target.value">
                                                         ~~~~~
            \`
          })
          class Test {}
        `;

        expect(replacement).to.eq(expectedSource);
      });

      it('should fail if a property is accessed within two-way data binding', () => {
        const source = `
          @Component({
            selector: 'test',
            template: \`
              <input [(ngModel)]="this.value    ">
                                  ~~~~~
            \`
          })
          class Test {}
        `;
        const ruleFailures = assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });

        if (!Array.isArray(ruleFailures)) return;

        const replacement = Replacement.applyFixes(source, ruleFailures.map(ruleFailure => ruleFailure.getFix()!));
        const expectedSource = `
          @Component({
            selector: 'test',
            template: \`
              <input [(ngModel)]="value    ">
                                  ~~~~~
            \`
          })
          class Test {}
        `;

        expect(replacement).to.eq(expectedSource);
      });

      it('should fail if a property is accessed within two-way data binding (using bindon-*)', () => {
        const source = `
          @Component({
            selector: 'test',
            template: \`
              <input bindon-ngModel="    this.value">
                                         ~~~~~
            \`
          })
          class Test {}
        `;
        const ruleFailures = assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });

        if (!Array.isArray(ruleFailures)) return;

        const replacement = Replacement.applyFixes(source, ruleFailures.map(ruleFailure => ruleFailure.getFix()!));
        const expectedSource = `
          @Component({
            selector: 'test',
            template: \`
              <input bindon-ngModel="    value">
                                         ~~~~~
            \`
          })
          class Test {}
        `;

        expect(replacement).to.eq(expectedSource);
      });
    });
  });

  describe('success', () => {
    it('should succed if a property called "this" is accessed within interpolation', () => {
      const source = `
        @Component({
          selector: 'test',
          template: '{{ foo.this }}'
        })
        class Test {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should succed if a indexed property called "this" is accessed within interpolation', () => {
      const source = `
        @Component({
          selector: 'test',
          template: '{{ foo['this'] }}'
        })
        class Test {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should succed if a indexed property is accessed within interpolation', () => {
      const source = `
        @Component({
          selector: 'test',
          template: '{{ this['foo'] }}'
        })
        class Test {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed if a dynamic indexed property is accessed within interpolation', () => {
      const source = `
        @Component({
          selector: 'test',
          template: '{{ this[foo] }}'
        })
        class Test {}
      `;
      assertSuccess(ruleName, source);
    });
  });
});
