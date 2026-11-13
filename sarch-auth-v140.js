/* S:ARCH v140: splash + account screen, optional secure Firebase Authentication.
   The application remains locally usable as a guest. This is NOT an access-control boundary:
   on public GitHub Pages, module URLs and local device data are not protected by a modal. */
(function(){
"use strict";
const config=window.SARCH_FIREBASE_CONFIG||null;
const configured=Boolean(config&&config.apiKey&&config.authDomain&&config.projectId&&config.appId);
const KEYS={guest:"sarch-v140-guest",intro:"sarch-v140-intro"};
const sessionGet=k=>{try{return sessionStorage.getItem(k)}catch(e){return null}};
const sessionSet=(k,v)=>{try{sessionStorage.setItem(k,v)}catch(e){}};
let auth=null,api=null,account=null,busy=false,mode="signin",previousFocus=null;
const E=id=>document.getElementById(id);
function status(msg){if(E("sarchAuthStatus"))E("sarchAuthStatus").textContent=msg||""}
function updateAccountButton(){
 const b=E("sarchAccountButton");if(!b)return;
 b.textContent=account?(account.email||"내 계정"):"로그인";
 b.title=account?"계정 정보 확인 또는 로그아웃":"로그인 또는 회원가입";
}
function setMode(next){
 mode=next;
 const joining=mode==="signup";
 E("sarchSignupTab").setAttribute("aria-selected",String(joining));
 E("sarchSigninTab").setAttribute("aria-selected",String(!joining));
 E("sarchSignupFields").hidden=!joining;
 E("sarchConfirmFields").hidden=!joining;
 E("sarchAuthSubmit").textContent=joining?"회원가입":"로그인";
 E("sarchResetPassword").hidden=joining;
 status(configured?"":"인증 서비스 연결 전입니다. 로그인·회원가입 화면을 미리 확인하고, 기존 방식으로 이용할 수 있습니다.");
}
function openLogin(){
 previousFocus=document.activeElement;
 E("sarchWelcome").hidden=false;document.body.classList.add("sarch-modal-open");
 E("sarchGuestButton").textContent=account?"닫기":"로그인 없이 계속 이용";
 E("sarchSignoutButton").hidden=!account;
 setMode("signin");setTimeout(()=>E("sarchAuthEmail").focus(),0);
}
function closeLogin(){
 E("sarchWelcome").hidden=true;document.body.classList.remove("sarch-modal-open");
 sessionSet(KEYS.guest,"1");
 if(previousFocus&&previousFocus.isConnected&&previousFocus.focus)previousFocus.focus();
}
function humanError(e){
 const code=(e&&e.code)||"";
 const m={
  "auth/email-already-in-use":"이미 가입된 이메일입니다.",
  "auth/invalid-email":"이메일 형식을 확인해 주세요.",
  "auth/weak-password":"비밀번호가 너무 짧거나 약합니다.",
  "auth/invalid-credential":"이메일이나 비밀번호가 올바르지 않습니다.",
  "auth/wrong-password":"이메일이나 비밀번호가 올바르지 않습니다.",
  "auth/user-not-found":"가입되지 않은 계정입니다.",
  "auth/too-many-requests":"시도가 많아 일시적으로 제한되었습니다. 잠시 후 다시 시도해 주세요.",
  "auth/network-request-failed":"네트워크 연결을 확인해 주세요.",
  "auth/unauthorized-domain":"Firebase 승인된 도메인에 현재 웹사이트 주소를 등록해 주세요."
 };
 return m[code]||"인증 처리에 실패했습니다. 연결 설정과 입력 내용을 확인해 주세요.";
}
async function beginAuth(){
 if(!configured)return;
 try{
  const [appMod,authMod]=await Promise.all([
    import("https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js")
  ]);
  const app=appMod.getApps().length?appMod.getApp():appMod.initializeApp(config);
  auth=authMod.getAuth(app);auth.languageCode="ko";api=authMod;
  authMod.onAuthStateChanged(auth,u=>{
   account=u&&u.emailVerified?u:null;
   updateAccountButton();
   if(account){closeLogin()}
  });
 }catch(e){status("Firebase 연결을 확인할 수 없습니다. 인터넷과 인증 설정을 확인해 주세요.")}
}
async function submit(ev){
 ev.preventDefault();if(busy)return;
 if(!auth||!api){status("로그인·회원가입을 실제로 사용하려면 Firebase 프로젝트를 먼저 연결해야 합니다. 현재는 화면 시연만 가능합니다.");return}
 const email=E("sarchAuthEmail").value.trim(),pass=E("sarchAuthPassword").value;
 if(!email||!pass){status("이메일과 비밀번호를 입력해 주세요.");return}
 if(mode==="signup"&&pass!==E("sarchAuthConfirm").value){status("비밀번호 확인이 일치하지 않습니다.");return}
 if(mode==="signup"&&pass.length<8){status("비밀번호는 8자 이상으로 입력해 주세요.");return}
 busy=true;E("sarchAuthSubmit").disabled=true;status("처리 중입니다…");
 try{
  if(mode==="signup"){
   const cred=await api.createUserWithEmailAndPassword(auth,email,pass);
   await api.sendEmailVerification(cred.user);
   await api.signOut(auth);
   setMode("signin");
   status("회원가입이 완료되었습니다. 이메일 인증 링크를 확인한 뒤 로그인해 주세요.");
  }else{
   const cred=await api.signInWithEmailAndPassword(auth,email,pass);
   await cred.user.reload();
   if(!cred.user.emailVerified){await api.signOut(auth);status("이메일 인증을 완료한 다음 로그인해 주세요.");return}
   account=cred.user;updateAccountButton();closeLogin();
  }
 }catch(e){status(humanError(e))}
 finally{busy=false;E("sarchAuthSubmit").disabled=false}
}
async function resetPassword(){
 if(!auth||!api){status("인증 서버 연결 전에는 비밀번호 재설정을 이용할 수 없습니다.");return}
 const email=E("sarchAuthEmail").value.trim();
 if(!email){status("이메일을 먼저 입력해 주세요.");return}
 try{await api.sendPasswordResetEmail(auth,email);status("비밀번호 재설정 메일을 전송했습니다.")}
 catch(e){status(humanError(e))}
}
async function signOut(){
 if(!auth||!api)return;
 try{await api.signOut(auth);account=null;updateAccountButton();status("로그아웃되었습니다.");}
 catch(e){status(humanError(e))}
}
function setup(){
 const nav=document.createElement("div");nav.className="sarch-account-menu";
 nav.innerHTML='<button id="sarchAccountButton" type="button" aria-haspopup="dialog">로그인</button>';
 document.querySelector(".header")?.appendChild(nav);
 const modal=document.createElement("section");modal.id="sarchWelcome";modal.hidden=true;
 modal.setAttribute("role","dialog");modal.setAttribute("aria-modal","true");modal.setAttribute("aria-label","S:ARCH 계정");
 modal.innerHTML='<div class="sarch-login-card">'+
 '<div class="sarch-login-brand"><img src="./sarch-icon.svg?v=140" alt=""><strong>S:ARCH</strong></div>'+
 '<p class="sarch-login-subtitle">건축 현장 업무 플랫폼<br>작업 자료를 안전하게 이어가는 계정 화면</p>'+
 '<div class="sarch-auth-tabs" role="tablist" aria-label="계정 선택"><button type="button" id="sarchSigninTab" aria-selected="true">로그인</button><button type="button" id="sarchSignupTab" aria-selected="false">회원가입</button></div>'+
 '<form id="sarchAuthForm" autocomplete="on">'+
 '<div class="sarch-signup-only" id="sarchSignupFields" hidden><label for="sarchDisplayName">이름 (선택)</label><input id="sarchDisplayName" type="text" autocomplete="name" placeholder="이름"></div>'+
 '<label for="sarchAuthEmail">이메일</label><input id="sarchAuthEmail" type="email" required autocomplete="email" placeholder="example@email.com">'+
 '<label for="sarchAuthPassword">비밀번호</label><input id="sarchAuthPassword" type="password" required minlength="8" autocomplete="current-password" placeholder="8자 이상">'+
 '<div class="sarch-signup-only" id="sarchConfirmFields" hidden><label for="sarchAuthConfirm">비밀번호 확인</label><input id="sarchAuthConfirm" type="password" minlength="8" autocomplete="new-password" placeholder="비밀번호를 다시 입력"></div>'+
 '<button class="sarch-auth-main" id="sarchAuthSubmit" type="submit">로그인</button></form>'+
 '<button type="button" class="sarch-auth-secondary" id="sarchResetPassword">비밀번호를 잊으셨나요?</button>'+
 '<p class="sarch-auth-status" id="sarchAuthStatus" role="status" aria-live="polite"></p>'+
 '<div class="sarch-auth-divider"></div><button type="button" class="sarch-auth-guest" id="sarchGuestButton">로그인 없이 계속 이용</button>'+
 '<button type="button" class="sarch-auth-secondary" id="sarchSignoutButton" hidden>로그아웃</button>'+
 '<p class="sarch-auth-note">현재 기기에 저장한 현장자료는 로그인만으로 클라우드에 옮겨지지 않습니다.<br>실제 계정 및 자료 동기화는 인증 서비스와 권한 설정이 필요합니다.</p>'+
 '</div>';
 document.body.appendChild(modal);
 E("sarchAccountButton").addEventListener("click",openLogin);
 E("sarchSigninTab").addEventListener("click",()=>setMode("signin"));
 E("sarchSignupTab").addEventListener("click",()=>setMode("signup"));
 E("sarchGuestButton").addEventListener("click",closeLogin);
 E("sarchAuthForm").addEventListener("submit",submit);
 E("sarchResetPassword").addEventListener("click",resetPassword);
 E("sarchSignoutButton").addEventListener("click",signOut);
 E("sarchWelcome").addEventListener("keydown",e=>{
  if(e.key==="Escape"){closeLogin();return}
  if(e.key==="Tab"){
   const focusables=Array.from(E("sarchWelcome").querySelectorAll("button:not([hidden]):not(:disabled),input:not([hidden])"))
    .filter(x=>x.offsetParent!==null);
   if(!focusables.length)return;
   const first=focusables[0],last=focusables[focusables.length-1];
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  }
 });
 beginAuth();updateAccountButton();
 if(!sessionGet(KEYS.intro)){
  sessionSet(KEYS.intro,"1");
  const splash=document.createElement("div");splash.id="sarchSplash";splash.setAttribute("aria-label","S:ARCH 시작 화면");
  splash.innerHTML='<div class="sarch-splash-inner"><img src="./sarch-icon.svg?v=140" alt=""><h1>S:ARCH</h1><p>ARCHITECTURE · FIELD PLATFORM</p></div>';
  document.body.appendChild(splash);
  setTimeout(()=>{
   splash.classList.add("sarch-hidden");
   setTimeout(()=>splash.remove(),340);
   if(!sessionGet(KEYS.guest)&&!account)openLogin();
  },1100);
 }else if(!sessionGet(KEYS.guest)){openLogin()}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setup,{once:true});else setup();
})();
