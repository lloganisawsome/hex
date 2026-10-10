'use strict';
const fleet=[
 {id:'vortex_gt',name:'VORTEX GT',kind:'Grand touring coupe',description:'A redesigned front-engine GT with compound body surfaces, sculpted fenders, independently removable panels and an expanded library of freely placeable powertrains.'},
 {id:'metro',name:'METRO',kind:'Compact hatchback',description:'Short overhangs, a tall five-seat cabin and a liftgate. A transverse inline-four, its own transaxle and a torsion-beam rear chassis.'},
 {id:'stratus',name:'STRATUS',kind:'Executive sedan',description:'A four-door sedan with a separate trunk, longitudinal turbo-six and independent suspension. Its body, wheelbase and cabin are independently authored.'},
 {id:'summit',name:'SUMMIT',kind:'Full-size SUV',description:'Seven seats across three rows, a long cargo cabin and a ladder frame. Add a roof basket, storage drawer and utility accessories.'},
 {id:'ranger',name:'RANGER',kind:'Full-size pickup',description:'A crew cab and genuinely separate open bed. Its tailgate folds down, the optional tonneau covers the cargo space, and rear leaf springs support the utility chassis.'},
 {id:'trail',name:'TRAIL',kind:'Off-road SUV',description:'An upright cabin, round lamps, live axles and knobby tires. Inspect the roof rack, bull bar and independently removable spare attached to the swing gate.'}
];
const grid=document.getElementById('vehicle-grid'),dialog=document.getElementById('vehicle-dialog');let selected=fleet[0];
for(const [index,car] of fleet.entries()){
 const button=document.createElement('button');button.className='vehicle-card';button.setAttribute('aria-label',`Explore HEX ${car.name}`);
 button.innerHTML=`<img src="assets/${car.id}-three-quarter.jpg" alt="HEX ${car.name} in the workshop" loading="lazy"><div class="card-meta"><div><h3>HEX ${car.name}</h3><p>${String(index+1).padStart(2,'0')} / ${car.kind}</p></div><span class="arrow" aria-hidden="true">↗</span></div>`;
 button.addEventListener('click',()=>{selected=car;document.getElementById('dialog-name').textContent=`HEX ${car.name}`;document.getElementById('dialog-class').textContent=car.kind;document.getElementById('dialog-description').textContent=car.description;setView('three-quarter');dialog.showModal();});grid.append(button);
}
function setView(view){const image=document.getElementById('dialog-image');image.src=`assets/${selected.id}-${view}.jpg`;image.alt=`HEX ${selected.name} — ${view.replaceAll('-',' ')}`;for(const b of document.querySelectorAll('[data-view]'))b.setAttribute('aria-pressed',String(b.dataset.view===view));}
for(const b of document.querySelectorAll('[data-view]'))b.addEventListener('click',()=>setView(b.dataset.view));
document.getElementById('close-dialog').addEventListener('click',()=>dialog.close());document.getElementById('gallery-download').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}});
const status=document.getElementById('download-status'),downloadButtons=[...document.querySelectorAll('[data-download]')];
async function hash(bytes){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');}
let releaseUrl=null;
async function download(kind){
 const previous=document.getElementById('verified-download');if(previous)previous.remove();if(releaseUrl){URL.revokeObjectURL(releaseUrl);releaseUrl=null;}
 for(const button of downloadButtons)button.disabled=true;
 try{
  status.textContent='Preparing your download…';const response=await fetch('updates/latest.json',{cache:'no-store'});if(!response.ok)throw new Error('The release is unavailable. Please try again.');const release=await response.json(),artifact=release.artifacts[kind];if(!artifact?.chunks?.length)throw new Error('This release file is not available.');
  const buffers=[];let done=0;
  for(const chunk of artifact.chunks){if(!/^downloads\/[a-zA-Z0-9._-]+$/.test(chunk.path))throw new Error('Invalid release file.');const result=await fetch(chunk.path);if(!result.ok)throw new Error('Download interrupted. Please retry.');const data=await result.arrayBuffer();if(data.byteLength!==chunk.size||await hash(data)!==chunk.sha256)throw new Error('Download verification failed. Please retry.');buffers.push(data);done+=data.byteLength;status.textContent=`Downloading and verifying · ${Math.floor(done/artifact.size*100)}%`;}
  if(done!==artifact.size)throw new Error('Incomplete download. Please retry.');const blob=new Blob(buffers,{type:'application/zip'});if(await hash(await blob.arrayBuffer())!==artifact.sha256)throw new Error('Release checksum mismatch. Please retry.');releaseUrl=URL.createObjectURL(blob);const link=document.createElement('a');link.id='verified-download';link.className='source-link verified-download';link.href=releaseUrl;link.download=artifact.filename;link.textContent='Save verified ZIP ↓';status.after(link);status.textContent=`Verified v${release.version} · Click Save verified ZIP to download.`;link.focus();
 }catch(error){status.textContent=error.message;}finally{for(const button of downloadButtons)button.disabled=false;}
}
for(const button of downloadButtons)button.addEventListener('click',()=>download(button.dataset.download));
