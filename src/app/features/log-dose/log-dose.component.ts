import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FirebaseService } from '../../services/firebase.service';
import { Medication } from '../../models/medication.model';

@Component({
  selector: 'app-log-dose',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './log-dose.component.html',
  styleUrl: './log-dose.component.css',
})
export class LogDoseComponent implements OnInit, OnDestroy {
  medications: Medication[] = [];
  selectedMedId  = '';
  dateTaken      = '';
  notes          = '';
  errorMsg: string | null = null;
  successMsg: string | null = null;
  saving = false;

  private sub!: Subscription;

  constructor(
    private firebase: FirebaseService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.dateTaken = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)
      .toISOString().slice(0, 16);

    this.sub = this.firebase.getMedications().subscribe(m => {
      this.medications = m;
      const id = this.route.snapshot.queryParamMap.get('medId');
      if (id) this.selectedMedId = id;
    });
  }

  get selectedMed(): Medication | undefined {
    return this.medications.find(m => m.id === this.selectedMedId);
  }

  displayName(m: Medication): string {
    return m.nickname?.trim() || m.analysis.medicationName;
  }

  async save() {
    this.errorMsg = null;

    if (!this.selectedMedId) {
      this.errorMsg = 'Please select a medication.'; return;
    }
    const taken = new Date(this.dateTaken);
    const now   = new Date();
    if (taken > now) {
      this.errorMsg = 'Date/time cannot be in the future.'; return;
    }
    const diff = (now.getTime() - taken.getTime()) / (1000 * 60 * 60 * 24);
    if (diff > 30) {
      this.errorMsg = 'Date/time cannot be more than 30 days in the past.'; return;
    }

    this.saving = true;
    try {
      const med = this.selectedMed!;
      await this.firebase.saveDose({
        medicationId:   this.selectedMedId,
        medicationName: this.displayName(med),
        dateTaken:      taken.toISOString(),
        notes:          this.notes.trim() || undefined,
      });
      this.successMsg = '✅ Dose logged!';
      setTimeout(() => this.router.navigate(['/history']), 1400);
    } catch (err: any) {
      // Show the real Firebase error so you can diagnose it
      console.error('saveDose failed:', err);
      this.errorMsg = `Failed to save dose: ${err?.message ?? 'Check your Firebase config (databaseURL, rules)'}`;
    } finally {
      this.saving = false;
    }
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }
}
