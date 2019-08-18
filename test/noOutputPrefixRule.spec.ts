import { Rule } from '../src/noOutputPrefixRule';
import { assertAnnotated, assertMultipleAnnotated, assertSuccess } from './testHelper';

const {
  metadata: { ruleName }
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    it('should fail if an output property is prefixed by a disallowed prefix', () => {
      const options = ['^on'];
      const source = `
        @Component({
          selector: 'test'
          template: ''
        })
        class TestComponent {
          @Output() onChange = new EventEmitter<void>();
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `;

      assertAnnotated({
        message: Rule.getFailureMessage(options[0]),
        options,
        ruleName,
        source
      });
    });

    it('should fail if an ouput property is snakecased and is prefixed by a disallowed prefix', () => {
      const options = ['^do'];
      const source = `
        @Component({
          selector: 'test'
          template: ''
        })
        class TestComponent {
          @Output() do_it = new EventEmitter<void>();
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `;
      assertAnnotated({
        message: Rule.getFailureMessage(options[0]),
        options,
        ruleName,
        source
      });
    });

    it('should fail if an output property is strictly equal a disallowed prefix', () => {
      const options = ['^(event1|yes)'];
      const source = `
        @Directive({
          selector: 'app-test'
        })
        class TestDirective {
          @Output() event1 = new EventEmitter<void>();
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `;

      assertAnnotated({
        message: Rule.getFailureMessage(options[0]),
        options,
        ruleName,
        source
      });
    });

    it('should fail if multiple output properties match a disallowed prefix', () => {
      const options = ['^(ok|should)'];
      const source = `
        @Directive({
          selector: 'app-test'
        })
        class TestDirective {
          @Output() okTest = new EventEmitter<void>();
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          @Output() shouldTest = new EventEmitter<void>();
          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        }
      `;
      const msg = Rule.getFailureMessage(options[0]);

      assertMultipleAnnotated({
        failures: [
          {
            char: '~',
            msg
          },
          {
            char: '^',
            msg
          }
        ],
        options,
        ruleName,
        source
      });
    });
  });

  describe('success', () => {
    it('should succeed if there is no output property', () => {
      const options = ['^on'];
      const source = `
        @Component({
          selector: 'test'
          template: ''
        })
        class TestComponent {
          readonly str: string;
        }
      `;

      assertSuccess(ruleName, source, options);
    });

    it('should succeed if an ouput property is snakecased and is not prefixed', () => {
      const options = ['^do'];
      const source = `
        @Component({
          selector: 'test'
          template: ''
        })
        class TestComponent {
          @Output() private readonly doit = new EventEmitter<void>();
        }
      `;

      assertSuccess(ruleName, source, options);
    });

    it('should succeed if the output property does not match a disallowed prefix', () => {
      const options = ['^(event1|yes)'];
      const source = `
        @Directive({
          selector: 'app-test'
        })
        class TestDirective {
          @Output() private readonly evYes = new EventEmitter<void>();
        }
      `;

      assertSuccess(ruleName, source, options);
    });

    it('should succeed if multiple output properties does not match a disallowed prefix', () => {
      const options = ['^(ok|should)'];
      const source = `
        @Directive({
          selector: 'app-test'
        })
        class TestDirective {
          @Output() private readonly oTest = new EventEmitter<void>();
          @Output() private readonly shoulChange = new EventEmitter<void>();
        }
      `;

      assertSuccess(ruleName, source, options);
    });
  });
});
