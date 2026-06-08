import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { FirebaseService } from '../../services/firebase.service';
import { Medication, DoseLog } from '../../models/medication.model';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './library.component.html',
  styleUrl: './library.component.css',
})
export class LibraryComponent implements OnInit, OnDestroy {
  medications : Medication[] = [];
  doses       : DoseLog[]    = [];
  searchQuery  = '';
  expandedId  : string | null = null;
  private subs : Subscription[] = [];

  constructor(private firebase: FirebaseService) {}

  ngOnInit() {
    this.subs.push(
      this.firebase.getMedications().subscribe(m => this.medications = m),
      this.firebase.getDoses().subscribe(d => this.doses = d),
    );
  }

  get filtered(): Medication[] {
    const q = this.searchQuery.toLowerCase();
    if (!q) return this.medications;
    return this.medications.filter(m =>
      m.analysis.medicationName.toLowerCase().includes(q) ||
      m.analysis.activeIngredient.toLowerCase().includes(q) ||
      (m.nickname || '').toLowerCase().includes(q)
    );
  }

  displayName(m: Medication): string {
    return m.nickname?.trim() || m.analysis.medicationName;
  }

  doseCount(medId: string): number {
    return this.doses.filter(d => d.medicationId === medId).length;
  }

  toggleDetails(id: string) {
    this.expandedId = this.expandedId === id ? null : id;
  }

  ngOnDestroy() { this.subs.forEach(s => s.unsubscribe()); }
}
