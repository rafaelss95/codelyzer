import { getFailureMessage, Rule } from '../src/directiveClassSuffixRule';
import { assertAnnotated, assertSuccess } from './testHelper';

const {
  metadata: { ruleName }
} = Rule;

describe(ruleName, () => {
  describe('invalid directive class suffix', () => {
    it('should fail when directive class is with the wrong suffix', () => {
      const source = `
        @Directive({
          selector: 'sgBarFoo'
        })
        class Test {}
              ~~~~
      `;

      assertAnnotated({
        message: getFailureMessage(),
        ruleName,
        source
      });
    });

    it('should fail when directive class is with the wrong suffix', () => {
      const source = `
        @Directive({
          selector: 'sgBarFoo'
        })
        class Test {}
              ~~~~
      `;
      const suffixes = ['Directive', 'Page', 'Validator'];

      assertAnnotated({
        message: getFailureMessage({ suffixes }),
        options: suffixes,
        ruleName,
        source
      });
    });
  });

  describe('valid directive class name', () => {
    it('should succeed when the directive class name ends with Directive', () => {
      const source = `
        @Directive({
          selector: 'sgBarFoo'
        })
        class TestDirective {}
      `;

      assertSuccess(ruleName, source);
    });

    it('should succeed when the directive class name ends with Validator and implements Validator', () => {
      const source = `
        @Directive({
          selector: 'sgBarFoo'
        })
        class TestValidator implements Validator {}
      `;

      assertSuccess(ruleName, source);
    });

    it('should succeed when the directive class name ends with Validator and implements AsyncValidator', () => {
      const source = `
        @Directive({
          selector: 'sgBarFoo'
        })
        class TestValidator implements AsyncValidator {}
      `;

      assertSuccess(ruleName, source);
    });
  });

  describe('valid directive class', () => {
    it('should succeed when is used @Component decorator', () => {
      const source = `
        @Component({
          selector: 'sg-foo-bar'
        })
        class TestComponent {}
      `;

      assertSuccess(ruleName, source);
    });
  });

  describe('valid pipe class', () => {
    it('should succeed when is used @Pipe decorator', () => {
      const source = `
        @Pipe({
          name: 'sg-test-pipe'
        })
        class TestPipe {}
      `;

      assertSuccess(ruleName, source);
    });
  });

  describe('valid service class', () => {
    it('should succeed when is used @Injectable decorator', () => {
      const source = `
        @Injectable()
        class TestService {}
      `;

      assertSuccess(ruleName, source);
    });
  });

  describe('valid empty class', () => {
    it('should succeed when the class is empty', () => {
      const source = `
        class TestEmpty {}
      `;

      assertSuccess(ruleName, source);
    });
  });

  describe('changed suffix', () => {
    it('should suceed when different suffix is set', () => {
      const source = `
        @Directive({
          selector: 'sgBarFoo'
        })
        class TestPage {}
      `;

      assertSuccess(ruleName, source, ['Page']);
    });

    it('should fail when different suffix is set and does not match', () => {
      const source = `
        @Directive({
          selector: 'sgBarFoo'
        })
        class TestPage {}
              ~~~~~~~~
      `;
      const suffixes = ['Directive'];

      assertAnnotated({
        message: getFailureMessage({ suffixes }),
        options: suffixes,
        ruleName,
        source
      });
    });

    it('should fail when different suffix is set and does not match', () => {
      const source = `
        @Directive({
          selector: 'sgBarFoo'
        })
        class TestDirective {}
              ~~~~~~~~~~~~~
      `;
      const suffixes = ['Page'];

      assertAnnotated({
        message: getFailureMessage({ suffixes }),
        options: suffixes,
        ruleName,
        source
      });
    });
  });
});
