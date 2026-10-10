'use strict';
let Y=+(new URLSearchParams(location.search).get('ano'))||appYear;
const short=v=>v>=1000?(v/1000).toLocaleString('pt-BR',{maximumFractionDigits:1})+'k':String(Math.round(v));
function go(k){Y+=k;draw()}
function draw(){
 const ym=i=>Y+'-'+pad(i+1);
 ensureFixed(ym(11));
 const M=[...Array(12)].map((_,i)=>{let a=S.bills.filter(b=>mo(b)==ym(i));return{t:sumV(a),p:sumV(a.filter(b=>b.paid)),n:a.length,a,fu:ym(i)>nowM}});
 const all=M.flatMap(m=>m.a),T=sumV(all),P=sumV(all.filter(b=>b.paid)),act=M.filter(m=>m.n);
 const avg=act.length?T/act.length:0,mx=Math.max(...M.map(m=>m.t),1);
 const hi=act.length?Math.max(...act.map(m=>m.t)):0,lo=act.length?Math.min(...act.map(m=>m.t)):0;
 const hiI=M.findIndex(m=>m.n&&m.t==hi),loI=M.findIndex(m=>m.n&&m.t==lo);
 $('#ylab').textContent=Y;document.title='Relatório '+Y;

 /* cartões */
 let g={};all.forEach(b=>g[b.cat]=(g[b.cat]||0)+b.value);
 const en=Object.entries(g).sort((a,b)=>b[1]-a[1]);
 $('#kpis').innerHTML=
  `<div class="kpi r"><small>💸 Total gasto no ano</small><b>${R(T)}</b></div>`+
  `<div class="kpi o"><small>📅 Média mensal</small><b>${R(avg)}</b></div>`+
  `<div class="kpi"><small>🔺 Mês mais caro</small><b>${hi?MES[hiI]:'—'}</b><em>${hi?R(hi):''}</em></div>`+
  `<div class="kpi"><small>🔻 Mês mais barato</small><b>${lo?MES[loI]:'—'}</b><em>${lo?R(lo):''}</em></div>`+
  `<div class="kpi g"><small>✅ Total pago</small><b>${R(P)}</b></div>`+
  `<div class="kpi o"><small>⏳ Ainda a pagar</small><b>${R(T-P)}</b></div>`+
  (en.length?`<div class="kpi full"><small>🏆 Categoria que mais pesou</small><b>${esc(en[0][0])}</b><em>${R(en[0][1])} · ${Math.round(en[0][1]/T*100)}% do total</em></div>`:'');

 /* gráfico de colunas */
 $('#chart').innerHTML=T?
  `<div class="chart">${hi?`<div class="avg" style="bottom:${avg/mx*80}%"><span>média ${short(avg)}</span></div>`:''}`+
  M.map((m,i)=>`<div class="col"><div class="v">${m.t?short(m.t):''}</div><div class="bb ${i==hiI?'hi':''} ${m.fu?'fu':''}" style="height:${m.t/mx*80}%"></div></div>`).join('')+`</div>`+
  `<div class="xl">${MES.map(x=>`<span>${x.slice(0,3)}</span>`).join('')}</div>`
  :'<div class="empty">Nenhuma conta neste ano.</div>';

 /* categorias */
 $('#cats').innerHTML=en.map(([c,v],i)=>`<div class="cb"><div class="t1"><span>${esc(c)}</span><b>${R(v)} · ${Math.round(v/T*100)}%</b></div><div class="tr"><i style="width:${v/en[0][1]*100}%;background:${PAL[i%13]}"></i></div></div>`).join('')||'<div class="sub">Sem contas neste ano.</div>';

 /* tabela */
 $('#tbm').innerHTML=M.map((m,i)=>`<tr><td style="text-align:left;padding-left:6px">${MES[i].slice(0,3)}</td><td>${R(m.t)}</td><td>${R(m.p)}</td><td style="${m.t-m.p>0&&!m.fu?'color:var(--r);font-weight:700':''}">${R(m.t-m.p)}</td><td>${m.n}</td></tr>`).join('')+
  `<tr style="font-weight:800;background:#f6f8f7"><td style="text-align:left;padding-left:6px">Ano</td><td>${R(T)}</td><td>${R(P)}</td><td>${R(T-P)}</td><td>${all.length}</td></tr>`;

 /* pendências antigas */
 const pend=sumV(S.bills.filter(b=>mo(b)<nowM&&!b.paid));
 $('#pendbox').innerHTML=pend?`<div class="box deb" style="cursor:default"><div><b>⚠️ Contas antigas ainda não pagas</b><div class="sub">De meses anteriores, somando todos os anos.</div></div><b style="color:var(--r)">${R(pend)}</b></div>`:'';
}
draw();
