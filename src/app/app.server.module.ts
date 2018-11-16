import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { ModuleMapLoaderModule } from '@nguniversal/module-map-ngfactory-loader';
import { AppModule } from './app.module';
import { ShellComponent } from './shell';

// By now Angular SSR build process is not compatible with App Shell in Angular v7
// https://github.com/angular/angular-cli/issues/12921
// const routes: Routes = [{ path: '**', component: ShellLoadingComponent }];

@NgModule({
   imports: [AppModule, ServerModule, ModuleMapLoaderModule],
   bootstrap: [ShellComponent]
})
export class AppServerModule {}
