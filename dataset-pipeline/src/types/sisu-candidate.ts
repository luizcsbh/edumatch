export interface SisuCandidate {
  id: string;
  name: string;
  normalizedName: string;
  enemRegistration?: string;
  college?: string;
  course?: string;
  shift?: string;
  classification?: string;
  approvedShift?: string;
  modality?: string;
}
