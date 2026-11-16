/* S:ARCH v145 — compact tablet controls. Reparents the original camera buttons
   (not clones) after all module startup handlers have registered. No storage writes. */
(function(){
"use strict";
const match=location.pathname.match(/\/(survey|drawing|schmidt|tilt)(?:\/|$)/);
if(!match)return;
const mod=match[1];
function align(){
 document.body.classList.add("sarch-shell-v145");
 if(mod==="drawing")return; // drawing has the v144 four-tab camera slot
 const survey=mod==="survey";
 const panel=survey?document.querySelector(".sm-survey-tools"):document.querySelector(".sm43-tool-panel");
 const tabs=panel?.querySelector(survey?".sm-mode-tabs":".sm43-tabs");
 const camera=survey?document.getElementById("cameraBtn"):document.getElementById("sm52FixedCamera");
 if(!panel||!tabs||!camera)return;
 if(camera.parentElement!==tabs)tabs.appendChild(camera);
 camera.classList.add("sarch-camera-tab-v145");
 camera.setAttribute("title","현장 카메라");
}
// Original survey, equipment and tilt scripts register their events during DOMContentLoaded.
if(document.readyState==="complete")setTimeout(align,90);
else window.addEventListener("load",()=>setTimeout(align,90),{once:true});
})();
