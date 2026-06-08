import { Component, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GeminiService } from '../../services/gemini.service';
import { FirebaseService } from '../../services/firebase.service';
import { GeminiAnalysis } from '../../models/medication.model';

@Component({
  selector: 'app-identify',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './identify.component.html',
  styleUrl: './identify.component.css',
})
export class IdentifyComponent implements OnDestroy {
  @ViewChild('videoEl') videoEl!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasEl') canvasEl!: ElementRef<HTMLCanvasElement>;

  cameraActive   = false;
  capturedImage: string | null = null;
  capturedMime   = 'image/jpeg';
  previewUrl: string | null = null;

  nickname       = '';
  analyzing      = false;
  analysisResult: GeminiAnalysis | null = null;
  errorMsg: string | null = null;
  saving         = false;
  saveSuccess    = false;

  private stream: MediaStream | null = null;

  constructor(
    private gemini: GeminiService,
    private firebase: FirebaseService,
    private router: Router
  ) {}

  async startCamera() {
    this.errorMsg = null;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.cameraActive = true;
      setTimeout(() => {
        this.videoEl.nativeElement.srcObject = this.stream;
      }, 50);
    } catch {
      this.errorMsg = 'Could not access camera. Please allow camera permissions.';
    }
  }

  takePhoto() {
    const video  = this.videoEl.nativeElement;
    const canvas = this.canvasEl.nativeElement;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')!.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg');
    this.capturedImage = dataUrl.split(',')[1];
    this.capturedMime  = 'image/jpeg';
    this.previewUrl    = dataUrl;
    this.analysisResult = null;
    this.stopCamera();
  }

  stopCamera() {
    this.stream?.getTracks().forEach(t => t.stop());
    this.stream       = null;
    this.cameraActive = false;
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.capturedMime  = file.type || 'image/jpeg';
      this.capturedImage = dataUrl.split(',')[1];
      this.previewUrl    = dataUrl;
      this.analysisResult = null;
      this.errorMsg = null;
    };
    reader.readAsDataURL(file);
  }

  async analyze() {
    if (!this.capturedImage) {
      this.errorMsg = 'Please capture or upload an image first.';
      return;
    }
    this.analyzing      = true;
    this.errorMsg       = null;
    this.analysisResult = null;
    try {
      const result = await this.gemini.analyzeMedication(this.capturedImage, this.capturedMime);
      if (result.confidenceLevel === 'low') {
        this.errorMsg = 'Low confidence — please retake the photo with better lighting or proceed manually.';
      }
      this.analysisResult = result;
    } catch {
      this.errorMsg = 'Gemini analysis failed. Check your API key or try again.';
    } finally {
      this.analyzing = false;
    }
  }

  async saveToLibrary() {
    if (!this.analysisResult || !this.capturedImage) return;
    this.saving = true;
    try {
      await this.firebase.saveMedication({
        nickname:      this.nickname.trim() || undefined,
        analysis:      this.analysisResult,
        imageBase64:   this.capturedImage,
        imageMimeType: this.capturedMime,
        dateAdded:     new Date().toISOString(),
      });
      this.saveSuccess = true;
      setTimeout(() => this.router.navigate(['/library']), 1400);
    } catch {
      this.errorMsg = 'Failed to save. Check your Firebase config.';
    } finally {
      this.saving = false;
    }
  }

  reset() {
    this.capturedImage  = null;
    this.previewUrl     = null;
    this.analysisResult = null;
    this.errorMsg       = null;
    this.nickname       = '';
    this.saveSuccess    = false;
  }

  ngOnDestroy() { this.stopCamera(); }
}
