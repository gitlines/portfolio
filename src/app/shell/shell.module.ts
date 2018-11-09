import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ShellLoadingComponent } from './shell-loading/shell-loading.component';
import { ShellComponent } from './shell.component';

@NgModule({
   declarations: [ShellComponent, ShellLoadingComponent],
   imports: [CommonModule, RouterModule],
   exports: [ShellComponent, ShellLoadingComponent],
   providers: []
})
export class ShellModule {}
