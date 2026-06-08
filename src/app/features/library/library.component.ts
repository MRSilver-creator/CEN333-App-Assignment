import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FirebaseService } from '../../services/firebase.service';
import { Medication, DoseLog } from '../../models/medication.model';
import { MDeleteButtonComponent } from '../../m-framework/components/m-delete-button/m-delete-button.component';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MDeleteButtonComponent],
  templateUrl: './library.component.html',
  styleUrl: './library.component.css',
})
export class LibraryComponent implements OnInit, OnDestroy {
  medications: Medication[] = [];
  doses: DoseLog[]          = [];
  searchTerm = '';
  expandedId: string | null = null;
  deletingId: string | null = null;

  private subs: Subscription[] = [];

  constructor(private firebase: FirebaseService, private router: Router) {}

  ngOnInit() {
    this.subs.push(
      this.firebase.getMedications().subscribe(m => this.medications = m),
      this.firebase.getDoses().subscribe(d => this.doses = d)
    );
  }

  get filtered(): Medication[] {
    const q = this.searchTerm.toLowerCase();
    if (!q) return this.medications;
    return this.medications.filter(m =>
      m.analysis.medicationName.toLowerCase().includes(q) ||
      m.analysis.activeIngredient.toLowerCase().includes(q) ||
      (m.nickname ?? '').toLowerCase().includes(q)
    );
  }

  displayName(m: Medication): string {
    return m.nickname?.trim() || m.analysis.medicationName;
  }

  doseCount(id: string): number {
    return this.doses.filter(d => d.medicationId === id).length;
  }

  toggleExpand(id: string) {
    this.expandedId = this.expandedId === id ? null : id;
  }

  logDose(med: Medication) {
    this.router.navigate(['/log-dose'], { queryParams: { medId: med.id, medName: this.displayName(med) } });
  }

  async deleteMedication(med: Medication) {
    this.deletingId = med.id!;
    try {
      await this.firebase.deleteMedication(med.id!);
    } catch {
      console.error('Delete failed for', med.id);
    } finally {
      this.deletingId = null;
    }
  }

  ngOnDestroy() { this.subs.forEach(s => s.unsubscribe()); }
}
