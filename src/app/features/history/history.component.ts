import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FirebaseService } from '../../services/firebase.service';
import { DoseLog, Medication } from '../../models/medication.model';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule, CanvasJSAngularChartsModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css',
})
export class HistoryComponent implements OnInit, OnDestroy {
  doses: DoseLog[]          = [];
  medications: Medication[] = [];
  searchTerm = '';
  chartOptions: any = {};

  private subs: Subscription[] = [];

  constructor(private firebase: FirebaseService) {}

  ngOnInit() {
    this.subs.push(
      this.firebase.getDoses().subscribe(d => {
        this.doses = [...d].sort(
          (a, b) => new Date(b.dateTaken).getTime() - new Date(a.dateTaken).getTime()
        );
        this.buildChart();
      }),
      this.firebase.getMedications().subscribe(m => this.medications = m)
    );
  }

  get latestId(): string | undefined {
    return this.doses[0]?.id;
  }

  get filtered(): DoseLog[] {
    const q = this.searchTerm.toLowerCase();
    if (!q) return this.doses;
    return this.doses.filter(d => d.medicationName.toLowerCase().includes(q));
  }

  thumbFor(dose: DoseLog): string {
    const med = this.medications.find(m => m.id === dose.medicationId);
    return med ? `data:${med.imageMimeType};base64,${med.imageBase64}` : '';
  }

  buildChart() {
    const today = new Date();
    const days: { label: string; date: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push({
        label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        date:  d.toISOString().slice(0, 10),
      });
    }

    const dataPoints = days.map(day => ({
      label: day.label,
      y: this.doses.filter(d => d.dateTaken.slice(0, 10) === day.date).length,
    }));

    this.chartOptions = {
      animationEnabled: true,
      backgroundColor:  '#0f1117',
      title: {
        text: '7-Day Medication Intake',
        fontColor: '#e8eaf0',
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: 16,
      },
      axisX: {
        labelFontColor: '#8890a8',
        lineColor: '#2a2d3a',
        tickColor: '#2a2d3a',
      },
      axisY: {
        title: 'Doses',
        titleFontColor: '#636880',
        labelFontColor: '#8890a8',
        gridColor: '#1e2238',
        lineColor: '#2a2d3a',
        minimum: 0,
        interval: 1,
      },
      data: [{
        type: 'column',
        color: '#7c8fff',
        dataPoints,
      }],
    };
  }

  ngOnDestroy() { this.subs.forEach(s => s.unsubscribe()); }
}
