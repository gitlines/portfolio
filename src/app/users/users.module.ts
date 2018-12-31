import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { UserListComponent } from './components/user-list/user-list.component';
import { UsersRoutingModule } from './users-routing.module';
import { UsersComponent } from './users.component';

@NgModule({
   declarations: [UsersComponent, UserListComponent],
   imports: [CommonModule, UsersRoutingModule],
})
export class UsersModule {}
