import { expect } from 'chai';
import { Replacement } from 'tslint/lib';
import { Rule } from '../src/templatePreferPropertyBindingRule';
import { assertAnnotated, assertMultipleAnnotated, assertSuccess } from './testHelper';

const {
  FAILURE_STRING,
  metadata: { ruleName }
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    it('should fail if values are rendered inside interpolation', () => {
      const source = `
        @Component({
          template: \`
            <img src="{{            url}}">
                 ~~~~~~~~~~~~~~~~~~~~~~~~~
          \`
        })
        class Test {
          readonly url = 'https://google.com';
        }
      `;
      assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source
      });
    });

    it('should fail if values are rendered inside interpolation with attribute binding', () => {
      const source = `
        @Component({
          template: \`
            <label attr.for="{{inputId            }}"></label>
                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            <input type="text" [id]="inputId">
          \`
        })
        class Test {
          readonly inputId = 'someId';
        }
      `;
      assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source
      });
    });

    it('should fail if values are static and rendered inside interpolation', () => {
      const source = `
        @Component({
          template: \`
            <input type="text" value="{{            'defaultValue'            }}">
                               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          \`
        })
        class Test {}
      `;
      assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source
      });
    });

    it('should fail if values are static and/or rendered inside interpolation', () => {
      const source = `
        @Component({
          template: \`
            <img src="{{            url}}">
                 ~~~~~~~~~~~~~~~~~~~~~~~~~

            <label attr.for="{{inputId            }}"></label>
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
            <input type="text" [id]="inputId">

            <input type="text" value="{{            'defaultValue'            }}">
                               ##################################################

            <div style.background-color="{{ backgroundColor }}" style.font-size.em="{{ fontSize }}">
                 %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
              Example
            </div>
          \`
        })
        class Test {
          readonly url = 'https://google.com';
          readonly inputId = 'someId';
          readonly backgroundColor = 'red';
          readonly fontSize = 0.9;
        }
      `;
      assertMultipleAnnotated({
        failures: [
          {
            char: '~',
            msg: FAILURE_STRING
          },
          {
            char: '^',
            msg: FAILURE_STRING
          },
          {
            char: '#',
            msg: FAILURE_STRING
          },
          {
            char: '%',
            msg: FAILURE_STRING
          },
          {
            char: '$',
            msg: FAILURE_STRING
          }
        ],
        ruleName,
        source
      });
    });
  });

  describe('success', () => {
    it('should succeed if property binding is used', () => {
      const source = `
        @Component({
          template: \`
            <img [src]="url">
          \`
        })
        class Test {
          readonly url = 'https://google.com';
        }
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed if attribute binding is used', () => {
      const source = `
        @Component({
          template: \`
            <label [attr.for]="inputId"></label>
            <input type="text" [id]="inputId">
          \`
        })
        class Test {
          readonly inputId = 'someId';
        }
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed if property binding is used with static values', () => {
      const source = `
        @Component({
          template: \`
            <input type="text" [value]="'initialValue'">
          \`
        })
        class Test {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed if property binding is used', () => {
      const source = `
        @Component({
          template: \`
            <div [style.background-color]="backgroundColor" bind-style.font-size.em="fontSize">
              Example
            </div>
          \`
        })
        class Test {
          readonly backgroundColor = 'red';
          readonly fontSize = 0.9;
        }
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed if multiple interpolations are used', () => {
      const source = `
        @Component({
          template: \`
            <video width="320" height="240" controls>
              <source src="{{basePath}}{{endpoint}}" type="video/mp4">
              Your browser does not support the video tag.
            </video>
          \`
        })
        class Test {
          readonly basePath = 'https://google.com/';
          readonly endpoint = 'video/300.mp4';
        }
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed if attributes/properties bindings or multiple interpolations are used', () => {
      const source = `
        @Component({
          template: \`
            <img [src]="url">

            <label [attr.for]="inputId"></label>
            <input type="text" [id]="inputId">

            <input type="text" [value]="'initialValue'">

            <div [style.background-color]="backgroundColor" bind-style.font-size.em="fontSize">
              Example
            </div>

            <video width="320" height="240" controls>
              <source src="{{basePath}}{{endpoint}}" type="video/mp4">
              Your browser does not support the video tag.
            </video>
          \`
        })
        class Test {
          readonly url = 'https://google.com';
          readonly inputId = 'someId';
          readonly backgroundColor = 'red';
          readonly fontSize = 0.9;
          readonly basePath = 'https://google.com/';
          readonly endpoint = 'video/300.mp4';
        }
      `;
      assertSuccess(ruleName, source);
    });
  });

  describe('replacement', () => {
    it('should fail and apply proper replacements if values are rendered inside interpolation', () => {
      const source = `
        @Component({
          template: \`
            <img src="{{            url}}">
                 ~~~~~~~~~~~~~~~~~~~~~~~~~
          \`
        })
        class Test {
          readonly url = 'https://google.com';
        }
      `;
      const failures = assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source
      });

      if (!Array.isArray(failures)) return;

      const replacedText = Replacement.applyFixes(source, failures.map(failure => failure.getFix()!));

      expect(replacedText).to.eq(`
        @Component({
          template: \`
            <img [src]="url">
                 ~~~~~~~~~~~~~~~~~~~~~~~~~
          \`
        })
        class Test {
          readonly url = 'https://google.com';
        }
      `);
    });

    it('should fail and apply proper replacements if values are rendered inside interpolation with attribute binding', () => {
      const source = `
        @Component({
          template: \`
            <label attr.for="{{inputId            }}"></label>
                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            <input type="text" [id]="inputId">
          \`
        })
        class Test {
          readonly inputId = 'someId';
        }
      `;
      const failures = assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source
      });

      if (!Array.isArray(failures)) return;

      const replacedText = Replacement.applyFixes(source, failures.map(failure => failure.getFix()!));

      expect(replacedText).to.eq(`
        @Component({
          template: \`
            <label [attr.for]="inputId"></label>
                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            <input type="text" [id]="inputId">
          \`
        })
        class Test {
          readonly inputId = 'someId';
        }
      `);
    });

    it('should fail and apply proper replacements if values are static and rendered inside interpolation', () => {
      const source = `
        @Component({
          template: \`
            <input type="text" value="{{            'defaultValue'            }}">
                               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          \`
        })
        class Test {}
      `;
      const failures = assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source
      });

      if (!Array.isArray(failures)) return;

      const replacedText = Replacement.applyFixes(source, failures.map(failure => failure.getFix()!));

      expect(replacedText).to.eq(`
        @Component({
          template: \`
            <input type="text" [value]="'defaultValue'">
                               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          \`
        })
        class Test {}
      `);
    });

    it('should fail and apply proper replacements if values are static and/or rendered inside interpolation', () => {
      const source = `
        @Component({
          template: \`
            <img src="{{            url}}">
                 ~~~~~~~~~~~~~~~~~~~~~~~~~

            <label attr.for="{{inputId            }}"></label>
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
            <input type="text" [id]="inputId">

            <input type="text" value="{{            'defaultValue'            }}">
                               ##################################################

            <div style.background-color="{{ backgroundColor }}" style.font-size.em="{{ fontSize }}">
                 %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
              Example
            </div>
          \`
        })
        class Test {
          readonly url = 'https://google.com';
          readonly inputId = 'someId';
          readonly backgroundColor = 'red';
          readonly fontSize = 0.9;
        }
      `;
      const failures = assertMultipleAnnotated({
        failures: [
          {
            char: '~',
            msg: FAILURE_STRING
          },
          {
            char: '^',
            msg: FAILURE_STRING
          },
          {
            char: '#',
            msg: FAILURE_STRING
          },
          {
            char: '%',
            msg: FAILURE_STRING
          },
          {
            char: '$',
            msg: FAILURE_STRING
          }
        ],
        ruleName,
        source
      });

      if (!Array.isArray(failures)) return;

      const replacedText = Replacement.applyFixes(source, failures.map(failure => failure.getFix()!));

      expect(replacedText).to.eq(`
        @Component({
          template: \`
            <img [src]="url">
                 ~~~~~~~~~~~~~~~~~~~~~~~~~

            <label [attr.for]="inputId"></label>
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
            <input type="text" [id]="inputId">

            <input type="text" [value]="'defaultValue'">
                               ##################################################

            <div [style.background-color]="backgroundColor" [style.font-size.em]="fontSize">
                 %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
              Example
            </div>
          \`
        })
        class Test {
          readonly url = 'https://google.com';
          readonly inputId = 'someId';
          readonly backgroundColor = 'red';
          readonly fontSize = 0.9;
        }
      `);
    });
  });
});
