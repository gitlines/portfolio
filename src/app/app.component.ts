import { Component } from '@angular/core';

/**
 * Main App component
 * @export
 * @class AppComponent
 */
@Component({
   selector: 'app-root',
   templateUrl: './app.component.html',
   styleUrls: ['./app.component.scss']
})
export class AppComponent {
   /**
    * Title of the app
    * @memberof AppComponent
    */
   title = 'portfolio';
}
