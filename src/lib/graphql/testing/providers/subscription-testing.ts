import { DocumentNode, ExecutionResult } from 'graphql';
import { Observable, Subject } from 'rxjs';
import { OperationOptions, SubscriptionClient } from 'subscriptions-transport-ws';

/**
 * Mock of SubscriptionClient to be used in tests. Direct use is not needed, use GraphQlTestingController instead.
 * @implements {Partial<SubscriptionClient>}
 */
export class SubscriptionTestingClient implements Partial<SubscriptionClient> {
   /**
    * Collection of requests indexed by query and params.
    * @type {{ [query: string]: Subject<ExecutionResult<any>> }}
    */
   private requests: { [query: string]: Subject<ExecutionResult<any>> } = {};

   /**
    * Gets the key of the request collection given a query and params.
    * @param {OperationOptions} { query, variables }
    * @returns {string}
    */
   private getKey({ query, variables }: OperationOptions): string {
      return query + '|' + JSON.stringify(variables || {});
   }

   /**
    * Generates the request mock.
    * @param {string} key
    */
   private generateRequest(key: string) {
      if (!this.requests[key]) {
         this.requests[key] = new Subject<ExecutionResult<any>>();
      }
   }

   /**
    * Asserts that a request is expected.
    * @param {string} key
    * @param {string} query
    */
   private assertRequest(key: string, query: string | DocumentNode) {
      if (!this.requests[key]) {
         throw new Error(`Query ${query} was not expected.`);
      }
   }

   /**
    * Returns the stream of a request.
    * @param {OperationOptions} options
    * @returns {Observable<ExecutionResult<any>>}
    */
   request(options: OperationOptions): Observable<ExecutionResult<any>> {
      const key: string = this.getKey(options);
      this.generateRequest(key);
      return this.requests[key].asObservable();
   }

   /**
    * Resolves a request by returning a body.
    * @param {OperationOptions} options
    * @param {ExecutionResult<any>} body
    */
   flush(options: OperationOptions, body: ExecutionResult<any>) {
      const key: string = this.getKey(options);
      this.assertRequest(key, options.query);
      this.requests[key].next(body);
   }

   /**
    * Resolves a request by returning an error.
    * @param {OperationOptions} options
    * @param {Error} error
    */
   error(options: OperationOptions, error: Error) {
      const key: string = this.getKey(options);
      this.assertRequest(key, options.query);
      this.requests[key].error(error);
   }

   /**
    * Completes an outstanding request.
    * @param {OperationOptions} options
    */
   complete(options: OperationOptions) {
      const key: string = this.getKey(options);
      this.assertRequest(key, options.query);
      this.requests[key].complete();
   }
}
