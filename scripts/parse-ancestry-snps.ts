/**
 * Match an AncestryDNA (or 23andMe) raw file against Gene_SNP_Risk_Table
 * and write only the genotypes that exist in both.
 *
 * Usage:
 *   npx tsx scripts/parse-ancestry-snps.ts \
 *     --dna data/lyfora-source/dna/SamplemanDNA.txt \
 *     --out data/parsed/snp_genotypes_male.json
 */
import fs from "fs";
import path from "path";

type RiskRow = { snpId: string };
type Genotype = {
  snpId: string;
  allele1: string;
  allele2: string;
  genotype: string;
};

const ROOT = path.join(__dirname, "..");
const RISK_PATH = path.join(ROOT, "data", "parsed", "gene_snp_risk.json");

function arg(flag: string, fallback?: string) {
  const i = process.argv.indexOf(flag);
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1]!;
  return fallback;
}

function baseSnpId(snpId: string) {
  return snpId.split("__")[0]!.toLowerCase();
}

function isValidAllele(a: string) {
  return a === "A" || a === "C" || a === "G" || a === "T";
}

/** Sort alleles for stable display; matching does not depend on order. */
function normalizeAlleles(a1: string, a2: string): [string, string] {
  const a = a1.toUpperCase();
  const b = a2.toUpperCase();
  return a <= b ? [a, b] : [b, a];
}

function loadWantedRsIds(): Set<string> {
  const rows = JSON.parse(fs.readFileSync(RISK_PATH, "utf8")) as RiskRow[];
  const want = new Set<string>();
  for (const r of rows) want.add(baseSnpId(r.snpId));
  return want;
}

function parseDnaFile(filePath: string, want: Set<string>) {
  const text = fs.readFileSync(filePath, "utf8");
  const found = new Map<string, Genotype>();
  let format: "ancestry" | "23andme" | "unknown" = "unknown";
  let skippedNoCall = 0;

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) {
      if (/AncestryDNA/i.test(line)) format = "ancestry";
      if (/23andMe/i.test(line)) format = "23andme";
      continue;
    }
    if (/^rsid\b/i.test(line) || /^allele1\b/i.test(line)) continue;

    const parts = line.split(/\t+/);
    if (parts.length < 4) continue;

    let rsid = "";
    let a1 = "";
    let a2 = "";

    // AncestryDNA: rsid chrom position allele1 allele2
    // 23andMe:     rsid chrom position genotype (e.g. AG)
    if (parts.length >= 5 && parts[3]!.length === 1 && parts[4]!.length === 1) {
      rsid = parts[0]!;
      a1 = parts[3]!;
      a2 = parts[4]!;
      if (format === "unknown") format = "ancestry";
    } else if (parts.length >= 4 && /^[ACGTDI0-]{1,2}$/i.test(parts[3]!)) {
      rsid = parts[0]!;
      const gt = parts[3]!.toUpperCase();
      if (gt.length === 2) {
        a1 = gt[0]!;
        a2 = gt[1]!;
      } else if (gt.length === 1) {
        a1 = gt;
        a2 = gt;
      }
      if (format === "unknown") format = "23andme";
    } else {
      continue;
    }

    const key = rsid.toLowerCase();
    if (!want.has(key)) continue;
    if (!isValidAllele(a1) || !isValidAllele(a2)) {
      skippedNoCall += 1;
      continue;
    }

    const [n1, n2] = normalizeAlleles(a1, a2);
    found.set(key, {
      snpId: rsid.startsWith("rs") ? rsid : key,
      allele1: n1,
      allele2: n2,
      genotype: `${n1}${n2}`,
    });
  }

  return { found, format, skippedNoCall };
}

function main() {
  const dnaRel =
    arg("--dna", "data/lyfora-source/dna/SamplemanDNA.txt")!;
  const outRel =
    arg("--out", "data/parsed/snp_genotypes_male.json")!;
  const dnaPath = path.isAbsolute(dnaRel) ? dnaRel : path.join(ROOT, dnaRel);
  const outPath = path.isAbsolute(outRel) ? outRel : path.join(ROOT, outRel);

  if (!fs.existsSync(dnaPath)) {
    console.error("DNA file not found:", dnaPath);
    process.exit(1);
  }

  const want = loadWantedRsIds();
  const { found, format, skippedNoCall } = parseDnaFile(dnaPath, want);
  const genotypes = [...found.values()].sort((a, b) =>
    a.snpId.localeCompare(b.snpId)
  );

  const payload = {
    source: path.basename(dnaPath),
    format,
    riskTableSnps: want.size,
    matched: genotypes.length,
    missing: want.size - genotypes.length,
    skippedNoCall,
    genotypes,
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + "\n");
  console.log(
    `Wrote ${genotypes.length}/${want.size} genotypes → ${path.relative(ROOT, outPath)}`
  );
  console.log(
    `  format=${format} skippedNoCall=${skippedNoCall} missing=${payload.missing}`
  );
}

main();
