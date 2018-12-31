import { isPlatformBrowser } from '@angular/common';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { GraphQlConfig } from '../models';

/**
 * Subscription factory. Return an injectable of SubscriptionClient in the browser, nothing in the server.
 * @param {GraphQlConfig} config
 * @param {*} platform
 * @returns {SubscriptionClient}
 */
export function SubscriptionFactory(config: GraphQlConfig, platform: any): SubscriptionClient {
   if (isPlatformBrowser(platform)) {
      const origin = (config.origin || window.location.origin).replace(/^http/, 'ws');
      const wsUri = `${origin}${config.uri}`;
      return new SubscriptionClient(wsUri);
   }
}
