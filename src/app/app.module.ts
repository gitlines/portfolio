import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { ShellComponent, ShellModule } from './shell';

@NgModule({
   imports: [BrowserModule.withServerTransition({ appId: 'serverApp' }), ShellModule, AppRoutingModule],
   exports: [ShellModule],
   bootstrap: [ShellComponent]
})
export class AppModule {}
