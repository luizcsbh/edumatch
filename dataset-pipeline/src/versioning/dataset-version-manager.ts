import * as fs from 'fs';
import * as path from 'path';

export interface VersionInfo {
  version: string;
  createdAt: string;
  records?: number;
  manifestPath?: string;
}

export class DatasetVersionManager {
  private readonly manifestsDir: string;

  constructor(baseDir: string) {
    this.manifestsDir = path.join(baseDir, 'manifests');
  }

  getNextVersion(): string {
    const existing = this.getExistingVersions();
    if (existing.length === 0) {
      return '1.0.0';
    }

    const latest = existing[existing.length - 1];
    const parts = latest.split('.').map(Number);
    parts[2]++;
    return parts.join('.');
  }

  getExistingVersions(): string[] {
    if (!fs.existsSync(this.manifestsDir)) {
      return [];
    }

    const files = fs.readdirSync(this.manifestsDir);
    const versions = files
      .filter((f) => f.endsWith('.manifest.json'))
      .map((f) => {
        const match = f.match(/dataset-v(.+)\.manifest\.json/);
        return match ? match[1] : null;
      })
      .filter((v): v is string => v !== null)
      .sort((a, b) => {
        const aParts = a.split('.').map(Number);
        const bParts = b.split('.').map(Number);
        for (let i = 0; i < 3; i++) {
          if (aParts[i] !== bParts[i]) return aParts[i] - bParts[i];
        }
        return 0;
      });

    return versions;
  }

  versionExists(version: string): boolean {
    const manifestPath = path.join(this.manifestsDir, `dataset-v${version}.manifest.json`);
    return fs.existsSync(manifestPath);
  }

  getLatestVersion(): string | null {
    const versions = this.getExistingVersions();
    return versions.length > 0 ? versions[versions.length - 1] : null;
  }

  getManifest(version: string): Record<string, unknown> | null {
    const manifestPath = path.join(this.manifestsDir, `dataset-v${version}.manifest.json`);
    if (!fs.existsSync(manifestPath)) {
      return null;
    }
    return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  }

  listVersions(): VersionInfo[] {
    const versions = this.getExistingVersions();
    return versions.map((version) => {
      const manifest = this.getManifest(version);
      return {
        version,
        createdAt: (manifest?.created_at as string) || 'unknown',
        records: (manifest?.records as number) || 0,
        manifestPath: path.join(this.manifestsDir, `dataset-v${version}.manifest.json`),
      };
    });
  }
}
