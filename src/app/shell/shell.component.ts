import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, PLATFORM_ID } from '@angular/core';
import { Angulartics2GoogleGlobalSiteTag } from 'angulartics2/gst';

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
   constructor(@Inject(PLATFORM_ID) private platform: any, private angulartics: Angulartics2GoogleGlobalSiteTag) {
      if (isPlatformBrowser(platform)) {
         angulartics.startTracking();
      }
   }
}
