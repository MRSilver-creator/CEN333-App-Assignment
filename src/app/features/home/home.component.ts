import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MHeaderComponent } from '../../m-framework/components/m-header/m-header.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MHeaderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  constructor(private router: Router) {}
  goToDispatch(): void { this.router.navigate(['/dispatch']); }
}
