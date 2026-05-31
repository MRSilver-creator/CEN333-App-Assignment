import { Injectable } from '@angular/core';
import { environment } from '../../environments/environments';

@Injectable({ providedIn: 'root' })
export class GeminiService {

  private endpoint =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

  async generateDeliveryInstruction(
    customerName: string,
    packageWeight: number,
    priority: string,
    distanceKm: number
  ): Promise<string> {

    const prompt =
      `You are a professional courier dispatcher. Write exactly 2 sentences of courier-style ` +
      `delivery instructions for the following delivery:\n` +
      `- Customer: ${customerName}\n` +
      `- Package Weight: ${packageWeight} kg\n` +
      `- Priority: ${priority}\n` +
      `- Distance from warehouse: ${distanceKm} km\n` +
      `Be concise, specific, and professional. Include timing advice appropriate to the priority level.`;

    const url = `${this.endpoint}?key=${environment.geminiApiKey}`;

    const body = {
      contents: [{ parts: [{ text: prompt }] }]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '(no response)';
  }
}
