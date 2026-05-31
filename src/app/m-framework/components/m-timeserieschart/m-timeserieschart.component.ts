import { Component, Input, OnChanges,
  SimpleChanges, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';

@Component({
selector: 'm-timeserieschart',
standalone: true,
imports: [],
templateUrl: './m-timeserieschart.component.html',
styleUrl: './m-timeserieschart.component.css'
})
export class MTimeseriesChartComponent implements OnInit, OnChanges {

@Input() label: string = '';
@Input() data: { date: string, value: number }[] = [];
@Input() color: string = '#1565c0';
@Input() min: number = 0;
@Input() max: number = 100;
@Input() unit: string = '';

chartId: string = '';
chart: any;

ngOnInit() {
// generate a unique id for each chart instance
this.chartId = 'chart-' + Math.random().toString(36).substring(2, 9);
}


ngOnChanges(changes: SimpleChanges) {
console.log(changes['data']);
if (changes['data'] && this.chart) {
this.updateChart();
}
}

ngAfterViewInit() {
setTimeout(() => {
this.initChart();
this.updateChart();
}, 50);
}

getSortedData(): { date: string, value: number }[] {
return [...this.data].sort((a, b) =>
new Date(a.date).getTime() - new Date(b.date).getTime()
);
}

initChart() {
const canvas = document.getElementById(this.chartId) as HTMLCanvasElement;
if (!canvas) return;

this.chart = new Chart(canvas, {
type: 'line',
data: {
 labels: [],
 datasets: [{
   label: this.label,
   data: [],
   borderColor: this.color,
   backgroundColor: this.color + '30',
   borderWidth: 2,
   tension: 0.3,
   fill: true,
   pointRadius: 5,
   pointHoverRadius: 7,
   pointBackgroundColor: this.color,
 }]
},
options: {
 responsive: true,
 plugins: {
   legend: {
     labels: { font: { size: 20 }, color: '#1A2B4A' }
   },
   tooltip: {
     titleFont: { size: 20 },
     bodyFont: { size: 20 }
   }
 },
 scales: {
   x: {
     ticks: { font: { size: 20 }, color: '#334155' },
     grid: { color: '#E2E8F0' }
   },
   y: {
     min: this.min,
     max: this.max,
     ticks: { font: { size: 20 }, color: '#334155' },
     grid: { color: '#E2E8F0' },
     title: {
       display: true,
       text: this.unit,
       font: { size: 20 },
       color: '#334155'
     }
   }
 }
}
});
}

updateChart() {
if (!this.chart) return;
const sorted = this.getSortedData();
this.chart.data.labels = sorted.map(r => r.date);
this.chart.data.datasets[0].data = sorted.map(r => r.value);
this.chart.update();
}
}