import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Home component.
 */
@Component({
   selector: 'app-home',
   templateUrl: './home.component.html',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
   /**
    * Creates an instance of HomeComponent.
    */
   constructor() {}
}
