import * as path from 'path';
import * as dotenv from 'dotenv';
import { ChromosImporter } from './importers/chromos-importer';
import { SisuImporter } from './importers/sisu-importer';
import { NameNormalizer } from './normalizers/name-normalizer';
import { CandidateBlocking } from './blocking/candidate-blocking';
import { PositivePairGenerator } from './generators/positive-pair-generator';
import { NegativePairGenerator } from './generators/negative-pair-generator';
import { HardNegativeGenerator } from './generators/hard-negative-generator';
import { FeatureGenerator } from './features/feature-generator';
import { DatasetValidator } from './validation/dataset-validator';
import { DatasetBalancer } from './balancing/dataset-balancer';
import { DatasetSplitter } from './splitting/dataset-splitter';
import { DatasetExporter } from './export/dataset-exporter';
import { DatasetVersionManager } from './versioning/dataset-version-manager';

dotenv.config();

async function main(): Promise<void> {
  console.log('========================================');
  console.log('EduMatch Dataset Pipeline');
  console.log('========================================\n');

  const baseDir = path.resolve(__dirname, '..');
  const dataDir = path.resolve(baseDir, '..');

  // Step 1: Import files
  console.log('[1/13] Importing Chromos file...');
  const chromosImporter = new ChromosImporter();
  const chromosPath = path.join(dataDir, 'lista-alunos-chromos-normalizada.csv');
  const students = chromosImporter.import(chromosPath);
  console.log(`  → Imported ${students.length} students from Chromos\n`);

  console.log('[2/13] Importing SISU file...');
  const sisuImporter = new SisuImporter();
  const sisuPath = path.join(dataDir, '8a-Chamada-da-Lista-de-Espera-SISU-2026.xlsx');
  const candidates = sisuImporter.import(sisuPath);
  console.log(`  → Imported ${candidates.length} candidates from SISU\n`);

  // Step 2: Normalize names
  console.log('[3/13] Normalizing names...');
  const normalizer = new NameNormalizer();
  students.forEach((s) => {
    s.normalizedName = normalizer.normalize(s.name);
  });
  candidates.forEach((c) => {
    c.normalizedName = normalizer.normalize(c.name);
  });
  console.log('  → Names normalized\n');

  // Step 3: Candidate Blocking
  console.log('[4/13] Running candidate blocking...');
  const blocking = new CandidateBlocking();
  const blocks = blocking.generateBlocks(students, candidates);
  const totalPairs = Array.from(blocks.values()).reduce((sum, b) => sum + b.length, 0);
  console.log(`  → Generated ${blocks.size} blocks with ${totalPairs} candidate pairs\n`);

  // Step 4: Generate pairs
  console.log('[5/13] Generating positive pairs...');
  const posGenerator = new PositivePairGenerator();
  const positivePairs = posGenerator.generate(students, candidates);
  console.log(`  → Generated ${positivePairs.length} positive pairs\n`);

  console.log('[6/13] Generating negative pairs...');
  const negGenerator = new NegativePairGenerator();
  const negativePairs = negGenerator.generate(students, candidates, blocks);
  console.log(`  → Generated ${negativePairs.length} negative pairs\n`);

  console.log('[7/13] Generating hard negative pairs...');
  const hardNegGenerator = new HardNegativeGenerator();
  const hardNegativePairs = hardNegGenerator.generate(students, candidates, blocks);
  console.log(`  → Generated ${hardNegativePairs.length} hard negative pairs\n`);

  // Step 5: Feature Engineering
  console.log('[8/13] Calculating features...');
  const featureGenerator = new FeatureGenerator();
  const allPairs = [...positivePairs, ...negativePairs, ...hardNegativePairs];
  const records = allPairs.map((pair) => featureGenerator.generate(pair));
  console.log(`  → Calculated features for ${records.length} records\n`);

  // Step 6: Validation
  console.log('[9/13] Validating dataset...');
  const validator = new DatasetValidator();
  const validationResult = validator.validate(records);
  console.log(`  → Validation: ${validationResult.valid ? 'PASS' : 'FAIL'}`);
  if (validationResult.errors.length > 0) {
    validationResult.errors.forEach((e) => console.log(`    ⚠ ${e}`));
  }
  if (validationResult.warnings.length > 0) {
    validationResult.warnings.forEach((w) => console.log(`    ℹ ${w}`));
  }
  console.log('');

  // Step 7: Balancing
  console.log('[10/13] Balancing dataset...');
  const balancer = new DatasetBalancer();
  const { records: balancedRecords, strategy } = balancer.autoBalance(records);
  const balanceReport = balancer.generateReport(balancedRecords, strategy);
  console.log(`  → Strategy: ${strategy}`);
  console.log(`  → Records after balancing: ${balancedRecords.length}\n`);

  // Step 8: Split
  console.log('[11/13] Splitting dataset...');
  const splitter = new DatasetSplitter();
  const splitConfig = splitter.getConfig();
  const { train, validation, test } = splitter.split(balancedRecords);
  console.log(`  → Train: ${train.length}, Validation: ${validation.length}, Test: ${test.length}\n`);

  // Step 9: Quality Report
  console.log('[12/13] Generating quality report...');
  const versionManager = new DatasetVersionManager(baseDir);
  const version = versionManager.getNextVersion();

  if (versionManager.versionExists(version)) {
    console.error(`  ✗ Version ${version} already exists. Aborting.`);
    process.exit(1);
  }

  const qualityReport = validator.generateQualityReport(version, balancedRecords, train, validation, test);
  console.log(validator.printQualityReport(qualityReport));
  console.log('');

  if (qualityReport.quality !== 'PASS') {
    console.error('  ✗ Quality check FAILED. Dataset will not be exported for training.');
    console.log('  → Dataset exported for review purposes only.\n');
  }

  // Step 10: Export
  console.log('[13/13] Exporting dataset...');
  const exporter = new DatasetExporter(baseDir);
  const manifest = exporter.exportAll(
    version,
    train,
    validation,
    test,
    balancedRecords,
    splitConfig.randomSeed,
  );
  console.log(`  → Exported dataset v${version}`);
  console.log(`  → Manifest: manifests/dataset-v${version}.manifest.json`);
  console.log(`  → Train: datasets/train/dataset-v${version}-train.csv`);
  console.log(`  → Validation: datasets/validation/dataset-v${version}-validation.csv`);
  console.log(`  → Test: datasets/test/dataset-v${version}-test.csv\n`);

  console.log('========================================');
  console.log('Pipeline completed successfully!');
  console.log(`Dataset version: ${version}`);
  console.log(`Total records: ${balancedRecords.length}`);
  console.log(`Quality: ${qualityReport.quality}`);
  console.log('========================================');
}

main().catch((error) => {
  console.error('Pipeline failed:', error);
  process.exit(1);
});
