"""Apply platform app permissions and new S:ARCH icon after cap add."""
import pathlib,sys,plistlib,xml.etree.ElementTree as ET
from PIL import Image
build=pathlib.Path(__file__).resolve().parent/"build"
platform=sys.argv[1]
icon=build/"www"/"SEOB"/"smetric-icon-1024.png"
if platform=="android":
    path=build/"android/app/src/main/AndroidManifest.xml"
    ns="http://schemas.android.com/apk/res/android"
    ET.register_namespace("android",ns)
    tree=ET.parse(path); root=tree.getroot()
    for perm,limit in [("android.permission.READ_EXTERNAL_STORAGE","32"),("android.permission.WRITE_EXTERNAL_STORAGE","29")]:
        if not any(x.get("{"+ns+"}name")==perm for x in root.findall("uses-permission")):
            el=ET.Element("uses-permission",{"{"+ns+"}name":perm,"{"+ns+"}maxSdkVersion":limit})
            root.insert(0,el)
    tree.write(path,encoding="utf-8",xml_declaration=True)
    # Same dark window background at the OS splash, Activity and WebView stages.
    styles=build/"android/app/src/main/res/values/styles.xml"
    st=ET.parse(styles)
    def item(style,name,value):
        el=next((x for x in style.findall("item") if x.get("name")==name),None)
        if el is None: el=ET.SubElement(style,"item",{"name":name})
        el.text=value
    for style in st.getroot().findall("style"):
        name=style.get("name")
        if name in ("AppTheme","AppTheme.NoActionBar","AppTheme.NoActionBarLaunch"):
            item(style,"android:windowBackground","#20252b")
            item(style,"android:statusBarColor","#20252b")
            item(style,"android:navigationBarColor","#20252b")
            item(style,"android:windowLightStatusBar","false")
            item(style,"android:windowLightNavigationBar","false")
        if name=="AppTheme.NoActionBarLaunch":
            item(style,"windowSplashScreenBackground","#20252b")
            item(style,"windowSplashScreenAnimatedIcon","@mipmap/ic_launcher")
            item(style,"postSplashScreenTheme","@style/AppTheme.NoActionBar")
    st.write(styles,encoding="utf-8",xml_declaration=True)
    if icon.exists():
        im=Image.open(icon).convert("RGBA")
        res=build/"android/app/src/main/res"
        for density,size in {"mdpi":48,"hdpi":72,"xhdpi":96,"xxhdpi":144,"xxxhdpi":192}.items():
            folder=res/("mipmap-"+density)
            folder.mkdir(exist_ok=True)
            for filename in ("ic_launcher.png","ic_launcher_round.png"):
                im.resize((size,size),Image.Resampling.LANCZOS).save(folder/filename)
        # Align Android's native start screen with the web splash.
        for splash in res.glob("drawable*/splash.png"):
            with Image.open(splash) as old: w,h=old.size
            bg=Image.new("RGB",(w,h),"#20252b")
            size=max(1,int(min(w,h)*.42))
            logo=im.resize((size,size),Image.Resampling.LANCZOS)
            bg.paste(logo,((w-size)//2,(h-size)//2),logo)
            bg.save(splash)
        # Replace the adaptive launcher with the generated raster icons.
        for x in (res/"mipmap-anydpi-v26").glob("ic_launcher*.xml"): x.unlink()
elif platform=="ios":
    path=build/"ios/App/App/Info.plist"
    with path.open("rb") as f: info=plistlib.load(f)
    info.update(NSCameraUsageDescription="현장조사 및 장비조사 사진을 촬영합니다.",
        NSPhotoLibraryUsageDescription="기기에 저장된 사진을 조사자료로 가져옵니다.",
        NSPhotoLibraryAddUsageDescription="촬영한 사진을 기기의 사진 앱에도 저장합니다.")
    with path.open("wb") as f: plistlib.dump(info,f)
    if icon.exists():
        folder=build/"ios/App/App/Assets.xcassets/AppIcon.appiconset"
        import json
        index=folder/"Contents.json"
        data=json.loads(index.read_text())
        for entry in data["images"]:
            name=entry.get("filename")
            if not name: continue
            size=int(float(entry.get("size","1024x1024").split("x")[0])*float(entry.get("scale","1x").rstrip("x")))
            img=Image.open(icon).convert("RGBA").resize((size,size),Image.Resampling.LANCZOS)
            bg=Image.new("RGB",img.size,"#20252b");bg.paste(img,mask=img.getchannel("A"));bg.save(folder/name)
        splash_dir=build/"ios/App/App/Assets.xcassets/Splash.imageset"
        for splash in splash_dir.glob("*.png"):
            with Image.open(splash) as old: w,h=old.size
            bg=Image.new("RGB",(w,h),"#20252b")
            size=max(1,int(min(w,h)*.38))
            logo=Image.open(icon).convert("RGBA").resize((size,size),Image.Resampling.LANCZOS)
            bg.paste(logo,((w-size)//2,(h-size)//2),logo)
            bg.save(splash)
else: raise ValueError(platform)
