import { async, TestBed } from '@angular/core/testing';

import { GraphQlTestingModule } from '../graphql-testing.module';
import { GraphQlTestingController } from './graphql-testing.controller';

describe('GraphQl GraphQlTestingController', () => {
   let graphqlTesting: GraphQlTestingController;

   beforeEach(() => {
      TestBed.configureTestingModule({
         imports: [GraphQlTestingModule],
      });

      graphqlTesting = TestBed.get(GraphQlTestingController);
   });

   it('should declare the provider', () => {
      expect(graphqlTesting).toBeTruthy();
   });
});
