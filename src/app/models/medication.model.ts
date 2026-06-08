export interface GeminiAnalysis {
  medicationName: string;
  activeIngredient: string;
  typicalAdultDosage: string;
  commonUses: string[];
  warnings: string[];
  confidenceLevel: 'high' | 'medium' | 'low';
}

export interface Medication {
  id?: string;
  nickname?: string;
  analysis: GeminiAnalysis;
  imageBase64: string;
  imageMimeType: string;
  dateAdded: string;
}

export interface DoseLog {
  id?: string;
  medicationId: string;
  medicationName: string;
  dateTaken: string;   // ISO string
  notes?: string;
}
