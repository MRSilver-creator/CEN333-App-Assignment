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

    const apiKey = environment.geminiApiKey?.trim();
    if (!apiKey) {
      throw new Error('Gemini API key is missing. Set geminiApiKey in environments.ts.');
    }

    const prompt =
      `You are a professional courier dispatcher. Write exactly 2 sentences of courier-style ` +
      `delivery instructions for the following delivery:\n` +
      `- Customer: ${customerName}\n` +
      `- Package Weight: ${packageWeight} kg\n` +
      `- Priority: ${priority}\n` +
      `- Distance from warehouse: ${distanceKm} km\n` +
      `Be concise, specific, and professional. Include timing advice appropriate to the priority level.`;

    const url = `${this.endpoint}?key=${encodeURIComponent(apiKey)}`;

    const body = {
      contents: [{ parts: [{ text: prompt }] }]
    };

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    } catch (e) {
      throw new Error(`Network error calling Gemini API: ${e instanceof Error ? e.message : String(e)}`);
    }

    const data = await response.json().catch(() => null);

    // fetch does not throw on 4xx/5xx — surface the real API error instead of "no response".
    if (!response.ok) {
      const apiMessage = data?.error?.message;
      throw new Error(
        apiMessage
          ? `Gemini API error (${response.status}): ${apiMessage}`
          : `Gemini API error (${response.status} ${response.statusText}).`
      );
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== 'string' || !text.trim()) {
      throw new Error('Gemini API returned an unexpected response with no text content.');
    }

    return text;
  }
}
