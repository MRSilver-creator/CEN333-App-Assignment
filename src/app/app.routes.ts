import { Routes } from '@angular/router';
import { HomeComponent }     from './features/home/home.component';
import { DispatchComponent } from './features/dispatch/dispatch.component';

export const routes: Routes = [
  { path: '',         component: HomeComponent },
  { path: 'home',     component: HomeComponent },
  { path: 'dispatch', component: DispatchComponent },
];
