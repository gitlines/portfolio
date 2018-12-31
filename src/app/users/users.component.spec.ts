import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { GraphQlTestingController, GraphQlTestingModule } from '@lib/graphql/testing';
import { User } from './models';
import { UsersComponent } from './users.component';
import { UsersModule } from './users.module';

describe('UsersComponent', () => {
   let graphqlTesting: GraphQlTestingController;
   let component: UsersComponent;
   let fixture: ComponentFixture<UsersComponent>;
   let element: any;

   beforeEach(async(() => {
      TestBed.configureTestingModule({
         imports: [GraphQlTestingModule, UsersModule],
      }).compileComponents();
   }));

   beforeEach(() => {
      graphqlTesting = TestBed.get(GraphQlTestingController);
      fixture = TestBed.createComponent(UsersComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      element = fixture.debugElement.nativeElement;
   });

   it('should create', () => {
      expect(component).toBeTruthy();
   });

   it('should get users and render them', () => {
      const load = graphqlTesting.expectQuery<{ users: User[] }>('query{users{id name email}}');
      load.flush({
         data: {
            users: [{ id: '1', name: 'user', email: 'email' }],
         },
      });

      fixture.detectChanges();
      expect(element.querySelector('li').textContent).toContain('user');

      graphqlTesting.verify();
   });

   it('should render new users', () => {
      const load = graphqlTesting.expectQuery<{ users: User[] }>('query{users{id name email}}');
      load.flush({
         data: {
            users: [],
         },
      });

      fixture.detectChanges();
      expect(element.querySelector('li')).toBeFalsy();

      const add = graphqlTesting.expectSubscription<{ userAdded: User }>('subscription{userAdded{id name email}}');
      add.flush({
         data: {
            userAdded: { id: '1', name: 'user', email: 'email' },
         },
      });

      fixture.detectChanges();
      expect(element.querySelector('li').textContent).toContain('user');

      graphqlTesting.verify();
   });
});
