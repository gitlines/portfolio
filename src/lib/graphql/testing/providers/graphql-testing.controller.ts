import { HttpTestingController } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { ExecutionResult } from 'graphql';
import { GraphQlTestRequest } from '../models';
import { SubscriptionTestingClient } from './subscription-testing';

/**
 * Controller to be injected into tests, that allows for mocking and flushing of requests.
 */
@Injectable()
export class GraphQlTestingController {
   /**
    * Creates an instance of GraphQlTestingController.
    * @param {HttpTestingController} httpTesting
    * @param {SubscriptionTestingClient} subscriptionTesting
    */
   constructor(private httpTesting: HttpTestingController, private subscriptionTesting: SubscriptionTestingClient) {}

   /**
    * Verify that no unmatched requests are outstanding.
    */
   verify() {
      this.httpTesting.verify();
   }

   /**
    * Expect that a request has been made which matches the given query, and return its mock.
    * @template T
    * @param {string} query
    * @param {Object} [variables]
    * @returns {GraphQlTestRequest<T>}
    */
   expectQuery<T>(query: string, variables?: Object): GraphQlTestRequest<T> {
      const httpRequest = this.httpTesting.expectOne((req) => {
         let match = true;

         match = match && req.url.includes('graphql');

         match = match && req.headers.has('Accept');
         match = match && req.headers.get('Accept') === 'application/json';

         match = match && req.params.has('query');
         match = match && req.params.get('query') === query;

         match = match && req.params.has('variables');
         match = match && req.params.get('variables') === JSON.stringify(variables || {});

         return match;
      });

      return {
         flush: (body: ExecutionResult<T>) => httpRequest.flush(body),
      };
   }

   /**
    * Expect that a subscription has been made which matches the given query, and return its mock.
    * @template T
    * @param {string} query
    * @param {Object} [variables]
    * @returns {GraphQlTestRequest<T>}
    */
   expectSubscription<T>(query: string, variables?: Object): GraphQlTestRequest<T> {
      return {
         flush: (body: ExecutionResult<T>) => {
            this.subscriptionTesting.flush({ query, variables }, body);
         },
         error: (error: Error) => {
            this.subscriptionTesting.error({ query, variables }, error);
         },
         complete: () => {
            this.subscriptionTesting.complete({ query, variables });
         },
      };
   }
}
