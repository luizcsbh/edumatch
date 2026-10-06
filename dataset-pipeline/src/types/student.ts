export interface Student {
  id: string;
  name: string;
  normalizedName: string;
  registration?: string;
  cpf?: string;
  email?: string;
  phone?: string;
  course?: string;
  unit?: string;
  source: string;
  sourceId?: string;
  raw?: Record<string, any>;
}
