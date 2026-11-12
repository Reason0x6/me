import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { webcrypto } from 'node:crypto';
const root = fileURLToPath(new URL('..', import.meta.url));
const output = join(root, 'dist/g-austin/browser');
const read = path => readFile(join(output, path), 'utf8');

test('the published six-transmission trail can be solved through its clues', async () => {
  const homepage = await read('index.html');
  const template = await readFile(join(root, 'src/app/app.component.html'), 'utf8');
  const hex = template.match(/class="cipher"[^>]*>([^<]+)</)[1];
  const key = Buffer.from(hex.replaceAll(' ', ''), 'hex');
  const payload = homepage.match(/payload:\s*([A-Za-z0-9+/=]+)/)[1];
  const first = Buffer.from(Buffer.from(payload, 'base64').map((b,i) => b ^ key[i % key.length])).toString();
  const received = await read(first + 'index.html');
  assert.match(received, /COLLECT ARTIFACT 001/);
  const continuation = received.match(/class="continue" href="([^"]+)"/)[1];
  const second = new URL(continuation, 'https://reason.test' + first).pathname;
  const interference = await read(second + 'index.html');
  const nextName = interference.match(/data-aligned>([^<]+)</)[1].toLowerCase();
  for (const plate of ['plate-1.svg','plate-2.svg']) {
    const svg = await read(second + plate);
    assert.match(svg, /<polyline/);
    assert.doesNotMatch(svg, /TRISTATE/);
  }
  const third = await read('/signal/' + nextName + '/index.html');
  const ternary = third.match(/data-ternary>([^<]+)</)[1];
  const fourthPath = ternary.split(' ').map(group => String.fromCharCode(parseInt(group.replaceAll('·','0').replaceAll('|','1').replaceAll('△','2'),3))).join('');
  const fourth = await read(fourthPath + 'index.html');
  const grid = fourth.match(/data-grid>([^<]+)</)[1].replace(/\s/g,'');
  const order = [0,1,2,3,7,11,15,14,13,12,8,4,5,6,10,9];
  const fifthPath = order.map(i=>grid[i]).join('');
  const fifth = await read(fifthPath + '/index.html');
  const carrier = fifth.match(/data-bacon>([^<]+)</)[1].replace(/\s/g,'');
  assert.equal(carrier.length,45);
  const bits = [...carrier].map(c=>c===c.toUpperCase()?'1':'0').join('');
  const sixthName = bits.match(/.{5}/g).map(group=>String.fromCharCode(65+parseInt(group,2))).join('').toLowerCase();
  const sixth = await read('/signal/'+sixthName+'/index.html');
  assert.match(sixth,/You carried the key here/);
  const fragments=[];
  for(let n=1;n<=5;n++){
    const artifact=await read('signal/artifacts/artifact-'+String(n).padStart(3,'0')+'.svg');
    fragments.push(artifact.match(/Fragment \d+: ([A-Z]+)\./)[1]);
  }
  fragments.push(template.match(/FRAGMENT 06 \/ ([A-Z]+)/)[1]);
  const envelope=JSON.parse(await read('/signal/'+sixthName+'/envelope.json'));
  const hash=await webcrypto.subtle.digest('SHA-256',new TextEncoder().encode(fragments.join(' ')));
  const aes=await webcrypto.subtle.importKey('raw',hash,{name:'AES-GCM'},false,['decrypt']);
  const plaintext=await webcrypto.subtle.decrypt({name:'AES-GCM',iv:Buffer.from(envelope.iv,'base64')},aes,Buffer.from(envelope.ciphertext,'base64'));
  const reward=JSON.parse(new TextDecoder().decode(plaintext));
  assert.equal(reward.message,'THERE WAS NEVER A LOCK.\nONLY A REASON TO LOOK.');
  assert.match(reward.artifact,/ARTIFACT 006/);
  const wrong=await webcrypto.subtle.importKey('raw',new Uint8Array(32),{name:'AES-GCM'},false,['decrypt']);
  await assert.rejects(webcrypto.subtle.decrypt({name:'AES-GCM',iv:Buffer.from(envelope.iv,'base64')},wrong,Buffer.from(envelope.ciphertext,'base64')));
  for(const path of [first,second,'/signal/'+nextName+'/',fourthPath,fifthPath+'/','/signal/'+sixthName+'/'])assert.match(await read(path+'index.html'),/noindex, nofollow/);
});

test('the calling card preserves GitHub, six independent marks, and archived-file exclusion', async()=>{
  const template=await readFile(join(root,'src/app/app.component.html'),'utf8');
  assert.match(template,/href="https:\/\/github.com\/Reason0x6"/);
  for(let n=1;n<=6;n++)assert.ok(template.includes('[class.lit]="solved().includes('+n+')"'));
  await assert.rejects(stat(join(output,'archive')),{code:'ENOENT'});
});
