'use strict';
/* ===== CONFIGURAÇÕES DO APLICATIVO (edite aqui) ===== */
const APP_NAME='Minha saúde financeira';
const SITE_LUMANOIDS='https://applumanoids.github.io/sitelumanoids.com/';
const WHATS_LUMANOIDS='https://wa.me/5511998899271';
const LINK_COMPRAS='https://applumanoids.github.io/lista-compras/';

/* ===== AUXILIARES ===== */
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const R=v=>'R$ '+v.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const MES=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const CATS=['🏠 Moradia','💡 Água, luz e gás','🛒 Alimentação','🚗 Transporte','💳 Cartão de crédito','📱 Internet e telefone','🏥 Saúde','📚 Educação','🎮 Lazer','💰 Dívidas e empréstimos','🐾 Pets','📦 Outros'];
const PAL=['#16a34a','#f59e0b','#3b82f6','#ec4899','#8b5cf6','#14b8a6','#ef4444','#84cc16','#f97316','#06b6d4','#a855f7','#64748b','#eab308'];
const pad=n=>String(n).padStart(2,'0');
const now=new Date();
const appYear=now.getFullYear();
const nowM=appYear+'-'+pad(now.getMonth()+1);
const today=nowM+'-'+pad(now.getDate());
const addM=(m,k)=>{let[y,n]=m.split('-').map(Number);let d=new Date(y,n-1+k,1);return d.getFullYear()+'-'+pad(d.getMonth()+1)};
const mk=(m,day)=>{let[y,n]=m.split('-').map(Number);return m+'-'+pad(Math.min(day,new Date(y,n,0).getDate()))};
const mo=b=>b.due.slice(0,7);
const late=b=>!b.paid&&b.due<today;
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const sumV=a=>a.reduce((s,x)=>s+x.value,0);
const catName=c=>c.split(' ').slice(1).join(' ')||c;

/* ===== DADOS (ficam só no aparelho: localStorage) ===== */
const DEF_CFG={sort:'due',showSal:true,payDay:0,pie:'cat'};
function norm(d){
 d=d&&typeof d=='object'?d:{};
 const o={...d};
 o.sal=d.sal&&typeof d.sal=='object'?d.sal:{};
 o.ended=d.ended&&typeof d.ended=='object'?d.ended:{};
 ['bills','cats','wish','goals'].forEach(k=>{o[k]=Array.isArray(d[k])?d[k]:[]});
 o.cfg={...DEF_CFG,...(d.cfg&&typeof d.cfg=='object'?d.cfg:{})};
 return o}
let S;try{S=norm(JSON.parse(localStorage.getItem('mc')))}catch(e){S=norm(null)}
const save=()=>{try{localStorage.setItem('mc',JSON.stringify(S))}catch(e){}};

/* ===== REGRAS DE CONTAS ===== */
function ensureFixed(m){let last={};S.bills.filter(b=>b.type=='fixed').forEach(b=>{if(!last[b.gid]||mo(b)>mo(last[b.gid]))last[b.gid]=b});
 for(const g in last){let b=last[g],x=mo(b),lim=addM(nowM,24);
  while(x<m&&x<lim){x=addM(x,1);if(S.ended[g]&&x>S.ended[g])break;S.bills.push({...b,id:uid(),due:mk(x,b.day),paid:false,paidAt:null})}}save()}
const sal=m=>{let k=Object.keys(S.sal).filter(x=>x<=m).sort().pop();return k?S.sal[k]:0};

/* ===== INSTALAÇÃO / FUNCIONAR SEM INTERNET ===== */
if('serviceWorker' in navigator&&/^https?:/.test(location.protocol))navigator.serviceWorker.register('sw.js').catch(()=>{});
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}

/* ===== ÍCONES (SVG simples, herdam a cor do texto) ===== */
const IC={
 wallet:'<path d="M20 7H5a2 2 0 0 1 0-4h13v4"/><path d="M3 5v14a2 2 0 0 0 2 2h15V7"/><circle cx="16.5" cy="14" r="1.3"/>',
 heart:'<path d="M12 21s-7-4.6-9.3-9A5.4 5.4 0 0 1 12 6a5.4 5.4 0 0 1 9.3 6C19 16.4 12 21 12 21z"/>',
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
 pencil:'<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/>',
 eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
 eyeoff:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/><path d="M3 3l18 18"/>',
 file:'<path d="M6 2h8l5 5v15H6z"/><path d="M9 13h6M9 17h6"/>',
 coins:'<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3 3 7 3s7-1.3 7-3v-6"/>',
 plus:'<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
 bars:'<path d="M5 20V10M12 20V4M19 20v-7"/>',
 whats:'<path d="M3 21l1.6-4.6A9 9 0 1 1 8 19.6z"/><path d="M9 9c0 3 3 6 6 6l1.2-1.4-2-1-1 .8c-.9-.4-1.9-1.4-2.3-2.3l.8-1-1-2z"/>',
 gear:'<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
 trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
 bulb:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5V16h8v-2.5A6 6 0 0 0 12 3z"/>',
 pie:'<path d="M12 3v9h9A9 9 0 1 1 12 3z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z"/>',
 arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
 left:'<path d="M15 5l-7 7 7 7"/>',right:'<path d="M9 5l7 7-7 7"/>',
 globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>'};
const ico=n=>`<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${IC[n]||''}</svg>`;
document.querySelectorAll('[data-i]').forEach(e=>e.insertAdjacentHTML('afterbegin',ico(e.dataset.i)));
