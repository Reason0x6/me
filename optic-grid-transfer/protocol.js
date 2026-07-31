(() => {
  const GRID = 72;
  const QUIET = 2;
  const FINDER = 9;

  function finderBit(x, y) {
    const ring = Math.min(x, y, FINDER - 1 - x, FINDER - 1 - y);
    if (ring === 0) return 1;
    if (ring === 1) return 0;
    if (ring === 2) return 1;
    if (ring >= 3 && ring <= 5) return 1;
    return 0;
  }

  function isFinderCell(x, y) {
    const left = x >= QUIET && x < QUIET + FINDER;
    const right = x >= GRID - QUIET - FINDER && x < GRID - QUIET;
    const top = y >= QUIET && y < QUIET + FINDER;
    const bottom = y >= GRID - QUIET - FINDER && y < GRID - QUIET;
    return (left || right) && (top || bottom);
  }

  function finderValue(x, y) {
    let lx = x, ly = y;
    if (x >= GRID - QUIET - FINDER) lx = GRID - QUIET - 1 - x;
    else lx = x - QUIET;
    if (y >= GRID - QUIET - FINDER) ly = GRID - QUIET - 1 - y;
    else ly = y - QUIET;
    return finderBit(lx, ly);
  }

  function reserved(x, y) {
    if (x < QUIET || y < QUIET || x >= GRID - QUIET || y >= GRID - QUIET) return true;
    if (isFinderCell(x, y)) return true;
    if (y === QUIET + FINDER || x === QUIET + FINDER) return true;
    return false;
  }

  const dataCoords = [];
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      if (!reserved(x, y)) dataCoords.push([x, y]);
    }
  }

  const maxBytes = Math.floor(dataCoords.length / 8);

  function crc32(bytes) {
    let crc = 0xffffffff;
    for (const b of bytes) {
      crc ^= b;
      for (let i = 0; i < 8; i++) {
        crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function writeU16(a, o, v) { a[o]=v>>>8; a[o+1]=v&255; }
  function writeU32(a, o, v) { a[o]=v>>>24; a[o+1]=(v>>>16)&255; a[o+2]=(v>>>8)&255; a[o+3]=v&255; }
  function readU16(a, o) { return (a[o]<<8)|a[o+1]; }
  function readU32(a, o) { return ((a[o]*0x1000000)+((a[o+1]<<16)|(a[o+2]<<8)|a[o+3]))>>>0; }

  const HEADER = 25;
  const PAYLOAD = maxBytes - HEADER;

  function packFrame({transferId, index, total, fileSize, payload}) {
    const out = new Uint8Array(HEADER + payload.length);
    out.set([79,71,82,49], 0); // OGR1
    out[4] = 1;
    writeU32(out, 5, transferId);
    writeU16(out, 9, index);
    writeU16(out, 11, total);
    writeU32(out, 13, fileSize);
    writeU16(out, 17, payload.length);
    out.set(payload, HEADER);
    writeU32(out, 19, crc32(out.slice(0, 19)));
    writeU16(out, 23, crc32(payload) & 0xffff);
    return out;
  }

  function unpackFrame(bytes) {
    if (bytes.length < HEADER) return null;
    if (bytes[0]!==79 || bytes[1]!==71 || bytes[2]!==82 || bytes[3]!==49 || bytes[4]!==1) return null;
    const headerCrc = readU32(bytes, 19);
    if (crc32(bytes.slice(0,19)) !== headerCrc) return null;
    const len = readU16(bytes,17);
    if (HEADER + len > bytes.length) return null;
    const payload = bytes.slice(HEADER, HEADER+len);
    if ((crc32(payload)&0xffff) !== readU16(bytes,23)) return null;
    return {
      transferId: readU32(bytes,5),
      index: readU16(bytes,9),
      total: readU16(bytes,11),
      fileSize: readU32(bytes,13),
      payload
    };
  }

  function bytesToBits(bytes) {
    const bits = [];
    for (const b of bytes) for (let i=7;i>=0;i--) bits.push((b>>i)&1);
    return bits;
  }

  function bitsToBytes(bits) {
    const out = new Uint8Array(Math.floor(bits.length/8));
    for (let i=0;i<out.length;i++) {
      let b=0;
      for (let j=0;j<8;j++) b=(b<<1)|bits[i*8+j];
      out[i]=b;
    }
    return out;
  }

  function drawFrame(canvas, frameBytes) {
    const ctx = canvas.getContext("2d", {alpha:false});
    const size = canvas.width;
    const cell = size / GRID;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0,0,size,size);
    const bits = bytesToBits(frameBytes);
    let p = 0;
    for (let y=0;y<GRID;y++) {
      for (let x=0;x<GRID;x++) {
        let bit = 0;
        if (isFinderCell(x,y)) bit = finderValue(x,y);
        else if (y === QUIET + FINDER && x > QUIET + FINDER && x < GRID-QUIET) bit = x % 2;
        else if (x === QUIET + FINDER && y > QUIET + FINDER && y < GRID-QUIET) bit = y % 2;
        else if (!reserved(x,y)) bit = p < bits.length ? bits[p++] : ((x*17+y*31)&1);
        if (bit) {
          ctx.fillStyle = "#000";
          ctx.fillRect(Math.floor(x*cell), Math.floor(y*cell), Math.ceil(cell), Math.ceil(cell));
        }
      }
    }
  }

  function sampleFrame(canvas) {
    const ctx = canvas.getContext("2d", {willReadFrequently:true});
    const {width,height}=canvas;
    const img = ctx.getImageData(0,0,width,height).data;
    const bits=[];
    for (const [x,y] of dataCoords) {
      const sx = Math.min(width-1, Math.floor((x+.5)*width/GRID));
      const sy = Math.min(height-1, Math.floor((y+.5)*height/GRID));
      const i=(sy*width+sx)*4;
      const lum=(img[i]*299+img[i+1]*587+img[i+2]*114)/1000;
      bits.push(lum<128?1:0);
    }
    return bitsToBytes(bits);
  }

  window.OpticGrid = {GRID, maxBytes, PAYLOAD, crc32, packFrame, unpackFrame, drawFrame, sampleFrame};
})();
