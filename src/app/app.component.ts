import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: '<router-outlet></router-outlet>',
  styleUrl: './app.component.css',
})
export class AppComponent {
  constructor(private router: Router) {}
}
