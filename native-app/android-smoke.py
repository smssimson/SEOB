"""Real Android WebView startup and navigation, reconnecting CDP after each page."""
import subprocess,time,json,urllib.request,websocket
PKG="com.sarch.fieldwork"
def adb(*args):return subprocess.check_output(["adb",*args],text=True,timeout=20).strip()
def connect():
    pid=adb("shell","pidof",PKG).split()[0]
    adb("forward","tcp:9222","localabstract:webview_devtools_remote_"+pid)
    pages=json.loads(urllib.request.urlopen("http://127.0.0.1:9222/json",timeout=5).read())
    page=next(p for p in pages if p.get("webSocketDebuggerUrl"))
    return websocket.create_connection(page["webSocketDebuggerUrl"],timeout=12,suppress_origin=True)
seq=0
def evaljs(expr):
    global seq
    seq+=1
    ws=connect()
    try:
        ws.send(json.dumps({"id":seq,"method":"Runtime.evaluate","params":{"expression":expr,"returnByValue":True,"awaitPromise":False}}))
        while True:
            r=json.loads(ws.recv())
            if r.get("id")==seq:
                assert "error" not in r,r
                assert "exceptionDetails" not in r.get("result",{}),r
                return r["result"]["result"].get("value")
    finally:ws.close()
def wait(expr,seconds=95):
    end=time.monotonic()+seconds
    last=None
    while time.monotonic()<end:
        try:
            if evaljs(expr):return
        except Exception as e:last=e
        time.sleep(1.5)
    raise AssertionError("WebView failed: "+expr+" | "+str(last))
def navigate(expr):
    # Let CDP return before navigation tears down its execution context.
    assert evaljs("(()=>{setTimeout(()=>{"+expr+"},500);return true})()")
    time.sleep(2)
adb("logcat","-c")
adb("shell","am","start","-W","-n",PKG+"/.MainActivity")
home="document.readyState!=='loading' && document.querySelectorAll('.module').length===4 && !!window.SARCHNative?.enabled && document.querySelector('.module').getBoundingClientRect().width>0"
wait(home)
assert "HOME_READY" in adb("logcat","-d","-s","SARCH:I"),"Native startup overlay did not clear"
print("Android home rendered with native bridge",flush=True)
for module in ("survey","drawing","schmidt","tilt"):
    selector=".module[href*='"+module+"']"
    assert evaljs("!!document.querySelector("+json.dumps(selector)+")")
    navigate("document.querySelector("+json.dumps(selector)+").click()")
    wait("location.pathname.includes('/"+module+"/') && document.readyState!=='loading' && !!window.SARCHNative?.enabled && document.body.innerText.length>30")
    print("Android module ready:",module,flush=True)
    navigate("location.href='/SEOB/index.html'")
    wait(home)
assert "FATAL EXCEPTION" not in adb("logcat","-d","-s","AndroidRuntime:E")
adb("shell","am","force-stop",PKG)
print("Android emulator: home + all 4 modules passed",flush=True)
