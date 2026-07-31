const video = document.querySelector("#video");
const canvas = document.querySelector("#sampleCanvas");
const cameraBtn = document.querySelector("#camera");
const resetBtn = document.querySelector("#reset");
const downloadBtn = document.querySelector("#download");
const progress = document.querySelector("#progress");
const progressText = document.querySelector("#progressText");
const statusEl = document.querySelector("#rxStatus");

let stream = null;
let running = false;
let currentId = null;
let total = 0;
let fileSize = 0;
let chunks = new Map();
let completed = null;
let completedMeta = null;
let lastAccepted = -1;

function status(s){ statusEl.textContent=s; }

function reset() {
  currentId=null; total=0; fileSize=0; chunks.clear();
  completed=null; completedMeta=null; lastAccepted=-1;
  progress.max=1; progress.value=0;
  progressText.textContent="0 frames";
  downloadBtn.disabled=true;
  status("Align the transmitted square inside the guide.");
}

async function startCamera() {
  stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: {ideal:"environment"},
      width: {ideal:1920},
      height: {ideal:1080},
      frameRate: {ideal:30}
    },
    audio:false
  });
  video.srcObject=stream;
  await video.play();
  running=true;
  cameraBtn.disabled=true;
  status("Camera active. Hold steady and align the square.");
  requestAnimationFrame(scan);
}

function scan() {
  if (!running) return;
  if (video.readyState>=2) {
    const vw=video.videoWidth, vh=video.videoHeight;
    const side=Math.floor(Math.min(vw,vh)*0.76);
    const sx=Math.floor((vw-side)/2), sy=Math.floor((vh-side)/2);
    const ctx=canvas.getContext("2d",{alpha:false,willReadFrequently:true});
    ctx.drawImage(video,sx,sy,side,side,0,0,canvas.width,canvas.height);
    const raw=OpticGrid.sampleFrame(canvas);
    const frame=OpticGrid.unpackFrame(raw);
    if (frame) accept(frame);
  }
  setTimeout(()=>requestAnimationFrame(scan), 18);
}

function accept(frame) {
  if (currentId===null || currentId!==frame.transferId) {
    currentId=frame.transferId;
    total=frame.total;
    fileSize=frame.fileSize;
    chunks.clear();
    completed=null;
    completedMeta=null;
    progress.max=total;
    status("Transfer detected.");
  }
  if (frame.total!==total || frame.fileSize!==fileSize) return;
  if (!chunks.has(frame.index)) chunks.set(frame.index, frame.payload);
  progress.value=chunks.size;
  progressText.textContent=`${chunks.size} / ${total} frames · ${Math.round(chunks.size/total*100)}%`;
  if (chunks.size===total && !completed) finish();
}

async function finish() {
  const all=new Uint8Array(fileSize);
  let offset=0;
  for (let i=0;i<total;i++) {
    const c=chunks.get(i);
    if (!c) return;
    all.set(c,offset); offset+=c.length;
  }
  const metaLen=new DataView(all.buffer,all.byteOffset,all.byteLength).getUint32(0);
  const meta=JSON.parse(new TextDecoder().decode(all.slice(4,4+metaLen)));
  const fileBytes=all.slice(4+metaLen);
  const digest=new Uint8Array(await crypto.subtle.digest("SHA-256",fileBytes));
  const hex=[...digest].map(b=>b.toString(16).padStart(2,"0")).join("");
  if (hex!==meta.sha256) {
    status("All frames received, but SHA-256 verification failed. Keep scanning or reset.");
    return;
  }
  completed=new Blob([fileBytes],{type:meta.type});
  completedMeta=meta;
  downloadBtn.disabled=false;
  status(`Complete and verified: ${meta.name}`);
}

downloadBtn.addEventListener("click",()=>{
  if (!completed) return;
  const a=document.createElement("a");
  a.href=URL.createObjectURL(completed);
  a.download=completedMeta.name || "received-file";
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),5000);
});

cameraBtn.addEventListener("click",()=>startCamera().catch(e=>{
  console.error(e); status("Camera could not start. Use HTTPS and allow camera permission.");
}));
resetBtn.addEventListener("click",reset);
reset();
