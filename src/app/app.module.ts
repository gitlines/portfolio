import { NgModule } from '@angular/core';
import { BrowserModule, BrowserTransferStateModule } from '@angular/platform-browser';
import { ServiceWorkerModule } from '@angular/service-worker';
import { GraphQlModule } from '@lib/graphql';
import { Angulartics2Module } from 'angulartics2';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { ShellComponent, ShellModule } from './shell';

@NgModule({
   imports: [
      BrowserModule.withServerTransition({ appId: 'serverApp' }),
      BrowserTransferStateModule,
      GraphQlModule.forRoot({ origin: environment.origin, uri: environment.apiUri }),
      ShellModule,
      AppRoutingModule,
      ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
      Angulartics2Module.forRoot(),
   ],
   exports: [ShellModule],
   bootstrap: [ShellComponent],
})
export class AppModule {
   constructor() {}
}
