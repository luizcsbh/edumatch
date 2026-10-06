import * as xlsx from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import { Student } from '../types/student';
import { NameNormalizer } from '../normalizers/name-normalizer';

export class ChromosImporter {
  private normalizer = new NameNormalizer();

  public import(filePath: string): Student[] {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const data = xlsx.utils.sheet_to_json(sheet) as any[];

    return data.map((row, idx) => {
      const rawName = String(row['NOME DO ALUNO CHROMOS'] || '').trim();
      return {
        id: uuidv4(),
        name: rawName,
        normalizedName: this.normalizer.normalize(rawName),
        registration: row['MATRICULA'] ? String(row['MATRICULA']) : undefined,
        cpf: row['CPF'] ? String(row['CPF']) : undefined,
        email: row['EMAIL'] ? String(row['EMAIL']) : undefined,
        phone: row['CELULAR_ALUNO']
          ? String(row['CELULAR_ALUNO'])
          : row['TELEFONE_ALUNO']
          ? String(row['TELEFONE_ALUNO'])
          : undefined,
        course: row['CURSO'] ? String(row['CURSO']) : undefined,
        unit: row['UNIDADE'] ? String(row['UNIDADE']) : undefined,
        source: 'chromos',
        sourceId: row['MATRICULA'] ? String(row['MATRICULA']) : `chromos-${idx}`,
        raw: row,
      };
    });
  }
}
