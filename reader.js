(function() {
    console.log("[slime-reader] reader.js executing.");

    if (document.getElementById("sr-backdrop")) {
        console.log("[slime-reader] Already open.");
        return;
    }

    // Hide Seanime layout
    var _layout = document.querySelector(".UI-AppLayout__root");
    if (_layout) _layout.style.display = "none";

    var BASE = "https://tensurafan.github.io";

    var VOLUMES = [
        { id:"v6",    name:"Volume 6",                 path:"/ln/v6.html",    emoji:"🟢", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"interlude",label:"Interlude"},{id:"chapter-4",label:"Chapter 4"},{id:"chapter-5",label:"Chapter 5"},{id:"chapter-6",label:"Chapter 6"},{id:"epilogue",label:"Epilogue"},{id:"afterword",label:"Afterword"}]},
        { id:"v7",    name:"Volume 7",                 path:"/ln/v7.html",    emoji:"⚔️", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"chapter-4",label:"Chapter 4"},{id:"chapter-5",label:"Chapter 5"},{id:"chapter-6",label:"Chapter 6"},{id:"chapter-7",label:"Chapter 7"},{id:"chapter-8",label:"Chapter 8"},{id:"epilogue",label:"Epilogue"},{id:"afterword",label:"Afterword"}]},
        { id:"v8",    name:"Volume 8",                 path:"/ln/v8.html",    emoji:"🌀", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"chapter-4",label:"Chapter 4"},{id:"chapter-5",label:"Chapter 5"},{id:"chapter-6",label:"Chapter 6"},{id:"chapter-7",label:"Chapter 7"},{id:"epilogue",label:"Epilogue"},{id:"afterword",label:"Afterword"}]},
        { id:"v8_5",  name:"Volume 8.5 Side Stories",  path:"/ln/v8.5.html",  emoji:"📖", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"chapter-4",label:"Chapter 4"},{id:"chapter-5",label:"Chapter 5"},{id:"epilogue",label:"Epilogue"}]},
        { id:"v9",    name:"Volume 9",                 path:"/ln/v9.html",    emoji:"🌿", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"chapter-4",label:"Chapter 4"},{id:"chapter-5",label:"Chapter 5"},{id:"epilogue",label:"Epilogue"},{id:"afterword",label:"Afterword"}]},
        { id:"v10",   name:"Volume 10",                path:"/ln/v10.html",   emoji:"💥", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"chapter-4",label:"Chapter 4"},{id:"chapter-5",label:"Chapter 5"},{id:"chapter-6",label:"Chapter 6"},{id:"chapter-7",label:"Chapter 7"},{id:"chapter-8",label:"Chapter 8"},{id:"epilogue",label:"Epilogue"},{id:"afterword",label:"Afterword"}]},
        { id:"v11",   name:"Volume 11",                path:"/ln/v11.html",   emoji:"👑", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"chapter-4",label:"Chapter 4"},{id:"chapter-5",label:"Chapter 5"},{id:"epilogue",label:"Epilogue"},{id:"afterword",label:"Afterword"}]},
        { id:"v12",   name:"Volume 12",                path:"/ln/v12.html",   emoji:"🔒", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"chapter-4",label:"Chapter 4"},{id:"chapter-5",label:"Chapter 5"},{id:"epilogue",label:"Epilogue"},{id:"afterword",label:"Afterword"}]},
        { id:"v13",   name:"Volume 13",                path:"/ln/v13.html",   emoji:"🗺️", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"chapter-4",label:"Chapter 4"},{id:"chapter-5",label:"Chapter 5"},{id:"chapter-6",label:"Chapter 6"},{id:"epilogue",label:"Epilogue"},{id:"afterword",label:"Afterword"}]},
        { id:"v13_5", name:"Volume 13.5 Side Stories", path:"/ln/v13.5.html", emoji:"📖", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"epilogue",label:"Epilogue"}]},
        { id:"v14",   name:"Volume 14",                path:"/ln/v14.html",   emoji:"🌪️", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"chapter-4",label:"Chapter 4"},{id:"chapter-5",label:"Chapter 5"},{id:"epilogue",label:"Epilogue"},{id:"afterword",label:"Afterword"}]},
        { id:"v15",   name:"Volume 15",                path:"/ln/v15.html",   emoji:"🏚️", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"chapter-4",label:"Chapter 4"},{id:"epilogue",label:"Epilogue"},{id:"afterword",label:"Afterword"}]},
        { id:"v16",   name:"Volume 16 (Edited MTL)",   path:"/ln/v16.html",   emoji:"🌌", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"chapter-4",label:"Chapter 4"},{id:"epilogue",label:"Epilogue"}]},
        { id:"v17",   name:"Volume 17 (Edited MTL)",   path:"/ln/v17.html",   emoji:"🐉", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"chapter-4",label:"Chapter 4"},{id:"epilogue",label:"Epilogue"}]},
        { id:"v18",   name:"Volume 18 (Edited MTL)",   path:"/ln/v18.html",   emoji:"⚡", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"chapter-4",label:"Chapter 4"},{id:"epilogue",label:"Epilogue"}]},
        { id:"v19",   name:"Volume 19 (Edited MTL)",   path:"/ln/v19.html",   emoji:"🌟", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"epilogue",label:"Epilogue"}]},
        { id:"v20",   name:"Volume 20 (Edited MTL)",   path:"/ln/v20.html",   emoji:"✨", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"epilogue",label:"Epilogue"}]},
        { id:"b1",    name:"Special Booklets 1-4",     path:"/ln/b1.html",    emoji:"📚", chapters:[{id:"booklet-1",label:"Booklet 1"},{id:"booklet-2",label:"Booklet 2"},{id:"booklet-3",label:"Booklet 3"},{id:"booklet-4",label:"Booklet 4"}]},
        { id:"b5",    name:"Special Booklets 5-8",     path:"/ln/b5.html",    emoji:"📚", chapters:[{id:"booklet-5",label:"Booklet 5"},{id:"booklet-6",label:"Booklet 6"},{id:"booklet-7",label:"Booklet 7"},{id:"booklet-8",label:"Booklet 8"}]}
    ];

    // Progress
    var Prog = {
        get: function(id) { try { return JSON.parse(localStorage.getItem("sr4_"+id))||null; } catch(e){return null;} },
        set: function(id,pct) { localStorage.setItem("sr4_"+id, JSON.stringify({scrollPct:pct})); }
    };

    // Settings
    var DEF = {theme:"dark",fontSize:18,lineHeight:1.85,fontFamily:"Georgia,serif",maxWidth:760};
    var _s = null;
    function gs() { if(!_s){try{_s=Object.assign({},DEF,JSON.parse(localStorage.getItem("sr4_s")||"{}"));}catch(e){_s=Object.assign({},DEF);}} return _s; }
    function ss() { try{localStorage.setItem("sr4_s",JSON.stringify(_s));}catch(e){} }
    function applyS() {
        var s=gs(), T={dark:{bg:"#0d1117",txt:"#e2e8f0"},sepia:{bg:"#f4ecd8",txt:"#5b4636"},light:{bg:"#f5f5f5",txt:"#1a1a1a"}};
        var t=T[s.theme]||T.dark;
        var rc=document.getElementById("sr-content"), rw=document.getElementById("sr-cw");
        if(rc){rc.style.fontSize=s.fontSize+"px";rc.style.lineHeight=s.lineHeight;rc.style.fontFamily=s.fontFamily;rc.style.maxWidth=s.maxWidth+"px";rc.style.color=t.txt;}
        if(rw) rw.style.background=t.bg;
        document.querySelectorAll(".sr-tbtn").forEach(function(b){b.style.outline=b.dataset.theme===s.theme?"2px solid #7ee8a2":"none";});
        var e;
        e=document.getElementById("sr-fsl"); if(e) e.textContent=s.fontSize;
        e=document.getElementById("sr-lhl"); if(e) e.textContent=s.lineHeight;
        e=document.getElementById("sr-mwl"); if(e) e.textContent=s.maxWidth;
        e=document.getElementById("sr-fs"); if(e) e.value=s.fontSize;
        e=document.getElementById("sr-lh"); if(e) e.value=s.lineHeight;
        e=document.getElementById("sr-mw"); if(e) e.value=s.maxWidth;
        e=document.getElementById("sr-ffs"); if(e) e.value=s.fontFamily;
    }

    // Volume cache
    var _vc = {};
    function fetchVol(vol) {
        if(_vc[vol.id]) return Promise.resolve(_vc[vol.id]);
        return fetch(BASE+vol.path,{mode:"cors",credentials:"omit"})
            .then(function(r){if(!r.ok) throw new Error("HTTP "+r.status+" for "+BASE+vol.path); return r.text();})
            .then(function(html){
                html=html.replace(/\{:[^|]*:\}\|([^|]*)\|/g,"$1");
                html=html.replace(/\{[^}|]*\}\|([^|]*)\|/g,"$1");
                html=html.replace(/src="\/ln\//g,'src="'+BASE+'/ln/');
                _vc[vol.id]=html; return html;
            });
    }

    function extractChapter(fullHtml, anchorId, nextId) {
        var tmp=document.createElement("div"); tmp.innerHTML=fullHtml;
        var start=tmp.querySelector("#"+anchorId);
        if(!start) return "<p style='color:#f0883e;padding:20px'>Anchor <code>#"+anchorId+"</code> not found in this volume. Try scrolling or another chapter.</p>";
        var stop=nextId?tmp.querySelector("#"+nextId):null;
        var out=document.createElement("div"), node=start;
        while(node){var next=node.nextSibling; if(stop&&node===stop)break; out.appendChild(node.cloneNode(true)); node=next;}
        return out.innerHTML;
    }

    function getPct(){var w=document.getElementById("sr-cw");if(!w||w.scrollHeight<=w.clientHeight)return 0;return Math.round(w.scrollTop/(w.scrollHeight-w.clientHeight)*1000)/10;}
    function restorePct(pct){if(!pct||pct<=0)return;var w=document.getElementById("sr-cw");if(!w)return;setTimeout(function(){w.scrollTop=(pct/100)*(w.scrollHeight-w.clientHeight);},200);}

    var _page="home", _vol=null, _chIdx=0, _timer=null;
    function stopSave(){if(_timer){clearInterval(_timer);_timer=null;}}
    function startSave(id){stopSave();_timer=setInterval(function(){Prog.set(id,getPct());},3000);}

    // Inject CSS
    var style=document.createElement("style"); style.id="sr-style";
    style.textContent="#sr-backdrop{position:fixed;inset:0;z-index:99999;background:#0d1117;display:flex;flex-direction:column;font-family:-apple-system,'Segoe UI',system-ui,sans-serif;color:#e2e8f0;}"
    +"#sr-bar{display:flex;align-items:center;gap:10px;padding:10px 18px;background:#161b22;border-bottom:1px solid #30363d;flex-shrink:0;min-height:48px;}"
    +".sr-logo{font-weight:700;font-size:.95rem;color:#7ee8a2;white-space:nowrap;}"
    +"#sr-close-btn,#sr-back-btn,#sr-cfg-btn{background:transparent;border:1px solid #30363d;color:#8b949e;padding:5px 10px;border-radius:6px;cursor:pointer;font-size:.82rem;}"
    +"#sr-close-btn:hover,#sr-back-btn:hover,#sr-cfg-btn:hover{background:#21262d;color:#e2e8f0;}"
    +"#sr-back-btn{display:none;}#sr-back-btn.v{display:inline-block;}"
    +"#sr-cfg-btn{display:none;}#sr-cfg-btn.v{display:inline-block;}"
    +"#sr-bar-title{flex:1;font-size:.82rem;color:#8b949e;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;}"
    +"#sr-close-btn{margin-left:auto;}"
    +"#sr-main{flex:1;overflow-y:auto;overflow-x:hidden;}"
    +"#sr-home{padding:24px 20px;max-width:1050px;margin:0 auto;}"
    +".sr-hero{background:linear-gradient(135deg,#1a2332,#0d2137);border:1px solid #30363d;border-radius:12px;padding:28px 36px;margin-bottom:28px;display:flex;align-items:center;gap:24px;}"
    +".sr-hero-ico{font-size:48px;flex-shrink:0;}.sr-hero h1{font-size:1.35rem;font-weight:800;color:#7ee8a2;margin:0 0 5px;}.sr-hero p{color:#8b949e;font-size:.85rem;line-height:1.55;margin:0;}"
    +".sr-cont{background:#161b22;border:1px solid #7ee8a28c;border-radius:9px;padding:13px 16px;margin-bottom:24px;display:flex;align-items:center;gap:13px;cursor:pointer;}"
    +".sr-cont:hover{border-color:#7ee8a2;}.sr-cont-info{flex:1;}.sr-cont-tag{font-size:.65rem;color:#7ee8a2;text-transform:uppercase;letter-spacing:.08em;font-weight:700;margin-bottom:2px;}"
    +".sr-cont-title{font-weight:700;color:#c9d1d9;font-size:.95rem;}.sr-cont-sub{color:#8b949e;font-size:.78rem;margin-top:2px;}"
    +".sr-cont-btn{background:#7ee8a2;color:#0d1117;border:none;padding:6px 14px;border-radius:6px;font-weight:700;cursor:pointer;font-size:.8rem;white-space:nowrap;}"
    +".sr-sec{font-size:.88rem;font-weight:700;color:#c9d1d9;margin:0 0 13px;display:flex;align-items:center;gap:8px;}"
    +".sr-sec::after{content:'';flex:1;height:1px;background:#21262d;}"
    +".sr-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(138px,1fr));gap:13px;margin-bottom:32px;}"
    +".sr-card{background:#161b22;border:1px solid #21262d;border-radius:9px;overflow:hidden;cursor:pointer;transition:all .18s;position:relative;}"
    +".sr-card:hover{border-color:#7ee8a2;transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.4);}"
    +".sr-cover{width:100%;aspect-ratio:2/3;background:linear-gradient(135deg,#1f2a38,#0d1a28);display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:1.8rem;border-bottom:1px solid #21262d;position:relative;}"
    +".sr-vnum{font-size:.54rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#7ee8a2;background:rgba(0,0,0,.75);padding:2px 6px;border-radius:3px;position:absolute;top:6px;left:6px;}"
    +".sr-rdg{position:absolute;top:6px;right:6px;background:#7ee8a2;color:#0d1117;font-size:.5rem;font-weight:800;text-transform:uppercase;padding:2px 5px;border-radius:3px;}"
    +".sr-pb{position:absolute;bottom:0;left:0;right:0;height:3px;background:rgba(255,255,255,.1);}.sr-pbf{height:100%;background:#7ee8a2;}"
    +".sr-vinfo{padding:8px 10px 11px;}.sr-vname{font-size:.74rem;font-weight:600;color:#c9d1d9;line-height:1.3;margin-bottom:2px;}.sr-vsub{font-size:.64rem;color:#6e7681;}"
    +"#sr-vol-page{padding:24px 20px;max-width:820px;margin:0 auto;}"
    +".sr-vhdr{display:flex;gap:16px;margin-bottom:22px;padding-bottom:16px;border-bottom:1px solid #21262d;}"
    +".sr-vhdr-ico{width:84px;aspect-ratio:2/3;background:linear-gradient(135deg,#1f2a38,#0d1a28);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:1.9rem;border:1px solid #30363d;flex-shrink:0;}"
    +".sr-vhdr-meta h2{font-size:1.1rem;font-weight:700;color:#c9d1d9;margin:0 0 4px;}.sr-vhdr-meta p{color:#8b949e;font-size:.8rem;margin:0 0 8px;}"
    +".sr-prog-line{font-size:.74rem;color:#7ee8a2;margin-bottom:7px;}"
    +".sr-cta{background:#7ee8a2;color:#0d1117;border:none;padding:6px 13px;border-radius:6px;font-weight:700;cursor:pointer;font-size:.8rem;}"
    +".sr-chlist{display:flex;flex-direction:column;gap:3px;}"
    +".sr-chitem{display:flex;align-items:center;gap:9px;padding:10px 13px;background:#161b22;border:1px solid #21262d;border-radius:7px;cursor:pointer;transition:all .13s;}"
    +".sr-chitem:hover{background:#1c2128;border-color:#30363d;}.sr-chdot{width:6px;height:6px;border-radius:50%;background:#30363d;flex-shrink:0;}.sr-chtitle{flex:1;font-size:.84rem;color:#c9d1d9;}"
    +"#sr-reader-page{display:flex;flex-direction:column;height:100%;overflow:hidden;}"
    +"#sr-rnav{display:flex;align-items:center;gap:6px;padding:7px 12px;background:#161b22;border-bottom:1px solid #21262d;flex-shrink:0;}"
    +"#sr-rnav button{background:#21262d;border:1px solid #30363d;color:#c9d1d9;padding:5px 12px;border-radius:5px;cursor:pointer;font-size:.78rem;white-space:nowrap;}"
    +"#sr-rnav button:hover:not(:disabled){background:#30363d;}#sr-rnav button:disabled{opacity:.3;cursor:not-allowed;}"
    +"#sr-chsel{flex:1;background:#21262d;border:1px solid #30363d;color:#c9d1d9;padding:5px 8px;border-radius:5px;font-size:.78rem;}"
    +"#sr-cw{flex:1;overflow-y:auto;overflow-x:hidden;background:#0d1117;}"
    +"#sr-content{max-width:760px;margin:0 auto;padding:32px 24px 80px;font-size:18px;line-height:1.85;color:#e2e8f0;font-family:'Georgia',serif;}"
    +"#sr-content p{margin-bottom:1.1em;}#sr-content img{max-width:100%;border-radius:6px;margin:10px auto;display:block;}"
    +"#sr-content h1{font-family:system-ui,sans-serif;color:#7ee8a2;margin:1.3em 0 .4em;font-size:1.4rem;}#sr-content a{color:#7ee8a2;}"
    +"#sr-cfg-panel{position:absolute;top:48px;right:0;width:250px;background:#161b22;border:1px solid #30363d;border-radius:0 0 0 10px;padding:13px;z-index:200;display:none;box-shadow:-4px 4px 20px rgba(0,0,0,.6);}"
    +"#sr-cfg-panel.open{display:block;}.sr-sr{margin-bottom:12px;}.sr-sr label{display:block;font-size:.68rem;color:#8b949e;margin-bottom:4px;text-transform:uppercase;letter-spacing:.06em;}"
    +".sr-sr input[type=range]{width:100%;accent-color:#7ee8a2;}.sr-sr select{width:100%;background:#21262d;border:1px solid #30363d;color:#c9d1d9;padding:4px 7px;border-radius:5px;font-size:.78rem;}"
    +".sr-trow{display:flex;gap:5px;}.sr-tbtn{flex:1;padding:5px;border-radius:5px;border:2px solid #30363d;cursor:pointer;font-size:.68rem;font-weight:600;}"
    +".sr-tbtn[data-theme=dark]{background:#0d1117;color:#e2e8f0;}.sr-tbtn[data-theme=sepia]{background:#f4ecd8;color:#5b4636;}.sr-tbtn[data-theme=light]{background:#f5f5f5;color:#1a1a1a;}"
    +".sr-spin{display:flex;flex-direction:column;align-items:center;justify-content:center;height:200px;gap:12px;}"
    +".sr-ring{width:34px;height:34px;border:3px solid #21262d;border-top-color:#7ee8a2;border-radius:50%;animation:sr-spin .7s linear infinite;}"
    +"@keyframes sr-spin{to{transform:rotate(360deg)}}.sr-spin p{color:#6e7681;font-size:.84rem;}"
    +".sr-err{margin:30px auto;max-width:420px;background:#1c1c1c;border:1px solid #f0883e55;border-radius:9px;padding:18px;text-align:center;color:#f0883e;}"
    +".sr-err p{margin-top:6px;color:#8b949e;font-size:.82rem;}.sr-err a{color:#f0883e;}.sr-err button{margin-top:12px;background:#f0883e;color:#fff;border:none;padding:6px 14px;border-radius:5px;cursor:pointer;font-weight:600;}"
    +"::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:#30363d;border-radius:3px;}";
    document.head.appendChild(style);

    // Build shell
    var bd=document.createElement("div"); bd.id="sr-backdrop";
    bd.innerHTML='<div id="sr-bar"><span class="sr-logo">&#x1F7E2; Slime Reader</span><button id="sr-back-btn">&#8249; Back</button><span id="sr-bar-title"></span><button id="sr-cfg-btn">&#9881;</button><button id="sr-close-btn">&#x2715;</button></div>'
    +'<div id="sr-cfg-panel"><div class="sr-sr"><label>Theme</label><div class="sr-trow"><button class="sr-tbtn" data-theme="dark">Dark</button><button class="sr-tbtn" data-theme="sepia">Sepia</button><button class="sr-tbtn" data-theme="light">Light</button></div></div>'
    +'<div class="sr-sr"><label>Font Size: <span id="sr-fsl">18</span>px</label><input type="range" id="sr-fs" min="13" max="28" value="18"></div>'
    +'<div class="sr-sr"><label>Line Height: <span id="sr-lhl">1.85</span></label><input type="range" id="sr-lh" min="1.2" max="2.5" step="0.05" value="1.85"></div>'
    +'<div class="sr-sr"><label>Font</label><select id="sr-ffs"><option value="Georgia,serif">Georgia</option><option value="system-ui,sans-serif">Sans-Serif</option><option value="\'Courier New\',monospace">Mono</option></select></div>'
    +'<div class="sr-sr"><label>Width: <span id="sr-mwl">760</span>px</label><input type="range" id="sr-mw" min="400" max="1100" step="20" value="760"></div></div>'
    +'<div id="sr-main"><div id="sr-home"></div><div id="sr-vol-page" style="display:none"></div>'
    +'<div id="sr-reader-page" style="display:none;height:100%;flex-direction:column;"><div id="sr-rnav"><button id="sr-prev">&#8592; Prev</button><select id="sr-chsel"></select><button id="sr-next">Next &#8594;</button></div><div id="sr-cw"><div id="sr-content"></div></div></div></div>';
    document.body.appendChild(bd);
    console.log("[slime-reader] Backdrop appended.");

    function showPage(id){["sr-home","sr-vol-page","sr-reader-page"].forEach(function(p){var el=document.getElementById(p);if(!el)return;el.style.display=(p===id)?(p==="sr-reader-page"?"flex":"block"):"none";});}
    function setTitle(t){var el=document.getElementById("sr-bar-title");if(el)el.textContent=t;}
    function ge(id){return document.getElementById(id);}

    function renderHome(){
        _page="home"; stopSave();
        showPage("sr-home");
        ge("sr-back-btn").classList.remove("v");
        ge("sr-cfg-btn").classList.remove("v");
        setTitle("");

        var contVol=null, contProg=null;
        for(var i=0;i<VOLUMES.length;i++){var p=Prog.get(VOLUMES[i].id);if(p&&p.scrollPct>0){contVol=VOLUMES[i];contProg=p;break;}}

        var contHtml="";
        if(contVol&&contProg){
            contHtml='<div class="sr-cont" id="sr-cont-banner"><div class="sr-cont-info"><div class="sr-cont-tag">Continue Reading</div><div class="sr-cont-title">'+contVol.name+'</div><div class="sr-cont-sub">'+contProg.scrollPct+'% through</div></div><button class="sr-cont-btn" data-id="'+contVol.id+'">Resume &#8250;</button></div>';
        }

        var cards=VOLUMES.map(function(v){
            var p=Prog.get(v.id), pct=p?p.scrollPct:0;
            return '<div class="sr-card" data-id="'+v.id+'"><div class="sr-cover">'+v.emoji+'<span class="sr-vnum">'+v.id+'</span>'+(pct>0?'<span class="sr-rdg">Reading</span>':'')+'<div class="sr-pb"><div class="sr-pbf" style="width:'+pct+'%"></div></div></div><div class="sr-vinfo"><div class="sr-vname">'+v.name+'</div><div class="sr-vsub">'+v.chapters.length+' ch</div></div></div>';
        }).join("");

        ge("sr-home").innerHTML='<div class="sr-hero"><div class="sr-hero-ico">&#x1F7E2;</div><div><h1>That Time I Got Reincarnated as a Slime</h1><p>Fan-translated LNs &middot; Vols 6&ndash;20 + Side Stories &middot; Progress auto-saved</p></div></div>'+contHtml+'<div class="sr-sec">All Volumes</div><div class="sr-grid">'+cards+'</div>';

        ge("sr-home").querySelectorAll(".sr-card").forEach(function(c){c.addEventListener("click",function(){var v=VOLUMES.find(function(x){return x.id===c.dataset.id;});if(v)renderVol(v);});});
        var cb=ge("sr-cont-banner");
        if(cb&&contVol)(function(cv,cp){cb.addEventListener("click",function(){renderReader(cv,0,cp.scrollPct);});})(contVol,contProg);
    }

    function renderVol(vol){
        _page="volume"; _vol=vol; stopSave();
        showPage("sr-vol-page");
        ge("sr-back-btn").classList.add("v");
        ge("sr-cfg-btn").classList.remove("v");
        setTitle(vol.name);
        var prog=Prog.get(vol.id);
        var chHtml=vol.chapters.map(function(ch,i){return '<div class="sr-chitem" data-idx="'+i+'"><div class="sr-chdot"></div><span class="sr-chtitle">'+ch.label+'</span></div>';}).join("");
        ge("sr-vol-page").innerHTML='<div class="sr-vhdr"><div class="sr-vhdr-ico">'+vol.emoji+'</div><div class="sr-vhdr-meta"><h2>'+vol.name+'</h2><p>'+vol.chapters.length+' chapters</p>'+(prog&&prog.scrollPct>0?'<div class="sr-prog-line">'+prog.scrollPct+'% read</div><button class="sr-cta" id="sr-volcont">Continue</button>':'')+'</div></div><div class="sr-sec">Chapters</div><div class="sr-chlist">'+chHtml+'</div>';
        ge("sr-vol-page").querySelectorAll(".sr-chitem").forEach(function(item){(function(v,idx){item.addEventListener("click",function(){renderReader(v,idx);});})(vol,parseInt(item.dataset.idx));});
        var vcb=ge("sr-volcont");
        if(vcb&&prog)(function(v,p){vcb.addEventListener("click",function(){renderReader(v,0,p.scrollPct);});})(vol,prog);
    }

    function renderReader(vol,chIdx,resumePct){
        _page="reader"; _vol=vol; _chIdx=chIdx; stopSave();
        showPage("sr-reader-page");
        ge("sr-back-btn").classList.add("v");
        ge("sr-cfg-btn").classList.add("v");
        var ch=vol.chapters[chIdx];
        setTitle(vol.name+" \u00b7 "+ch.label);
        var sel=ge("sr-chsel");
        sel.innerHTML=vol.chapters.map(function(c,i){return '<option value="'+i+'"'+(i===chIdx?" selected":"")+'>'+c.label+'</option>';}).join("");
        ge("sr-prev").disabled=chIdx===0;
        ge("sr-next").disabled=chIdx===vol.chapters.length-1;
        ge("sr-content").innerHTML='<div class="sr-spin"><div class="sr-ring"></div><p>Loading '+ch.label+'&hellip;</p></div>';
        fetchVol(vol).then(function(fullHtml){
            var nextCh=vol.chapters[chIdx+1];
            ge("sr-content").innerHTML=extractChapter(fullHtml,ch.id,nextCh?nextCh.id:null);
            applyS();
            if(typeof resumePct==="number"&&resumePct>0){restorePct(resumePct);}else{ge("sr-cw").scrollTop=0;}
            Prog.set(vol.id,getPct());
            startSave(vol.id);
        }).catch(function(err){
            console.error("[slime-reader] Fetch error:",err);
            ge("sr-content").innerHTML='<div class="sr-err"><strong>Failed to load</strong><p>'+err.message+'</p><p><a href="'+BASE+vol.path+'" target="_blank">Open in browser</a></p></div>';
        });
    }

    // Events
    ge("sr-close-btn").addEventListener("click",cleanup);
    window.addEventListener("keydown",function _esc(e){if(e.key==="Escape"){e.preventDefault();cleanup();window.removeEventListener("keydown",_esc);}});
    ge("sr-back-btn").addEventListener("click",function(){if(_page==="reader"){Prog.set(_vol.id,getPct());renderVol(_vol);}else if(_page==="volume"){renderHome();}});
    ge("sr-cfg-btn").addEventListener("click",function(e){e.stopPropagation();ge("sr-cfg-panel").classList.toggle("open");});
    document.addEventListener("click",function(e){var p=ge("sr-cfg-panel");if(p&&p.classList.contains("open")&&!p.contains(e.target)&&e.target.id!=="sr-cfg-btn")p.classList.remove("open");});
    ge("sr-prev").addEventListener("click",function(){if(_chIdx>0){Prog.set(_vol.id,getPct());renderReader(_vol,_chIdx-1);}});
    ge("sr-next").addEventListener("click",function(){if(_chIdx<_vol.chapters.length-1){Prog.set(_vol.id,getPct());renderReader(_vol,_chIdx+1);}});
    ge("sr-chsel").addEventListener("change",function(e){var i=parseInt(e.target.value);if(i!==_chIdx){Prog.set(_vol.id,getPct());renderReader(_vol,i);}});
    document.querySelectorAll(".sr-tbtn").forEach(function(b){b.addEventListener("click",function(){gs().theme=b.dataset.theme;ss();applyS();});});
    function bindSl(sid,lid,key,parse){var el=ge(sid);if(!el)return;el.addEventListener("input",function(){gs()[key]=parse(el.value);var l=ge(lid);if(l)l.textContent=gs()[key];ss();applyS();});}
    bindSl("sr-fs","sr-fsl","fontSize",function(v){return parseInt(v);});
    bindSl("sr-lh","sr-lhl","lineHeight",function(v){return parseFloat(v);});
    bindSl("sr-mw","sr-mwl","maxWidth",function(v){return parseInt(v);});
    var ffs=ge("sr-ffs"); if(ffs)ffs.addEventListener("change",function(){gs().fontFamily=ffs.value;ss();applyS();});

    function cleanup(){
        stopSave();
        var layout=document.querySelector(".UI-AppLayout__root");
        if(layout)layout.style.display="";
        var bd=ge("sr-backdrop"); if(bd)bd.remove();
        var st=ge("sr-style"); if(st)st.remove();
        console.log("[slime-reader] Cleaned up.");
    }

    applyS();
    renderHome();
    console.log("[slime-reader] Ready.");
})();
