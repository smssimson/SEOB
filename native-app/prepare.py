"""Build a separate native S:ARCH package from the checked-out web source.
Run from repository root: python native-app/prepare.py
Then cd native-app/build; npm install; npm run bundle; npx cap add android.
For iOS use macOS, npx cap add ios, then python ../permissions.py ios.
"""
import json, pathlib, shutil, subprocess, re
root=pathlib.Path(__file__).resolve().parent.parent
out=root/"native-app"/"build"
out.mkdir(parents=True,exist_ok=True)
www=out/"www"
if www.exists(): shutil.rmtree(www)
app=www/"SEOB"; app.mkdir(parents=True)
modules={"survey","drawing","schmidt","tilt"}
exts={".html",".htm",".js",".mjs",".css",".json",".webmanifest",".svg",".png",".jpg",".jpeg",".webp",".gif",".ico",".woff",".woff2",".ttf",".wasm",".xlsx",".xls",".pdf",".map",".txt",".avif",".otf",".zip",".bin",".data",".hwpx",".hwp",".docx"}
files=subprocess.check_output(["git","ls-files","-z"],cwd=root).decode().split("\0")
count=0
for name in files:
    if not name: continue
    rel=pathlib.Path(name)
    if rel.parts[0] in modules or (len(rel.parts)==1 and rel.suffix.lower() in exts and rel.suffix.lower()!=".zip"):
        src=root/rel
        if not src.is_file() or src.suffix.lower() not in exts: continue
        dst=app/rel
        dst.parent.mkdir(parents=True,exist_ok=True)
        shutil.copy2(src,dst); count+=1
for name in ["index.html","survey/index.html","drawing/index.html","schmidt/index.html","tilt/index.html"]:
    assert (app/name).is_file(),name
# The app keeps the /SEOB/ URL path as the existing module navigation expects it.
(www/"index.html").write_text('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>S:ARCH</title><script>location.replace("./SEOB/")</script><a href="./SEOB/">S:ARCH 열기</a>',encoding="utf-8")
# The checked-out web release already contains the official brand and all artwork.
shutil.copy2(root/"native-app"/"brand"/"render-icons.cjs",out/"render-icons.cjs")
for page in app.rglob("*.html"):
    s=page.read_text(encoding="utf-8")
    if not re.search(r"<head(?:\s[^>]*)?>",s,re.I): continue
    # Load before application scripts so programmatic file-input clicks also work.
    s=re.sub(r"(<head(?:\s[^>]*)?>)",r'\1<script src="/native-bridge.js"></script>',s,count=1,flags=re.I)
    if page==app/"schmidt"/"index.html":
        old="if(cameraStream&&cameraStream.active)return;"
        old_take="if(cameraBusy)return;let v=$('cameraVideo');"
        assert old in s and old_take in s,"Equipment camera implementation changed; review native integration"
        s=s.replace(old,"if(window.SARCHNative?.enabled){$('cameraHelp').textContent='촬영 버튼을 누르면 기기 카메라가 열리고 앨범에도 저장됩니다.';return;}"+old,1)
        s=s.replace(old_take,"if(cameraBusy)return;if(window.SARCHNative?.enabled){$('photoInput').value='';$('photoInput').click();return;}let v=$('cameraVideo');",1)
    page.write_text(s,encoding="utf-8")
package={"name":"sarch-native","version":"1.0.205","private":True,"scripts":{"bundle":"node render-icons.cjs && esbuild bridge.js --bundle --format=iife --target=es2020 --outfile=www/native-bridge.js"},"dependencies":{"@capacitor/core":"^7.0.0","@capacitor/android":"^7.0.0","@capacitor/ios":"^7.0.0","@capacitor/camera":"^7.0.0","@capacitor/filesystem":"^7.0.0","@capacitor/share":"^7.0.0"},"devDependencies":{"@capacitor/cli":"^7.0.0","esbuild":"^0.25.0","@resvg/resvg-js":"^2.6.2"}}
(out/"package.json").write_text(json.dumps(package,indent=2),encoding="utf-8")
(out/"capacitor.config.json").write_text(json.dumps({"appId":"com.sarch.fieldwork","appName":"S:ARCH","webDir":"www","server":{"hostname":"localhost","androidScheme":"https"}},indent=2),encoding="utf-8")
(out/"bridge.js").write_text((root/"native-app"/"bridge.js").read_text(encoding="utf-8"),encoding="utf-8")
print(f"Prepared {count} bundled source files")
