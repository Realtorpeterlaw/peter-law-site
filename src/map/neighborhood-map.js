/*! @license Leaflet 1.9.4, a JS library for interactive maps. https://leafletjs.com (c) 2010-2023 Vladimir Agafonkin, (c) 2010-2011 CloudMade. BSD-2-Clause licence: https://github.com/Leaflet/Leaflet/blob/v1.9.4/LICENSE */
/* Toronto Neighbourhood Map: behaviour. Data lives in ./neighborhood-data.js.
   Built from the "Beta2" map of 24 Nov 2026. */
import L from "leaflet";
import {DISTRICTS,AGENT,DIST,COMM,DLABEL,STATIONS,PINS,REGIONS,STREETS,NEARBY,UNIS,GROCERY,SCHOOLS} from "./neighborhood-data.js";

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
["pReg","pDist","pComm","pSel","pSub"].forEach((p,i)=>{map.createPane(p).style.zIndex=410+i*10});map.createPane("pCondo").style.zIndex=640;["pHalo",425,"pRing",625].forEach((v,i,a)=>{if(i%2)return;const pn=map.createPane(v);pn.style.zIndex=a[i+1];pn.style.pointerEvents="none"});map.createPane("pUni").style.zIndex=630;map.createPane("pShop").style.zIndex=620;map.createPane("pGlow").style.zIndex=445;map.getPane("pGlow").style.pointerEvents="none";
const cityBounds=L.geoJSON(DIST).getBounds();
map.fitBounds(cityBounds,{padding:[10,10]});

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
const dLabels=L.layerGroup(Object.keys(DLABEL).map(k=>L.marker(DLABEL[k].slice(0,2),{pane:"pSel",interactive:false,keyboard:false,icon:L.divIcon({className:"dl",html:DLABEL[k][2]||k,iconSize:[60,20]})}))).addTo(map);
const cLabelMarkers=COMM.features.filter(f=>!f.properties.dup).map(f=>L.marker(f.properties.c,{pane:"pSel",interactive:false,keyboard:false,icon:L.divIcon({className:"cl",html:esc(f.properties.n),iconSize:[110,14]})}));
const cLabels=L.layerGroup();
const subLayer=L.layerGroup(STATIONS.map(s=>L.circleMarker([s[1],s[2]],{pane:"pSub",radius:5,color:"#fff",weight:1.5,fillColor:LINE[s[3]],fillOpacity:1,bubblingMouseEvents:false}).bindTooltip(s[0]+" station",{className:"tt",direction:"top"}).on("click",e=>{e.target.closeTooltip();zoomPop(e.target.getLatLng())}))).addTo(map);
/* Yonge St and Bloor St: glowing main streets (halo that pulses, bright core, light that travels along the street) */
const glowLayer=L.layerGroup(),glowLabels=L.layerGroup();
Object.keys(STREETS).forEach(n=>{const p=STREETS[n];
  [["halo",14],["core",4],["run",4]].forEach(k=>glowLayer.addLayer(L.polyline(p,{pane:"pGlow",interactive:false,className:"glow-"+k[0],weight:k[1],lineCap:"round",lineJoin:"round"})))});
glowLabels.addLayer(L.marker([43.7300,-79.4034],{pane:"pSel",interactive:false,keyboard:false,icon:L.divIcon({className:"gl",html:"Yonge St",iconSize:[70,14]})}));
glowLabels.addLayer(L.marker([43.6520,-79.4760],{pane:"pSel",interactive:false,keyboard:false,icon:L.divIcon({className:"gl",html:"Bloor St W",iconSize:[80,14]})}));
glowLabels.addLayer(L.marker([43.6722,-79.3790],{pane:"pSel",interactive:false,keyboard:false,icon:L.divIcon({className:"gl",html:"Bloor St E",iconSize:[80,14]})}));
glowLayer.addTo(map);
/* click any icon: zoom straight in to browse the area around it (no card). Already close: just centre on it */
function zoomPop(ll){ll=L.latLng(ll);map.closePopup();map.flyTo(ll,Math.max(map.getZoom(),16.5),{duration:.7})}
/* grocery stores */
const CART='<svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12.5" r="11.5" fill="#fff" fill-opacity=".85"/><path d="M2.2 3.4h3.1l2.3 10.2h10.3l2-7.4H6.2" fill="#fff" stroke="#16202b" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.6 9.3h10.2M12.9 6.4v7M9.3 6.4l.9 7M16.6 6.4l-.6 7" stroke="#16202b" stroke-width="1.1" fill="none"/><circle cx="9.3" cy="18.6" r="1.9" fill="#16202b"/><circle cx="16.6" cy="18.6" r="1.9" fill="#16202b"/></svg>';
const shopMarkers=GROCERY.map(g=>{const m=L.marker([g[1],g[2]],{pane:"pShop",keyboard:false,icon:L.divIcon({className:"shop",html:CART,iconSize:[20,20],iconAnchor:[10,10],tooltipAnchor:[0,-10]})});
  m.bindTooltip(g[0],{className:"tt",direction:"top"});m.on("click",()=>{m.closeTooltip();zoomPop(m.getLatLng())});return m});
const shopLayer=L.layerGroup();
/* universities and colleges */
const CAP='<svg viewBox="0 0 24 24" width="26" height="26" fill="#fff" stroke="#16202b" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><circle cx="12" cy="12" r="11.6" stroke="none" fill-opacity=".85"/><path d="M12 4.2 2.2 9l9.8 4.8L21.8 9z"/><path d="M6.2 11.2v4.6c0 1.6 2.6 2.9 5.8 2.9s5.8-1.3 5.8-2.9v-4.6" fill="none"/><path d="M3.4 9.9v4.9"/><rect x="2.5" y="14.8" width="1.8" height="2.6" rx=".6"/></svg>';
const uniLayer=L.layerGroup(UNIS.map(u=>L.marker([u[1],u[2]],{pane:"pUni",keyboard:false,icon:L.divIcon({className:"uni",html:CAP,iconSize:[26,26],iconAnchor:[13,13],tooltipAnchor:[0,-12]})}).bindTooltip(u[0],{className:"tt",direction:"top"}).on("click",e=>{e.target.closeTooltip();zoomPop(e.target.getLatLng())}))).addTo(map);
/* surrounding regions */
const regLayer=L.layerGroup(),regLabels=L.layerGroup(),regPoly={};
Object.keys(REGIONS).forEach(n=>{const r=REGIONS[n],name=n==="Grey"?"Grey County":n;
  const p=L.polygon(r.p,{pane:"pReg",color:"#1c5fa8",weight:2.4,dashArray:"7 4 2 4",fillColor:"#1c5fa8",fillOpacity:.04});
  p.bindTooltip(name,{sticky:true,className:"tt",direction:"top"});
  p.on({mouseover:()=>p.setStyle({fillOpacity:.16,weight:3.4}),mouseout:()=>p.setStyle({fillOpacity:.04,weight:2.4}),click:()=>{glowShape([p.getLatLngs()]);map.flyToBounds(p.getBounds(),{padding:[30,30],duration:.6})}});
  regPoly[name.toLowerCase()]=p;regLayer.addLayer(p);
  regLabels.addLayer(L.marker(r.c,{pane:"pSel",interactive:false,keyboard:false,icon:L.divIcon({className:"rl",html:name,iconSize:[200,18]})}))});
regLabels.addLayer(L.marker(cityBounds.getCenter(),{pane:"pSel",interactive:false,keyboard:false,icon:L.divIcon({className:"rl city",html:"Toronto",iconSize:[200,18]})}));
const allBounds=L.latLngBounds(cityBounds.getSouthWest(),cityBounds.getNorthEast());regLayer.eachLayer(p=>allBounds.extend(p.getBounds()));
regLayer.addTo(map);
let showReg=true;
const JUMPS=[["Downtown Toronto",43.6550,-79.3850,13.5],["King West",43.6440,-79.4010,15],["Liberty Village",43.6385,-79.4195,15.5],["UofT",43.6629,-79.3957,15],["TMU",43.6585,-79.3785,16],["Financial District",43.6480,-79.3810,16],["Union Station",43.6453,-79.3806,16.5]];
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
const pinOf={};let hotPin=null;
const condoLayer=L.layerGroup();
Object.keys(PINS).forEach(id=>PINS[id].forEach((p,i)=>{if(!p)return;const cs=DISTRICTS[id].condos[i].split(";").map(x=>x.split("|"));
  const m=L.marker([p[0],p[1]],{pane:"pCondo",keyboard:false,icon:L.divIcon({className:"pin",html:"<span></span>",iconSize:[18,18],iconAnchor:[9,17],tooltipAnchor:[0,-17]})});
  const w=walkTo(p);m.bindTooltip((cs.every(c=>c[0]===cs[0][0])?"<b>"+esc(cs[0][0])+"</b><br><span style=\"font-weight:400\">"+cs.map(c=>esc(c[1])).join(" \u00b7 ")+"</span>":cs.map(c=>"<b>"+esc(c[0])+"</b><br><span style=\"font-weight:400\">"+esc(c[1])+"</span>").join("<br>"))+(cs.some(c=>c[2]==="pre")?"<br><i>Pre-construction</i>":"")+(p[2]?"":"<br><i>approximate spot</i>")+(w?"<br><span style=\"font-weight:400\">"+esc(walkTxt(w))+"</span>":""),{className:"tt",direction:"top"});
  m.on("click",()=>{if(sel!==id)pick(id,null);hot(id,i,false,true);m.closeTooltip();zoomPop(m.getLatLng())});
  m.on("mouseover",()=>hot(id,i,false,false));m.on("mouseout",()=>{if(!stick)hot(null)});
  pinOf[id+"|"+i]=m}));
const condoMarkers=Object.values(pinOf);
condoLayer.addTo(map);
/* Keep on the page only the markers in (or just around) the visible area. With all ~1,300 pins, carts and
   labels on the page at once, every pan and zoom had to move and repaint each one. */
function cull(group,list,keep){if(!map.hasLayer(group))return;const b=map.getBounds().pad(.3);
  for(const m of list){const inb=b.contains(m.getLatLng());if(inb){if(!group.hasLayer(m))group.addLayer(m)}else if(group.hasLayer(m)&&m!==keep)group.removeLayer(m)}}
function cullAll(){cull(condoLayer,condoMarkers,hotPin);cull(shopLayer,shopMarkers);cull(cLabels,cLabelMarkers)}
map.on("moveend",cullAll);cullAll();
let stick=false;
/* Hover labels (districts, communities, condos, groceries, stations, campuses): at most one on screen at a time,
   and never left behind. Browsers sometimes skip the "mouse left" signal (fast moves, page scrolling under a
   still pointer, zooming), which left labels stranded on the map; these checks close them regardless. */
let openTip=null;
const tipEl=t=>{const s=t&&t._source;return s&&(s._path||s._icon)};
const tipClose=()=>{const t=openTip;openTip=null;if(t&&t._source)t._source.closeTooltip()};
map.on("tooltipopen",e=>{if(openTip&&openTip!==e.tooltip)tipClose();openTip=e.tooltip});
map.on("tooltipclose",e=>{if(openTip===e.tooltip)openTip=null});
map.getContainer().addEventListener("mousemove",ev=>{if(!openTip)return;const el=tipEl(openTip);if(el&&!el.contains(ev.target))tipClose()},{passive:true});
map.getContainer().addEventListener("mouseleave",()=>{if(!stick)hot(null);tipClose()});
map.on("zoomstart",()=>{if(!stick)tipClose()});
document.addEventListener("visibilitychange",()=>{if(document.hidden)tipClose()});
function hot(id,i,pan,keep){
  if(hotPin){const e=hotPin.getElement();if(e)e.classList.remove("hot");hotPin.setZIndexOffset(0);hotPin.closeTooltip();hotPin=null}
  document.querySelectorAll("ul.condos li.hot,ul.condos li.picked").forEach(l=>l.classList.remove("hot","picked"));
  stick=!!keep;if(id==null)return;
  if(keep&&id===sel)nearby(id,i);
  const m=pinOf[id+"|"+i];if(!m||!map.hasLayer(condoLayer))return;if(!condoLayer.hasLayer(m))condoLayer.addLayer(m);
  hotPin=m;m.setZIndexOffset(5000);const e=m.getElement();if(e)e.classList.add("hot");
  if(pan){const ll=m.getLatLng(),pad=small.matches?L.latLngBounds(map.containerPointToLatLng([20,60]),map.containerPointToLatLng([innerWidth-20,innerHeight*.36])):L.latLngBounds(map.containerPointToLatLng([400,60]),map.containerPointToLatLng([map.getSize().x-340,map.getSize().y-40]));
    if(!pad.contains(ll)){const off=small.matches?[0,map.getSize().y*.22]:[-190,0];map.panTo(map.unproject(map.project(ll).add(off)),{animate:true,duration:.35})}
    m.openTooltip()}
  if(id===sel){const li=document.querySelector('ul.condos li[data-i="'+i+'"]');if(li){li.classList.add("hot");if(keep)li.classList.add("picked");if(!pan)panelScrollTo(li,keep)}}
}
/* Scroll only the side panel (never the page around the map): a clicked condo is brought to the middle of the
   list, a hovered one just into view. */
function panelScrollTo(li,center){const sc=$("pbody");if(!sc)return;const a=sc.getBoundingClientRect(),b=li.getBoundingClientRect();let top;
  if(center)top=sc.scrollTop+(b.top-a.top)-(a.height-b.height)/2;
  else if(b.top<a.top)top=sc.scrollTop+(b.top-a.top)-8;else if(b.bottom>a.bottom)top=sc.scrollTop+(b.bottom-a.bottom)+8;else return;
  sc.scrollTop=Math.max(0,top)}   /* instant: a smooth scroll was cut short when the Nearby section redrew */
function restyle(){distLayer.setStyle(f=>dStyle(f.properties.d));commLayer.setStyle(cStyle);
  const c=map.getContainer(),z=map.getZoom(),wide=z<9.5;c.classList.toggle("z-far",z<11);c.classList.toggle("z-near",z>=13);c.classList.toggle("z-reg",z<8);c.classList.toggle("wide",wide);
  (showReg&&z<11.5)?regLabels.addTo(map):map.removeLayer(regLabels);
  (z>=12.5)?glowLabels.addTo(map):map.removeLayer(glowLabels);
  if(z>=12.5){shopLayer.addTo(map);cull(shopLayer,shopMarkers)}else map.removeLayer(shopLayer);
  glowLayer.eachLayer(l=>{const c=l.options.className;l.setStyle({weight:c==="glow-halo"?(z<10?6:z<12?11:z<14?15:20):(z<10?2:z<12?3:z<14?4.5:6)})});
  if(showComm&&z>=13.5){cLabels.addTo(map);cull(cLabels,cLabelMarkers)}else map.removeLayer(cLabels);
  subLayer.eachLayer(m=>m.setRadius(z<11?3:z<13?5:7));($("l-sub").checked&&!wide)?subLayer.addTo(map):map.removeLayer(subLayer)}
map.on("zoomend",restyle);
function setComm(on){showComm=true;commLayer.addTo(map);restyle()}
$("l-dist").onchange=e=>{e.target.checked?(distLayer.addTo(map),dLabels.addTo(map)):(map.removeLayer(distLayer),map.removeLayer(dLabels))};
$("l-sub").onchange=restyle;
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
function pick(id,comm,fly){
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
  $("panel").classList.add("open");
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
/* starts a lookup once per condominium; after a failure only the "Try again" button (force) starts another */
function plLoad(id,i,force){const key=id+"|"+i,p=(PINS[id]||[])[i];if(!p||(PL[key]&&!(force&&PL[key].s==="failed")))return;
  PL[key]={s:"loading"};
  plFetch(p).then(l=>{PL[key]={s:"ok",l}},()=>{PL[key]={s:"failed"}}).then(()=>{if(nbShown&&nbShown[0]===id&&nbShown[1]===i&&sel===id)nearby(id,i)})}
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
    return '<details class="sg nbg nb-'+NB_CLS[k]+'"'+(open[k]?" open":"")+' data-k="'+k+'"><summary><b><i></i>'+NB_GROUPS[k]+' \u00b7 '+g[0]+' <em>show</em></b></summary><ul class="nb">'+g[1].map(x=>'<li><span>'+esc(x[0])+'</span><em>'+x[1]+' min</em></li>').join("")+'</ul>'+(more>0?'<p class="none">'+(st==="loading"?'Nearest shown. Loading the other '+more+'\u2026':'Nearest shown. '+more+' more within 5 minutes. <button type="button" class="retry" id="plretry'+k+'">Show all</button>')+'</p>':'')+'</details>'}).join(""):'<p class="none">Nothing mapped within a 5 minute walk.</p>')+'<p class="none nbsrc">Estimated walking times. Places from OpenStreetMap; some may be missing, closed or renamed.</p>';
  el.querySelectorAll('[id^="plretry"]').forEach(b=>b.onclick=()=>{plLoad(id,i,true);nearby(id,i)});
}
/* condominium list: sorted view of DISTRICTS[id].condos; data-i keeps the original index so pins still line up */
let csort="az",cfilter="";
const PRE='<u class="pre">Pre-construction</u>';
/* a building with several addresses under one name is written once; true twins keep both names */
function cHtml(c){const pre=c.some(x=>x[2]==="pre")?" "+PRE:"";
  return c.every(x=>x[0]===c[0][0])?'<div>'+esc(c[0][0])+pre+'<small>'+c.map(x=>esc(x[1])).join(" \u00b7 ")+'</small></div>':c.map(x=>'<div>'+esc(x[0])+(x[2]==="pre"?" "+PRE:"")+'<small>'+esc(x[1])+'</small></div>').join("")}
/* While the list is scrolling, rows sliding under a still pointer must not each move the map and open a
   label (that made scrolling the list stutter). A row reacts only once the pointer rests on it. */
let listScrolling=false,listScrollT=0,listHoverT=0;
$("pbody").addEventListener("scroll",()=>{listScrolling=true;clearTimeout(listScrollT);clearTimeout(listHoverT);listScrollT=setTimeout(()=>{listScrolling=false},180)},{passive:true});
function fillCondos(id){
  const rows=DISTRICTS[id].condos.map((s,i)=>{const c=s.split(";").map(x=>x.split("|")),p=(PINS[id]||[])[i];return{i,c,p,w:walkTo(p),key:c[0][0].replace(/^the\s+/i,"").toLowerCase()}});
  const az=(a,b)=>a.key.localeCompare(b.key,"en",{numeric:true});
  const f=cfilter.trim().toLowerCase(),all=rows.length;if(f)for(let k=rows.length-1;k>=0;k--){if(!rows[k].c.some(x=>(x[0]+" "+x[1]).toLowerCase().includes(f)))rows.splice(k,1)}
  rows.sort(csort==="za"?(a,b)=>az(b,a):csort==="walk"?(a,b)=>(a.w?a.w.min:99)-(b.w?b.w.min:99)||az(a,b):az);
  $("clist").innerHTML=(f?'<p class="none cf">'+rows.length+' of '+all+' match</p>':'')+'<ul class="condos">'+rows.map(r=>'<li data-i="'+r.i+'"'+(r.p?' tabindex="0"':' class="nopin"')+'>'+cHtml(r.c)+(r.p?(r.p[2]?'':'<small><em>approximate spot</em></small>'):'<small><em>not on the map yet</em></small>')+(r.w?'<small class="wk">'+esc(walkTxt(r.w))+'</small>':(csort==="walk"?'<small class="nw">'+(r.p&&r.p[2]?'No subway within a 10 minute walk':'Walking time not available')+'</small>':''))+'</li>').join("")+'</ul>';
  $("clist").querySelectorAll("li:not(.nopin)").forEach(li=>{const i=+li.dataset.i;
    li.addEventListener("mouseenter",()=>{clearTimeout(listHoverT);if(stick||listScrolling)return;listHoverT=setTimeout(()=>{if(!stick&&!listScrolling)hot(id,i,true,false)},110)});li.addEventListener("mouseleave",()=>{clearTimeout(listHoverT);if(!stick)hot(null)});
    li.addEventListener("focus",()=>hot(id,i,true,false));
    li.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();li.click()}});
    li.addEventListener("click",()=>{const same=stick&&hotPin===pinOf[id+"|"+i];hot(null);if(!same)hot(id,i,true,true)})});
}
function unpick(){hot(null);glowClear();$("panel").classList.remove("open");sel=selComm=null;restyle()}
$("close").onclick=()=>{unpick();map.getContainer().focus({preventScroll:true})};
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&$("panel").classList.contains("open")&&!e.defaultPrevented){unpick();map.getContainer().focus({preventScroll:true})}});
map.on("click",()=>{if(stick)hot(null)});

/* search */
const names={};Object.keys(DISTRICTS).forEach(k=>names[k.toLowerCase()]=[k,null]);
COMM.features.forEach(f=>{const p=f.properties,key=p.n.toLowerCase();if(names[key])p.dup=1;else names[key]=[p.d,p.n]});
const EXTRA={"leslieville":["E01","South Riverdale"],"liberty village":["C01","Niagara"],"king west":["C01","Niagara"],"cityplace":["C01","Waterfront Communities-The Island"],"yorkville":["C02","Annex"],"distillery district":["C08","Waterfront Communities-The Island"],"st. lawrence":["C08","Waterfront Communities-The Island"],"the junction":["W02","Junction Area"],"humber bay shores":["W06","Mimico (includes Humber Bay Shores)"],"north york centre":["C14","Willowdale East"],"scarborough town centre":["E09","Bendale"],"davisville":["C10","Mount Pleasant West"],"entertainment district":["C01","Waterfront Communities-The Island"],"chinatown":["C01","Kensington-Chinatown"],"greektown":["E03","Playter Estates-Danforth"]};
Object.assign(names,EXTRA);
$("names").innerHTML=Object.keys(DISTRICTS).map(k=>'<option value="'+k+'">').join("")+Object.keys(names).filter(k=>names[k][1]).sort().map(k=>'<option value="'+esc(k.replace(/\b[a-z]/g,m=>m.toUpperCase()))+'">').join("")+Object.keys(regPoly).map(k=>'<option value="'+esc(k.replace(/\b[a-z]/g,m=>m.toUpperCase()))+'">').join("");
/* Places in the search box: every condominium, school and park. Each name points to its district;
   condos also to their pin. Names used in more than one district get the district code added. */
const places={},placeOpts=[];
(function(){const add=(name,lab,t)=>{let v=name,k=v.toLowerCase();if(places[k]&&!(places[k].t==="c"&&t.t==="c"&&places[k].id===t.id&&places[k].i===t.i)){v=name+" ("+t.id+")";k=v.toLowerCase();if(places[k])return}
    if(places[k])return;places[k]=t;placeOpts.push([v,lab])};
  Object.keys(DISTRICTS).forEach(id=>{const d=DISTRICTS[id];
    d.condos.forEach((c,i)=>c.split(";").forEach(x=>add(x.split("|")[0],"Condo · "+id,{t:"c",id,i})));
    (SCHOOLS[id]||[]).forEach(sc=>add(sc[0],"School · "+id,{t:"s",id,n:sc[0]}));
    d.spots.forEach(sp=>{const a=sp.split("|");if(a[1]==="park")add(a[0],"Park · "+id,{t:"p",id,n:a[0]})})})})();
/* the long list goes into the search suggestions the first time the box is used, not while the map loads */
let placesListed=false;
function listPlaces(){if(placesListed)return;placesListed=true;
  $("names").insertAdjacentHTML("beforeend",placeOpts.sort((a,b)=>a[0].localeCompare(b[0],"en")).map(o=>'<option value="'+esc(o[0])+'" label="'+esc(o[1])+'">').join(""))}
$("find").addEventListener("focus",listPlaces,{once:true});
/* open what was found: a condo zooms to its pin and is centred in the list; a school or park opens its
   district with that entry shown and glowing */
function goPlace(t){
  if(t.t==="c"){pick(t.id,null,false);const p=(PINS[t.id]||[])[t.i];if(p){glowPoint([p[0],p[1]]);map.flyTo([p[0],p[1]],Math.max(map.getZoom(),16),{duration:.7})}hot(t.id,t.i,false,true)}
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
function fromHash(){const h=decodeURIComponent(location.hash.slice(1)).trim().toUpperCase();if(DISTRICTS[h]){pick(h,null,true);if(small.matches)$("layers").open=false}}
window.addEventListener("hashchange",fromHash);fromHash();
/* Inside a page, the mouse wheel scrolls the page until the visitor clicks the map; after that it zooms. */
if(window.top!==window){map.scrollWheelZoom.disable();let told=false;
  map.getContainer().addEventListener("wheel",()=>{if(!map.scrollWheelZoom.enabled()&&!told){told=true;note("Click the map first to zoom with the mouse wheel, or use the + and − buttons.")}},{passive:true});
  map.on("click",()=>map.scrollWheelZoom.enable());map.getContainer().addEventListener("focus",()=>map.scrollWheelZoom.enable());
  document.documentElement.addEventListener("mouseleave",()=>{map.scrollWheelZoom.disable();told=false})}
