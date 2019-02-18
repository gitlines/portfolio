import { NO_ERRORS_SCHEMA, PLATFORM_ID } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Angulartics2GoogleGlobalSiteTag } from 'angulartics2/gst';
import { ShellComponent } from './shell.component';

class MockAngulartics {
   startTracking() {}
}

describe('ShellComponent', () => {
   let component: ShellComponent;
   let fixture: ComponentFixture<ShellComponent>;
   let element: any;

   describe('in browser', async () => {
      beforeEach(async(() => {
         TestBed.configureTestingModule({
            declarations: [ShellComponent],
            providers: [
               { provide: Angulartics2GoogleGlobalSiteTag, useClass: MockAngulartics },
               { provide: PLATFORM_ID, useValue: 'browser' },
            ],
            schemas: [NO_ERRORS_SCHEMA],
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

      it('should render title in a header tag', async(() => {
         expect(element.querySelector('header').textContent).toContain('Portfolio');
      }));
   });

   describe('in server', async () => {
      beforeEach(async(() => {
         TestBed.configureTestingModule({
            declarations: [ShellComponent],
            providers: [
               { provide: Angulartics2GoogleGlobalSiteTag, useClass: MockAngulartics },
               { provide: PLATFORM_ID, useValue: 'server' },
            ],
            schemas: [NO_ERRORS_SCHEMA],
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
   });
});
