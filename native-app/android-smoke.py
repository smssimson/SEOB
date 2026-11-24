"""Real Android WebView startup and module navigation smoke test via ADB/CDP."""
import subprocess,time,json,urllib.request,websocket,re
PKG="com.sarch.fieldwork"
def adb(*args):return subprocess.check_output(["adb",*args],text=True).strip()
adb("shell","am","start","-W","-n",PKG+"/.MainActivity")
ws=None
deadline=time.monotonic()+75
while time.monotonic()<deadline:
    try:
        pid=adb("shell","pidof",PKG).split()[0]
        adb("forward","tcp:9222","localabstract:webview_devtools_remote_"+pid)
        pages=json.loads(urllib.request.urlopen("http://127.0.0.1:9222/json",timeout=3).read())
        page=next(p for p in pages if p.get("webSocketDebuggerUrl"))
        ws=websocket.create_connection(page["webSocketDebuggerUrl"],timeout=6,suppress_origin=True)
        break
    except Exception: time.sleep(2)
assert ws is not None,"Android WebView debugging endpoint not available"
seq=0
def evaljs(expr):
    global seq
    seq+=1
    ws.send(json.dumps({"id":seq,"method":"Runtime.evaluate","params":{"expression":expr,"returnByValue":True,"awaitPromise":True}}))
    while True:
        r=json.loads(ws.recv())
        if r.get("id")==seq:
            assert "error" not in r,r
            assert "exceptionDetails" not in r.get("result",{}),r
            return r["result"]["result"].get("value")
def wait(expr,seconds=35):
    end=time.monotonic()+seconds
    while time.monotonic()<end:
        try:
            if evaljs(expr):return
        except Exception:pass
        time.sleep(1)
    raise AssertionError("WebView failed: "+expr+" | "+str(evaljs("location.href")))
home="document.readyState!=='loading' && document.querySelectorAll('.module').length===4 && !!window.SARCHNative?.enabled"
wait(home)
assert "HOME_READY" in adb("logcat","-d","-s","SARCH:I"),"Native startup overlay did not clear"
print("Android home rendered with native bridge")
for module in ("survey","drawing","schmidt","tilt"):
    evaljs("document.querySelector('.module[href*="+json.dumps(module)+"]').click(); true")
    wait("location.pathname.includes('/"+module+"/') && document.readyState==='complete' && !!window.SARCHNative?.enabled && document.body.innerText.length>30")
    print("Android module ready:",module)
    evaljs("location.href='/SEOB/index.html'; true")
    wait(home)
assert "FATAL EXCEPTION" not in adb("logcat","-d","-s","AndroidRuntime:E")
adb("shell","am","force-stop",PKG)
ws.close()
print("Android emulator: home + all 4 modules passed")
