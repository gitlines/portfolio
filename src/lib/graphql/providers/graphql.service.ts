import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, Optional } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { ExecutionResult } from 'graphql';
import { concat, EMPTY, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { GraphQlConfig, GraphQlEntity } from '../models';
import { GRAPHQL_CONFIG, SERVER_GRAPHQL_CONFIG } from './config.provider';

/**
 * Service to handle GraphQl queries and subscriptions.
 *
 * Inspired on https://github.com/prisma/graphql-request/blob/master/src/index.ts
 */
@Injectable({ providedIn: 'root' })
export class GraphQlService {
   /**
    * URI of the http endpoint for queries.
    * @type {string}
    */
   readonly httpUri: string;

   /**
    * Creates an instance of GraphQlService.
    * @param {GraphQlConfig} browserConfig
    * @param {Partial<GraphQlConfig>} serverConfig
    * @param {SubscriptionClient} ws
    * @param {HttpClient} http
    * @param {TransferState} transferState
    */
   constructor(
      @Inject(GRAPHQL_CONFIG) browserConfig: GraphQlConfig,
      @Optional() @Inject(SERVER_GRAPHQL_CONFIG) serverConfig: Partial<GraphQlConfig>,
      private ws: SubscriptionClient,
      private http: HttpClient,
      private transferState: TransferState
   ) {
      const config: GraphQlConfig = {
         ...browserConfig,
         ...(serverConfig || {}),
      };

      this.httpUri = `${config.origin || ''}${config.uri}`;
   }

   /**
    * Trims the query string to normalize it.
    * @param {string} query
    * @returns {string}
    */
   private processQuery(query: string): string {
      return query
         .replace(/\s+/g, ' ')
         .replace(/\s*\{\s*/g, '{')
         .replace(/\s*\}\s*/g, '}')
         .trim();
   }

   /**
    * Makes a query request to the endpoint.
    * @template T
    * @param {string} query
    * @param {Object} [variables={}]
    * @returns {Observable<ExecutionResult<T>>}
    */
   query<T = {}>(query: string, variables: Object = {}): Observable<ExecutionResult<T>> {
      const headers = { Accept: 'application/json' };
      const params = {
         query: this.processQuery(query),
         variables: JSON.stringify(variables),
      };

      const key = makeStateKey<ExecutionResult<T>>(JSON.stringify(params));

      if (this.transferState.hasKey(key)) {
         // If in client, check if state transfer has the value stored
         const result = this.transferState.get(key, { data: {} } as any);
         this.transferState.remove(key);
         return of(result);
      } else {
         // If in the server, persist the query result
         return this.http
            .get<ExecutionResult<T>>(this.httpUri, { headers, params })
            .pipe(tap((result) => this.transferState.set(key, result)));
      }
   }

   /**
    * Subscribes to changes of an endpoint.
    * @template T
    * @param {string} query
    * @param {Object} [variables={}]
    * @returns {Observable<ExecutionResult<T>>}
    */
   subscription<T = {}>(query: string, variables: Object = {}): Observable<ExecutionResult<T>> {
      return this.ws
         ? Observable.create((observer) =>
              this.ws.request({ query: this.processQuery(query), variables }).subscribe({
                 next: (response: ExecutionResult<T>) => observer.next(response),
                 complete: () => observer.complete(),
                 error: (error) => observer.error(error),
              })
           )
         : EMPTY;
   }

   /**
    * Handles a collection of items. It loads initial items, and subscribes to additions, modifications or deletions.
    * It returns a new array every time.
    *
    * @template T
    * @param {GraphQlEntity<T>} config
    * @returns {Observable<T[]>}
    */
   entity<T>(config: GraphQlEntity<T>): Observable<T[]> {
      const loadAll = this.query(config.loadAllQuery).pipe(map((response) => config.loadAllMap(response)));
      const onAdded =
         config.onAddedQuery && config.onAddedMap
            ? this.subscription(config.onAddedQuery).pipe(map((response) => config.onAddedMap(response)))
            : undefined;

      return loadAll.pipe(
         switchMap((entities) => {
            let allEntities = [...entities];

            if (onAdded) {
               const addEntity = onAdded.pipe(
                  map((newEntity) => {
                     allEntities = [...allEntities, newEntity];
                     return allEntities;
                  })
               );

               return concat(of(allEntities), addEntity);
            } else {
               return of(allEntities);
            }
         })
      );
   }
}
