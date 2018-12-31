import { ExecutionResult } from 'graphql';

/**
 * GraphQl entity.
 */
export interface GraphQlEntity<T> {
   /**
    * Query to return all items.
    */
   loadAllQuery: string;

   /**
    * Mapping from the query result to the items collection.
    */
   loadAllMap: (result: ExecutionResult) => T[];

   /**
    * Subscription to get new items.
    */
   onAddedQuery?: string;

   /**
    * Mapping from the new items subscription result to the single item.
    */
   onAddedMap?: (result: ExecutionResult) => T;
}
