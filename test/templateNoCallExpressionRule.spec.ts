import { Rule } from '../src/templateNoCallExpressionRule';
import { assertAnnotated, assertMultipleAnnotated, assertSuccess, assertFailures } from './testHelper';

const {
  FAILURE_STRING,
  metadata: { ruleName }
} = Rule;

describe(ruleName, () => {
  describe.only('failure', () => {
    it('should fail if call expressions are used within interpolation', () => {
      const source = `
        @Component({
          template: \`
            {{ framework().name }}
               ~~~~~~~~~~~

            {{ this.framework().name }}
               ^^^^^^^^^^^^^^^^

            {{ this['framework']().name }}
               ↗↗↗↗↗↗↗↗↗↗↗↗↗↗↗↗↗↗↗

            {{ this[methodName]().name }}
               ↖↖↖↖↖↖↖↖↖↖↖↖↖↖↖↖↖↖

            {{ obj.$any() ? 150 : 50 }}
               →→→→→→→→→→

            {{ obj!.x?.y!.z?.$any() || 'label' }}
               ←←←←←←←←←←←←←←←←←←←←
          \`
        })
        class Test {}
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
            char: '↗',
            msg: FAILURE_STRING
          },
          {
            char: '↖',
            msg: FAILURE_STRING
          },
          {
            char: '→',
            msg: FAILURE_STRING
          },
          {
            char: '←',
            msg: FAILURE_STRING
          }
        ],
        ruleName,
        source
      });
    });

    it.only('should fail if call expressions are used within structual directives', () => {
      // const source = `
      //   @Component({
      //     template: \`
      //       <div *ngFor="let name of framework().names; index as i">Hey {{ i }}!</div>
      //                                ~~~~~~~~~~~

      //       <div *ngIf="this.framework().name">Hey!</div>
      //                   ^^^^^^^^^^^^^^^^

      //       <div class="hero-list" *ngIf="heroes else loading">
      //         {{ heroes }}
      //       </div>

      //       <ng-template #loading>
      //         <div *ngIf="this['framework']().name">Hey!</div>
      //                     ↗↗↗↗↗↗↗↗↗↗↗↗↗↗↗↗↗↗↗
      //       </ng-template>

      //       <p *appUnless="this[methodName]().name">Hey!</p>
      //                      ↖↖↖↖↖↖↖↖↖↖↖↖↖↖↖↖↖↖↖

      //       <div [ngSwitch]="obj.$any()">
      //                        →→→→→→→→→→
      //         <div *ngSwitchCase="1">Hey!</div>
      //         <div *ngSwitchCase="2">Hey!</div>
      //       </div>

      //       <ng-container *ngTemplateOutlet="svk; context: obj!.x?.y!.z?.$any()"></ng-container>
      //                                                      ←←←←←←←←←←←←←←←←←←←←

      //       <ng-template #svk let-person="localSk">
      //         <span>Ahoj {{ person }}!</span>
      //       </ng-template>
      //     \`
      //   })
      //   class Test {}
      // `;
      // assertMultipleAnnotated({
      //   failures: [
      //     {
      //       char: '~',
      //       msg: FAILURE_STRING
      //     },
      //     {
      //       char: '^',
      //       msg: FAILURE_STRING
      //     },
      //     {
      //       char: '↗',
      //       msg: FAILURE_STRING
      //     },
      //     {
      //       char: '↖',
      //       msg: FAILURE_STRING
      //     },
      //     {
      //       char: '→',
      //       msg: FAILURE_STRING
      //     },
      //     {
      //       char: '←',
      //       msg: FAILURE_STRING
      //     }
      //   ],
      //   ruleName,
      //   source
      // });
      // const source = `
      //   @Component({
      //     template: \`
      //       <ng-template #loading>
      //         <div *ngIf="obj!.x?.y!.z?.$any()">Hey!</div>
      //                     ↗↗↗↗↗↗↗↗↗↗↗↗↗↗↗↗↗↗↗
      //       </ng-template>
      //     \`
      //   })
      //   class Test {}
      // `;
      // assertMultipleAnnotated({
      //   failures: [
      //     // {
      //     //   char: '~',
      //     //   msg: FAILURE_STRING
      //     // },
      //     // {
      //     //   char: '^',
      //     //   msg: FAILURE_STRING
      //     // },
      //     {
      //       char: '↗',
      //       msg: FAILURE_STRING
      //     }
      //     // {
      //     //   char: '↖',
      //     //   msg: FAILURE_STRING
      //     // },
      //     // {
      //     //   char: '→',
      //     //   msg: FAILURE_STRING
      //     // },
      //     // {
      //     //   char: '←',
      //     //   msg: FAILURE_STRING
      //     // }
      //   ],
      //   ruleName,
      //   source
      // });

      const source = `
        @Component({
          template: \`
            <div *ngIf="obj.x!.y.z?.$any()">Hey!</div>
          \`
        })
        class Test {}
      `;
      assertFailures(ruleName, source, [
        {
          endPosition: {
            character: 48,
            line: 4
          },
          message: FAILURE_STRING,
          startPosition: {
            character: 26,
            line: 4
          }
        }
      ]);
    });

    it('should fail if call expressions are used within data binding', () => {
      const source = `
        @Component({
          template: \`
            <div appPrefix="{{ framework().name }}">Hey!</div>
                               ~~~~~~~~~~~

            <div bind-appPrefix="this.framework().name">Hey!</div>
                                 ^^^^^^^^^^^^^^^^

            <div [appPrefix]="this['framework']().name">Hey!</div>
                              ↗↗↗↗↗↗↗↗↗↗↗↗↗↗↗↗↗↗↗

            <div [attr.appPrefix]="this[methodName]().name">Hey!</div>
                                   ↖↖↖↖↖↖↖↖↖↖↖↖↖↖↖↖↖↖

            <button [style.font-size.%]="obj.$any() ? 150 : 50" >Small</button>
                                         →→→→→→→→→→
            <div attr.aria-label="{{ obj!.x?.y!.z?.$any() || 'label' }}">Hey!</div>
                                     ←←←←←←←←←←←←←←←←←←←←
          \`
        })
        class Test {}
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
            char: '↗',
            msg: FAILURE_STRING
          },
          {
            char: '↖',
            msg: FAILURE_STRING
          },
          {
            char: '→',
            msg: FAILURE_STRING
          },
          {
            char: '←',
            msg: FAILURE_STRING
          }
        ],
        ruleName,
        source
      });
    });
  });
});
