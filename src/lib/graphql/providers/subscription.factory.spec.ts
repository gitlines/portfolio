import { SubscriptionClient } from 'subscriptions-transport-ws';
import { SubscriptionFactory } from '.';

const SERVER_PLATFORM = 'server';
const BROWSER_PLATFORM = 'browser';

describe('GraphQl SubscriptionFactory', () => {
   it('should use websockets for subscriptions', () => {
      const subscription = SubscriptionFactory({ uri: '/graphql' }, BROWSER_PLATFORM);
      expect(subscription instanceof SubscriptionClient).toBeTruthy();
      expect((<any>subscription).url).toEqual('ws://localhost/graphql');
   });

   it('should not connect for subscriptions', () => {
      const subscription = SubscriptionFactory({ uri: '/graphql' }, SERVER_PLATFORM);
      expect(subscription).toBeFalsy();
   });

   it('should use wss for https', () => {
      const subscription = SubscriptionFactory({ origin: 'https://server', uri: '/graphql' }, BROWSER_PLATFORM);
      expect(subscription instanceof SubscriptionClient).toBeTruthy();
      expect((<any>subscription).url).toEqual('wss://server/graphql');
   });
});
