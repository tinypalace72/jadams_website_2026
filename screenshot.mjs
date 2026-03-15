import puppeteer from 'puppeteer';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const url   = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] ? `-${process.argv[3]}` : '';
const outDir = join(__dirname, 'temporary screenshots');

// Auto-increment screenshot number
let n = 1;
try {
  const files = await readdir(outDir);
  const nums  = files
    .map(f => f.match(/^screenshot-(\d+)/))
    .filter(Boolean)
    .map(m => parseInt(m[1], 10));
  if (nums.length) n = Math.max(...nums) + 1;
} catch { /* dir doesn't exist yet */ }

import { mkdir } from 'fs/promises';
await mkdir(outDir, { recursive: true });

const outPath = join(outDir, `screenshot-${n}${label}.png`);

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
await new Promise(r => setTimeout(r, 800)); // let animations settle
await page.screenshot({ path: outPath, type: 'png' });
await browser.close();
console.log(outPath);
