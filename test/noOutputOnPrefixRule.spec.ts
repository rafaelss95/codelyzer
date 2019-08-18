import { Rule } from '../src/noOutputOnPrefixRule';
import { assertAnnotated, assertSuccess } from './testHelper';

const {
  FAILURE_STRING,
  metadata: { ruleName }
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    it('should fail if a component property is prefixed by "on"', () => {
      const source = `
        @Component({
          selector: 'test'
        })
        class TestComponent {
          @Output() onChange = new EventEmitter<void>();
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `;

      assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source
      });
    });

    it('should fail if a directive property is prefixed by "on"', () => {
      const source = `
        @Directive({
          selector: 'test'
        })
        class TestDirective {
          @Output() onChange = new EventEmitter<void>();
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `;

      assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source
      });
    });

    it('should fail if a directive property name is exactly "on"', () => {
      const source = `
        @Directive({
          selector: 'test'
        })
        class TestDirective {
          @Output() on = new EventEmitter<void>();
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `;

      assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source
      });
    });
  });

  describe('success', () => {
    it('should succeed if a component property is not prefixed by "on"', () => {
      const source = `
        @Component({
          selector: 'test'
        })
        class TestComponent {
          @Output() change = new EventEmitter<void>();
        }
      `;

      assertSuccess(ruleName, source);
    });

    it('should succeed if a component property is prefixed by "one"', () => {
      const source = `
        @Component({
          selector: 'test'
        })
        class TestComponent {
          @Output() oneProp = new EventEmitter<void>();
        }
      `;

      assertSuccess(ruleName, source);
    });

    it('should succeed if a component property is prefixed by "selection"', () => {
      const source = `
        @Component({
          selector: 'test'
        })
        class TestComponent {
          @Output() selectionChanged = new EventEmitter<void>();
        }
      `;

      assertSuccess(ruleName, source);
    });
  });
});
