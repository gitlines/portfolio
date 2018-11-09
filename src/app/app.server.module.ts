import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { RouterModule, Routes } from '@angular/router';
import { ModuleMapLoaderModule } from '@nguniversal/module-map-ngfactory-loader';
import { AppModule } from './app.module';
import { ShellComponent, ShellLoadingComponent } from './shell';

const routes: Routes = [{ path: '**', component: ShellLoadingComponent }];

@NgModule({
   imports: [AppModule, ServerModule, ModuleMapLoaderModule, RouterModule.forRoot(routes)],
   bootstrap: [ShellComponent]
})
export class AppServerModule {}
