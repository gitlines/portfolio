import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ShellComponent } from './shell.component';

describe('ShellComponent', () => {
   let component: ShellComponent;
   let fixture: ComponentFixture<ShellComponent>;
   let element: any;

   beforeEach(async(() => {
      TestBed.configureTestingModule({
         declarations: [ShellComponent],
         schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();
   }));

   beforeEach(() => {
      fixture = TestBed.createComponent(ShellComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      element = fixture.debugElement.nativeElement;
   });

   it('should create', () => {
      expect(component).toBeTruthy();
   });

   it(`should have as title 'app'`, async(() => {
      expect(component.title).toEqual('Portfolio');
   }));

   it('should render title in a h1 tag', async(() => {
      expect(element.querySelector('h1').textContent).toContain('Welcome to Portfolio!');
   }));

   it('should match the snapshot', async(() => {
      expect(fixture).toMatchSnapshot();
   }));
});
