"""Prepare native web assets without changing the public PWA or survey data."""
import json, pathlib, shutil, re, sys, zipfile, hashlib
MODULES=("survey","drawing","schmidt","tilt")
EXTS={".html",".htm",".js",".mjs",".css",".json",".webmanifest",".svg",".png",".jpg",".jpeg",".webp",".gif",".ico",".woff",".woff2",".ttf",".wasm",".xlsx",".xls",".pdf",".map",".txt",".avif",".otf",".bin",".data",".hwpx",".hwp",".docx"}
WEB_SCRIPTS={"smetric-offline-v60","sm-offline-registration-v40","sm64-version-check","smetric-v66-auto-update","smetric-update-v82","smetric-update-v95-silent","sarch-manual-update-v128","sarch-android-install-v155"}
def prepare(source, www):
    source=pathlib.Path(source).resolve(); www=pathlib.Path(www).resolve()
    www.mkdir(parents=True,exist_ok=True)
    app=www/"SEOB"; app.mkdir(exist_ok=True)
    paths=list(source.iterdir())
    for m in MODULES: paths.extend((source/m).rglob("*"))
    for p in paths:
        if not p.is_file() or p.suffix.lower() not in EXTS: continue
        rel=p.relative_to(source)
        if p.name=="native-bridge.js" or p.name.startswith("web-v") and p.suffix==".zip": continue
        dst=app/rel; dst.parent.mkdir(parents=True,exist_ok=True); shutil.copy2(p,dst)
    for page in app.rglob("*.html"):
        s=page.read_text(encoding="utf-8")
        if not re.search(r"<head(?:\s[^>]*)?>",s,re.I): continue
        # Suppress only isolated web-app startup/update scripts, not application logic.
        def script(m):
            attr=m.group(1)
            idm=re.search(r"""\bid=["']([^"']+)["']""",attr)
            if idm and idm.group(1) in WEB_SCRIPTS: return ""
            if "sarch-splash-v141.js" in attr: return ""
            return m.group(0).replace("navigator.serviceWorker.register(","window.SARCHNativeRegisterWorker(")
        s=re.sub(r"<script\b([^>]*)>[\s\S]*?</script>",script,s,flags=re.I)
        s=re.sub(r"""(href\s*=\s*["'])(\./|\.\./|\./(?:survey|drawing|schmidt|tilt)/)(["'])""",r"\1\2index.html\3",s,flags=re.I)
        s=s.replace('location.href="./"+type.key+"/?sarch_received="','location.href="./"+type.key+"/index.html?sarch_received="')
        s=re.sub(r"(<head(?:\s[^>]*)?>)",r'\1<script>window.SARCHNativeRegisterWorker=function(){return Promise.reject(new Error("PWA worker disabled in APK"))}</script><script defer src="/native-bridge.js"></script>',s,count=1,flags=re.I)
        if page==app/"schmidt"/"index.html":
            old="if(cameraStream&&cameraStream.active)return;"
            take="if(cameraBusy)return;let v=$('cameraVideo');"
            assert old in s and take in s, "Equipment native camera integration needs review"
            s=s.replace(old,"if(window.SARCHNative?.enabled){$('cameraHelp').textContent='촬영 버튼을 누르면 기기 카메라가 열리고 앨범에도 저장됩니다.';return;}"+old,1)
            s=s.replace(take,"if(cameraBusy)return;if(window.SARCHNative?.enabled){$('photoInput').value='';$('photoInput').click();return;}let v=$('cameraVideo');",1)
        if page==app/"index.html":
            s=re.sub(r'<button\b[^>]*\bid="sarchInstallShare155"[^>]*>[\s\S]*?</button>',"",s,count=1)
            s=re.sub(r'<button\b[^>]*\bid="sarchManualUpdate"[^>]*>[\s\S]*?</button>',"",s,count=1)
        page.write_text(s,encoding="utf-8")
    quick=app/"sarch-quick-nav-v139.js"
    q=re.sub(r'path:"(survey|drawing|schmidt|tilt)/"',r'path:"\1/index.html"',quick.read_text(encoding="utf-8"))
    quick.write_text(q,encoding="utf-8")
    # No redirect or appStartPath dependency. The root is the real home HTML.
    home=(app/"index.html").read_text(encoding="utf-8")
    home=re.sub(r"(<head(?:\s[^>]*)?>)",r'\1<base href="/SEOB/">',home,count=1,flags=re.I)
    (www/"index.html").write_text(home,encoding="utf-8")
    for m in MODULES:
        assert './'+m+'/index.html' in home,m
        assert 'href="../index.html"' in (app/m/"index.html").read_text(encoding="utf-8"),m
    assert '<base href="/SEOB/">' in home
    assert 'location.replace("/SEOB/index.html")' not in home
    (www/"native-error.html").write_text("""<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>S:ARCH</title><body style="background:#f2f5fa;color:#203750;font:16px sans-serif;padding:28px"><h2>S:ARCH 시작 오류</h2><p>앱 화면을 불러오지 못했습니다. 현장자료는 삭제하지 마세요.</p><a href="/index.html">다시 열기</a></body></html>""",encoding="utf-8")
    return int(json.loads((app/"version.json").read_text())["version"])
if __name__=="__main__":
    src,out,release=map(pathlib.Path,sys.argv[1:4])
    version=prepare(src,out)
    release.mkdir(parents=True,exist_ok=True)
    file=release/f"web-v{version}.zip"
    with zipfile.ZipFile(file,"w",zipfile.ZIP_DEFLATED,compresslevel=6) as z:
        for p in sorted(out.rglob("*")):
            if p.is_file(): z.write(p,p.relative_to(out).as_posix())
    size=file.stat().st_size
    assert 0<size<150*1024*1024
    (release/"manifest.json").write_text(json.dumps({"protocol":1,"version":version,"file":file.name,"size":size,"sha256":hashlib.sha256(file.read_bytes()).hexdigest()}),encoding="utf-8")
    print("Native web update:",version,size)
