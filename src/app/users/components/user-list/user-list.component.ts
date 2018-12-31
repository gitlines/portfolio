import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { User } from '../../models';

/**
 * User's list presentational component.
 */
@Component({
   selector: 'app-user-list',
   template: `
      <h4>Users</h4>
      <ul>
         <li *ngFor="let user of users">{{ user.name }}</li>
      </ul>
   `,
   changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent {
   /**
    * List of users.
    * @type {User[]}
    */
   @Input() users: User[];

   /**
    * Creates an instance of UserListComponent.
    */
   constructor() {}
}
