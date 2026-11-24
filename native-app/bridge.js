import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource, CameraDirection } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

// APK assets are already installed locally; web-only service worker registrations
// must not intercept the native start page. Preserve all project databases.
window.SARCHNativeRegisterWorker = async () => {
  throw new Error('PWA registration skipped in native package');
};
if (Capacitor.isNativePlatform()) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(regs =>
      Promise.allSettled(regs.filter(r => {
        try {const u=new URL(r.scope); return u.origin===location.origin&&u.pathname.startsWith('/SEOB/');}
        catch (_) {return false;}
      }).map(r=>r.unregister()))
    ).catch(()=>{});
  }
  // Only normalize local app page links. Leave attachments and project file URLs untouched.
  document.addEventListener('click',e=>{
    const a=e.target?.closest?.('a[href]');
    if(!a||a.hasAttribute('download'))return;
    try {
      const u=new URL(a.getAttribute('href'),location.href);
      if(u.origin===location.origin&&/^\/SEOB\/(?:survey\/|drawing\/|schmidt\/|tilt\/)?$/.test(u.pathname)){
        u.pathname+='index.html';a.href=u.href;
      }
    } catch (_) {}
  },true);

  window.SARCHNative = { enabled: true };
  let busy = false;
  const photoInput = el => el instanceof HTMLInputElement &&
    el.type === 'file' && el.hasAttribute('capture') &&
    /image\//i.test(el.accept || '') && !el.disabled;
  function notice(message) {
    const box = document.createElement('div');
    box.setAttribute('role', 'status');
    Object.assign(box.style, {position:'fixed',bottom:'max(20px, env(safe-area-inset-bottom))',
      left:'50%',transform:'translateX(-50%)',zIndex:'2147483647',
      background:'#15344b',color:'white',padding:'10px 15px',borderRadius:'9px',
      font:'13px sans-serif',maxWidth:'90vw',pointerEvents:'none'});
    box.textContent=message;
    (document.body || document.documentElement).append(box);
    setTimeout(()=>box.remove(),4500);
  }
  async function capture(input) {
    if(busy) return;
    busy=true;
    let delivered=false;
    try {
      const photo=await Camera.getPhoto({
        source:CameraSource.Camera, direction:CameraDirection.Rear,
        resultType:CameraResultType.Uri, quality:100,
        allowEditing:false, correctOrientation:true, saveToGallery:true
      });
      if (!photo.webPath) throw Error('촬영 파일 경로가 없습니다.');
      const response=await fetch(photo.webPath);
      if(!response.ok) throw Error('촬영 파일 읽기 실패');
      const blob=await response.blob();
      if(!blob.size) throw Error('촬영 파일이 비어 있습니다.');
      const ext=photo.format==='png'?'png':'jpg';
      const file=new File([blob],'SARCH_'+new Date().toISOString().replace(/[:.]/g,'-')+'.'+ext,
        {type:ext==='png'?'image/png':'image/jpeg',lastModified:Date.now()});
      const dt=new DataTransfer();
      dt.items.add(file);
      input.files=dt.files;
      delivered=true;
      busy=false;
      input.dispatchEvent(new Event('input',{bubbles:true}));
      input.dispatchEvent(new Event('change',{bubbles:true}));
      if(photo.saved===true) notice('기기 앨범에 저장되었습니다.');
      else notice('앨범 저장이 확인되지 않았습니다. 사진 권한을 확인해 주세요.');
    } catch(e) {
      if(!/cancel|cancelled|canceled|취소/i.test(String(e?.message||e)))
        notice('촬영 실패: '+String(e?.message||e));
    } finally {
      if(!delivered) {
        busy=false;
        input.dispatchEvent(new Event('cancel',{bubbles:true}));
      }
    }
  }
  // Programmatic and physical clicks are both intercepted for camera-only inputs.
  const originalClick=HTMLInputElement.prototype.click;
  HTMLInputElement.prototype.click=function(...args) {
    if(photoInput(this)) { capture(this); return; }
    return originalClick.apply(this,args);
  };
  if(HTMLInputElement.prototype.showPicker) {
    const originalPicker=HTMLInputElement.prototype.showPicker;
    HTMLInputElement.prototype.showPicker=function(...args){
      if(photoInput(this)){capture(this);return;}
      return originalPicker.apply(this,args);
    };
  }
  document.addEventListener('click',e=>{
    if(photoInput(e.target)){e.preventDefault();e.stopImmediatePropagation();capture(e.target);}
  },true);

  // Existing export links use browser blob downloads. Native share makes the
  // exported file available to Files / My Files without exposing project data.
  const isExport=a=>a instanceof HTMLAnchorElement && a.hasAttribute('download') &&
    /^(blob:|data:)/i.test(a.href);
  let exporting=false;
  async function exportFile(a) {
    if(exporting) {notice('다른 파일을 처리 중입니다.');return;}
    exporting=true;
    try {
      const response=await fetch(a.href);
      if(!response.ok)throw Error('파일 읽기 실패');
      const blob=await response.blob();
      const data=await new Promise((resolve,reject)=>{
        const reader=new FileReader();
        reader.onload=()=>resolve(String(reader.result).split(',')[1]);
        reader.onerror=()=>reject(reader.error);
        reader.readAsDataURL(blob);
      });
      const name=(a.download||'SARCH_export').replace(/[\\/:*?"<>|]/g,'_').slice(0,180);
      const entry=await Filesystem.writeFile({path:'sarch-export/'+Date.now()+'/'+name,
        data,directory:Directory.Cache,recursive:true});
      await Share.share({files:[entry.uri],dialogTitle:'내보낸 파일 저장 / 공유'});
    } catch(e) {
      if(!/cancel|취소/i.test(String(e?.message||e))) notice('내보내기 실패: '+String(e?.message||e));
    } finally {exporting=false;}
  }
  const anchorClick=HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click=function(...args){
    if(isExport(this)){exportFile(this);return;}
    return anchorClick.apply(this,args);
  };
  document.addEventListener('click',e=>{
    const a=e.target?.closest?.('a[download]');
    if(isExport(a)){e.preventDefault();e.stopImmediatePropagation();exportFile(a);}
  },true);
}
