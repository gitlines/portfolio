import { async, TestBed } from '@angular/core/testing';
import { makeStateKey, TransferState } from '@angular/platform-browser';

import { EMPTY } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { GraphQlTestingController, GraphQlTestingModule, TransferStateMock } from '../testing';
import { GraphQlService } from './graphql.service';

describe('GraphQl GraphQlService', () => {
   let service: GraphQlService;
   let graphqlTesting: GraphQlTestingController;
   let transferState: TransferStateMock;

   beforeEach(() => {
      TestBed.configureTestingModule({
         imports: [GraphQlTestingModule],
      });

      service = TestBed.get(GraphQlService);
      graphqlTesting = TestBed.get(GraphQlTestingController);
      transferState = TestBed.get(TransferState);
   });

   afterEach(() => {
      graphqlTesting.verify();
   });

   it('should declare service', () => {
      expect(service).toBeTruthy();
   });

   it('should perform a query without variables', (done) => {
      const testResponse = { data: { test: true } };

      service.query('query { }').subscribe((resp) => {
         expect(resp).toEqual(testResponse);
         done();
      });

      const req = graphqlTesting.expectQuery('query{}');
      req.flush(testResponse);
   });

   it('should perform a query with variables', (done) => {
      const testResponse = { data: { test: true } };
      const testVariables = { variable: true };

      service.query<any>('query { }', testVariables).subscribe((resp) => {
         expect(resp).toEqual(testResponse);
         done();
      });

      const req = graphqlTesting.expectQuery('query{}', testVariables);
      req.flush(testResponse);
   });

   it('should subscribe without variables', (done) => {
      const testResponse = { data: { test: true } };

      service
         .subscription<any>('subscribe { }')
         .pipe(finalize(() => done()))
         .subscribe((resp) => {
            expect(resp).toEqual(testResponse);
         });

      const req = graphqlTesting.expectSubscription('subscribe{}');
      req.flush(testResponse);
      req.complete();
   });

   it('should subscribe with variables', (done) => {
      const testResponse = { data: { test: true } };
      const testVariables = { variable: true };

      service
         .subscription<any>('subscribe { }', testVariables)
         .pipe(finalize(() => done()))
         .subscribe((resp) => {
            expect(resp).toEqual(testResponse);
         });

      const req = graphqlTesting.expectSubscription('subscribe{}', testVariables);
      req.flush(testResponse);
      req.complete();
   });

   it('should handle subscription errors', (done) => {
      const testVariables = { variable: true };
      const testError = new Error('error');

      service
         .subscription<any>('subscribe { }', testVariables)
         .pipe(
            catchError((error) => {
               expect(error).toEqual(testError);
               done();
               return EMPTY;
            })
         )
         .subscribe();

      const req = graphqlTesting.expectSubscription('subscribe{}', testVariables);
      req.error(testError);
   });

   it('should return an entity that loads all items', () => {
      const testLoad = { data: { tests: [{ id: 1 }] } };

      let tests;

      service
         .entity({
            loadAllQuery: 'query { }',
            loadAllMap: (resp) => resp.data.tests,
         })
         .subscribe((response) => {
            tests = response;
         });

      const load = graphqlTesting.expectQuery('query{}');
      load.flush(testLoad);
      expect(tests.length).toEqual(1);
      expect(tests[0].id).toEqual(1);
   });

   it('should return an entity that get new items', () => {
      const testLoad = { data: { tests: [{ id: 1 }] } };
      const testOnAdded = { data: { test: { id: 2 } } };

      let tests;

      service
         .entity({
            loadAllQuery: 'query { }',
            loadAllMap: (resp) => resp.data.tests,
            onAddedQuery: 'onAdded { }',
            onAddedMap: (resp) => resp.data.test,
         })
         .subscribe((response) => {
            tests = response;
         });

      const load = graphqlTesting.expectQuery('query{}');
      const added = graphqlTesting.expectSubscription('onAdded{}');
      load.flush(testLoad);
      added.flush(testOnAdded);
      expect(tests.length).toEqual(2);
      expect(tests[1].id).toEqual(2);
   });

   it('should use origin if provided in config', () => {
      expect(service.httpUri).toEqual('http://some_server/graphql');
   });

   it('should use browser origin', () => {
      const graphqlService = new GraphQlService({ uri: '/graphql' }, undefined, undefined, undefined, undefined);
      expect(graphqlService.httpUri).toEqual('/graphql');
   });

   it('should use server origin if provided', () => {
      const graphqlService = new GraphQlService(
         { uri: '/graphql' },
         { origin: 'http://localhost:5000' },
         undefined,
         undefined,
         undefined
      );
      expect(graphqlService.httpUri).toEqual('http://localhost:5000/graphql');
   });

   it('should not connect for subscriptions in server', (done) => {
      const graphqlService = new GraphQlService(
         { uri: '/graphql', origin: 'http://some_server' },
         { origin: 'http://localhost:5000' },
         undefined,
         undefined, // In server ws provided is undefined
         undefined
      );

      graphqlService
         .subscription<any>('subscribe { }')
         .pipe(finalize(() => done()))
         .subscribe();
   });

   it('should use transfer state', (done) => {
      const testResponse = { data: { test: true } };
      const key = makeStateKey('{"query":"query{}","variables":"{}"}');
      transferState.set(key, testResponse);

      service.query('query { }').subscribe((resp) => {
         expect(resp).toEqual(testResponse);
         done();
      });
   });
});
