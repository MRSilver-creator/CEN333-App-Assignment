import {
  Component, OnInit, OnDestroy, NgZone,
  ViewChild, ElementRef, AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { FirebaseService, DeliveryRequest } from '../../services/firebase.service';
import { GeminiService } from '../../services/gemini.service';
import { environment } from '../../../environments/environments';

import { MHeaderComponent }      from '../../m-framework/components/m-header/m-header.component';
import { MContainerComponent }   from '../../m-framework/components/m-container/m-container.component';
import { MFormUlaComponent }     from '../../m-framework/components/m-form-ula/m-form-ula.component';
import { MTableComponent }       from '../../m-framework/components/m-table/m-table.component';
import { MAhaComponent }         from '../../m-framework/components/m-aha/m-aha.component';
import { MSearchButtonComponent }from '../../m-framework/components/m-search-button/m-search-button.component';
import { MResultBoxComponent }   from '../../m-framework/components/m-result-box/m-result-box.component';
import { MDeleteButtonComponent } from '../../m-framework/components/m-delete-button/m-delete-button.component';

// Warehouse location constant
const WAREHOUSE = { lat: 24.4539, lng: 54.3773 }; // Abu Dhabi city centre

declare const google: any;

@Component({
  selector: 'app-dispatch',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MHeaderComponent, MContainerComponent, MFormUlaComponent,
    MTableComponent, MAhaComponent, MSearchButtonComponent, MResultBoxComponent,
    MDeleteButtonComponent
  ],
  templateUrl: './dispatch.component.html',
  styleUrl: './dispatch.component.css'
})
export class DispatchComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('mapEl') mapEl!: ElementRef<HTMLDivElement>;

  // ── Form fields ──────────────────────────────────────────────────────────
  customerName  = '';
  packageWeight = '';
  priority      = '';

  selectedLat: number | null = null;
  selectedLng: number | null = null;

  validationError = '';
  successMessage  = '';

  // ── Data ──────────────────────────────────────────────────────────────────
  deliveries: DeliveryRequest[] = [];
  filterTerm = '';
  priorityFilter = '';

  // ── Table display ─────────────────────────────────────────────────────────
  tableHeaders      = ['Customer', 'Weight (kg)', 'Priority', 'Distance (km)', 'AI Instruction'];
  columnsDisplayed  = ['customerName', 'packageWeight', 'priority', 'distance', 'aiInstruction'];

  // ── Map & markers ─────────────────────────────────────────────────────────
  private map!: any;
  private warehouseMarker!: any;
  private deliveryMarkers: Map<string, any> = new Map();
  private activeInfoWindow: any = null;
  private activePolyline: any = null;
  private clickMarker: any = null;
  private selectedDeliveryId: string | null = null;

  // ── AI state ──────────────────────────────────────────────────────────────
  generatingFor: string | null = null;   // id of delivery being processed

  private sub!: Subscription;

  // Warehouse constant exposed to template
  warehouse = WAREHOUSE;

  constructor(
    private fb: FirebaseService,
    private gemini: GeminiService,
    private zone: NgZone
  ) {}

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.sub = this.fb.deliveries$.subscribe(list => {
      this.zone.run(() => {
        this.deliveries = list;
        this.syncMarkers();
      });
    });
  }

  ngAfterViewInit(): void {
    this.loadGoogleMaps();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  // ── Google Maps ───────────────────────────────────────────────────────────

  private loadGoogleMaps(): void {
    if ((window as any).google?.maps) {
      this.initMap();
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}`;
    script.async = true;
    script.onload = () => this.zone.run(() => this.initMap());
    document.head.appendChild(script);
  }

  private initMap(): void {
    this.map = new google.maps.Map(this.mapEl.nativeElement, {
      center: WAREHOUSE,
      zoom: 12,
      mapTypeId: 'roadmap'
    });

    // Warehouse marker (blue pin)
    this.warehouseMarker = new google.maps.Marker({
      position: WAREHOUSE,
      map: this.map,
      title: 'Warehouse',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#1d4ed8',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3
      },
      zIndex: 1000
    });

    const warehouseIW = new google.maps.InfoWindow({
      content: '<div style="font-family:\'Trebuchet MS\',sans-serif;padding:6px 4px"><strong>🏭 Warehouse</strong><br><small>Lat: ' + WAREHOUSE.lat + ', Lng: ' + WAREHOUSE.lng + '</small></div>'
    });
    this.warehouseMarker.addListener('click', () => warehouseIW.open(this.map, this.warehouseMarker));

    // Map click — capture delivery location
    this.map.addListener('click', (event: any) => {
      this.zone.run(() => {
        this.selectedLat = event.latLng.lat();
        this.selectedLng = event.latLng.lng();

        // Show temp click marker
        if (this.clickMarker) this.clickMarker.setMap(null);
        this.clickMarker = new google.maps.Marker({
          position: { lat: this.selectedLat!, lng: this.selectedLng! },
          map: this.map,
          title: 'Selected location',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 9,
            fillColor: '#7c3aed',
            fillOpacity: 0.9,
            strokeColor: '#fff',
            strokeWeight: 2
          }
        });
      });
    });

    // Render any already-loaded deliveries
    this.syncMarkers();
  }

  // ── Markers ───────────────────────────────────────────────────────────────

  private markerColor(priority: string): string {
    if (priority === 'Urgent')  return '#ef4444';
    if (priority === 'Express') return '#f59e0b';
    return '#22c55e'; // Standard
  }

  private syncMarkers(): void {
    if (!this.map) return;

    const currentIds = new Set(this.deliveries.map(d => d.id!));

    // Remove stale markers (covers deletions surfaced by the onValue listener)
    for (const [id, marker] of this.deliveryMarkers) {
      if (!currentIds.has(id)) {
        marker.setMap(null);
        this.deliveryMarkers.delete(id);
        if (this.selectedDeliveryId === id) this.clearSelection();
      }
    }

    // Add new markers
    for (const d of this.deliveries) {
      if (!d.id || this.deliveryMarkers.has(d.id)) continue;

      const marker = new google.maps.Marker({
        position: { lat: d.lat, lng: d.lng },
        map: this.map,
        title: d.customerName,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: this.markerColor(d.priority),
          fillOpacity: 0.95,
          strokeColor: '#fff',
          strokeWeight: 2
        }
      });

      marker.addListener('click', () => this.zone.run(() => this.onMarkerClick(d, marker)));
      this.deliveryMarkers.set(d.id, marker);
    }
  }

  private onMarkerClick(delivery: DeliveryRequest, marker: any): void {
    // Close old info window
    if (this.activeInfoWindow) this.activeInfoWindow.close();

    // Draw route polyline
    if (this.activePolyline) this.activePolyline.setMap(null);
    this.activePolyline = new google.maps.Polyline({
      path: [WAREHOUSE, { lat: delivery.lat, lng: delivery.lng }],
      geodesic: true,
      strokeColor: '#7c3aed',
      strokeOpacity: 0.85,
      strokeWeight: 3,
      map: this.map
    });

    // Build info window content
    const iwId    = 'iw-' + delivery.id;
    const btnId   = 'btn-gen-' + delivery.id;
    const textId  = 'iw-text-' + delivery.id;
    const loadId  = 'iw-load-' + delivery.id;

    const instrHtml = delivery.aiInstruction
      ? `<p id="${textId}" style="color:#1e3a5f;margin-top:6px;font-size:.82rem;line-height:1.5">${delivery.aiInstruction}</p>`
      : `<p id="${textId}" style="color:#6b7280;margin-top:6px;font-size:.82rem;font-style:italic"></p>`;

    const content = `
      <div id="${iwId}" style="font-family:'Trebuchet MS',sans-serif;min-width:240px;max-width:300px">
        <h3 style="margin:0 0 6px;color:#0b1f3a;font-size:1rem">${delivery.customerName}</h3>
        <table style="width:100%;font-size:.82rem;border-collapse:collapse">
          <tr><td style="color:#6b7280;padding:2px 6px 2px 0">Weight</td><td><strong>${delivery.packageWeight} kg</strong></td></tr>
          <tr><td style="color:#6b7280;padding:2px 6px 2px 0">Priority</td><td><strong style="color:${this.markerColor(delivery.priority)}">${delivery.priority}</strong></td></tr>
          <tr><td style="color:#6b7280;padding:2px 6px 2px 0">Distance</td><td><strong>${delivery.distance.toFixed(2)} km</strong></td></tr>
        </table>
        ${instrHtml}
        <p id="${loadId}" style="color:#6b7280;font-size:.78rem;font-style:italic;display:none">Generating…</p>
        <button id="${btnId}"
          style="margin-top:10px;background:#f59e0b;color:#0b1f3a;border:none;
                 padding:.4rem 1rem;border-radius:20px;font-size:.8rem;font-weight:700;
                 cursor:pointer;font-family:'Trebuchet MS',sans-serif"
          ${delivery.aiInstruction ? 'disabled style="opacity:.5"' : ''}>
          ${delivery.aiInstruction ? '✅ Instructions Generated' : '🤖 Generate Instructions'}
        </button>
      </div>`;

    const iw = new google.maps.InfoWindow({ content });
    iw.open(this.map, marker);
    this.activeInfoWindow = iw;
    this.selectedDeliveryId = delivery.id ?? null;

    // Attach button handler after DOM renders
    google.maps.event.addListener(iw, 'domready', () => {
      const btn = document.getElementById(btnId);
      if (btn && !delivery.aiInstruction) {
        btn.addEventListener('click', () => {
          this.zone.run(() => this.generateInstruction(delivery, textId, btnId, loadId));
        });
      }
    });
  }

  private clearSelection(): void {
    if (this.activeInfoWindow) { this.activeInfoWindow.close(); this.activeInfoWindow = null; }
    if (this.activePolyline) { this.activePolyline.setMap(null); this.activePolyline = null; }
    this.selectedDeliveryId = null;
  }

  // ── Delete ──────────────────────────────────────────────────────────────

  async onDelete(id: string): Promise<void> {
    this.validationError = '';
    this.successMessage  = '';

    try {
      await this.fb.deleteDelivery(id);

      // If the deleted delivery was selected, clear its info window / polyline.
      if (this.selectedDeliveryId === id) this.clearSelection();

      // Remove its marker from the map and local store immediately.
      const marker = this.deliveryMarkers.get(id);
      if (marker) {
        marker.setMap(null);
        this.deliveryMarkers.delete(id);
      }
    } catch (e) {
      this.validationError = e instanceof Error ? e.message : 'Failed to delete delivery request.';
      console.error('deleteDelivery failed:', e);
    }
  }

  // ── AI Instruction ────────────────────────────────────────────────────────

  async generateInstruction(
    delivery: DeliveryRequest,
    textId: string,
    btnId: string,
    loadId: string
  ): Promise<void> {
    const btn  = document.getElementById(btnId)  as HTMLButtonElement | null;
    const load = document.getElementById(loadId);
    const text = document.getElementById(textId);

    if (btn)  { btn.disabled = true; btn.textContent = '⏳ Generating…'; }
    if (load) load.style.display = 'block';

    this.generatingFor = delivery.id ?? null;

    try {
      const instruction = await this.gemini.generateDeliveryInstruction(
        delivery.customerName,
        delivery.packageWeight,
        delivery.priority,
        delivery.distance
      );

      // Update Firebase
      if (delivery.id) {
        await this.fb.updateDelivery(delivery.id, { aiInstruction: instruction });
        delivery.aiInstruction = instruction;
      }

      if (text) text.textContent = instruction;
      if (btn)  { btn.textContent = '✅ Instructions Generated'; }
      if (load) load.style.display = 'none';

    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to generate instructions.';
      if (text) text.textContent = `⚠️ ${message}`;
      if (btn)  { btn.disabled = false; btn.textContent = '🤖 Generate Instructions'; }
      if (load) load.style.display = 'none';
      console.error('generateInstruction failed:', e);
    }

    this.generatingFor = null;
  }

  // ── Form Submission ───────────────────────────────────────────────────────

  async onSubmit(): Promise<void> {
    this.validationError = '';
    this.successMessage  = '';

    // Validation
    if (!this.customerName.trim()) {
      this.validationError = 'Customer name is required.'; return;
    }
    const weight = parseFloat(this.packageWeight);
    if (!this.packageWeight || isNaN(weight) || weight <= 0) {
      this.validationError = 'Package weight must be a positive number.'; return;
    }
    if (weight > 50) {
      this.validationError = 'Package weight cannot exceed 50 kg.'; return;
    }
    if (!this.priority) {
      this.validationError = 'Please select a priority level.'; return;
    }
    if (this.selectedLat === null || this.selectedLng === null) {
      this.validationError = 'Please click on the map to set a delivery location.'; return;
    }

    const dist = this.haversine(WAREHOUSE.lat, WAREHOUSE.lng, this.selectedLat, this.selectedLng);

    const delivery: Omit<DeliveryRequest, 'id'> = {
      customerName:  this.customerName.trim(),
      packageWeight: weight,
      priority:      this.priority as 'Standard' | 'Express' | 'Urgent',
      lat:           this.selectedLat,
      lng:           this.selectedLng,
      distance:      dist,
      timestamp:     new Date().toISOString(),
      status:        'pending'
    };

    try {
      await this.fb.saveDelivery(delivery);
      this.successMessage = `Delivery for ${delivery.customerName} saved successfully!`;
      this.resetForm();
    } catch (e) {
      this.validationError = e instanceof Error ? e.message : 'Failed to save delivery request.';
      console.error('saveDelivery failed:', e);
    }
  }

  private resetForm(): void {
    this.customerName  = '';
    this.packageWeight = '';
    this.priority      = '';
    this.selectedLat   = null;
    this.selectedLng   = null;
    if (this.clickMarker) { this.clickMarker.setMap(null); this.clickMarker = null; }
  }

  // ── Haversine Formula ────────────────────────────────────────────────────

  haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) ** 2 +
              Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
  }

  // ── Table helpers ─────────────────────────────────────────────────────────

  // Nearest pending delivery is computed from the FULL unfiltered list,
  // considering only deliveries with status === 'pending'.
  get nearestDeliveryId(): string | null {
    const pending = this.deliveries.filter(d => d.status === 'pending');
    if (!pending.length) return null;
    let nearest = pending[0];
    for (const d of pending) {
      if (d.distance < nearest.distance) nearest = d;
    }
    return nearest.id ?? null;
  }

  isNearest(delivery: DeliveryRequest): boolean {
    return delivery.id === this.nearestDeliveryId;
  }

  onSearch(term: string): void {
    this.filterTerm = term;
  }

  onPriorityFilter(priority: string): void {
    this.priorityFilter = priority;
  }

  // Deliveries after applying the Customer Name and Priority filters.
  get filteredDeliveries(): DeliveryRequest[] {
    const term = this.filterTerm.trim().toLowerCase();
    return this.deliveries.filter(d => {
      const matchesName = !term || d.customerName.toLowerCase().includes(term);
      const matchesPriority = !this.priorityFilter || d.priority === this.priorityFilter;
      return matchesName && matchesPriority;
    });
  }

  // Table display data (flatten aiInstruction for table)
  get tableData(): any[] {
    return this.filteredDeliveries.map(d => ({
      ...d,
      distance: d.distance.toFixed(2),
      aiInstruction: d.aiInstruction ?? '—'
    }));
  }
}
