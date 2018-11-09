import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Component used as app's shell.
 */
@Component({
   selector: 'app-shell',
   templateUrl: './shell.component.html',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShellComponent {
   /**
    * Title of the app
    */
   title = 'Portfolio';

   /**
    * Creates an instance of ShellComponent.
    */
   constructor() {}
}
