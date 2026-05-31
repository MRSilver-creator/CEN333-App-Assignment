import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue, update, remove } from 'firebase/database';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environments';

export interface DeliveryRequest {
  id?: string;
  customerName: string;
  packageWeight: number;
  priority: 'Standard' | 'Express' | 'Urgent';
  lat: number;
  lng: number;
  distance: number;           // km, Haversine from warehouse
  timestamp: string;
  status: 'pending' | 'delivered';
  aiInstruction?: string;
}

@Injectable({ providedIn: 'root' })
export class FirebaseService {

  private db: any = null;

  private _deliveries$ = new BehaviorSubject<DeliveryRequest[]>([]);
  deliveries$: Observable<DeliveryRequest[]> = this._deliveries$.asObservable();

  constructor() {
    // Initializing the Realtime Database with an empty/invalid databaseURL
    // throws a FATAL error. That would happen during DI when DispatchComponent
    // is constructed, aborting the route render and leaving a blank page.
    // Guard initialization so an unconfigured Firebase degrades to an empty
    // delivery list instead of crashing the app.
    if (!environment.firebaseConfig?.databaseURL) {
      console.warn('FirebaseService: firebaseConfig.databaseURL is not set — running without realtime data.');
      return;
    }

    try {
      const app = initializeApp(environment.firebaseConfig);
      this.db = getDatabase(app);

      // Real-time listener
      onValue(ref(this.db, 'deliveries'), (snapshot) => {
        const data = snapshot.val();
        const list: DeliveryRequest[] = data
          ? Object.keys(data).map(k => ({ status: 'pending', id: k, ...data[k] }))
          : [];
        this._deliveries$.next(list);
      });
    } catch (e) {
      console.error('FirebaseService: failed to initialize Firebase.', e);
      this.db = null;
    }
  }

  saveDelivery(delivery: Omit<DeliveryRequest, 'id'>): Promise<string> {
    if (!this.db) return Promise.reject(new Error('Firebase is not configured.'));
    return push(ref(this.db, 'deliveries'), delivery).then(r => r.key ?? '');
  }

  updateDelivery(id: string, changes: Partial<DeliveryRequest>): Promise<void> {
    if (!this.db) return Promise.reject(new Error('Firebase is not configured.'));
    return update(ref(this.db, `deliveries/${id}`), changes as any);
  }

  deleteDelivery(id: string): Promise<void> {
    if (!this.db) return Promise.reject(new Error('Firebase is not configured.'));
    return remove(ref(this.db, 'deliveries/' + id));
  }

  getDeliveries(): DeliveryRequest[] {
    return this._deliveries$.getValue();
  }
}
