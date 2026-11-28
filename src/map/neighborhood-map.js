/*! @license Leaflet 1.9.4, a JS library for interactive maps. https://leafletjs.com (c) 2010-2023 Vladimir Agafonkin, (c) 2010-2011 CloudMade. BSD-2-Clause licence: https://github.com/Leaflet/Leaflet/blob/v1.9.4/LICENSE */
/* Toronto Neighbourhood Map: behaviour. Data lives in ./neighborhood-data.js.
   Built from the "Beta2" map of 24 Nov 2026. */
import L from "leaflet";
import {DISTRICTS,AGENT,DIST,COMM,DLABEL,STATIONS,PINS,REGIONS,STREETS,NEARBY,UNIS,GROCERY,SCHOOLS,MALLS} from "./neighborhood-data.js";

const TYPE={park:"Parks & outdoors",shop:"Shopping",culture:"Arts & culture",food:"Food & drink",sport:"Sport & recreation",landmark:"Landmark"};
const COL={W:["#e2a33a","#b97d16"],C:["#4b7fe3","#2a56b0"],E:["#31a59c","#167a72"]};
const LINE={1:"#f2b600",2:"#1a9a50",4:"#a3238e"};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const $=id=>document.getElementById(id);
const small=matchMedia("(max-width:720px)");
if(small.matches)$("layers").open=false;

const map=L.map("map",{zoomSnap:.5,minZoom:7,maxZoom:18,maxBounds:[[42.3,-82.4],[45.7,-76.3]],zoomControl:false});
L.control.zoom({position:"bottomright"}).addTo(map);
map.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>');
["pReg","pDist","pComm","pSel","pSub"].forEach((p,i)=>{map.createPane(p).style.zIndex=410+i*10});map.createPane("pCondo").style.zIndex=640;map.getPane("pCondo").style.pointerEvents="none";["pHalo",425,"pRing",625].forEach((v,i,a)=>{if(i%2)return;const pn=map.createPane(v);pn.style.zIndex=a[i+1];pn.style.pointerEvents="none"});map.createPane("pGlow").style.zIndex=445;map.getPane("pGlow").style.pointerEvents="none";
const cityBounds=L.geoJSON(DIST).getBounds();
/* Opening view: zoomed in on the Eaton Centre, the same view as the "Downtown Toronto" button. (The whole city at once
   showed every pin and was too much to take in; "ZOOM out" still gives the wide view.) A link to one district, such as
   /neighborhood-map#C08, starts from the whole city as before and zooms in to that district. */
const HOME=[43.6544,-79.3807,16];
function hashDistrict(){try{const h=decodeURIComponent(location.hash.slice(1)).trim().toUpperCase();return DISTRICTS[h]?h:null}catch(e){return null}}
if(hashDistrict())map.fitBounds(cityBounds,{padding:[10,10]});else map.setView([HOME[0],HOME[1]],HOME[2]);

/* street background, with a fallback when tiles cannot load */
let tilesOk=0,tilesBad=0,hasBase=true;
const base=L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:'<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">&copy; OpenStreetMap</a>'});
base.on("tileload",()=>{tilesOk++});
base.on("tileerror",()=>{tilesBad++;if(!tilesOk&&tilesBad>=4&&hasBase){$("l-base").checked=false;setBase(false);
  note("The street background could not load just now. Districts and everything else still work. Try reloading the page.")}});
let noteT=0;function note(t){const n=$("note");n.textContent=t;n.style.display="block";clearTimeout(noteT);noteT=setTimeout(()=>n.style.display="none",9000)}
function setBase(on){hasBase=on;on?base.addTo(map):map.removeLayer(base);restyle()}

/* helpers */
function km(a,b){const R=6371,r=Math.PI/180,dLa=(b[0]-a[0])*r,dLo=(b[1]-a[1])*r,x=Math.sin(dLa/2)**2+Math.cos(a[0]*r)*Math.cos(b[0]*r)*Math.sin(dLo/2)**2;return 2*R*Math.asin(Math.sqrt(x))}
function nearest(ll){let best=null,d=1e9;STATIONS.forEach(s=>{const k=km(ll,[s[1],s[2]]);if(k<d){d=k;best=s}});return{d,s:best}}
const walkCol=d=>d<.8?"#1a7f5a":d<1.5?"#7fc08a":d<3?"#f0c36a":"#d9825f";
/* walk estimate: straight-line distance x 1.3 for real streets, at 80 m a minute; shown only up to 10 minutes and only for exactly placed pins */
function walkTo(p){if(!p||!p[2])return null;const n=nearest([p[0],p[1]]),min=Math.max(1,Math.round(n.d*1.3/0.08));return min<=10?{min,st:n.s[0]}:null}
const walkTxt=w=>w?'About '+w.min+' min walk to '+w.st+' station':'';
const fmt=d=>d<1?Math.round(d*100)*10+" m":d.toFixed(1)+" km";

/* ---------- Map symbols and name labels: two canvases instead of one page element each ----------
   Condo pins, grocery carts, campuses, shopping centres, daycares, schools and every name label are small pictures,
   drawn once and then stamped onto a canvas. Each used to be its own page element, which the browser kept as a
   separate layer and re-composed on every frame: about 500 of them at neighbourhood zoom, 1,900 with daycares and
   schools switched on, is what made dragging and zooming the map lag. Symbols go on one canvas (top pane), labels
   on a second one in the pane the labels always had, so stations and glows still draw over them. The canvases let
   the pointer through, so districts underneath keep working; hover and click on a symbol are found by the hit
   test further down. */
const MK=[],SPR={},MK_PAD=.25,MK_MAXPX=12e6;
let DPR=Math.min(window.devicePixelRatio||1,2),mkReady=false,mkZ=map.getZoom(),mkMin=L.point(0,0),mkW=0,mkH=0,mkQ=1,mkLL=null,mkPZ=mkZ,mkRq=0,mkAnim=0,mkSlow=0,mkGap=0,mkLast=0,hotPin=null;
const mkCs=["pCondo","pSel"].map(n=>L.DomUtil.create("canvas","leaflet-zoom-animated",map.getPane(n))),mkX=mkCs[0].getContext("2d"),mkLX=mkCs[1].getContext("2d");
mkCs.forEach(c=>{c.style.cssText="position:absolute;left:0;top:0;pointer-events:none";c.setAttribute("aria-hidden","true")});
const mkMx=window.DOMMatrixReadOnly||window.WebKitCSSMatrix||null;   /* reads how far a zoom animation has got */
/* a group of symbols or labels: z = drawing order (as the old panes), x = which canvas (symbols unless given),
   on() = shown at this zoom / with these switches, ok(it) = this one passes the filter, spr() = picture for each,
   hit() = the pointer is on it (labels have none), off = how far above it the hover label sits, click */
function mkGroup(o){o.items=[];o.vis=false;MK.push(o);MK.sort((a,b)=>a.z-b.z);return o}
function mkAdd(g,lat,lng,tip,x){const q=map.project([lat,lng],0),it=Object.assign({g,ll:[lat,lng],wx:q.x,wy:q.y,tip,sx:NaN,sy:0},x);g.items.push(it);return it}
const mkSort=g=>g.items.sort((a,b)=>b.ll[0]-a.ll[0]);   /* north first, so a symbol further south overlaps the one above it */
const mkBox=h=>(it,dx,dy)=>dx<=h&&dx>=-h&&dy<=h&&dy>=-h;   /* the square the old icon element covered */
const mkFly=it=>{mkTip(null);zoomPop(it.ll)};
/* an SVG icon drawn once into a small bitmap, sized for this screen's pixel density */
function sprSvg(name,svg,size){const key=name+"@"+DPR;if(key in SPR)return SPR[key];SPR[key]=null;
  const px=Math.round(size*DPR),c=document.createElement("canvas"),x=c.getContext("2d"),img=new Image(),done=()=>{SPR[key]={c,w:size,h:size,ax:size/2,ay:size/2};mkDirty()};
  c.width=c.height=px;
  img.onload=()=>{x.drawImage(img,0,0,px,px);done()};
  img.onerror=()=>{x.beginPath();x.arc(px/2,px/2,px/2-1,0,7);x.fillStyle="#fff";x.fill();x.strokeStyle="#16202b";x.stroke();done()};   /* a plain disc if the icon cannot be decoded */
  img.src="data:image/svg+xml,"+encodeURIComponent(svg.replace("<svg ",'<svg xmlns="http://www.w3.org/2000/svg" ').replace(/width="\d+" height="\d+"/,'width="'+px+'" height="'+px+'"'));return null}
/* a name label drawn once into a small bitmap, laid out the way the page-element labels were: same font, weight,
   size, colour and soft white halo, centred on its point (st: weight, size, colour, halo blur radii, line height,
   height of the old label box, and for some a wrap width or letter spacing) */
const LBF=getComputedStyle(map.getContainer()).fontFamily;
function sprText(text,st){const key=st.k+"|"+text+"@"+DPR;if(SPR[key])return SPR[key];
  const c=document.createElement("canvas"),x=c.getContext("2d"),font=st.wt+" "+st.fs+"px "+LBF,ls=(st.ls||0)*st.fs;x.font=font;
  const W=t=>x.measureText(t).width+ls*t.length;let lines=[text];
  if(st.wrap){lines=[];let cur="";(text.match(/[^ -]+[ -]*|[ -]+/g)||[text]).forEach(t=>{if(cur&&W((cur+t).trimEnd())>st.wrap){lines.push(cur.trimEnd());cur=t}else cur+=t});if(cur.trim())lines.push(cur.trimEnd())}
  const mt=x.measureText("Mg"),A=Math.round(mt.fontBoundingBoxAscent||st.fs*.93),D=Math.round(mt.fontBoundingBoxDescent||st.fs*.25),LH=st.lh*st.fs,half=(LH-A-D)/2,pad=8,
    w=2*Math.ceil(Math.max(...lines.map(W))/2+pad),y0=pad-Math.floor(Math.min(0,half)),H=y0+Math.ceil(Math.max(st.box,lines.length*LH-half))+pad;
  c.width=Math.round(w*DPR);c.height=Math.round(H*DPR);x.scale(DPR,DPR);x.font=font;x.textBaseline="alphabetic";
  const draw=()=>lines.forEach((t,i)=>{let px=w/2-W(t)/2;const py=y0+Math.round(i*LH)+Math.floor(half+A);if(ls)for(const ch of t){x.fillText(ch,px,py);px+=x.measureText(ch).width+ls}else x.fillText(t,px,py)});
  x.fillStyle=x.shadowColor="#fff";st.halo.forEach(r=>{x.shadowBlur=r*DPR;draw()});
  x.shadowColor="transparent";x.shadowBlur=0;x.fillStyle=st.col;draw();
  return SPR[key]={c,w,h:H,ax:w/2,ay:y0+st.box/2}}
const lbSpr=st=>it=>sprText(it.t,st);
const LB={};[["dl11",800,11,"#16202b",[3,3,4,4],1.45,20],["dl15",800,15,"#16202b",[3,3,4,4],1.45,20],["dl20",800,20,"#16202b",[3,3,4,4],1.45,20],["cl",600,11,"#3c4754",[3,3,3],1.1,14,110],
  ["rl13",800,13,"#1c5fa8",[3,3,4,5],1.45,18,0,.22],["rl11",800,11,"#1c5fa8",[3,3,4,5],1.45,18,0,.14],["ct13",800,13,"#16202b",[3,3,4,5],1.45,18,0,.22],["ct11",800,11,"#16202b",[3,3,4,5],1.45,18,0,.14],
  ["gl",800,11,"#7a4b00",[3,3,4,5],1.45,14]].forEach(a=>LB[a[0]]={k:a[0],wt:a[1],fs:a[2],col:a[3],halo:a[4],lh:a[5],box:a[6],wrap:a[7]||0,ls:a[8]||0});
/* stamp one picture: pixel for pixel when it is drawn at its own size (sharp at any screen scaling), scaled otherwise */
function mkPut(x,it,sp,k){if(!sp)return;
  if(k===1&&mkQ===DPR)x.drawImage(sp.c,Math.round((it.sx-sp.ax-mkMin.x)*mkQ),Math.round((it.sy-sp.ay-mkMin.y)*mkQ));
  else x.drawImage(sp.c,(it.sx-sp.ax*k-mkMin.x)*mkQ,(it.sy-sp.ay*k-mkMin.y)*mkQ,sp.w*k*mkQ,sp.h*k*mkQ)}
/* mkPaint(): place and draw everything for the map as it is now.
   mkPaint(k): redraw it all where it already is at k times its size; used while a zoom animation is scaling the
   canvases, so symbols and labels keep their size on screen. */
function mkPaint(k){if(!mkReady)return;const live=!k;k=k||1;let S=0,ox=0,oy=0;const x0=mkMin.x-90,y0=mkMin.y-50,x1=mkMin.x+mkW+90,y1=mkMin.y+mkH+70;
  if(live){S=map.getZoomScale(map.getZoom(),0);const o=map.getPixelOrigin();ox=o.x;oy=o.y;mkPZ=map.getZoom();mkLL=map.layerPointToLatLng(mkMin)}
  [mkX,mkLX].forEach(x=>x.clearRect(0,0,x.canvas.width,x.canvas.height));
  for(const g of MK){if(live)g.vis=!!g.on();if(!g.vis)continue;const spr=g.spr(),x=g.x||mkX;
    for(const it of g.items){
      if(live){if(g.ok&&it!==hotPin&&!g.ok(it)){it.sx=NaN;continue}const px=Math.round(it.wx*S-ox),py=Math.round(it.wy*S-oy);if(px<x0||px>x1||py<y0||py>y1){it.sx=NaN;continue}it.sx=px;it.sy=py}
      else if(it.sx!==it.sx)continue;
      if(it!==hotPin)mkPut(x,it,spr(it),k)}}
  if(hotPin&&hotPin.g.vis&&hotPin.sx===hotPin.sx)mkPut(mkX,hotPin,hotPin.g.spr(true)(hotPin),k)}
function mkDirty(){if(!mkRq)mkRq=requestAnimationFrame(()=>{mkRq=0;if(!map._animatingZoom)mkPaint()})}
/* size the canvases to the view plus a margin all round, place them, repaint */
function mkReset(){if(!mkReady||map._animatingZoom)return;cancelAnimationFrame(mkAnim);
  const s=map.getSize(),px=Math.round(s.x*MK_PAD),py=Math.round(s.y*MK_PAD),w=s.x+2*px,h=s.y+2*py,d=Math.min(window.devicePixelRatio||1,2);
  if(d!==DPR){DPR=d;for(const k in SPR)delete SPR[k]}   /* pictures are drawn per pixel density: start afresh when it changes (browser zoom, another screen) */
  const q=Math.min(DPR,Math.sqrt(MK_MAXPX/(w*h)));
  if(w!==mkW||h!==mkH||q!==mkQ){mkW=w;mkH=h;mkQ=q;mkCs.forEach(c=>{c.width=Math.round(w*q);c.height=Math.round(h*q);c.style.width=w+"px";c.style.height=h+"px"})}
  mkMin=map.containerPointToLayerPoint([-px,-py]).round();mkCs.forEach(c=>L.DomUtil.setPosition(c,mkMin));mkPaint()}
map.on("moveend",()=>{if(mkSlow>0&&map.getZoom()!==mkZ)mkSlow--;mkZ=map.getZoom();mkReset()});
map.on("resize",mkReset);
/* Repainting on every frame of a zoom is cheap where the browser draws canvases on the graphics card. Where it does
   not, frames arrive late: after several late frames in one zoom (not counted while the page is still loading) the
   canvases are simply scaled with the map for the next few zooms (symbols grow or shrink with it and snap back when
   it ends), then per-frame repainting is tried again. */
function mkPace(){const now=performance.now(),d=now-mkLast;mkLast=now;if(d>400)mkGap=0;else if(d>60&&now>4000&&++mkGap>=4)mkSlow=6}
/* While the map is dragged the canvases simply ride along with it; they are repainted only if the view reaches
   their margin. A fly-to moves the map frame by frame, so they are repainted with every frame. During a two-finger
   pinch they are scaled with the map instead (no work per frame at all) and repainted when the fingers lift. */
map.on("move",e=>{if(!mkReady||map._animatingZoom)return;
  if(e&&(e.flyTo||e.pinch)){if(e.flyTo){mkPace();if(!mkSlow){mkReset();return}}
    if(mkLL){const at=map.project(mkLL)._subtract(map.getPixelOrigin()),sc=map.getZoomScale(map.getZoom(),mkPZ);mkCs.forEach(c=>L.DomUtil.setTransform(c,at,sc))}return}
  const tl=map.containerPointToLayerPoint([0,0]),s=map.getSize();if(tl.x<mkMin.x||tl.y<mkMin.y||tl.x+s.x>mkMin.x+mkW||tl.y+s.y>mkMin.y+mkH)mkReset()});
/* An animated zoom step (wheel, buttons, double-click): the browser scales the canvases together with the map
   tiles, so nothing can slip against the streets, and on every frame everything on them is redrawn smaller or
   larger by the opposite amount, so it holds its size. When the step ends it is all repainted sharp. */
map.on("zoomanim",e=>{if(!mkReady||!map._animatingZoom||!mkLL)return;
  const at=map._latLngToNewLayerPoint(mkLL,e.zoom,e.center),sc=map.getZoomScale(e.zoom,mkPZ);mkCs.forEach(c=>L.DomUtil.setTransform(c,at,sc));
  cancelAnimationFrame(mkAnim);const tick=()=>{if(!map._animatingZoom)return;mkPace();if(mkSlow)return;const a=new mkMx(getComputedStyle(mkCs[0]).transform).a;if(a>0)mkPaint(1/a);mkAnim=requestAnimationFrame(tick)};
  if(!mkSlow&&mkMx)mkAnim=requestAnimationFrame(tick)});
/* one shared hover label for whichever symbol is under the pointer */
const mkTT=L.tooltip({className:"tt",direction:"top"});let mkTipIt=null;
function mkTip(it){if(!it){if(mkTipIt){mkTipIt=null;map.closeTooltip(mkTT)}return}
  mkTipIt=it;const o=it.g.off;mkTT.options.offset=L.point(0,-(typeof o==="function"?o():o));mkTT.setContent(it.tip).setLatLng(it.ll);if(!map.hasLayer(mkTT))map.openTooltip(mkTT)}

/* layers */
let sel=null,selComm=null,showComm=true;const walk=false;
const distLayer=L.geoJSON(DIST,{pane:"pDist",style:f=>dStyle(f.properties.d),onEachFeature:(f,l)=>{
  const id=f.properties.d;l.bindTooltip(id+" · "+DISTRICTS[id].name,{sticky:true,className:"tt",direction:"top"});
  l.on({mouseover:()=>{if(id!==sel)l.setStyle({fillOpacity:hasBase?.34:.8})},mouseout:()=>distLayer.resetStyle(l),click:()=>{if(sel===id)unpick();else{pick(id,null);l.bringToFront()}}});}}).addTo(map);
function dStyle(id){const c=COL[id[0]],on=id===sel;return{color:on?"#16202b":c[1],weight:on?6:1.8,fillColor:on?c[1]:c[0],fillOpacity:walk?0:(hasBase?(on?.42:.16):(on?.95:.62)),interactive:!showComm}}
COMM.features.forEach(f=>{const c=L.geoJSON(f).getBounds().getCenter();f.properties.c=[c.lat,c.lng];f.properties.near=nearest([c.lat,c.lng])});
const commLayer=L.geoJSON(COMM,{pane:"pComm",style:cStyle,onEachFeature:(f,l)=>{
  l.bindTooltip(()=>f.properties.n+" · "+f.properties.d,{sticky:true,className:"tt",direction:"top"});
  l.on({mouseover:()=>l.setStyle({weight:2.5,color:"#16202b"}),mouseout:()=>commLayer.resetStyle(l),click:()=>{const p=f.properties;if(sel===p.d&&(selComm===null||selComm===p.n))unpick();else pick(p.d,p.n)}});}});
function cStyle(f){const p=f.properties,on=p.n===selComm&&p.d===sel;return{color:on?"#16202b":"#5d6976",weight:on?2.6:.9,dashArray:on?null:"3 3",fillColor:walk?walkCol(p.near.d):"#fff",fillOpacity:walk?.62:(on?.25:.01)}}
const gDL=mkGroup({z:441,x:mkLX,on:()=>map.hasLayer(distLayer)&&mkZ>=9.5,spr:()=>lbSpr(mkZ<11?LB.dl11:mkZ>=13?LB.dl20:LB.dl15)});
Object.keys(DLABEL).forEach(k=>mkAdd(gDL,DLABEL[k][0],DLABEL[k][1],null,{t:DLABEL[k][2]||k}));mkSort(gDL);
const gCL=mkGroup({z:442,x:mkLX,on:()=>showComm&&mkZ>=13.5,spr:()=>lbSpr(LB.cl)});
COMM.features.forEach(f=>mkAdd(gCL,f.properties.c[0],f.properties.c[1],null,{t:f.properties.n}));mkSort(gCL);
const subLayer=L.layerGroup(STATIONS.map(s=>L.circleMarker([s[1],s[2]],{pane:"pSub",radius:5,color:"#fff",weight:1.5,fillColor:LINE[s[3]],fillOpacity:1,bubblingMouseEvents:false}).bindTooltip(s[0]+" station",{className:"tt",direction:"top"}).on("click",e=>{e.target.closeTooltip();zoomPop(e.target.getLatLng())}))).addTo(map);
/* Yonge St and Bloor St: glowing main streets (halo that pulses, bright core, light that travels along the street) */
const glowLayer=L.layerGroup();
Object.keys(STREETS).forEach(n=>{const p=STREETS[n];
  [["halo",14],["core",4],["run",4]].forEach(k=>glowLayer.addLayer(L.polyline(p,{pane:"pGlow",interactive:false,className:"glow-"+k[0],weight:k[1],lineCap:"round",lineJoin:"round"})))});
const gGL=mkGroup({z:444,x:mkLX,on:()=>mkZ>=12.5,spr:()=>lbSpr(LB.gl)});
[[43.7300,-79.4034,"Yonge St"],[43.6520,-79.4760,"Bloor St W"],[43.6722,-79.3790,"Bloor St E"]].forEach(a=>mkAdd(gGL,a[0],a[1],null,{t:a[2]}));
glowLayer.addTo(map);
/* click any icon: zoom straight in to browse the area around it (no card). Already close: just centre on it */
function zoomPop(ll){ll=L.latLng(ll);map.closePopup();map.flyTo(ll,Math.max(map.getZoom(),16.5),{duration:.7})}
/* grocery stores */
const CART='<svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12.5" r="11.5" fill="#fff" fill-opacity=".85"/><path d="M2.2 3.4h3.1l2.3 10.2h10.3l2-7.4H6.2" fill="#fff" stroke="#16202b" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.6 9.3h10.2M12.9 6.4v7M9.3 6.4l.9 7M16.6 6.4l-.6 7" stroke="#16202b" stroke-width="1.1" fill="none"/><circle cx="9.3" cy="18.6" r="1.9" fill="#16202b"/><circle cx="16.6" cy="18.6" r="1.9" fill="#16202b"/></svg>';
const gShop=mkGroup({z:620,on:()=>mkZ>=12.5,off:10,spr:()=>{const sp=sprSvg("cart",CART,20);return()=>sp},hit:mkBox(10),click:mkFly});
GROCERY.forEach(g=>mkAdd(gShop,g[1],g[2],g[0]));mkSort(gShop);
/* licensed child care centres (public/map/daycares.txt, Ontario licensed child care data). Off by default; the file
   is only downloaded the first time someone switches the layer on. */
const PACI='<svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="11.4" fill="#fff" fill-opacity=".92" stroke="#16202b" stroke-width=".8"/><circle cx="12" cy="7.1" r="2.9" fill="none" stroke="#16202b" stroke-width="1.8"/><path d="M5.4 12.3c0-1.4 3-2.4 6.6-2.4s6.6 1 6.6 2.4-3 2.4-6.6 2.4-6.6-1-6.6-2.4z" fill="#16202b"/><path d="M10.2 14.4h3.6v2.5a1.8 1.8 0 0 1-3.6 0z" fill="#fff" stroke="#16202b" stroke-width="1.4"/></svg>';
let dayOn=false,dayLoad=null;
const gDay=mkGroup({z:615,on:()=>dayOn&&mkZ>=13,off:10,spr:()=>{const sp=sprSvg("day",PACI,20);return()=>sp},hit:mkBox(10),click:mkFly});
function dayData(){return dayLoad||(dayLoad=fetch("/map/daycares.txt").then(r=>{if(!r.ok)throw new Error("HTTP "+r.status);return r.text()}).then(tx=>{gDay.items.length=0;
  tx.split("\n").forEach(l=>{if(!l||l[0]==="#")return;const a=l.split("~");
    mkAdd(gDay,(+a[0]+4360000)/1e5,(+a[1]-7940000)/1e5,"<b>"+esc(a[2])+"</b><br><span style=\"font-weight:400\">"+esc(a[3])+"</span><br><i>Licensed child care"+(a[4]?" \u00b7 "+esc(a[4]).replace(/\//g," \u00b7 "):"")+"</i>")});mkSort(gDay)}).catch(e=>{dayLoad=null;throw e}))}
/* GTA schools (public/map/schools.txt): public incl. Catholic (green caps) and private (red caps), split K-8 / 9-12.
   All four layers are off by default; the file is only downloaded the first time one is switched on. */
const SCAP=c=>'<svg viewBox="0 0 24 24" width="20" height="20" stroke-linejoin="round" stroke-linecap="round"><circle cx="12" cy="12" r="11.4" fill="#fff" fill-opacity=".92" stroke="'+c+'" stroke-width="1.2"/><path d="M12 5.2 3.4 9.4l8.6 4.2 8.6-4.2z" fill="'+c+'" stroke="'+c+'" stroke-width="1.2"/><path d="M7 11.6v3.9c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-3.9" fill="'+c+'"/><path d="M5 10.2v4.4" stroke="'+c+'" stroke-width="1.3" fill="none"/></svg>';
const SCH_PUB=SCAP("#1f7a3a"),SCH_PRI=SCAP("#c62828");
let schMask=0,schLoad=null;
const gSch=mkGroup({z:617,on:()=>schMask&&mkZ>=13,ok:it=>it.f&schMask,off:10,spr:()=>{const pu=sprSvg("schp",SCH_PUB,20),pr=sprSvg("schv",SCH_PRI,20);return it=>it.f&3?pu:pr},hit:mkBox(10),click:mkFly});
function schData(){return schLoad||(schLoad=fetch("/map/schools.txt").then(r=>{if(!r.ok)throw new Error("HTTP "+r.status);return r.text()}).then(tx=>{gSch.items.length=0;
  tx.split("\n").forEach(l=>{if(!l||l[0]==="#")return;const a=l.split("~");
    mkAdd(gSch,(+a[0]+4360000)/1e5,(+a[1]-7940000)/1e5,"<b>"+esc(a[3])+"</b><br><span style=\"font-weight:400\">"+esc(a[4])+"</span><br><i>"+esc(a[5])+"</i>",{f:+a[2]})});mkSort(gSch)}).catch(e=>{schLoad=null;throw e}))}
/* universities and colleges */
const CAP='<svg viewBox="0 0 24 24" width="26" height="26" fill="#fff" stroke="#16202b" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><circle cx="12" cy="12" r="11.6" stroke="none" fill-opacity=".85"/><path d="M12 4.2 2.2 9l9.8 4.8L21.8 9z"/><path d="M6.2 11.2v4.6c0 1.6 2.6 2.9 5.8 2.9s5.8-1.3 5.8-2.9v-4.6" fill="none"/><path d="M3.4 9.9v4.9"/><rect x="2.5" y="14.8" width="1.8" height="2.6" rx=".6"/></svg>';
const gUni=mkGroup({z:630,on:()=>mkZ>=9.5,off:12,spr:()=>{const sp=mkZ<11?sprSvg("uni20",CAP,20):sprSvg("uni",CAP,26);return()=>sp},hit:mkBox(13),click:mkFly});
UNIS.forEach(u=>mkAdd(gUni,u[1],u[2],u[0]));mkSort(gUni);
/* shopping centres: two shopping bags, grey on a white circle (no CSS filter, so it stays cheap to draw) */
const BAGS='<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="11.6" fill="#fff" fill-opacity=".9" stroke="#16202b" stroke-width=".8"/><path d="M5.2 9.4h7.6l.7 9.1H4.5z" fill="#5d6976" stroke="#16202b" stroke-width="1" stroke-linejoin="round"/><path d="M7 9.4V8a2 2 0 0 1 4 0v1.4" fill="none" stroke="#16202b" stroke-width="1.2" stroke-linecap="round"/><path d="M11.4 11.6h7.3l.7 7.6h-8.7z" fill="#c3cad3" stroke="#16202b" stroke-width="1" stroke-linejoin="round"/><path d="M13.3 11.6v-1.1a1.75 1.75 0 0 1 3.5 0v1.1" fill="none" stroke="#16202b" stroke-width="1.2" stroke-linecap="round"/></svg>';
const gMall=mkGroup({z:635,on:()=>mkZ>=9.5,off:12,spr:()=>{const sp=mkZ<11?sprSvg("mall20",BAGS,20):sprSvg("mall",BAGS,24);return()=>sp},hit:mkBox(12),click:mkFly});
MALLS.forEach(m=>mkAdd(gMall,m[1],m[2],esc(m[0])));mkSort(gMall);
/* surrounding regions */
const regLayer=L.layerGroup(),regPoly={};
const gRL=mkGroup({z:443,x:mkLX,on:()=>showReg&&mkZ<11.5,ok:it=>!it.city||mkZ<9.5,spr:()=>{const a=lbSpr(mkZ<8?LB.rl11:LB.rl13),b=lbSpr(mkZ<8?LB.ct11:LB.ct13);return it=>(it.city?b:a)(it)}});
Object.keys(REGIONS).forEach(n=>{const r=REGIONS[n],name=n==="Grey"?"Grey County":n;
  const p=L.polygon(r.p,{pane:"pReg",color:"#1c5fa8",weight:2.4,dashArray:"7 4 2 4",fillColor:"#1c5fa8",fillOpacity:.04});
  p.bindTooltip(name,{sticky:true,className:"tt",direction:"top"});
  p.on({mouseover:()=>p.setStyle({fillOpacity:.16,weight:3.4}),mouseout:()=>p.setStyle({fillOpacity:.04,weight:2.4}),click:()=>{glowShape([p.getLatLngs()]);map.flyToBounds(p.getBounds(),{padding:[30,30],duration:.6})}});
  regPoly[name.toLowerCase()]=p;regLayer.addLayer(p);
  mkAdd(gRL,r.c[0],r.c[1],null,{t:name.toUpperCase()})});
{const c=cityBounds.getCenter();mkAdd(gRL,c.lat,c.lng,null,{t:"TORONTO",city:1})}   /* shown only when zoomed out past the pins */
const allBounds=L.latLngBounds(cityBounds.getSouthWest(),cityBounds.getNorthEast());regLayer.eachLayer(p=>allBounds.extend(p.getBounds()));
regLayer.addTo(map);
let showReg=true;
const JUMPS=[["Yorkville",43.6710,-79.3925,16],["King West",43.6440,-79.4010,15],["Water Front",43.6448,-79.3719,16.5],["UofT",43.6629,-79.3957,15],["TMU",43.6585,-79.3785,16],["Financial District",43.6480,-79.3810,16],["Downtown Toronto",...HOME]];
$("jump").innerHTML=JUMPS.map((j,k)=>'<button data-k="'+k+'">'+j[0]+'</button>').join("");
/* view buttons: a button is highlighted only while the map is showing that button's view.
   Clicking highlights it at once; moving or zooming the map away clears it; coming back by any route lights it again. */
const fitOf=b=>{const t=map._getBoundsCenterZoom(b,{padding:[10,10]});return[t.center,t.zoom]};
const VIEWS=[[$("v-all"),()=>fitOf(allBounds)]];
$("jump").querySelectorAll("button").forEach(b=>{const j=JUMPS[+b.dataset.k];VIEWS.push([b,()=>[L.latLng(j[1],j[2]),j[3]]])});
function markView(btn){VIEWS.forEach(v=>{v[0].classList.toggle("on",v[0]===btn);v[0].setAttribute("aria-pressed",v[0]===btn)})}
function syncView(){const z=map.getZoom(),c=map.latLngToContainerPoint(map.getCenter());let hit=null;
  VIEWS.forEach(v=>{const t=v[1]();if(!hit&&Math.abs(t[1]-z)<.01&&map.latLngToContainerPoint(t[0]).distanceTo(c)<6)hit=v[0]});markView(hit)}
VIEWS.forEach(v=>v[0].onclick=()=>{const t=v[1]();markView(v[0]);if(v[0].id==="v-all"){if(!sel)glowClear()}else glowPoint(t[0]);map.flyTo(t[0],t[1],{duration:.7});if(small.matches&&v[0].parentNode.id==="jump")$("layers").open=false});
map.on("moveend",syncView);
/* condo pins: PINS[district][i] lines up with DISTRICTS[district].condos[i] */
/* building type sets the pin colour: pre-construction (grey), loft (purple), condo (red).
   An entry is pre-construction when marked "|pre", a loft when marked "|loft" or named "... Loft(s)". */
const kindOf=cs=>cs.some(c=>c[2]==="pre")?"pre":cs.some(c=>c[2]==="loft"||/\blofts?\b/i.test(c[0]))?"loft":"condo";
const KIND={pre:"Pre-construction",loft:"Loft",condo:"Condo"},showKind={pre:$("l-pre").checked,condo:$("l-condo").checked,loft:$("l-loft").checked};
const preWhen=x=>x&&x[3]?" \u00b7 "+x[3]:"";
const pinOf={};
const PCOL={condo:"#e0245e",loft:"#7b3fbf",pre:"#aab1ba"};
/* Pins keep one size up to the zoom that a click or a jump button brings you to (16.5). Zooming in further they grow:
   about +17% at zoom 17, +33% at 17.5, and 2.25 times their size at full zoom (18), where the buildings are largest.
   A highlighted pin is 2.2 times the normal one; at full zoom only 1.5 times, which keeps it the size it always had there. */
const pinK=()=>mkZ>=18?2.25:mkZ<=16.5?1:1+(mkZ-16.5)/3,pinHot=()=>mkZ>=18?1.5:2.2;
/* the pin picture: a teardrop with a white dot; smaller when zoomed far out, larger while highlighted (pinHot),
   k times larger for the zoom (pinK) */
function sprPin(kind,far,big,k){const key="pin"+kind+(far?"f":"")+(big?"b":"")+Math.round(k*100)+"@"+DPR;if(SPR[key])return SPR[key];
  const hf=big?pinHot():1,f=hf*k,kb=k*(big?hf/2.2:1),R=(far?5:6)*f,h=(far?8.5:10.5)*f,m=big?10:8,w=2*Math.ceil(R+m),H=Math.ceil(h+R+2*m),c=document.createElement("canvas"),x=c.getContext("2d"),px=w/2,py=H-m,cy=py-h,a=Math.acos(R/h);
  c.width=Math.round(w*DPR);c.height=Math.round(H*DPR);x.scale(DPR,DPR);
  x.beginPath();x.moveTo(px,py);x.arc(px,cy,R,Math.PI/2+a,Math.PI*2.5-a);x.closePath();
  x.shadowColor="rgba(0,0,0,.38)";x.shadowBlur=(big?4:2)*kb*DPR;x.shadowOffsetX=-DPR;x.shadowOffsetY=DPR;x.fillStyle=PCOL[kind]||PCOL.condo;x.fill();
  x.shadowColor="transparent";x.shadowBlur=0;x.shadowOffsetX=x.shadowOffsetY=0;x.lineWidth=(big?2:1.5)*kb;x.strokeStyle=kind==="pre"?"#f4f6f8":"#fff";x.stroke();
  if(kind==="pre"){x.lineWidth=.6*kb;x.strokeStyle="#6b737d";x.stroke()}
  x.beginPath();x.arc(px,cy,R*.3,0,Math.PI*2);x.fillStyle="#fff";x.fill();
  return SPR[key]={c,w,h:H,ax:px,ay:py}}
const gPin=mkGroup({z:640,on:()=>mkZ>=9.5,ok:it=>showKind[it.k],off:()=>14*pinK(),
  spr:big=>{const far=mkZ<11,k=pinK(),m={condo:sprPin("condo",far,big,k),loft:sprPin("loft",far,big,k),pre:sprPin("pre",far,big,k)};return it=>m[it.k]},
  hit:(it,dx,dy)=>{const f=(it===hotPin?pinHot():1)*pinK(),far=mkZ<11,R=(far?5:6)*f,h=(far?8.5:10.5)*f;return dx*dx+(dy+h)*(dy+h)<=(R+3)*(R+3)||(Math.abs(dx)<=R*.6&&dy<=1&&dy>=-h)},
  click:it=>{if(sel!==it.id)pick(it.id,null);hot(it.id,it.i,false,true);mkTip(mkMouse?null:it);zoomPop(it.ll)}});   /* by touch there is no hover, so the tapped building keeps its name label */
Object.keys(PINS).forEach(id=>PINS[id].forEach((p,i)=>{if(!p)return;const cs=DISTRICTS[id].condos[i].split(";").map(x=>x.split("|")),w=walkTo(p);
  pinOf[id+"|"+i]=mkAdd(gPin,p[0],p[1],(cs.every(c=>c[0]===cs[0][0])?"<b>"+esc(cs[0][0])+"</b><br><span style=\"font-weight:400\">"+cs.map(c=>esc(c[1])).join(" \u00b7 ")+"</span>":cs.map(c=>"<b>"+esc(c[0])+"</b><br><span style=\"font-weight:400\">"+esc(c[1])+"</span>").join("<br>"))+(cs.some(c=>c[2]==="pre")?"<br><i>Pre-construction"+esc(preWhen(cs.find(c=>c[2]==="pre")))+"</i>":kindOf(cs)==="loft"?"<br><i>Loft</i>":"")+(p[2]?"":"<br><i>approximate spot</i>")+(w?"<br><span style=\"font-weight:400\">"+esc(walkTxt(w))+"</span>":""),{id,i,k:kindOf(cs)})}));
mkSort(gPin);
/* hit test for the symbols: hover shows the label (and, for a condo, lights its list entry); a click acts on it.
   The click is caught before it reaches the district underneath. */
let mkOver=null,mkPt=null,mkXY=null,mkMouse=true,downAt=null,hitQ=0,dragging=false;
map.on("dragstart",()=>{dragging=true});map.on("dragend",()=>{dragging=false});
function mkAt(cp){const q=map.containerPointToLayerPoint(cp);
  if(hotPin&&hotPin.g.vis&&hotPin.sx===hotPin.sx&&hotPin.g.hit(hotPin,q.x-hotPin.sx,q.y-hotPin.sy))return hotPin;
  for(let a=MK.length-1;a>=0;a--){const g=MK[a];if(!g.vis||!g.hit)continue;
    for(let b=g.items.length-1;b>=0;b--){const it=g.items[b],dx=q.x-it.sx,dy=q.y-it.sy;if(dx<32&&dx>-32&&dy<16&&dy>-48&&g.hit(it,dx,dy))return it}}
  return null}
function mkEnter(it){if(it.g===gPin)hot(it.id,it.i,false,false);mkTip(it)}
function mkLeave(it){if(it.g===gPin){if(!stick)hot(null);else if(it!==hotPin&&mkTipIt===it)mkTip(null)}else if(mkTipIt===it)mkTip(null)}
/* The pointer has come off a symbol: whatever lies underneath (a district, a community, a station) is told the
   pointer is over it, so its own label comes back, as it did when symbols were page elements on top of it. */
const mc=map.getContainer();
function mkUnder(){const el=mkXY&&document.elementFromPoint(mkXY[0],mkXY[1]);
  if(el&&el!==mc&&mc.contains(el))el.dispatchEvent(new MouseEvent("mouseover",{bubbles:true,cancelable:true,view:window,clientX:mkXY[0],clientY:mkXY[1]}))}
function mkHover(){hitQ=0;if(map._animatingZoom||dragging)return;const it=mkPt?mkAt(mkPt):null,was=mkOver;
  if(it!==was){if(was)mkLeave(was);mkOver=it;if(it)mkEnter(it);else if(mkPt)mkUnder()}
  mc.classList.toggle("on-pin",!!it)}
map.on("mousemove",e=>{const o=e.originalEvent;if(o){mkXY=[o.clientX,o.clientY];mkPt=o.target&&o.target.closest&&o.target.closest(".leaflet-control")?null:e.containerPoint}
  if(!hitQ)hitQ=requestAnimationFrame(mkHover)});
/* the map has moved or zoomed under a mouse pointer that stayed still: look again at what is under it */
map.on("moveend",()=>{if(mkPt&&mkMouse&&!hitQ)hitQ=requestAnimationFrame(mkHover)});
mc.addEventListener("mouseleave",()=>{mkPt=null;if(mkOver){mkLeave(mkOver);mkOver=null}mc.classList.remove("on-pin")});
mc.addEventListener("pointermove",e=>{mkMouse=e.pointerType==="mouse"},{capture:true,passive:true});
mc.addEventListener("pointerdown",e=>{downAt=[e.clientX,e.clientY];mkMouse=e.pointerType==="mouse"},true);
mc.addEventListener("click",e=>{if(e.target.closest&&e.target.closest(".panel,.layers,.leaflet-control,.leaflet-tooltip,.leaflet-marker-icon"))return;
  if(downAt&&Math.hypot(e.clientX-downAt[0],e.clientY-downAt[1])>6)return;
  const r=mc.getBoundingClientRect(),it=mkAt(L.point(e.clientX-r.left,e.clientY-r.top));if(!it)return;
  e.stopPropagation();e.preventDefault();mkOver=it;it.g.click(it)},true);   /* mkOver: the pointer is on it, so its label stays closed until the pointer leaves and returns */
mkReady=true;mkReset();
/* The name labels' pictures are drawn ahead of time, a few per idle moment, so that work never lands in the middle of a zoom. */
{const idle=window.requestIdleCallback||(f=>setTimeout(f,80)),todo=[[gDL,LB.dl15],[gDL,LB.dl11],[gDL,LB.dl20],[gCL,LB.cl]];let a=0,b=0;
  const step=d=>{let n=0;while(a<todo.length&&n<10&&!(d&&d.timeRemaining&&d.timeRemaining()<3)){const g=todo[a][0];if(b<g.items.length){lbSpr(todo[a][1])(g.items[b++]);n++}else{a++;b=0}}if(a<todo.length)idle(step)};idle(step)}
/* Phones: hover labels are hidden while a pinch or zoom animation runs; they reappear on zoomend. */
const touch=matchMedia("(pointer:coarse)").matches||small.matches;
if(touch){const zp=["markerPane","tooltipPane"].map(n=>map.getPane(n)).filter(Boolean);
  map.on("zoomstart",()=>zp.forEach(p=>p.style.visibility="hidden"));map.on("zoomend",()=>zp.forEach(p=>p.style.visibility=""))}
/* Inside the Neighborhood page on a phone, one finger should scroll the page, not get trapped moving the map:
   two fingers move and zoom the map; the full-screen map keeps normal one-finger dragging. */
if(touch&&window.top!==window){map.dragging.disable();let hintT=0;
  map.getContainer().addEventListener("touchmove",e=>{if(e.touches.length===1&&Date.now()-hintT>6000){hintT=Date.now();note("Use two fingers to move the map, or open it full screen.")}},{passive:true})}
let stick=false;
/* Hover labels (districts, communities, condos, groceries, stations, campuses): at most one on screen at a time,
   and never left behind. Browsers sometimes skip the "mouse left" signal (fast moves, page scrolling under a
   still pointer, zooming), which left labels stranded on the map; these checks close them regardless. */
let openTip=null;
const tipEl=t=>{const s=t&&t._source;return s&&(s._path||s._icon)};
const tipClose=()=>{const t=openTip;openTip=null;if(t===mkTT)mkTip(null);else if(t&&t._source)t._source.closeTooltip()};
map.on("tooltipopen",e=>{
  if(e.tooltip!==mkTT&&mkOver&&mkTipIt===mkOver){const src=e.tooltip._source;Promise.resolve().then(()=>{if(src&&mkOver)src.closeTooltip()});return}   /* the pointer is on a symbol: its label stays, the area label underneath does not replace it */
  if(openTip&&openTip!==e.tooltip)tipClose();openTip=e.tooltip});
map.on("tooltipclose",e=>{if(openTip===e.tooltip)openTip=null;if(e.tooltip===mkTT)mkTipIt=null});
map.getContainer().addEventListener("mousemove",ev=>{if(!openTip)return;const el=tipEl(openTip);if(el&&!el.contains(ev.target))tipClose()},{passive:true});
map.getContainer().addEventListener("mouseleave",()=>{if(!stick)hot(null);tipClose()});
map.on("zoomstart",()=>{if(!stick)tipClose()});
document.addEventListener("visibilitychange",()=>{if(document.hidden)tipClose()});
function hot(id,i,pan,keep){
  if(hotPin){if(mkTipIt===hotPin)mkTip(null);hotPin=null;mkDirty()}
  document.querySelectorAll("ul.condos li.hot,ul.condos li.picked").forEach(l=>l.classList.remove("hot","picked"));
  stick=!!keep;if(id==null)return;
  if(keep&&id===sel)nearby(id,i);
  const m=pinOf[id+"|"+i];if(!m||!gPin.on())return;   /* pins are not shown when zoomed far out */
  hotPin=m;mkDirty();
  if(pan){const ll=L.latLng(m.ll),pad=small.matches?L.latLngBounds(map.containerPointToLatLng([20,60]),map.containerPointToLatLng([innerWidth-20,innerHeight*.36])):L.latLngBounds(map.containerPointToLatLng([400,60]),map.containerPointToLatLng([map.getSize().x-340,map.getSize().y-40]));
    if(!pad.contains(ll)){const off=small.matches?[0,map.getSize().y*.22]:[-190,0];map.panTo(map.unproject(map.project(ll).add(off)),{animate:true,duration:.35})}
    mkTip(m)}
  if(id===sel){const li=document.querySelector('ul.condos li[data-i="'+i+'"]');if(li){li.classList.add("hot");if(keep)li.classList.add("picked");if(!pan)panelScrollTo(li,keep)}}
}
/* Scroll only the side panel (never the page around the map): a clicked condo is brought to the middle of the
   list, a hovered one just into view. */
function panelScrollTo(li,center){const sc=$("pbody");if(!sc)return;const a=sc.getBoundingClientRect(),b=li.getBoundingClientRect();let top;
  if(center)top=sc.scrollTop+(b.top-a.top)-(a.height-b.height)/2;
  else if(b.top<a.top)top=sc.scrollTop+(b.top-a.top)-8;else if(b.bottom>a.bottom)top=sc.scrollTop+(b.bottom-a.bottom)+8;else return;
  sc.scrollTop=Math.max(0,top)}   /* instant: a smooth scroll was cut short when the Nearby section redrew */
function restyle(){distLayer.setStyle(f=>dStyle(f.properties.d));commLayer.setStyle(cStyle);
  const z=map.getZoom(),wide=z<9.5;
  glowLayer.eachLayer(l=>{const c=l.options.className;l.setStyle({weight:c==="glow-halo"?(z<10?6:z<12?11:z<14?15:20):(z<10?2:z<12?3:z<14?4.5:6)})});
  subLayer.eachLayer(m=>m.setRadius(z<11?3:z<13?5:7));!wide?subLayer.addTo(map):map.removeLayer(subLayer)}
map.on("zoomend",restyle);
function setComm(on){showComm=true;commLayer.addTo(map);restyle()}
$("l-dist").onchange=e=>{e.target.checked?distLayer.addTo(map):map.removeLayer(distLayer);mkDirty()};
$("l-day").onchange=e=>{dayOn=e.target.checked;if(!dayOn){mkDirty();return}
  dayData().then(()=>{mkDirty();if(map.getZoom()<13)note("Daycares show when you zoom in closer.")},()=>{e.target.checked=dayOn=false;note("Daycares could not be loaded just now. Please try again.")})};
[1,2,4,8].forEach(f=>{$("l-s"+f).onchange=e=>{schMask=e.target.checked?schMask|f:schMask&~f;mkDirty();if(!schMask)return;
  schData().then(()=>{mkDirty();if(map.getZoom()<13)note("Schools show when you zoom in closer.")},()=>{e.target.checked=false;schMask&=~f;note("Schools could not be loaded just now. Please try again.")})}});
["pre","condo","loft"].forEach(k=>{$("l-"+k).onchange=e=>{showKind[k]=e.target.checked;mkDirty()}});
$("l-base").onchange=e=>{tilesOk=tilesBad=0;setBase(e.target.checked)};
base.addTo(map);

/* Selection glow: whatever was just chosen (a district, a community, a region, or a place from the quick buttons)
   gets a soft gold halo. One static outline that pulses twice when it appears, then stays still: no ongoing redraws. */
const selGlow=L.layerGroup().addTo(map);
function glowClear(){selGlow.clearLayers()}
function glowShape(shapes){glowClear();
  shapes.forEach(latlngs=>[["sel-glow-halo",16,.38],["sel-glow-core",4,.95]].forEach(k=>selGlow.addLayer(L.polygon(latlngs,{pane:"pHalo",interactive:false,fill:false,color:"#ffb400",weight:k[1],opacity:k[2],lineJoin:"round",className:k[0]}))))}
function glowPoint(ll){glowClear();
  selGlow.addLayer(L.circleMarker(ll,{pane:"pRing",interactive:false,radius:24,color:"#ffb400",weight:5,opacity:.95,fillColor:"#ffb400",fillOpacity:.16,className:"sel-glow-ring"}))}
function glowLayersOf(group,match){const ll=[];group.eachLayer(l=>{if(match(l.feature.properties))ll.push(l.getLatLngs())});return ll}

/* panel */
function pick(id,comm,fly){plStatic().catch(()=>{});
  sel=id;selComm=comm||null;restyle();
  {const ll=comm?glowLayersOf(commLayer,p=>p.d===id&&p.n===comm):glowLayersOf(distLayer,p=>p.d===id);if(ll.length)glowShape(ll)}
  const d=DISTRICTS[id],spots=d.spots.map(s=>s.split("|")),condos=d.condos.map(s=>s.split(";").map(x=>x.split("|"))),nb=condos.reduce((a,c)=>a+c.length,0);
  const comms=COMM.features.filter(f=>f.properties.d===id).map(f=>f.properties);
  let h='<div class="head"><div class="badge" style="background:'+COL[id[0]][1]+'">'+id+'</div><div><h2>'+esc(d.name)+'</h2></div></div>';
  if(comm){const p=comms.find(c=>c.n===comm);if(p)h+='<div class="comm"><b>'+esc(comm)+'</b>Nearest subway: '+esc(p.near.s[0])+', about '+fmt(p.near.d)+' away</div>'}
  const sch=SCHOOLS[id]||[],BOARD={P:"Public (TDSB)",C:"Catholic (TCDSB)",F:"French-language"};
  h+='<details class="sec sch"><summary><h3>Schools <span>'+sch.length+' · <em>show</em></span></h3><p class="sum">'+(["P","C","F"].map(b=>[sch.filter(s=>s[1]===b).length,BOARD[b]]).filter(x=>x[0]).map(x=>x[0]+' '+x[1]).join(' · ')||'None listed for this district')+'</p></summary>'+["P","C","F"].map(b=>{const l=sch.filter(s=>s[1]===b);if(!l.length)return"";
    return '<div class="sg b-'+b+'"><b><i></i>'+BOARD[b]+' · '+l.length+'</b><div class="chips">'+l.map(s=>'<span>'+esc(s[0])+(s[2]?' <u>Secondary</u>':'')+'</span>').join("")+'</div></div>'}).join("")+'</details>';
  h+='<details class="sec sch"><summary><h3>Highlights <span>'+spots.length+' · <em>show</em></span></h3><p class="sum">'+esc(spots.slice(0,2).map(s=>s[0]).join(', '))+' and '+(spots.length-2)+' more</p></summary>'+spots.map((s,i)=>'<div class="spot t-'+s[1]+'"><div class="rank">'+(i+1)+'</div><div><b>'+esc(s[0])+'</b><small><span class="tag">'+TYPE[s[1]]+'</span>'+esc(s[2])+'</small></div></div>').join("")+'</details>';
  h+='<details class="sec sch" id="nearby"'+(nbOpen?" open":"")+'><summary><h3>Nearby <span id="nbcount"><em>show</em></span></h3><p class="sum" id="nbsum">Caf\u00e9s, restaurants and drinks within a 5 minute walk. Click a condominium to see them.</p></summary><div id="nbbody"><p class="none">Click a condominium in the list below, or its pin on the map, to see what is within a 5 minute walk.</p></div></details>';
  h+='<div class="sec"><h3>Condominiums <span>'+(nb?nb+(nb===1?' building':' buildings'):'')+'</span></h3>'+(condos.length?'<label class="sort">Sort by <select id="csort"><option value="az">A to Z</option><option value="za">Z to A</option><option value="walk">Walking distance to subway</option></select></label>'+(condos.length>12?'<input id="cfind" class="cfind" placeholder="Filter by building or street" autocomplete="off" aria-label="Filter condominiums">':'')+'<div id="clist"></div>':'<p class="none">Mostly houses and townhomes here. Ask about current condo options in '+id+'.</p>')+'</div>';
  h+='<div class="beta"><p><b>Feedback, additions or improvements.</b> If a building is missing, a detail looks wrong, or you have an idea that would make this map more useful, please let us know at <a href="mailto:'+esc(AGENT.email)+'?subject='+encodeURIComponent("Map feedback – "+id)+'">'+esc(AGENT.email)+'</a> or '+esc(AGENT.phone)+'.</p>'
   +'<p><b>Please verify before you rely on it.</b> This map is a general guide, not advice. Confirm every detail independently before making a decision, including district and community boundaries, condominium names and addresses, and school listings. Schools shown are those located in the district; the school a home is assigned to depends on its address, so confirm with the school board. Walking times are estimates. The buildings shown are a sample, not every condominium in the district, and are not live listings. This is not an official real estate board map, and no guarantee is given that the information is accurate, complete or current.</p>'
   +'<p><b>Sources.</b> Contains information licensed under the <a href="https://open.toronto.ca/open-data-license/" target="_blank" rel="noopener">Open Government Licence – Toronto</a> (City of Toronto Open Data: neighbourhood boundaries and school locations). Regional boundaries adapted from Statistics Canada, 2021 Census – Boundary files (census divisions); this does not constitute an endorsement by Statistics Canada of this product. Street map &copy; OpenStreetMap contributors.</p></div>';
  $("pbody").innerHTML=h;$("pbody").scrollTop=0;
  if($("nearby"))$("nearby").addEventListener("toggle",e=>{nbOpen=e.target.open});
  hot(null);cfilter="";if($("cfind"))$("cfind").oninput=e=>{cfilter=e.target.value;hot(null);fillCondos(id)};if($("csort")){$("csort").value=csort;$("csort").onchange=e=>{csort=e.target.value;hot(null);fillCondos(id)};fillCondos(id)}
  $("cta").innerHTML='<b>For more information,</b><div>'+esc(AGENT.line)+'</div><p><a href="tel:+1'+AGENT.phone.replace(/\D/g,"")+'">'+esc(AGENT.phone)+'</a> \u00b7 <a href="mailto:'+esc(AGENT.email)+'?subject='+encodeURIComponent("Question about "+id+(comm?" – "+comm:""))+'">'+esc(AGENT.email)+'</a></p><div>'+esc(AGENT.extra||"")+'</div>';
  $("panel").classList.remove("mini");$("panel").classList.add("open");
  $("pbar").innerHTML='<span class="pb-badge" style="background:'+COL[id[0]][1]+'">'+id+'</span><span class="pb-txt"><b>'+esc(comm||d.name)+'</b><small>'+(nb?nb+(nb===1?" building":" buildings")+" \u00b7 ":"")+'Show details</small></span><svg class="pb-up" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4 10l4-4 4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  if(fly){let b=null;(comm?commLayer:distLayer).eachLayer(l=>{const p=l.feature.properties;if(p.d===id&&(!comm||p.n===comm))b=b?b.extend(l.getBounds()):L.latLngBounds(l.getBounds().getSouthWest(),l.getBounds().getNorthEast())});
    if(b)map.flyToBounds(b,{paddingTopLeft:small.matches?[20,20]:[400,30],paddingBottomRight:small.matches?[20,innerHeight*.5]:[30,30],maxZoom:14.5,duration:.6})}
}
/* Nearby: cafes, restaurants and drinks within a 5 minute walk of the chosen condominium.
   Built into the page (NEARBY) from OpenStreetMap, gathered 24 Nov 2026: per condominium, a count for each group and its nearest few places. */
const NB_GROUPS=["Caf\u00e9s & coffee","Restaurants","Bars & drinks"],NB_CLS=["cafe","food","drink"],NB_SKIP=/parking|bed and breakfast/i;
let nbOpen=false,nbShown=null;
/* Nearby places are looked up on demand for the chosen condominium only (a small box around its pin),
   instead of downloading every cafe and restaurant in the city for every visitor in the background.
   Results are kept for this visit. The built-in NEARBY data (nearest few per group) shows while a lookup
   runs and stays as the fallback when OpenStreetMap's lookup service cannot be reached. */
const PL_URLS=["https://overpass-api.de/api/interpreter","https://overpass.private.coffee/api/interpreter","https://overpass.kumi.systems/api/interpreter"];
const PL_BOX=[.004,.006];   /* the same search box nbGroups uses, wider than a 5 minute walk */
const PL={};                /* "C08|12" -> {s:"loading"|"ok"|"failed", l:[[name,kind,lat,lon],...]} */
/* sort an OpenStreetMap place into 0 cafes & coffee, 1 restaurants, 2 bars & drinks (-1 = skip) */
function plKind(am,sh,cu){cu=(cu||"").toLowerCase();
  if(/bubble_tea|juice|tea(?!ch)/.test(cu)&&am!=="restaurant")return 2;
  if(am==="cafe"||sh==="coffee"||(/coffee/.test(cu)&&am!=="restaurant"))return 0;
  if(am==="bar"||am==="pub"||sh==="tea"||sh==="beverages")return 2;
  if(am==="restaurant"||am==="fast_food"||am==="food_court")return 1;return -1}
function plQuery(p){const b=[p[0]-PL_BOX[0],p[1]-PL_BOX[1],p[0]+PL_BOX[0],p[1]+PL_BOX[1]].map(x=>x.toFixed(5)).join(",");
  return '[out:csv(::lat,::lon,name,amenity,shop,cuisine;false;"|")][timeout:25];(nwr[amenity~"^(cafe|restaurant|fast_food|food_court|bar|pub)$"][name]('+b+');nwr[shop~"^(coffee|tea|beverages)$"][name]('+b+'););out center;'}
function plParse(tx){const l=[];tx.split("\n").forEach(row=>{const a=row.split("|");if(a.length!==6)return;const la=+a[0],lo=+a[1],n=a[2].trim(),k=plKind(a[3],a[4],a[5]);if(!isFinite(la)||!isFinite(lo)||k<0||n.length<2||n.length>60||NB_SKIP.test(n))return;l.push([n,k,+la.toFixed(5),+lo.toFixed(5)])});return l}
/* Ask the servers one at a time: move on to the next at once if one fails, or after 9 seconds without an
   answer (the slow one keeps going). The first good answer wins; give up after 30 seconds. */
function plFetch(p){return new Promise((res,rej)=>{let k=-1,done=false,pending=0;const ctl=[],body="data="+encodeURIComponent(plQuery(p));
  const finish=(ok,v)=>{if(done)return;done=true;ctl.forEach(c=>c.abort());ok?res(v):rej(v)};
  const next=()=>{if(done)return;k++;if(k>=PL_URLS.length){if(!pending)finish(false,new Error("unavailable"));return}
    const c=new AbortController();ctl.push(c);pending++;let moved=false;const move=()=>{if(!moved){moved=true;next()}};
    const t=setTimeout(move,9000);
    fetch(PL_URLS[k],{method:"POST",body,headers:{"Content-Type":"application/x-www-form-urlencoded"},signal:c.signal})
      .then(r=>{if(!r.ok)throw new Error("HTTP "+r.status);return r.text()})
      .then(tx=>{if(/^\s*</.test(tx))throw new Error("not a data reply");clearTimeout(t);finish(true,plParse(tx))})
      .catch(()=>{if(done)return;pending--;clearTimeout(t);move();if(!pending&&k>=PL_URLS.length)finish(false,new Error("unavailable"))})};
  next();setTimeout(()=>finish(false,new Error("timeout")),30000)})}
/* Nearby places normally come from a file on this site (public/map/places.txt, collected from OpenStreetMap),
   so they show at once and never wait on an outside server. Only if that file cannot be read does the
   live OpenStreetMap lookup above run instead. */
let plAll=null;
function plStatic(){return plAll||(plAll=fetch("/map/places.txt").then(r=>{if(!r.ok)throw new Error("HTTP "+r.status);return r.text()}).then(tx=>{const l=[];
  tx.split("\n").forEach(row=>{if(!row||row[0]==="#")return;const a=row.split("~");if(a.length<4)return;const la=(+a[0]+4360000)/1e5,lo=(+a[1]-7940000)/1e5,k=+a[2],n=a.slice(3).join("~");
    if(isFinite(la)&&isFinite(lo)&&k>=0&&k<3&&n.length>1)l.push([n,k,la,lo])});if(!l.length)throw new Error("empty");return l}).catch(e=>{plAll=null;throw e}))}
/* starts a lookup once per condominium; after a failure only the "Try again" button (force) starts another */
function plLoad(id,i,force){const key=id+"|"+i,p=(PINS[id]||[])[i];if(!p||(PL[key]&&!(force&&PL[key].s==="failed")))return;
  PL[key]={s:"loading"};
  plStatic().then(all=>all.filter(x=>Math.abs(x[2]-p[0])<=PL_BOX[0]&&Math.abs(x[3]-p[1])<=PL_BOX[1]),()=>plFetch(p)).then(l=>{PL[key]={s:"ok",l}},()=>{PL[key]={s:"failed"}}).then(()=>{if(nbShown&&nbShown[0]===id&&nbShown[1]===i&&sel===id)nearby(id,i)})}
function nbGroups(id,i){   /* -> [[count,[[name,min],...]] x3, complete?] */
  const p=PINS[id][i],got=PL[id+"|"+i];
  if(got&&got.s==="ok"){const g=[[],[],[]],seen={};
    got.l.forEach(x=>{if(Math.abs(x[2]-p[0])>.004||Math.abs(x[3]-p[1])>.006)return;const d=km([p[0],p[1]],[x[2],x[3]]),min=Math.max(1,Math.round(d*1.3/0.08));if(min>5)return;const key=x[1]+x[0].toLowerCase();if(seen[key]&&seen[key]<=d)return;seen[key]=d;g[x[1]].push([x[0],min,d])});
    return g.map(l=>{const best={};l.forEach(x=>{const k=x[0].toLowerCase();if(!best[k]||x[2]<best[k][2])best[k]=x});const u=Object.values(best).sort((a,b)=>a[2]-b[2]);return[u.length,u]}).concat([true])}
  const row=(NEARBY.c[id]||[])[i];if(!row)return null;
  return row.map(g=>[g[0],g[1].map(x=>[NEARBY.n[x[0]],x[1]]).filter(x=>x[0].length>1&&!NB_SKIP.test(x[0]))]).concat([false])}
/* Redrawing Nearby (above the list) changes its height; keep the chosen condo where it is on screen. */
function nearby(id,i){const pk=document.querySelector("ul.condos li.picked"),sc=$("pbody"),y0=pk?pk.getBoundingClientRect().top:0;
  nearbyDraw(id,i);if(pk&&pk.isConnected&&sc)sc.scrollTop+=pk.getBoundingClientRect().top-y0}
function nearbyDraw(id,i){
  const el=$("nearby");if(!el||sel!==id||!(PINS[id]||[])[i])return;nbShown=[id,i];plLoad(id,i);const st=(PL[id+"|"+i]||{}).s;
  const open={};el.querySelectorAll(".nbg").forEach(d=>{open[d.dataset.k]=d.open});const G=nbGroups(id,i);
  const c=DISTRICTS[id].condos[i].split(";")[0].split("|")[0],p=PINS[id][i];
  if(!G){const ld=st==="loading";$("nbcount").innerHTML='<em>show</em>';$("nbsum").textContent="Near "+c+": "+(ld?"loading…":"not loaded yet");
    $("nbbody").innerHTML='<p class="nbfor">Within a 5 minute walk of <b>'+esc(c)+'</b></p><p class="none">'+(ld?'Loading nearby places\u2026':'Nearby places could not be loaded just now. <button type="button" class="retry" id="plretry0">Try again</button>')+'</p>';
    el.querySelectorAll('[id^="plretry"]').forEach(b=>b.onclick=()=>{plLoad(id,i,true);nearby(id,i)});return}
  const row=G.slice(0,3),total=row.reduce((a,g)=>a+g[0],0);
  $("nbcount").innerHTML=total+' \u00b7 <em>show</em>';
  $("nbsum").textContent="Near "+c+": "+(total?row.map((g,k)=>g[0]?g[0]+" "+(g[0]===1&&k===1?"restaurant":NB_GROUPS[k].toLowerCase()):"").filter(Boolean).join(" \u00b7 "):"nothing mapped within a 5 minute walk");
  $("nbbody").innerHTML='<p class="nbfor">Within a 5 minute walk of <b>'+esc(c)+'</b>'+(p[2]?'':' (approximate location, so times are rough)')+'</p>'+(total?row.map((g,k)=>{if(!g[0])return"";const more=g[0]-g[1].length;
    return '<details class="sg nbg nb-'+NB_CLS[k]+'"'+(open[k]?" open":"")+' data-k="'+k+'"><summary><b><i></i>'+NB_GROUPS[k]+' \u00b7 '+g[0]+' <em>show</em></b></summary><ul class="nb">'+g[1].map(x=>'<li><span>'+esc(x[0])+'</span><em>'+x[1]+' min</em></li>').join("")+'</ul>'+(more>0?'<p class="none">'+(st==="loading"?'Nearest shown. Loading the other '+more+'\u2026':'Nearest shown. '+more+' more within 5 minutes. <button type="button" class="retry" id="plretry'+k+'">Show all</button>')+'</p>':'')+'</details>'}).join(""):'<p class="none">Nothing mapped within a 5 minute walk.</p>')+'<p class="none nbsrc">Estimated walking times. Places from OpenStreetMap (November 2026); some may be missing, closed or renamed.</p>';
  el.querySelectorAll('[id^="plretry"]').forEach(b=>b.onclick=()=>{plLoad(id,i,true);nearby(id,i)});
}
/* condominium list: sorted view of DISTRICTS[id].condos; data-i keeps the original index so pins still line up */
let csort="az",cfilter="";
const PRE=x=>'<u class="pre">Pre-construction'+esc(preWhen(x))+'</u>';
/* a building with several addresses under one name is written once; true twins keep both names */
function cHtml(c){const pre=c.some(x=>x[2]==="pre")?" "+PRE(c.find(x=>x[2]==="pre")):"";
  return c.every(x=>x[0]===c[0][0])?'<div>'+esc(c[0][0])+pre+'<small>'+c.map(x=>esc(x[1])).join(" \u00b7 ")+'</small></div>':c.map(x=>'<div>'+esc(x[0])+(x[2]==="pre"?" "+PRE(x):"")+'<small>'+esc(x[1])+'</small></div>').join("")}
/* While the list is scrolling, rows sliding under a still pointer must not each move the map and open a
   label (that made scrolling the list stutter). A row reacts only once the pointer rests on it. */
let listScrolling=false,listScrollT=0,listHoverT=0;
$("pbody").addEventListener("scroll",()=>{listScrolling=true;clearTimeout(listScrollT);clearTimeout(listHoverT);listScrollT=setTimeout(()=>{listScrolling=false},180)},{passive:true});
function fillCondos(id){
  const rows=DISTRICTS[id].condos.map((s,i)=>{const c=s.split(";").map(x=>x.split("|")),p=(PINS[id]||[])[i];return{i,c,p,w:walkTo(p),key:c[0][0].replace(/^the\s+/i,"").toLowerCase()}});
  const az=(a,b)=>a.key.localeCompare(b.key,"en",{numeric:true});
  const f=cfilter.trim().toLowerCase(),all=rows.length;if(f)for(let k=rows.length-1;k>=0;k--){if(!rows[k].c.some(x=>(x[0]+" "+x[1]).toLowerCase().includes(f)))rows.splice(k,1)}
  rows.sort(csort==="za"?(a,b)=>az(b,a):csort==="walk"?(a,b)=>(a.w?a.w.min:99)-(b.w?b.w.min:99)||az(a,b):az);
  $("clist").innerHTML=(f?'<p class="none cf">'+rows.length+' of '+all+' match</p>':'')+'<ul class="condos">'+rows.map(r=>'<li data-i="'+r.i+'"'+' class="k-'+kindOf(r.c)+(r.p?'" tabindex="0"':' nopin"')+'>'+cHtml(r.c)+(r.p?(r.p[2]?'':'<small><em>approximate spot</em></small>'):'<small><em>not on the map yet</em></small>')+(r.w?'<small class="wk">'+esc(walkTxt(r.w))+'</small>':(csort==="walk"?'<small class="nw">'+(r.p&&r.p[2]?'No subway within a 10 minute walk':'Walking time not available')+'</small>':''))+'</li>').join("")+'</ul>';
  $("clist").querySelectorAll("li:not(.nopin)").forEach(li=>{const i=+li.dataset.i;
    li.addEventListener("mouseenter",()=>{clearTimeout(listHoverT);if(stick||listScrolling)return;listHoverT=setTimeout(()=>{if(!stick&&!listScrolling)hot(id,i,true,false)},110)});li.addEventListener("mouseleave",()=>{clearTimeout(listHoverT);if(!stick)hot(null)});
    li.addEventListener("focus",()=>hot(id,i,true,false));
    li.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();li.click()}});
    li.addEventListener("click",()=>{const same=stick&&hotPin===pinOf[id+"|"+i];hot(null);if(!same)hot(id,i,true,true)})});
}
function unpick(){hot(null);glowClear();$("panel").classList.remove("open","mini");sel=selComm=null;restyle()}
/* minimize: the panel folds into a small bar (district badge, name, "Show details") so the map is free again;
   clicking the bar brings the full panel back exactly where it was. */
$("pmin").onclick=()=>{$("panel").classList.add("mini");$("pbar").focus({preventScroll:true})};
$("pbar").onclick=()=>{$("panel").classList.remove("mini");$("pmin").focus({preventScroll:true})};
$("close").onclick=()=>{unpick();map.getContainer().focus({preventScroll:true})};
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&$("panel").classList.contains("open")&&!e.defaultPrevented){unpick();map.getContainer().focus({preventScroll:true})}});
map.on("click",()=>{if(stick)hot(null)});

/* search */
const names={};Object.keys(DISTRICTS).forEach(k=>names[k.toLowerCase()]=[k,null]);
COMM.features.forEach(f=>{const p=f.properties,key=p.n.toLowerCase();if(names[key])p.dup=1;else names[key]=[p.d,p.n]});
const EXTRA={"leslieville":["E01","South Riverdale"],"liberty village":["C01","Niagara"],"king west":["C01","Niagara"],"cityplace":["C01","Waterfront Communities-The Island"],"yorkville":["C02","Annex"],"distillery district":["C08","Waterfront Communities-The Island"],"st. lawrence":["C08","Waterfront Communities-The Island"],"the junction":["W02","Junction Area"],"humber bay shores":["W06","Mimico (includes Humber Bay Shores)"],"north york centre":["C14","Willowdale East"],"scarborough town centre":["E09","Bendale"],"davisville":["C10","Mount Pleasant West"],"entertainment district":["C01","Waterfront Communities-The Island"],"chinatown":["C01","Kensington-Chinatown"],"greektown":["E03","Playter Estates-Danforth"],"koreatown":["C01","Palmerston-Little Italy"],"korea town":["C01","Palmerston-Little Italy"]};
Object.assign(names,EXTRA);
$("names").innerHTML=Object.keys(DISTRICTS).map(k=>'<option value="'+k+'">').join("")+Object.keys(names).filter(k=>names[k][1]).sort().map(k=>'<option value="'+esc(k.replace(/\b[a-z]/g,m=>m.toUpperCase()))+'">').join("")+Object.keys(regPoly).map(k=>'<option value="'+esc(k.replace(/\b[a-z]/g,m=>m.toUpperCase()))+'">').join("");
/* Places in the search box: every condominium, school and park. Each name points to its district;
   condos also to their pin. Names used in more than one district get the district code added. */
const places={},placeOpts=[];
(function(){const add=(name,lab,t)=>{let v=name,k=v.toLowerCase();if(places[k]&&!(places[k].t==="c"&&t.t==="c"&&places[k].id===t.id&&places[k].i===t.i)){v=name+" ("+t.id+")";k=v.toLowerCase();if(places[k])return}
    if(places[k])return;places[k]=t;placeOpts.push([v,lab])};
  Object.keys(DISTRICTS).forEach(id=>{const d=DISTRICTS[id];
    d.condos.forEach((c,i)=>c.split(";").forEach(x=>add(x.split("|")[0],KIND[kindOf([x.split("|")])]+" · "+id,{t:"c",id,i})));
    (SCHOOLS[id]||[]).forEach(sc=>add(sc[0],"School · "+id,{t:"s",id,n:sc[0]}));
    d.spots.forEach(sp=>{const a=sp.split("|");if(a[1]==="park")add(a[0],"Park · "+id,{t:"p",id,n:a[0]})})});
  MALLS.forEach(m=>add(m[0],"Shopping centre",{t:"m",ll:[m[1],m[2]]}));
  UNIS.forEach(u=>add(u[0],"Campus",{t:"m",ll:[u[1],u[2]]}));
  add("The Well","Shops & dining \u00b7 C01",{t:"m",ll:[43.6430,-79.3955]});
  /* everyday short names people type */
  const al={"candy loft":"candy factory lofts","candy lofts":"candy factory lofts","uoft":"university of toronto, st. george","u of t":"university of toronto, st. george","tmu":"toronto metropolitan university","toy factory":"toy factory lofts"};Object.keys(al).forEach(k=>{if(places[al[k]]&&!places[k])places[k]=places[al[k]]})})();
/* the long list goes into the search suggestions the first time the box is used, not while the map loads */
let placesListed=false;
function listPlaces(){if(placesListed)return;placesListed=true;
  $("names").insertAdjacentHTML("beforeend",placeOpts.sort((a,b)=>a[0].localeCompare(b[0],"en")).map(o=>'<option value="'+esc(o[0])+'" label="'+esc(o[1])+'">').join(""))}
$("find").addEventListener("focus",listPlaces,{once:true});
/* open what was found: a condo zooms to its pin and is centred in the list; a school or park opens its
   district with that entry shown and glowing */
function goPlace(t){
  if(t.t==="m"){unpick();glowPoint(t.ll);map.flyTo(t.ll,16,{duration:.7})}
  else if(t.t==="c"){pick(t.id,null,false);const p=(PINS[t.id]||[])[t.i];if(p){glowPoint([p[0],p[1]]);map.flyTo([p[0],p[1]],Math.max(map.getZoom(),16),{duration:.7})}hot(t.id,t.i,false,true)}
  else{pick(t.id,null,true);const sec=t.t==="s"?$("pbody").querySelector("details.sch"):[...$("pbody").querySelectorAll("details.sch")][1];
    if(sec){sec.open=true;const hit=[...sec.querySelectorAll(t.t==="s"?".chips span":".spot")].find(e=>(t.t==="s"?e.childNodes[0].textContent.trim():e.querySelector("b").textContent)===t.n);
      if(hit){hit.classList.add("found");panelScrollTo(hit,true)}}}
  if(small.matches)$("layers").open=false}
let lastFind=["",0];
function find(){const q=$("find").value.trim().toLowerCase();if(!q)return;if(q===lastFind[0]&&Date.now()-lastFind[1]<600)return;lastFind=[q,Date.now()];
  let hit=names[q]||names[q.replace(/^([cew])(\d)$/,(m,a,b)=>a+"0"+b)];
  const rp=regPoly[q]||regPoly[q.replace(/ (region|county)$/,"")]||(q==="grey"&&regPoly["grey county"]);
  if(rp&&!names[q]){glowShape([rp.getLatLngs()]);map.flyToBounds(rp.getBounds(),{padding:[30,30],duration:.6});return}
  if(!hit&&places[q]){goPlace(places[q]);return}
  if(!hit){const k=Object.keys(names).find(k=>k.startsWith(q))||Object.keys(names).find(k=>k.includes(q));hit=k&&names[k]}
  if(!hit){const rk=Object.keys(regPoly).find(k=>k.startsWith(q));if(rk){glowShape([regPoly[rk].getLatLngs()]);map.flyToBounds(regPoly[rk].getBounds(),{padding:[30,30],duration:.6});return}}
  if(!hit&&q.length>=3){const pk=Object.keys(places).find(k=>k.startsWith(q))||Object.keys(places).find(k=>k.includes(q));if(pk){goPlace(places[pk]);return}}
  if(!hit){note('Nothing found for "'+$("find").value+'". Try a district code like C01, a neighbourhood, a condo, a school or a park.');return}
  if(hit[1])setComm(true);pick(hit[0],hit[1],true);if(small.matches)$("layers").open=false}
$("find").addEventListener("change",find);$("find").addEventListener("keydown",e=>{if(e.key==="Enter")find()});
setComm(true);syncView();
/* Deep link: /neighborhood-map#C08 opens that district (the guide on /neighborhood uses this). */
function fromHash(){const h=hashDistrict();if(h){pick(h,null,true);if(small.matches)$("layers").open=false}}
window.addEventListener("hashchange",fromHash);fromHash();
/* Inside a page, the mouse wheel scrolls the page until the visitor clicks the map; after that it zooms. */
if(window.top!==window){map.scrollWheelZoom.disable();let told=false;
  map.getContainer().addEventListener("wheel",()=>{if(!map.scrollWheelZoom.enabled()&&!told){told=true;note("Click the map first to zoom with the mouse wheel, or use the + and − buttons.")}},{passive:true});
  map.on("click",()=>map.scrollWheelZoom.enable());map.getContainer().addEventListener("focus",()=>map.scrollWheelZoom.enable());
  document.documentElement.addEventListener("mouseleave",()=>{map.scrollWheelZoom.disable();told=false})}
