import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Loading indicator for app's shell.
 */
@Component({
   selector: 'app-shell-loading',
   templateUrl: './shell-loading.component.html',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShellLoadingComponent {
   /**
    * Creates an instance of ShellLoadingComponent.
    */
   constructor() {}
}
