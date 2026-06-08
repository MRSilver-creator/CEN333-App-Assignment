import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FirebaseService } from '../../services/firebase.service';
import { DoseLog } from '../../models/medication.model';

interface ChartDataPoint { label: string; y: number; }

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css',
})
export class HistoryComponent implements OnInit, OnDestroy {
  doses         : DoseLog[] = [];
  searchQuery    = '';
  private subs  : Subscription[] = [];

  // Chart
  chartOptions  : any = null;

  ngOnInit() {
    this.subs.push(
      this.firebase.getDoses().subscribe(d => {
        this.doses = [...d].sort(
          (a, b) => new Date(b.dateTaken).getTime() - new Date(a.dateTaken).getTime()
        );
        this.buildChart();
      })
    );
  }

  constructor(private firebase: FirebaseService) {}

  get mostRecentId(): string | undefined {
    return this.doses[0]?.id;
  }

  get filtered(): DoseLog[] {
    const q = this.searchQuery.toLowerCase();
    if (!q) return this.doses;
    return this.doses.filter(d => d.medicationName.toLowerCase().includes(q));
  }

  buildChart() {
    const today = new Date();
    const days: ChartDataPoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dateStr = d.toISOString().slice(0, 10);
      const count = this.doses.filter(dose =>
        dose.dateTaken.startsWith(dateStr)
      ).length;
      days.push({ label, y: count });
    }

    this.chartOptions = {
      animationEnabled: true,
      title: { text: '7-Day Medication Intake', fontFamily: 'inherit', fontColor: '#2c3e50' },
      axisX: { title: 'Date', titleFontColor: '#555', labelFontColor: '#555' },
      axisY: { title: 'Doses', minimum: 0, interval: 1, titleFontColor: '#555', labelFontColor: '#555' },
      data: [{
        type: 'column',
        color: '#3498db',
        dataPoints: days
      }]
    };
  }

  ngOnDestroy() { this.subs.forEach(s => s.unsubscribe()); }
}
