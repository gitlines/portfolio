import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgModule } from '@angular/core';
import { TransferState } from '@angular/platform-browser';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { GraphQlModule } from '../graphql.module';
import { GraphQlTestingController, SubscriptionTestingClient, TransferStateMock } from './providers';

/**
 * Testing module for GraphQl.
 */
@NgModule({
   imports: [HttpClientTestingModule, GraphQlModule.forRoot({ uri: '/graphql', origin: 'http://some_server' })],
   providers: [
      GraphQlTestingController,
      { provide: SubscriptionTestingClient, useFactory: () => new SubscriptionTestingClient() },
      { provide: SubscriptionClient, useExisting: SubscriptionTestingClient },
      { provide: TransferState, useClass: TransferStateMock },
   ],
})
export class GraphQlTestingModule {}
