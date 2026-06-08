import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environments';
import { GeminiAnalysis } from '../models/medication.model';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private readonly API_URL =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  constructor(private http: HttpClient) {}

  async analyzeMedication(
    imageBase64: string,
    mimeType: string
  ): Promise<GeminiAnalysis> {
    const prompt = `You are a pharmaceutical information assistant.
Analyze the provided medication image and return ONLY valid JSON matching this exact schema:
{
  "medicationName": string,
  "activeIngredient": string,
  "typicalAdultDosage": string,
  "commonUses": [string, string, string],
  "warnings": [string, string, string],
  "confidenceLevel": "high" | "medium" | "low"
}
If you cannot identify the medication confidently, set confidenceLevel to "low".
Return ONLY the JSON object, no markdown, no explanation.`;

    const body = {
      contents: [{
        parts: [
          { text: prompt },
          { inline_data: { mime_type: mimeType, data: imageBase64 } }
        ]
      }],
      generationConfig: { response_mime_type: 'application/json' }
    };

    const res: any = await firstValueFrom(
      this.http.post(`${this.API_URL}?key=${environment.geminiApiKey}`, body)
    );

    const raw = res?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
    return JSON.parse(raw) as GeminiAnalysis;
  }
}
