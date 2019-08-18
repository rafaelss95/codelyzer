import { getFailureMessage, Rule } from '../src/componentClassSuffixRule';
import { assertAnnotated, assertSuccess } from './testHelper';

const {
  metadata: { ruleName }
} = Rule;

describe(ruleName, () => {
  describe('invalid component class suffix', () => {
    it('should fail when component class is with the wrong suffix', () => {
      const source = `
        @Component({
          selector: 'sg-foo-bar'
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
  });

  describe('valid component class name', () => {
    it('should succeed when the component class name ends with Component', () => {
      const source = `
        @Component({
          selector: 'sg-foo-bar',
          template: '<foo-bar [foo]="bar">{{baz + 42}}</foo-bar>'
        })
        class TestComponent {}
      `;

      assertSuccess(ruleName, source);
    });
  });

  describe('valid directive class', () => {
    it('should succeed when is used @Directive decorator', () => {
      const source = `
        @Directive({
          selector: '[myHighlight]'
        })
        class TestDirective {}
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
    it('should succeed when different suffix is set', () => {
      const source = `
        @Component({
          selector: 'sgBarFoo'
        })
        class TestPage {}
      `;

      assertSuccess(ruleName, source, ['Page']);
    });

    it('should succeed when different list of suffix is set', () => {
      const source = `
        @Component({
          selector: 'sgBarFoo'
        })
        class TestPage {}
      `;

      assertSuccess(ruleName, source, ['Page', 'View']);
    });

    it('should fail when different list of suffix is set and does not match', () => {
      const source = `
        @Component({
          selector: 'sgBarFoo'
        })
        class TestPage {}
              ~~~~~~~~
      `;
      const suffixes = ['Component', 'View'];

      assertAnnotated({
        message: getFailureMessage({ suffixes }),
        options: suffixes,
        ruleName,
        source
      });
    });

    it('should fail when different suffix is set and does not match', () => {
      const source = `
        @Component({
          selector: 'sgBarFoo'
        })
        class TestPage {}
              ~~~~~~~~
      `;
      const suffixes = ['Component'];

      assertAnnotated({
        message: getFailureMessage({ suffixes }),
        options: suffixes,
        ruleName,
        source
      });
    });

    it('should fail when different suffix is set and does not match', () => {
      const source = `
        @Component({
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
