const fileInput = document.querySelector("#file");
const fpsInput = document.querySelector("#fps");
const startBtn = document.querySelector("#start");
const pauseBtn = document.querySelector("#pause");
const fullscreenBtn = document.querySelector("#fullscreen");
const statusEl = document.querySelector("#status");
const canvas = document.querySelector("#txCanvas");
const stage = document.querySelector("#stage");

let frames = [];
let timer = null;
let cursor = 0;
let paused = false;

function setStatus(s) { statusEl.textContent = s; }

async function buildTransfer(file) {
  const fileBytes = new Uint8Array(await file.arrayBuffer());
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", fileBytes));
  const hex = [...digest].map(b=>b.toString(16).padStart(2,"0")).join("");
  const meta = new TextEncoder().encode(JSON.stringify({
    name: file.name,
    type: file.type || "application/octet-stream",
    size: file.size,
    sha256: hex
  }));
  const wrapped = new Uint8Array(4 + meta.length + fileBytes.length);
  new DataView(wrapped.buffer).setUint32(0, meta.length);
  wrapped.set(meta,4);
  wrapped.set(fileBytes,4+meta.length);

  const transferId = crypto.getRandomValues(new Uint32Array(1))[0];
  const payloadSize = OpticGrid.PAYLOAD;
  const total = Math.ceil(wrapped.length/payloadSize);
  if (total > 65535) throw new Error("File is too large for this prototype.");
  const result = [];
  for (let i=0;i<total;i++) {
    const payload = wrapped.slice(i*payloadSize, Math.min(wrapped.length,(i+1)*payloadSize));
    result.push(OpticGrid.packFrame({transferId,index:i,total,fileSize:wrapped.length,payload}));
  }
  return result;
}

function transmit() {
  if (!frames.length || paused) return;
  OpticGrid.drawFrame(canvas, frames[cursor]);
  setStatus(`Transmitting frame ${cursor+1} of ${frames.length} · ${Math.round((cursor+1)/frames.length*100)}% through loop · ${OpticGrid.PAYLOAD} bytes/frame`);
  cursor=(cursor+1)%frames.length;
}

startBtn.addEventListener("click", async () => {
  const file = fileInput.files[0];
  if (!file) return setStatus("Choose a file first.");
  clearInterval(timer);
  setStatus("Preparing file and SHA-256 hash…");
  try {
    frames = await buildTransfer(file);
    cursor = 0;
    paused = false;
    pauseBtn.disabled = false;
    pauseBtn.textContent = "Pause";
    const fps = Math.max(1,Math.min(20,Number(fpsInput.value)||8));
    transmit();
    timer=setInterval(transmit,1000/fps);
  } catch (e) {
    console.error(e);
    setStatus(e.message || "Could not prepare file.");
  }
});

pauseBtn.addEventListener("click", () => {
  paused=!paused;
  pauseBtn.textContent=paused?"Resume":"Pause";
  if (!paused) transmit();
});

fullscreenBtn.addEventListener("click", async () => {
  try { await stage.requestFullscreen(); } catch {}
});

OpticGrid.drawFrame(canvas, new Uint8Array([79,71,82,49,1]));
