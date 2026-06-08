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
  medications   : Medication[] = [];
  selectedMedId : string = '';
  dateTaken     : string = '';
  notes         : string = '';
  errorMsg      : string | null = null;
  saveSuccess   = false;
  saving        = false;
  private subs  : Subscription[] = [];

  constructor(
    private firebase : FirebaseService,
    private route    : ActivatedRoute,
    private router   : Router
  ) {}

  ngOnInit() {
    // Default date to now
    const now = new Date();
    now.setSeconds(0, 0);
    this.dateTaken = now.toISOString().slice(0, 16);

    this.subs.push(
      this.firebase.getMedications().subscribe(m => {
        this.medications = m;
        // Pre-fill from query param
        const preId = this.route.snapshot.queryParamMap.get('medId');
        if (preId) this.selectedMedId = preId;
      })
    );
  }

  get selectedMed(): Medication | undefined {
    return this.medications.find(m => m.id === this.selectedMedId);
  }

  displayName(m: Medication): string {
    return m.nickname?.trim() || m.analysis.medicationName;
  }

  validate(): boolean {
    this.errorMsg = null;
    if (!this.selectedMedId) {
      this.errorMsg = 'Please select a medication.'; return false;
    }
    if (!this.dateTaken) {
      this.errorMsg = 'Please enter a date and time.'; return false;
    }
    const taken = new Date(this.dateTaken);
    const now   = new Date();
    if (taken > now) {
      this.errorMsg = 'Date/time cannot be in the future.'; return false;
    }
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    if (taken < thirtyDaysAgo) {
      this.errorMsg = 'Date/time cannot be more than 30 days in the past.'; return false;
    }
    return true;
  }

  async save() {
    if (!this.validate()) return;
    this.saving = true;
    try {
      await this.firebase.saveDose({
        medicationId  : this.selectedMedId,
        medicationName: this.displayName(this.selectedMed!),
        dateTaken     : new Date(this.dateTaken).toISOString(),
        notes         : this.notes.trim() || undefined,
      });
      this.saveSuccess = true;
      setTimeout(() => this.router.navigate(['/history']), 1200);
    } catch (e) {
      this.errorMsg = 'Failed to save dose. Check Firebase config.';
    } finally {
      this.saving = false;
    }
  }

  ngOnDestroy() { this.subs.forEach(s => s.unsubscribe()); }
}
