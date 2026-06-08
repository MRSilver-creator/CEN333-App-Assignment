import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environments';
import { GeminiAnalysis } from '../models/medication.model';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private readonly API_URL =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

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

    let res: any;
    try {
      res = await firstValueFrom(
        this.http.post(`${this.API_URL}?key=${environment.geminiApiKey}`, body)
      );
    } catch (err) {
      const httpErr = err as HttpErrorResponse;
      console.error('Gemini HTTP error:', httpErr.status, httpErr.statusText);
      console.error('Gemini error body:', httpErr.error);
      throw new Error(
        `Gemini API error ${httpErr.status}: ${httpErr.error?.error?.message ?? httpErr.statusText}`
      );
    }

    // Strip markdown code fences if Gemini wraps the JSON anyway
    let raw: string = res?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
    raw = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

    try {
      return JSON.parse(raw) as GeminiAnalysis;
    } catch {
      console.error('Gemini JSON parse error. Raw response:', raw);
      throw new Error('Gemini returned invalid JSON. See console for details.');
    }
  }
}
