import { async, TestBed } from '@angular/core/testing';
import { GraphQlTestingModule } from '../graphql-testing.module';
import { SubscriptionTestingClient } from './subscription-testing';

describe('GraphQl SubscriptionTestingClient', () => {
   let subscriptionTesting: SubscriptionTestingClient;

   beforeEach(async(() => {
      TestBed.configureTestingModule({
         imports: [GraphQlTestingModule],
      });

      subscriptionTesting = TestBed.get(SubscriptionTestingClient);
   }));

   it('should declare the provider', () => {
      expect(subscriptionTesting).toBeTruthy();
   });

   it('should handle multiple requests', () => {
      const firstRequest = subscriptionTesting.request({ query: 'query' });
      const secondRequest = subscriptionTesting.request({ query: 'query' });
      expect(firstRequest).toBeTruthy();
      expect(secondRequest).toBeTruthy();
   });

   it('should handle errors on flush method', () => {
      expect(() => {
         subscriptionTesting.flush({ query: 'error' }, {});
      }).toThrowError('Query error was not expected');
   });

   it('should handle errors on error method', () => {
      expect(() => {
         subscriptionTesting.error({ query: 'error' }, new Error());
      }).toThrowError('Query error was not expected');
   });

   it('should handle errors on complete method', () => {
      expect(() => {
         subscriptionTesting.complete({ query: 'error' });
      }).toThrowError('Query error was not expected');
   });
});
