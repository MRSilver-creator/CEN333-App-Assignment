import { Routes } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-test',
  template: `<div style="padding: 2rem; font-size: 1.4rem;">TEST ROUTE WORKS</div>`,
})
export class TestComponent {}

export const routes: Routes = [
  { path: '', component: TestComponent },
  { path: 'identify', component: TestComponent },
];