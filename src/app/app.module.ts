import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { ShellComponent, ShellModule } from './shell';

@NgModule({
   imports: [
      BrowserModule.withServerTransition({ appId: 'serverApp' }),
      ShellModule,
      AppRoutingModule,
      ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
   ],
   exports: [ShellModule],
   bootstrap: [ShellComponent]
})
export class AppModule {}
