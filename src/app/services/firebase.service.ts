import { Injectable } from '@angular/core';
import {
  getDatabase, ref, push, set, onValue, off
} from 'firebase/database';
import { Observable } from 'rxjs';
import { Medication, DoseLog } from '../models/medication.model';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private db = getDatabase();

  // ── Medications ────────────────────────────────────────────────
  saveMedication(med: Omit<Medication, 'id'>): Promise<string> {
    const listRef = ref(this.db, 'medications');
    const newRef  = push(listRef);
    return set(newRef, med).then(() => newRef.key!);
  }

  getMedications(): Observable<Medication[]> {
    return new Observable(observer => {
      const r = ref(this.db, 'medications');
      onValue(r,
        snap => {
          const val = snap.val() || {};
          const list: Medication[] = Object.entries(val).map(([id, v]) => ({
            ...(v as Omit<Medication, 'id'>), id
          }));
          observer.next(list);
        },
        err => observer.error(err)
      );
      return () => off(r);
    });
  }

  // ── Doses ───────────────────────────────────────────────────────
  saveDose(dose: Omit<DoseLog, 'id'>): Promise<string> {
    const listRef = ref(this.db, 'doses');
    const newRef  = push(listRef);
    return set(newRef, dose).then(() => newRef.key!);
  }

  getDoses(): Observable<DoseLog[]> {
    return new Observable(observer => {
      const r = ref(this.db, 'doses');
      onValue(r,
        snap => {
          const val = snap.val() || {};
          const list: DoseLog[] = Object.entries(val).map(([id, v]) => ({
            ...(v as Omit<DoseLog, 'id'>), id
          }));
          observer.next(list);
        },
        err => observer.error(err)
      );
      return () => off(r);
    });
  }
}
