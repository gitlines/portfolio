import { ExecutionResult } from 'graphql';

/**
 * GraphQl request.
 * @interface GraphQlTestRequest
 * @template T
 */
export interface GraphQlTestRequest<T> {
   /**
    * Simulates response from the backend.
    */
   flush: (body: ExecutionResult<T>) => void;

   /**
    * Simulates error from the backend.
    */
   error?: (error: Error) => void;

   /**
    * Simulates closed connection from the backend.
    */
   complete?: () => void;
}
