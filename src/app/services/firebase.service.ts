import { Injectable } from '@angular/core';
import {
  getDatabase, ref, push, set, remove, onValue, off, Database
} from 'firebase/database';
import { getApp } from 'firebase/app';
import { Observable } from 'rxjs';
import { Medication, DoseLog } from '../models/medication.model';

@Injectable({ providedIn: 'root' })
export class FirebaseService {

  private get db(): Database {
    return getDatabase(getApp());
  }

  // ── Medications ────────────────────────────────────────────────
  saveMedication(med: Omit<Medication, 'id'>): Promise<string> {
    const listRef = ref(this.db, 'medications');
    const newRef  = push(listRef);
    return set(newRef, med)
      .then(() => newRef.key!)
      .catch(err => { console.error('Firebase saveMedication error:', err); throw err; });
  }

  deleteMedication(id: string): Promise<void> {
    return remove(ref(this.db, `medications/${id}`))
      .catch(err => { console.error('Firebase deleteMedication error:', err); throw err; });
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
        err => { console.error('Firebase getMedications error:', err); observer.error(err); }
      );
      return () => off(r);
    });
  }

  // ── Doses ───────────────────────────────────────────────────────
  saveDose(dose: Omit<DoseLog, 'id'>): Promise<string> {
    const listRef = ref(this.db, 'doses');
    const newRef  = push(listRef);
    return set(newRef, dose)
      .then(() => newRef.key!)
      .catch(err => { console.error('Firebase saveDose error:', err); throw err; });
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
        err => { console.error('Firebase getDoses error:', err); observer.error(err); }
      );
      return () => off(r);
    });
  }
}
