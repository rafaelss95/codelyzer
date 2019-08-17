import { Rule } from '../src/relativeUrlPrefixRule';
import { assertAnnotated, assertFailures, assertSuccess } from './testHelper';

const {
  FAILURE_STRING,
  metadata: { ruleName }
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    describe('styleUrls', () => {
      it('should fail if a URL has no prefix', () => {
        const source = `
          @Component({
            styleUrls: ['test.css']
                        ~~~~~~~~~~
          })
          class Test {}
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });
      });

      it('should fail if a URL is prefixed by .//', () => {
        const source = `
          @Component({
            styleUrls: ['.//test.css']
                        ~~~~~~~~~~~~~
          })
          class Test {}
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });
      });

      it('should fail if a URL is prefixed by ../', () => {
        const source = `
          @Component({
            styleUrls: ['../test.css']
                        ~~~~~~~~~~~~~
          })
          class Test {}
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });
      });

      it('should fail if a URL is prefixed by ./../', () => {
        const source = `
          @Component({
            styleUrls: ['./../test.css']
                        ~~~~~~~~~~~~~~~
          })
          class Test {}
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });

        it('should fail if a URL is prefixed by .././', () => {
          const source = `
            @Component({
              styleUrls: ['.././test.css']
                          ~~~~~~~~~~~~~~~
            })
            class Test {}
          `;
          assertAnnotated({
            message: FAILURE_STRING,
            ruleName,
            source
          });
        });
      });

      it('should fail if one of multiple URLs has no prefix', () => {
        const source = `
            @Component({
              styleUrls: ['./test.css', 'test1.css', './test2.css']
                                        ~~~~~~~~~~~
            })
            class Test {}
          `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });
      });
    });

    describe('templateUrl', () => {
      it('should fail if a URL has no prefix', () => {
        const source = `
          @Component({
            templateUrl: 'test.html'
                         ~~~~~~~~~~~
          })
          class Test {}
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });
      });

      it('should fail if a URL is prefixed by .//', () => {
        const source = `
            @Component({
              templateUrl: './/test.html'
                           ~~~~~~~~~~~~~~
            })
            class Test {}
          `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });
      });

      it('should fail if a URL is prefixed by ../', () => {
        const source = `
            @Component({
              templateUrl: '../test.html'
                           ~~~~~~~~~~~~~~
            })
            class Test {}
          `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });
      });

      it('should fail if a URL is prefixed by ./../', () => {
        const source = `
          @Component({
            templateUrl: './../test.html'
                         ~~~~~~~~~~~~~~~~
          })
          class Test {}
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });
      });

      it('should fail if a URL is prefixed by .././', () => {
        const source = `
          @Component({
            templateUrl: '.././test.html'
                         ~~~~~~~~~~~~~~~~
          })
          class Test {}
        `;
        assertAnnotated({
          message: FAILURE_STRING,
          ruleName,
          source
        });
      });
    });

    describe('styleUrls and templateUrl', () => {
      it('should fail if multiple URLs are not prefixed by ./', () => {
        const source = `
          @Component({
            styleUrls: ['./test.css', 'test1.css', './test2.css'],
            templateUrl: '.././test.html'
          })
          class Test {}
        `;
        assertFailures(ruleName, source, [
          {
            endPosition: { character: 49, line: 2 },
            message: FAILURE_STRING,
            startPosition: { character: 38, line: 2 }
          },
          {
            endPosition: { character: 41, line: 3 },
            message: FAILURE_STRING,
            startPosition: { character: 25, line: 3 }
          }
        ]);
      });
    });
  });

  describe('success', () => {
    describe('styleUrls', () => {
      it('should succeed if a URL is prefixed by ./', () => {
        const source = `
          @Component({
            styleUrls: ['./test.css']
          })
          class Test {}
        `;
        assertSuccess(ruleName, source);
      });

      it('should succeed if all URLs are prefixed by ./', () => {
        const source = `
          @Component({
            styleUrls: ['./test.css', './test1.css', './test2.css']
          })
          class Test {}
        `;
        assertSuccess(ruleName, source);
      });
    });

    describe('templateUrl', () => {
      it('should succeed if a URL is prefixed by ./', () => {
        const source = `
          @Component({
            templateUrl: './test.html'
          })
          class Test {}
        `;
        assertSuccess(ruleName, source);
      });
    });

    describe('styleUrls and templateUrl', () => {
      it('should succeed if all URLs are prefixed by ./', () => {
        const source = `
          @Component({
            styleUrls: ['./test.css', './test1.css', './test2.css'],
            templateUrl: './test.html'
          })
          class Test {}
        `;
        assertSuccess(ruleName, source);
      });
    });
  });
});
