import { expect } from 'chai';
import { renderSync } from 'node-sass';
import { Config } from '../src/angular/config';
import { Rule } from '../src/noUnusedCssRule';
import { assertAnnotated, assertFailure, assertSuccess } from './testHelper';

const {
  FAILURE_STRING,
  metadata: { ruleName }
} = Rule;

describe.only(ruleName, () => {
  describe('failures', () => {
    describe('to-rename', () => {
      it("should fail when having a complex selector that doesn't match anything", () => {
        const source = `
          @Component({
            selector: 'foobar',
            styles: [
              \`
                div h2 {
                ~~~~~~~~
                  color: red;
                }
                ~
              \`
            ],
            template: \`
              <div>
                <section>
                  <span><h1>{{ foo }}</h1></span>
                </section>
              </div>
            \`
          })
          class TestComponent {
            test: boolean;
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });
      });

      it('should fail with multiple styles', () => {
        const source = `
          @Component({
            selector: 'foobar',
            styles: [
              \`
                div h2 {
                  color: red;
                }
              \`,
              \`
                h1 {
                ~~~~
                  color: black;
                }
                ~
              \`
            ],
            template: \`
              <div>
                <section>
                  <span><h2>{{ foo }}</h2></span>
                </section>
              </div>
            \`
          })
          class TestComponent {
            test: boolean;
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });
      });

      it('should fail when dynamic selector of not the proper type is used', () => {
        const source = `
          @Component({
            selector: 'foobar',
            styles: [
              \`
                div section.bar h2 {
                ~~~~~~~~~~~~~~~~~~~~
                  color: red;
                }
                ~
              \`
            ],
            template: \`
              <div>
                <section class="bar">
                  <span><h1 [attr.id]="test">{{ foo }}</h1></span>
                </section>
              </div>
            \`
          })
          class TestComponent {
            test: boolean;
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });
      });

      it('should fail for structural directives when selector does not match', () => {
        const source = `
          @Component({
            selector: 'foobar'
            styles: [
              \`
                div h1#header {
                ~~~~~~~~~~~~~~~
                  color: red;
                }
                ~
              \`
            ],
            template: \`
              <div>
                <section>
                  <span><h1 *ngIf="true">{{ foo }}</h1></span>
                </section>
              </div>
            \`,
          })
          class TestComponent {
            test: boolean;
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });
      });

      it('should fail when having valid complex selector', () => {
        const source = `
          @Component({
            selector: 'foobar',
            styles: [
              \`
                div h1.header {
                ~~~~~~~~~~~~~~~
                  color: red;
                }
                ~
              \`
            ],
            template: \`
              <div>
                <section>
                  <span><h1 [class.head]="test">{{ foo }}</h1></span>
                </section>
              </div>
            \`
          })
          class TestComponent {
            test: boolean;
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });
      });
    });

    describe('deep', () => {
      it('should match before reaching deep', () => {
        const source = `
          @Component({
            selector: 'foobar',
            styles: [
              \`
                div section /deep/ h2 {
                ~~~~~~~~~~~~~~~~~~~~~~~
                  color: red;
                }
                ~
              \`
            ],
            template: \`
              <div>
                <content>
                  <span><h1 [class.header]="test">{{ foo }}</h1></span>
                </content>
              </div>
            \`
          })
          class TestComponent {
            test: boolean;
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });
      });
    });

    describe('pseudo classes', () => {
      it('should fail when not matched selectors after :host', () => {
        const source = `
          @Component({
            selector: 'foobar',
            styles: [
              \`
                :host section h2 {
                ~~~~~~~~~~~~~~~~~~
                  color: red;
                }
                ~
              \`
            ],
            template: \`
              <div>
                <section>
                  <span><h1 [class.header]="test">{{ foo }}</h1></span>
                </section>
              </div>
            \`
          })
          class TestComponent {
            test: boolean;
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });
      });
    });

    describe('pseudo elements', () => {
      it('should succeed if after is used', () => {
        const source = `
          @Component({
            selector: 'foobar',
            styles: [
              \`
                div content::after {
                ~
                  color: red;
                }
                ~
              \`
            ],
            template: \`
              <div>
                <section>
                  <span><h1 [class.header]="test">{{ foo }}</h1></span>
                </section>
              </div>
            \`
          })
          class TestComponent {
            test: boolean;
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });
      });

      it('should succeed if before is used', () => {
        const source = `
          @Component({
            selector: 'foobar',
            styles: [
              \`
                div content::before {
                ~
                  color: red;
                }
                ~
              \`
            ],
            template: \`
              <div>
                <section>
                  <span><h1 [class.header]="test">{{ foo }}</h1></span>
                </section>
              </div>
            \`
          })
          class TestComponent {
            test: boolean;
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });
      });

      it('should succeed if first-letter is used', () => {
        const source = `
          @Component({
            selector: 'foobar',
            styles: [
              \`
                div content::first-letter {
                ~
                  color: red;
                }
                ~
              \`
            ],
            template: \`
              <div>
                <section>
                  <span><h1 [class.header]="test">{{ foo }}</h1></span>
                </section>
              </div>
            \`
          })
          class TestComponent {
            test: boolean;
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });
      });

      it('should succeed if first-line is used', () => {
        const source = `
          @Component({
            selector: 'foobar',
            styles: [
              \`
                div content::first-line {
                ~
                  color: red;
                }
                ~
              \`
            ],
            template: \`
              <div>
                <section>
                  <span><h1 [class.header]="test">{{ foo }}</h1></span>
                </section>
              </div>
            \`
          })
          class TestComponent {
            test: boolean;
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });
      });

      it('should succeed if selection is used', () => {
        const source = `
          @Component({
            selector: 'foobar',
            styles: [
              \`
                div content::selection {
                ~
                  color: red;
                }
                ~
              \`
            ],
            template: \`
              <div>
                <section>
                  <span><h1 [class.header]="test">{{ foo }}</h1></span>
                </section>
              </div>
            \`
          })
          class TestComponent {
            test: boolean;
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });
      });
    });

    describe('ViewEncapsulation', () => {
      it('should ignore before and after', () => {
        const source = `
          @Component({
            encapsulation: ViewEncapsulation.Native,
            selector: 'foobar',
            styles: [
              \`
                p {
                ~~~
                  color: red;
                }
                ~
              \`
            ],
            template: '<div></div>'
          })
          class TestComponent {}
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });
      });

      it('should ignore before and after', () => {
        const source = `
          @Component({
            encapsulation: ViewEncapsulation.Emulated,
            selector: 'foobar',
            styles: [
              \`
                p {
                ~~~
                  color: red;
                }
                ~
              \`
            ],
            template: '<div></div>'
          })
          class TestComponent {}
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });
      });

      it('should ignore before and after', () => {
        const source = `
          @Component({
            encapsulation: prefix.foo.ViewEncapsulation.Emulated,
            selector: 'foobar',
            styles: [
              \`
                p {
                ~~~
                  color: red;
                }
                ~
              \`
            ],
            template: '<div></div>'
          })
          class TestComponent {}
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });
      });
    });

    describe('sass', () => {
      it('should succeed with sass', () => {
        Config.transformStyle = source => {
          const result = renderSync({
            data: source,
            sourceMap: true,
            sourceMapEmbed: true
          });
          const code = result.css.toString();
          const base64Map = code.match(/\/\*(.*?)\*\//)![1].replace('# sourceMappingURL=data:application/json;base64,', '');
          const map = JSON.parse(Buffer.from(base64Map, 'base64').toString('ascii'));
          return { code, source, map };
        };

        const source = `
          @Component({
            selector: 'hero-cmp',
            styles: [
              \`
                h1 {
               ~~~~~~
                  spam {
                    baz {
                      color: red;
                    }
                   ~
                  }
                }
              \`
            ],
            template: '<h1>Hello <span>{{ hero.name }}</span></h1>'
          })
          class HeroComponent {
            private hero: Hero;
          }
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });
        Config.transformStyle = code => ({ code });
      });
    });
  });

  describe('autofixes', () => {
    it('should succeed with regular CSS', () => {
      const source = `
        @Component({
          encapsulation: prefix.foo.ViewEncapsulation.Emulated,
          selector: 'foobar',
          styles: [
            \`
              p {
                color: red;
              }
            \`
          ],
          template: '<div></div>'
        })
        class TestComponent {}
      `;
      const failures = assertFailure(
        'no-unused-css',
        source,
        {
          endPosition: {
            character: 15,
            line: 8
          },
          message: FAILURE_STRING,
          startPosition: {
            character: 14,
            line: 6
          }
        },
        null
      );
      const replacement = failures[0].getFix();

      if (!replacement || Array.isArray(replacement)) return;

      expect(replacement.text).to.eq('');
      expect(replacement.start).to.eq(14);
      expect(replacement.end).to.eq(62);
    });

    it('should succeed with SASS', () => {
      Config.transformStyle = source => {
        const result = renderSync({
          data: source,
          sourceMap: true,
          sourceMapEmbed: true
        });
        const code = result.css.toString();
        const base64Map = code.match(/\/\*(.*?)\*\//)![1].replace('# sourceMappingURL=data:application/json;base64,', '');
        const map = JSON.parse(Buffer.from(base64Map, 'base64').toString('ascii'));
        return { code, source, map };
      };

      const source = `
        @Component({
          selector: 'hero-cmp',
          styles: [
            \`
              h1 {
                spam {
                  baz {
                    color: red;
                  }
                }
              }
            \`
          ],
          template: '<h1>Hello <span>{{ hero.name }}</span></h1>'
        })
        class HeroComponent {
          private hero: Hero;
        }
      `;
      const failures = assertFailure(ruleName, source, {
        endPosition: {
          character: 18,
          line: 9
        },
        message: FAILURE_STRING,
        startPosition: {
          character: 13,
          line: 5
        }
      });
      const replacement = failures[0].getFix();

      Config.transformStyle = code => ({ code });

      if (!replacement || Array.isArray(replacement)) return;

      expect(replacement.text).to.eq('');
      expect(replacement.start).to.eq(-1);
      expect(replacement.end).to.eq(29);
    });
  });

  describe('success', () => {
    it('should succeed when having valid simple selector', () => {
      const source = `
        @Component({
          selector: 'foobar',
          styles: [
            \`
              div {
                color: red;
              }
            \`
          ],
          template: '<div bar="{{baz}}" [ngClass]="expr">{{ foo }}</div>'
        })
        class TestComponent {
          test: boolean;
        }
      `;
      assertSuccess(ruleName, source);
    });

    describe('complex selectors', () => {
      it('should succeed when having valid complex selector', () => {
        const source = `
          @Component({
            selector: 'foobar',
            styles: [
              \`
                div h1 {
                  color: red;
                }
              \`
            ],
            template: \`
              <div>
                <section>
                  <span><h1>{{ foo }}</h1></span>
                </section>
              </div>
            \`
          })
          class TestComponent {
            test: boolean;
          }
        `;
        assertSuccess(ruleName, source);
      });

      it('should succeed when having valid complex selector', () => {
        const source = `
          @Component({
            selector: 'foobar',
            styles: [
              \`
                div.bar {
                  color: red;
                }
              \`
            ],
            template: '<div [class.bar]="test"></div>'
          })
          class TestComponent {
            test: boolean;
          }
        `;
        assertSuccess(ruleName, source);
      });

      it('should succeed when having valid complex selector', () => {
        const source = `
          @Component({
            selector: 'foobar',
            styles: [
              \`
                div h1#header {
                  color: red;
                }
              \`
            ],
            template: \`
              <div>
                <section>
                  <span><h1 id="header">{{ foo }}</h1></span>
                </section>
              </div>
            \`
          })
          class TestComponent {
            test: boolean;
          }
        `;
        assertSuccess(ruleName, source);
      });

      it('should succeed for structural directives when selector matches', () => {
        const source = `
          @Component({
            selector: 'foobar',
            styles: [
              \`
                div h1 {
                  color: red;
                }
              \`
            ],
            template: \`
              <div>
                <section>
                  <span><h1>{{ foo }}</h1></span>
                </section>
              </div>
            \`
          })
          class TestComponent {
            test: boolean;
          }
        `;
        assertSuccess(ruleName, source);
      });

      describe('multiple styles', () => {
        it('should succeed when having valid complex selector', () => {
          const source = `
            @Component({
              selector: 'foobar',
              styles: [
                \`
                  div h1#header {
                    color: red;
                  }
                \`,
                \`
                  #header {
                    font-size: 10px;
                  }
                \`
              ],
              template: \`
                <div>
                  <section>
                    <span><h1 id="header">{{ foo }}</h1></span>
                  </section>
                </div>
              \`
            })
            class TestComponent {
              test: boolean;
            }
          `;
          assertSuccess(ruleName, source);
        });
      });
    });

    describe('class setter', () => {
      it('should succeed when having valid complex selector', () => {
        const source = `
          @Component({
            selector: 'foobar',
            styles: [
              \`
                div h1.header {
                  color: red;
                }
              \`
            ],
            template: \`
              <div>
                <section>
                  <span><h1 [class.header]="test">{{ foo }}</h1></span>
                </section>
              </div>
            \`
          })
          class TestComponent {
            test: boolean;
          }
        `;
        assertSuccess(ruleName, source);
      });
    });

    describe('dynamic classes', () => {
      it('should skip components with dynamically set classes', () => {
        const source = `
          @Component({
            selector: 'foobar',
            styles: [
              \`
                div h1#header {
                  color: red;
                }
              \`
            ],
            template: \`
              <div>
                <section class="bar {{baz}}">
                  <span><h1 [attr.id]="invalid">{{ foo }}</h1></span>
                </section>
              </div>
            \`
          })
          class TestComponent {
            test: boolean;
          }
        `;
        assertSuccess(ruleName, source);
      });

      it('should skip components with dynamically set classes', () => {
        const source = `
          @Component({
            selector: 'foobar',
            styles: [
              \`
                div h1#header {
                  color: red;
                }
              \`
            ],
            template: \`
              <div>
                <section [ngClass]="{ 'bar': true }">
                  <span><h1 id="{{invalid}}">{{ foo }}</h1></span>
                </section>
              </div>
            \`
          })
          class TestComponent {
            test: boolean;
          }
        `;
        assertSuccess(ruleName, source);
      });
    });

    describe('deep and >>>', () => {
      it('should ignore deep and match only before it', () => {
        const source = `
          @Component({
            selector: 'foobar',
            styles: [
              \`
                div section /deep/ h2 {
                  color: red;
                }
              \`
            ],
            template: \`
              <div>
                <section>
                  <span><h1 [class.header]="test">{{ foo }}</h1></span>
                </section>
              </div>
            \`
          })
          class TestComponent {
            test: boolean;
          }
        `;
        assertSuccess(ruleName, source);
      });

      it('should ignore deep and match only before it', () => {
        const source = `
          @Component({
            selector: 'foobar',
            styles: [
              \`
                div section >>> h2 {
                  color: red;
                }
              \`
            ],
            template: \`
              <div>
                <section>
                  <span><h1 [class.header]="test">{{ foo }}</h1></span>
                </section>
              </div>
            \`
          })
          class TestComponent {
            test: boolean;
          }
        `;
        assertSuccess(ruleName, source);
      });
    });

    describe('pseudo classes', () => {
      it('should succeed for :host', () => {
        const source = `
          @Component({
            selector: 'foobar',
            styles: [
              \`
                :host {
                  color: red;
                }
              \`
            ],
            template: \`
              <div>
                <section>
                  <span><h1 [class.header]="test">{{ foo }}</h1></span>
                </section>
              </div>
            \`
          })
          class TestComponent {
            test: boolean;
          }
        `;
        assertSuccess(ruleName, source);
      });

      it('should succeed for :host-context', () => {
        const source = `
          @Component({
            selector: 'foobar',
            styles: [
              \`
                :host-context(h1) {
                  font-weight: bold;
                }
              \`
            ],
            template: \`
              <div>
                <section>
                  <span><h1 [class.header]="test">{{ foo }}</h1></span>
                </section>
              </div>
            \`
          })
          class TestComponent {
            test: boolean;
          }
        `;
        assertSuccess(ruleName, source);
      });
    });

    describe('pseudo elements', () => {
      it('should succed if after is used', () => {
        const source = `
          @Component({
            selector: 'foobar',
            styles: [
              \`
                div section::after {
                  color: red;
                }
              \`
            ],
            template: \`
              <div>
                <section>
                  <span><h1 [class.header]="test">{{ foo }}</h1></span>
                </section>
              </div>
            \`
          })
          class TestComponent {
            test: boolean;
          }
        `;
        assertSuccess(ruleName, source);
      });

      it('should succed if before is used', () => {
        const source = `
          @Component({
            selector: 'foobar',
            styles: [
              \`
                div section::before {
                  color: red;
                }
              \`
            ],
            template: \`
              <div>
                <section>
                  <span><h1 [class.header]="test">{{ foo }}</h1></span>
                </section>
              </div>
            \`
          })
          class TestComponent {
            test: boolean;
          }
        `;
        assertSuccess(ruleName, source);
      });

      it('should succed if first-letter is used', () => {
        const source = `
          @Component({
            selector: 'foobar',
            styles: [
              \`
                div section::first-letter {
                  color: red;
                }
              \`
            ],
            template: \`
              <div>
                <section>
                  <span><h1 [class.header]="test">{{ foo }}</h1></span>
                </section>
              </div>
            \`
          })
          class TestComponent {
            test: boolean;
          }
        `;
        assertSuccess(ruleName, source);
      });

      it('should succed if first-line is used', () => {
        const source = `
          @Component({
            selector: 'foobar',
            styles: [
              \`
                div section::first-line {
                  color: red;
                }
              \`
            ],
            template: \`
              <div>
                <section>
                  <span><h1 [class.header]="test">{{ foo }}</h1></span>
                </section>
              </div>
            \`
          })
          class TestComponent {
            test: boolean;
          }
        `;
        assertSuccess(ruleName, source);
      });

      it('should succed if selection is used', () => {
        const source = `
          @Component({
            selector: 'foobar',
            styles: [
              \`
                div section::selection {
                  color: red;
                }
              \`
            ],
            template: \`
              <div>
                <section>
                  <span><h1 [class.header]="test">{{ foo }}</h1></span>
                </section>
              </div>
            \`
          })
          class TestComponent {
            test: boolean;
          }
        `;
        assertSuccess(ruleName, source);
      });
    });

    describe('ViewEncapsulation', () => {
      // TODO
      it('should succeed if no ViewEncapsulation is set to a variable', () => {
        const source = `
          @Component({
            encapsulation: whatever,
            selector: 'foobar',
            styles: [
              \`
                p {
                  color: red;
                }
              \`
            ],
            template: '<div></div>'
          })
          class TestComponent {}
        `;
        assertSuccess(ruleName, source);
      });

      it('should succeed if ViewEncapsulation.None is set', () => {
        const source = `
          @Component({
            encapsulation: ViewEncapsulation.None,
            selector: 'foobar',
            styles: [
              \`
                p {
                  color: red;
                }
              \`
            ],
            template: '<div></div>'
          })
          class TestComponent {}
        `;
        assertSuccess(ruleName, source);
      });
    });
  });
});
