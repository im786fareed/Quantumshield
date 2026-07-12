// Run with: npx tsx tests/deep-file-scan.test.ts
/* Deeper file-scan fixtures: malware vectors hidden INSIDE files — executables
   in archives, VBA macros in Office docs, PDF active content — plus guards
   that benign archives/PDFs do not false-positive. No real malware. */
import { analyzeFileStatic } from '../src/lib/security/fileAnalysis';
import { computeVerdict } from '../src/lib/security/verdict';
import JSZip from 'jszip';

let pass = 0, fail = 0;
function has(label: string, ids: string[], want: string) {
  if (ids.includes(want)) { pass++; console.log(`✓ ${label} → ${want}`); }
  else { fail++; console.log(`✗ ${label}: expected ${want}, got [${ids.join(',')}]`); }
}
function none(label: string, count: number) {
  if (count === 0) { pass++; console.log(`✓ ${label} → no signals`); }
  else { fail++; console.log(`✗ ${label}: expected 0 signals, got ${count}`); }
}
const fileOf = (name: string, bytes: Uint8Array) => new File([bytes.slice().buffer as ArrayBuffer], name);
async function zipFile(name: string, files: Record<string, Uint8Array | string>): Promise<File> {
  const z = new JSZip();
  for (const [n, c] of Object.entries(files)) z.file(n, c);
  return fileOf(name, await z.generateAsync({ type: 'uint8array' }));
}

async function run() {
  const exeInZip = await analyzeFileStatic(await zipFile('invoice.zip', { 'invoice.pdf': 'x', 'update.exe': new Uint8Array([0x4d, 0x5a, 1]) }));
  has('ZIP hides .exe', exeInZip.signals.map(s => s.id), 'file.executableInArchive');

  const macro = await analyzeFileStatic(await zipFile('report.docx', { '[Content_Types].xml': '<xml/>', 'word/vbaProject.bin': new Uint8Array([1, 2, 3]) }));
  has('Office VBA macro', macro.signals.map(s => s.id), 'file.officeMacro');

  const pdfActive = await analyzeFileStatic(fileOf('statement.pdf', new TextEncoder().encode('%PDF-1.7\n<</OpenAction<</S/JavaScript/JS(x)>>>>\n%%EOF')));
  has('PDF active content', pdfActive.signals.map(s => s.id), 'file.pdfActiveContent');

  const nested = await analyzeFileStatic(await zipFile('bundle.zip', { 'a.txt': 'x', 'inner.zip': new Uint8Array([0x50, 0x4b, 3, 4]) }));
  has('nested archive', nested.signals.map(s => s.id), 'file.nestedArchive');

  const cleanZip = await analyzeFileStatic(await zipFile('photos.zip', { 'a.txt': 'hello world notes here', 'b.csv': '1,2,3' }));
  none('benign ZIP', cleanZip.signals.length);

  const cleanPdf = await analyzeFileStatic(fileOf('clean.pdf', new TextEncoder().encode('%PDF-1.4\n<</Type/Catalog>>\n%%EOF')));
  none('benign PDF', cleanPdf.signals.length);

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}
run().catch((e) => { console.error('FAIL', e); process.exit(1); });
