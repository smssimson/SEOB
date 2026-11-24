"""Build S:ARCH native package with a direct root entry document."""
import json,pathlib,shutil
from prepare_web import prepare
root=pathlib.Path(__file__).resolve().parent.parent
out=root/"native-app"/"build"
out.mkdir(parents=True,exist_ok=True)
www=out/"www"
if www.exists(): shutil.rmtree(www)
prepare(root,www)
shutil.copy2(root/"native-app"/"brand"/"render-icons.cjs",out/"render-icons.cjs")
package={"name":"sarch-native","version":"1.0.228","private":True,"scripts":{"bundle":"node render-icons.cjs && esbuild bridge.js --bundle --format=iife --target=es2020 --outfile=www/native-bridge.js"},"dependencies":{"@capacitor/core":"^7.3.0","@capacitor/android":"^7.3.0","@capacitor/ios":"^7.0.0","@capacitor/camera":"^7.0.0","@capacitor/filesystem":"^7.0.0","@capacitor/share":"^7.0.0"},"devDependencies":{"@capacitor/cli":"^7.3.0","esbuild":"^0.25.0","@resvg/resvg-js":"^2.6.2"}}
(out/"package.json").write_text(json.dumps(package,indent=2),encoding="utf-8")
(out/"capacitor.config.json").write_text(json.dumps({"appId":"com.sarch.fieldwork","appName":"S:ARCH","webDir":"www","server":{"hostname":"localhost","androidScheme":"https","html5mode":False,"errorPath":"native-error.html"}},indent=2),encoding="utf-8")
(out/"bridge.js").write_text((root/"native-app"/"bridge.js").read_text(encoding="utf-8"),encoding="utf-8")
print("Prepared native web application")
