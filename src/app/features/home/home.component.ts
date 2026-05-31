import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MContainerComponent } from '../../m-framework/components/m-container/m-container.component';
import { MMainMenuComponent } from '../../m-framework/components/m-main-menu/m-main-menu.component';
import { MTableComponent } from '../../m-framework/components/m-table/m-table.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MContainerComponent,
    MMainMenuComponent,
    MTableComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  readonly navItems = ['About', 'Features', 'Launch App'];

  readonly stats = [
    { label: 'Real-time sync', value: '∞' },
    { label: 'Haversine accuracy', value: '±0.01km' },
    { label: 'Gemini briefings', value: 'AI' },
    { label: 'Priority tiers', value: '3' },
  ];

  readonly features = [
    { no: '01', icon: '📍', title: 'Map-Click Location', description: 'Tap anywhere on the Google Map to pin a delivery. Lat/lng captured instantly.' },
    { no: '02', icon: '🔄', title: 'Real-Time Firebase Sync', description: "New deliveries appear on every device the moment they're saved — no refresh needed." },
    { no: '03', icon: '📐', title: 'Haversine Distance', description: 'Straight-line distance from warehouse to delivery, computed with the Haversine formula.' },
    { no: '04', icon: '🤖', title: 'Gemini AI Briefings', description: 'One tap generates a 2-sentence courier instruction, saved back to the cloud for all dispatchers.' },
    { no: '05', icon: '🗺️', title: 'Color-Coded Markers', description: 'Green = Standard · Amber = Express · Red = Urgent. Route polyline drawn on marker tap.' },
    { no: '06', icon: '⭐', title: 'Nearest Highlight', description: 'The table automatically highlights the delivery closest to the warehouse so dispatchers can prioritize.' },
  ];

  readonly featureColumns = ['no', 'icon', 'title', 'description'];
  readonly featureHeaders = ['#', '', 'Feature', 'What it does'];

  constructor(private router: Router) {}

  goToDispatch(): void { this.router.navigate(['/dispatch']); }

  onNavClick(item: string): void {
    if (item === 'Launch App') {
      this.goToDispatch();
      return;
    }
    const target = document.getElementById(item.toLowerCase());
    target?.scrollIntoView({ behavior: 'smooth' });
  }
}
