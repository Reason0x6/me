import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const output = join(root, 'dist/g-austin/browser');

test('the published clues decode to a real static destination and collectible', async () => {
  const homepage = await readFile(join(output, 'index.html'), 'utf8');
  const template = await readFile(join(root, 'src/app/app.component.html'), 'utf8');
  const hex = template.match(/class="cipher"[^>]*>([^<]+)</)?.[1];
  assert.ok(hex, 'The visible identity clue must exist');
  const key = Buffer.from(hex.replaceAll(' ', ''), 'hex');
  assert.equal(key.toString(), 'Reason0x6');
  const payload = homepage.match(/payload:\s*([A-Za-z0-9+/=]+)/)?.[1];
  assert.ok(payload, 'The source clue must survive production optimization');
  const path = Buffer.from(Buffer.from(payload, 'base64').map((byte, i) => byte ^ key[i % key.length])).toString();
  assert.match(path, /^\/signal\/[a-f0-9]+\/$/);
  const destination = join(output, path);
  const reward = await readFile(join(destination, 'index.html'), 'utf8');
  assert.match(reward, /ACKNOWLEDGED/);
  assert.match(reward, /You were expected\./);
  const download = reward.match(/href="([^"]+)" download=/)?.[1];
  assert.ok(download);
  assert.ok((await stat(join(destination, download))).size > 0);
  const artifact = await readFile(join(destination, download), 'utf8');
  assert.match(artifact, /ARTIFACT 006/);
  assert.match(artifact, /IS AN OPEN DOOR/);
  assert.match(reward, /noindex, nofollow/);
});

test('the calling card retains its public GitHub link and six completion marks', async () => {
  const template = await readFile(join(root, 'src/app/app.component.html'), 'utf8');
  assert.match(template, /href="https:\/\/github\.com\/Reason0x6"/);
  assert.match(template, /<button[^>]*class="artifact"/);
  assert.match(template, /aria-controls="source-hint"/);
  const marks = template.match(/<g class="marks"[^>]*>([\s\S]*?)<\/g>/)?.[1];
  assert.equal((marks?.match(/<circle/g) ?? []).length, 6);
  await assert.rejects(stat(join(output, 'archive')), { code: 'ENOENT' });
});
