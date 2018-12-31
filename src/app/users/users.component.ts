import { Component, OnInit } from '@angular/core';
import { GraphQlEntity, GraphQlService } from '@lib/graphql';
import { Observable } from 'rxjs';
import { User } from './models';

/**
 * GraphQL query to fetch all users.
 */
export const GET_ALL_USERS_QUERY = `
   query {
      users {
         id
         name
         email
      }
   }
`;

/**
 * GraphQl subscription for new users.
 */
export const USER_ADDED_SUBSCRIPTION = `
   subscription {
      userAdded {
         id
         name
         email
      }
   }
`;

/**
 * Users smart component.
 */
@Component({
   selector: 'app-users',
   template: `
      <app-user-list [users]="users$ | async"></app-user-list>
   `,
})
export class UsersComponent implements OnInit {
   /**
    * Observable of users.
    * @type {Observable<User[]>}
    */
   users$: Observable<User[]>;

   /**
    * Creates an instance of UsersComponent.
    * @param {UsersQuery} users
    */
   constructor(private graphQl: GraphQlService) {}

   /**
    * On init life-cycle hook.
    */
   ngOnInit(): void {
      const userEntity: GraphQlEntity<User> = {
         loadAllQuery: GET_ALL_USERS_QUERY,
         loadAllMap: (response) => response.data.users,
         onAddedQuery: USER_ADDED_SUBSCRIPTION,
         onAddedMap: (response) => response.data.userAdded,
      };

      this.users$ = this.graphQl.entity(userEntity);
   }
}
