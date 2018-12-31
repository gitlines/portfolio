import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
   { path: '', loadChildren: './home/home.module#HomeModule' },
   { path: 'users', loadChildren: './users/users.module#UsersModule' },
   { path: '**', redirectTo: '' },
];

@NgModule({
   imports: [
      RouterModule.forRoot(routes, {
         initialNavigation: 'enabled', // Prevents flickering when Universal renders a lazy-loaded route
      }),
   ],
   exports: [RouterModule],
})
export class AppRoutingModule {}
