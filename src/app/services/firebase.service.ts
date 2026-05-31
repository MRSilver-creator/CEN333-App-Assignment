import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue, update } from 'firebase/database';
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
  aiInstruction?: string;
}

@Injectable({ providedIn: 'root' })
export class FirebaseService {

  private db: any;

  private _deliveries$ = new BehaviorSubject<DeliveryRequest[]>([]);
  deliveries$: Observable<DeliveryRequest[]> = this._deliveries$.asObservable();

  constructor() {
    const app = initializeApp(environment.firebaseConfig);
    this.db = getDatabase(app);

    // Real-time listener
    onValue(ref(this.db, 'deliveries'), (snapshot) => {
      const data = snapshot.val();
      const list: DeliveryRequest[] = data
        ? Object.keys(data).map(k => ({ id: k, ...data[k] }))
        : [];
      this._deliveries$.next(list);
    });
  }

  saveDelivery(delivery: Omit<DeliveryRequest, 'id'>): Promise<string> {
    return push(ref(this.db, 'deliveries'), delivery).then(r => r.key ?? '');
  }

  updateDelivery(id: string, changes: Partial<DeliveryRequest>): Promise<void> {
    return update(ref(this.db, `deliveries/${id}`), changes as any);
  }

  getDeliveries(): DeliveryRequest[] {
    return this._deliveries$.getValue();
  }
}
