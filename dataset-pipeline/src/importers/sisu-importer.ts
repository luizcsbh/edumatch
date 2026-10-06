import * as xlsx from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import { SisuCandidate } from '../types/sisu-candidate';
import { NameNormalizer } from '../normalizers/name-normalizer';

export class SisuImporter {
  private normalizer = new NameNormalizer();

  public import(filePath: string): SisuCandidate[] {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames.includes('Planilha1') ? 'Planilha1' : workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const data = xlsx.utils.sheet_to_json(sheet) as any[];

    return data.map((row) => {
      const rawName = String(row['nome_candidato'] || '').trim();
      const treatedName = row['nome_tratado'] ? String(row['nome_tratado']).trim() : rawName;

      return {
        id: uuidv4(),
        name: rawName,
        normalizedName: this.normalizer.normalize(treatedName || rawName),
        enemRegistration: row['incricao_enem'] ? String(row['incricao_enem']) : undefined,
        college: row['faculdade'] ? String(row['faculdade']) : undefined,
        course: row['curso'] ? String(row['curso']) : undefined,
        shift: row['turno'] ? String(row['turno']) : undefined,
        classification: row['classificacao'] ? String(row['classificacao']) : undefined,
        approvedShift: row['turno_aprovado'] ? String(row['turno_aprovado']) : undefined,
        modality: row['modalidade'] ? String(row['modalidade']) : undefined,
      };
    });
  }
}
