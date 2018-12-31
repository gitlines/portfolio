import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule, PLATFORM_ID } from '@angular/core';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { GraphQlConfig } from './models';
import { GRAPHQL_CONFIG, SubscriptionFactory } from './providers';

@NgModule({
   imports: [CommonModule, HttpClientModule],
})
export class GraphQlModule {
   static forRoot(config: GraphQlConfig): ModuleWithProviders {
      return {
         ngModule: GraphQlModule,
         providers: [
            { provide: GRAPHQL_CONFIG, useValue: config },
            { provide: SubscriptionClient, useFactory: SubscriptionFactory, deps: [GRAPHQL_CONFIG, PLATFORM_ID] },
         ],
      };
   }
}
