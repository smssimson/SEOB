/* S:ARCH v141 — startup splash only. Unrestricted access; no authentication. */
(function(){
"use strict";
var key="sarch-splash-v141-seen";
function seen(){try{return sessionStorage.getItem(key)==="1"}catch(e){return false}}
function remember(){try{sessionStorage.setItem(key,"1")}catch(e){}}
function start(){
 if(seen()||document.getElementById("sarchSplash141"))return;
 remember();
 var box=document.createElement("div");box.id="sarchSplash141";box.setAttribute("aria-hidden","true");
 box.innerHTML='<div class="sarch-splash-content"><img src="./sarch-icon.svg?v=139" alt=""><strong>S:ARCH</strong><p>ARCHITECTURE · FIELD PLATFORM</p></div>';
 document.body.appendChild(box);
 window.setTimeout(function(){box.classList.add("sarch-splash-hide");window.setTimeout(function(){box.remove()},330)},850);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();
