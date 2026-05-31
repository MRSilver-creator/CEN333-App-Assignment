import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { MHeaderComponent } from './m-framework/components/m-header/m-header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, MHeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  titleName = 'QuickDispatch';

  // Feature pages (home, dispatch) render their own chrome, so the global
  // header/footer shell stays off for them. Driven per-route here so the
  // app.component.html shell has a defined flag to switch on.
  showGlobalShell = false;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.showGlobalShell = false;
      });
  }
}
