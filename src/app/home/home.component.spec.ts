import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
   let component: HomeComponent;
   let fixture: ComponentFixture<HomeComponent>;
   let element: any;

   beforeEach(() => {
      TestBed.configureTestingModule({
         declarations: [HomeComponent],
      }).compileComponents();
   });

   beforeEach(() => {
      fixture = TestBed.createComponent(HomeComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      element = fixture.debugElement.nativeElement;
   });

   it('should create', () => {
      expect(component).toBeTruthy();
   });
});
