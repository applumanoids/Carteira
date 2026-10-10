'use strict';
const MASK='R$ ••••••';
let cur=nowM,editing=null,view='cart';

/* ===== CAIXA DE DIÁLOGO SIMPLES ===== */
function dlg(o){return new Promise(r=>{let d=$('#md'),i=$('#mi'),ok=$('#mo'),hi=o.inp!=null;$('#mt').textContent=o.t;$('#mm').textContent=o.m||'';i.style.display=hi?'block':'none';if(hi)i.value=o.inp;
 $('#mc').style.display=o.one?'none':'';$('#mc').textContent=o.cn||'Cancelar';ok.textContent=o.ok||'OK';ok.className='p'+(o.danger?' dg':'');
 const end=v=>{d.close();r(v)};$('#mc').onclick=()=>end(null);ok.onclick=()=>end(hi?i.value:true);d.oncancel=e=>{e.preventDefault();end(null)};d.showModal();if(hi)setTimeout(()=>i.focus(),60)})}

/* ===== ABAS ===== */
function tab(t){view=t;['cart','wish','goal'].forEach(k=>{$('#v-'+k).hidden=k!=t;$('#t-'+k).classList.toggle('on',k==t)});window.scrollTo(0,0)}

/* ===== CÁLCULO DO MÊS ===== */
function calc(){ensureFixed(cur);let all=S.bills,gm=m=>all.filter(b=>mo(b)==m),sm=sumV;
 let ks=[...all.map(mo),...Object.keys(S.sal)].filter(k=>k<cur).sort(),cs=0;
 if(ks.length){let k=ks[0];while(k<cur){let bal=sal(k)+cs-sm(gm(k));if(bal>=0)cs=bal;else cs=-Math.min(-bal,sm(all.filter(x=>mo(x)<=k&&!x.paid)));k=addM(k,1)}}
 return{mb:gm(cur),pv:all.filter(b=>mo(b)<cur&&!b.paid),cs,sum:sm}}

function face(p){let k=p>90?2:p>70?1:0,c=['#16a34a','#f97316','#dc2626'][k];
 let eyes=k==0?'<path d="M28 46q8-9 16 0M56 46q8-9 16 0" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>':'<circle cx="36" cy="48" r="6" fill="#fff"/><circle cx="64" cy="48" r="6" fill="#fff"/><circle cx="36" cy="50" r="3" fill="#222"/><circle cx="64" cy="50" r="3" fill="#222"/>';
 let ex=['','<path d="M27 38l14-6M73 38l-14-6" stroke="#7c2d12" stroke-width="3.5" stroke-linecap="round"/><path d="M84 24q6 8 0 12q-6-4 0-12z" fill="#38bdf8"/>','<path d="M27 34l16 8M73 34l-16 8" stroke="#450a0a" stroke-width="5" stroke-linecap="round"/>'][k];
 let m=['M30 62Q50 84 70 62Z','M34 72q8-6 16 0t16 0','M32 76Q50 58 68 76'][k];
 return `<svg width="72" height="72" viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="${c}"/>${eyes}${ex}<path d="${m}" fill="${k==0?'#fff':'none'}" stroke="#fff" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>${p>100?'<path d="M16 14l6 10M84 14l-6 10M50 2v12" stroke="#fff" stroke-width="3" stroke-linecap="round"/>':''}</svg>`}

/* ===== ORDENAÇÃO DA TABELA ===== */
const SORT_OPTS=[['due','📅 Vencimento'],['name','🔤 Ordem alfabética'],['cat','🏷️ Categoria'],['vhi','💰 Maior valor'],['vlo','🪙 Menor valor']];
const SORTS={
 due:(a,b)=>a.due.localeCompare(b.due)||a.name.localeCompare(b.name,'pt-BR'),
 name:(a,b)=>a.name.localeCompare(b.name,'pt-BR',{sensitivity:'base'}),
 cat:(a,b)=>catName(a.cat).localeCompare(catName(b.cat),'pt-BR')||a.due.localeCompare(b.due),
 vhi:(a,b)=>b.value-a.value,
 vlo:(a,b)=>a.value-b.value};

/* ===== TELA CARTEIRA ===== */
let showAll=false;
function toggleAll(){showAll=!showAll;render()}
function renderCart(){const{mb,pv,cs,sum}=calc();const c=S.cfg,sh=c.showSal;
 let s=sal(cur),cr=Math.max(0,cs),ex=Math.max(0,-cs),tot=sum(mb)+ex,base=s+cr,sld=base-tot,p=base?Math.round(tot/base*100):(tot?101:0);
 $('#mlab').textContent=MES[+cur.slice(5)-1]+' '+cur.slice(0,4);
 $('#sal').textContent=sh?R(s):MASK;$('#tot').textContent=R(tot);$('#sld').textContent=sh?R(sld):MASK;
 $('#sld').style.color=!sh?'var(--m)':sld<0?'var(--r)':'var(--g2)';
 $('#eyeb').innerHTML=ico(sh?'eye':'eyeoff');
 let col=p>90?'#dc2626':p>70?'#f97316':'#16a34a';
 $('#pct').textContent=p+'%';$('#rg').setAttribute('stroke',col);$('#rg').style.strokeDashoffset=251.3*(1-Math.min(p,100)/100);
 $('#bi').style.cssText=`width:${Math.min(p,100)}%;background:${col}`;
 $('#face').innerHTML=face(p);$('#pmc').style.background=col+'1f';
 $('#pmt').textContent=p>100?'ALERTA!':p>90?'Muito cuidado!':p>70?'Cuidado!':'Muito bem!';$('#pmt').style.color=col;
 $('#pm').textContent=p>100?`Você ultrapassou o limite${sh?' em '+R(tot-base):''}. Revise seus gastos!`:p>90?'Seu salário está praticamente todo comprometido!':p>70?'Seu salário está acabando. Fique atento aos próximos gastos!':'Você ainda tem uma boa parte do salário disponível!';
 $('#debt').innerHTML=(cr?`<div class="sub" style="margin:0 4px 8px">💚 Saldo do mês anterior: <b>${sh?R(cr):MASK}</b> (já somado ao disponível)</div>`:'')+(pv.length?`<div class="box deb" onclick="showDebts()"><div><b>⚠️ Dívida do mês passado</b><div class="sub">Você possui ${pv.length} conta${pv.length>1?'s':''} pendente${pv.length>1?'s':''} de meses anteriores.</div></div><b style="color:var(--r)">${R(sum(pv))} ›</b></div>`:'');
 let rows=mb.slice().sort(SORTS[c.sort]||SORTS.due);
 $('#alist').innerHTML=rows.slice(0,showAll?rows.length:5).map(row).join('')||'<div class="empty">Nenhuma conta neste mês.<br>Toque em <b>Adicionar conta</b>.</div>';
 $('#vall').style.display=rows.length>5?'':'none';$('#vall').innerHTML=showAll?'Ver menos':'Ver todas '+ico('arrow');
 let so=SORT_OPTS.find(x=>x[0]==c.sort)||SORT_OPTS[0];
 $('#sortinfo').innerHTML=`↕️ Ordenado por: <b>${so[1].replace(/^\S+\s/,'')}</b> · <a onclick="openCfg()" style="text-decoration:underline;cursor:pointer">mudar</a>`;
 let m=[],pend=sum(mb.filter(b=>!b.paid))+sum(pv),lc=mb.filter(late).length+pv.length,pt=sum(S.bills.filter(b=>mo(b)==addM(cur,-1)));
 if(base)m.push(`Você já comprometeu ${p}% do seu salário.`);if(pend)m.push(`Você possui ${R(pend)} em contas pendentes.`);else if(mb.length)m.push('Parabéns! Todas as suas contas deste mês foram pagas!');
 if(lc)m.push(`Você possui ${lc} conta${lc>1?'s':''} vencida${lc>1?'s':''}.`);
 if(pt&&sum(mb)!=pt){let d=Math.round((sum(mb)/pt-1)*100);m.push(`Seu gasto ${d>0?'aumentou':'diminuiu'} ${Math.abs(d)}% em relação ao mês anterior.`)}
 $('#msgs').innerHTML=m.map(x=>'<li>'+esc(x)+'</li>').join('')||'<li>Cadastre suas contas para começar.</li>';
 renderPie(mb)}

function renderPie(mb){const byAcc=S.cfg.pie=='acc';
 $('#pcat').classList.toggle('on',!byAcc);$('#pacc').classList.toggle('on',byAcc);
 let g={};mb.forEach(b=>{let k=byAcc?b.name.trim():b.cat;g[k]=(g[k]||0)+b.value});
 let en=Object.entries(g).sort((a,b)=>b[1]-a[1]);
 if(byAcc&&en.length>8){let rest=en.slice(7).reduce((s,e)=>s+e[1],0);en=en.slice(0,7).concat([['Outras contas',rest]])}
 let T=en.reduce((s,e)=>s+e[1],0),ac=0;
 let st=en.map(([c,v],i)=>{let a=ac/T*100;ac+=v;return PAL[i%13]+' '+a+'% '+ac/T*100+'%'});
 $('#pie').style.background=T?'conic-gradient('+st.join(',')+')':'#e5e7eb';
 $('#pie').innerHTML=`<div class="ct"><b>${R(T)}</b><small>Total de contas</small></div>`;
 $('#leg').innerHTML=en.map(([c,v],i)=>`<div class="lg"><i style="background:${PAL[i%13]}"></i><span style="${i?'':'font-weight:700'}">${byAcc?'':esc(c.split(' ')[0])+' '}${esc(byAcc?c:catName(c))}</span><b>${Math.round(v/T*100)}%</b><span style="flex:none;color:var(--m)">${R(v)}</span></div>`).join('')||'<small class="sub">Sem contas neste mês.</small>';
 $('#pm2').textContent=en.length?(byAcc?`A conta que mais pesa neste mês é ${en[0][0]}, representando ${Math.round(en[0][1]/T*100)}% das suas contas.`:`Sua maior despesa neste mês é ${catName(en[0][0])}, representando ${Math.round(en[0][1]/T*100)}% das suas contas.`):''}

function row(b){let l=late(b),dd=b.due.slice(8)+'/'+b.due.slice(5,7);
 return `<div class="ar"><div class="ti">${esc(b.cat.split(' ')[0])}</div><div><div class="nm">${esc(b.name)}</div><div class="ct">${esc(catName(b.cat))}${b.type=='inst'?' · '+b.n+'/'+b.total:''}</div></div><div class="vl"><b>${R(b.value)}</b><small class="${l?'late':''}">${b.paid?'Paga ✓':(l?'Venceu em ':'Vence em ')+dd}</small></div><button class="ck ${b.paid?'on':''}" onclick="tog('${b.id}')" title="Marcar como paga">${b.paid?'✓':''}</button><button class="ic" onclick="openForm('${b.id}')" title="Editar">${ico('pencil')}</button><button class="ic" onclick="del('${b.id}')" title="Excluir">${ico('trash')}</button></div>`}
function tog(id){let b=S.bills.find(x=>x.id==id);b.paid=!b.paid;b.paidAt=b.paid?today:null;save();render();if($('#gd').open)showDebts()}
function nav(k){cur=addM(cur,k);render()}

/* ===== SALÁRIO ===== */
async function editSal(){let v=await dlg({t:'💵 Editar salário',m:'Salário mensal de '+MES[+cur.slice(5)-1]+' (vale para os meses seguintes até alterar):',inp:String(sal(cur)).replace('.',','),ok:'Salvar'});if(v===null)return;
 let s=String(v).trim().replace('R$','').trim();if(s.includes(','))s=s.replace(/\./g,'').replace(',','.');v=parseFloat(s);
 if(isNaN(v)||v<0)return dlg({t:'⚠️ Atenção',m:'Valor inválido.',one:1});S.sal[cur]=v;save();render()}

/* ===== CONTAS: FORMULÁRIO ===== */
function cats(){return CATS.concat(S.cats)}
async function newCat(){let n=await dlg({t:'🏷️ Nova categoria',m:'Nome da categoria:',inp:'',ok:'Criar'});if(n&&n.trim()){S.cats.push('⭐ '+n.trim());save();fillCats('⭐ '+n.trim())}}
function fillCats(sel){$('#fc').innerHTML=cats().map(c=>`<option ${c==sel?'selected':''}>${esc(c)}</option>`).join('')}
const defDue=()=>S.cfg.payDay?mk(cur,S.cfg.payDay):today;
const TN={single:'conta única',fixed:'conta fixa/recorrente',inst:'conta parcelada'};
function updFi(){let t=$('#fy').value,show=t=='inst'&&(!editing||editing.type!='inst');
 $('#fi').style.display=show?'block':'none';
 $('#f1l').textContent=editing?'Esta conta é a parcela número':'Número da primeira parcela';
 $('#fhint').textContent=editing?'O valor acima é o de cada parcela. As próximas parcelas serão criadas nos meses seguintes.':'O valor acima é o de cada parcela; o vencimento é o da primeira.';
 $('#ftn').style.display=editing&&t!=editing.type?'block':'none'}
function openForm(id){editing=id?S.bills.find(b=>b.id==id):null;let b=editing;$('#ft').textContent=b?'Editar conta':'Nova conta';
 $('#fn').value=b?b.name:'';$('#fv').value=b?b.value:'';fillCats(b?b.cat:CATS[0]);$('#fd').value=b?b.due:defDue();$('#fy').value=b?b.type:'single';
 $('#ft2').value=b&&b.type=='inst'?b.total:'';$('#f1').value=b&&b.type=='inst'?b.n:1;updFi();$('#fm').showModal()}
async function saveForm(){let name=$('#fn').value.trim(),v=parseFloat($('#fv').value),d=$('#fd').value,cat=$('#fc').value,ty=$('#fy').value;
 if(!name||!(v>0)||!d)return dlg({t:'⚠️ Atenção',m:'Preencha nome, valor e vencimento.',one:1});
 if(editing){let b=editing,old=b.type;
  if(ty!=old){
   let tt=0,f=1;
   if(ty=='inst'){tt=+$('#ft2').value;f=+$('#f1').value||1;if(!(tt>=2)||f>tt||f<1)return dlg({t:'⚠️ Atenção',m:'Informe o total de parcelas e o número desta parcela.',one:1})}
   let fut=S.bills.filter(x=>x.gid==b.gid&&x.id!=b.id&&x.due>b.due);
   if(fut.length&&!await dlg({t:'🔄 Mudar o tipo da conta',m:`Esta conta é ${TN[old]}. Ao mudar para ${TN[ty]}, as ${fut.length} contas futuras dela serão refeitas conforme o novo tipo. Continuar?`,ok:'Continuar'}))return;
   S.bills=S.bills.filter(x=>!fut.includes(x));
   if(old=='fixed')S.ended[b.gid]=addM(mo(b),-1);
   b.name=name;b.value=v;b.cat=cat;b.due=d;b.day=+d.slice(8);b.gid=uid();b.type=ty;delete b.n;delete b.total;
   if(ty=='inst'){b.n=f;b.total=tt;for(let i=f+1;i<=tt;i++)S.bills.push({id:uid(),gid:b.gid,name,value:v,cat,due:mk(addM(mo(b),i-f),b.day),paid:false,type:'inst',n:i,total:tt,day:b.day})}
  }else{
   let fut=false;if(b.gid&&S.bills.some(x=>x.gid==b.gid&&x.due>b.due))fut=!!await dlg({t:'✏️ Editar conta',m:'Aplicar a alteração também às ocorrências futuras?',ok:'Esta e futuras',cn:'Só esta'});
   let upd=x=>{x.name=name;x.value=v;x.cat=cat};upd(b);b.due=d;b.day=+d.slice(8);if(fut)S.bills.filter(x=>x.gid==b.gid&&x.due>b.due).forEach(upd)}}
 else if(ty=='inst'){let t=+$('#ft2').value,f=+$('#f1').value||1;if(!(t>=2)||f>t||f<1)return dlg({t:'⚠️ Atenção',m:'Informe o total de parcelas e a primeira parcela.',one:1});let g=uid(),day=+d.slice(8);
  for(let i=f;i<=t;i++)S.bills.push({id:uid(),gid:g,name,value:v,cat,due:mk(addM(d.slice(0,7),i-f),day),paid:false,type:'inst',n:i,total:t,day})}
 else{let g=uid();S.bills.push({id:uid(),gid:g,name,value:v,cat,due:d,paid:false,type:ty,day:+d.slice(8)})}
 save();$('#fm').close();render()}
async function del(id){let b=S.bills.find(x=>x.id==id),fut=S.bills.filter(x=>x.gid==b.gid&&x.due>b.due&&b.type!='single');
 if(!await dlg({t:'🗑️ Excluir conta',m:'Deseja realmente excluir a conta "'+b.name+'"?',ok:'Excluir',danger:1}))return;let all=false;if(fut.length)all=!!await dlg({t:'🗑️ Ocorrências futuras',m:'Excluir também as '+fut.length+' ocorrências futuras de "'+b.name+'"?',ok:'Esta e futuras',cn:'Só esta',danger:1});
 S.bills=S.bills.filter(x=>x.id!=id&&!(all&&x.gid==b.gid&&x.due>b.due));if(b.type=='fixed'&&all)S.ended[b.gid]=addM(mo(b),-1);save();render()}
function showDebts(){const{pv,sum}=calc();$('#gb').innerHTML=`<h3 style="margin:0">⚠️ Pendências anteriores</h3><p class="sub">Vencimento original preservado. Total: <b style="color:var(--r)">${R(sum(pv))}</b></p>`+
 (pv.length?pv.sort((a,b)=>a.due.localeCompare(b.due)).map(b=>`<div class="bc" style="font-size:13px;justify-content:space-between"><span>${esc(b.name)}${b.type=='inst'?' '+b.n+'/'+b.total:''} · venc. ${b.due.split('-').reverse().join('/')}</span><span>${R(b.value)} <button class="ck" onclick="tog('${b.id}')"></button></span></div>`).join(''):'<p>Nenhuma pendência. 🎉</p>');
 if(!$('#gd').open)$('#gd').showModal()}
function openReport(){location.href='relatorio.html?ano='+cur.slice(0,4)}

/* ===== EXTRATO EM IMAGEM (nunca mostra salário, saldo ou %) ===== */
function png(share){const{mb,pv,sum}=calc();let rows=mb.slice().sort(SORTS.due),H=230+(rows.length+(pv.length?pv.length+3:0))*34+120,W=720;
 let c=document.createElement('canvas');c.width=W;c.height=H;let x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,W,H);
 x.fillStyle='#16a34a';x.fillRect(0,0,W,12);x.fillStyle='#111';x.font='800 30px Inter,sans-serif';x.fillText((APP_NAME+' '+appYear).toUpperCase(),30,66);
 x.font='500 20px Inter,sans-serif';x.fillStyle='#555';x.fillText('Extrato de contas — '+MES[+cur.slice(5)-1]+'/'+cur.slice(0,4),30,98);
 let y=140;const hd=()=>{x.fillStyle='#f3f4f6';x.fillRect(20,y-24,W-40,34);x.fillStyle='#555';x.font='600 14px Inter,sans-serif';[['Conta',30],['Categoria',250],['Venc.',430],['Valor',500],['Parc.',600],['Situação',650]].forEach(([t,px])=>x.fillText(t,px,y));y+=34};
 const line=b=>{x.font='500 14px Inter,sans-serif';x.fillStyle=late(b)?'#dc2626':'#222';x.fillText(b.name.slice(0,24),30,y);x.fillText(b.cat.slice(0,22),250,y);x.fillText(b.due.slice(8)+'/'+b.due.slice(5,7)+'/'+b.due.slice(2,4),430,y);x.fillText(R(b.value),500,y);x.fillText(b.type=='inst'?b.n+'/'+b.total:'—',600,y);x.fillStyle=b.paid?'#16a34a':'#d97706';x.font='700 14px Inter,sans-serif';x.fillText(b.paid?'Paga':'Pendente',650,y);y+=34};
 hd();rows.forEach(line);y+=20;
 const tot=(l,v,col)=>{x.font='700 18px Inter,sans-serif';x.fillStyle=col;x.fillText(l,30,y);x.textAlign='right';x.fillText(R(v),W-30,y);x.textAlign='left';y+=30};
 tot('Total de contas do mês',sum(rows),'#111');tot('Total pago',sum(rows.filter(b=>b.paid)),'#16a34a');tot('Total pendente',sum(rows.filter(b=>!b.paid)),'#d97706');
 if(pv.length){y+=24;x.font='800 20px Inter,sans-serif';x.fillStyle='#dc2626';x.fillText('Pendências anteriores',30,y);y+=40;hd();pv.forEach(line);y+=10;tot('Total de pendências anteriores',sum(pv),'#dc2626')}
 x.font='500 13px Inter,sans-serif';x.fillStyle='#9ca3af';x.textAlign='center';x.fillText('Criado por Lumanoids',W/2,H-24);
 c.toBlob(async bl=>{let f=new File([bl],'extrato-'+cur+'.png',{type:'image/png'});
  if(share&&navigator.canShare&&navigator.canShare({files:[f]})){try{await navigator.share({files:[f],title:'Extrato '+APP_NAME});return}catch(e){if(e.name=='AbortError')return}}
  let a=document.createElement('a');a.href=URL.createObjectURL(bl);a.download=f.name;a.click();if(share)dlg({t:'📥 Extrato baixado',m:'Seu navegador não compartilha imagens direto. O PNG foi baixado: anexe-o manualmente no WhatsApp.',one:1,ok:'Entendi'})})}

/* ===== CONFIGURAÇÕES ===== */
function fillCfg(){const c=S.cfg;
 $('#cfsal').textContent=c.showSal?R(sal(cur)):MASK;
 $('#cfeye').checked=!!c.showSal;
 $('#cfpay').value=String(c.payDay||0);
 $('#cfsort').innerHTML=SORT_OPTS.map(([k,l])=>`<button class="${c.sort==k?'on':''}" onclick="setSort('${k}')">${l}</button>`).join('')}
function openCfg(){fillCfg();if(!$('#cf').open)$('#cf').showModal()}
function setEye(v){S.cfg.showSal=!!v;save();render()}
function setPay(v){S.cfg.payDay=+v||0;save();fillCfg()}
function setSort(k){S.cfg.sort=k;save();render()}
function setPie(k){S.cfg.pie=k;save();render()}
function explain(){$('#gb').innerHTML=`<h3 style="margin:0 0 6px">🔒 Como seus dados são guardados</h3><div class="ex">
 <p>✅ Tudo o que você anota aqui fica guardado <b>somente no seu celular</b> (dentro do navegador).</p>
 <p>✅ Suas contas, salário, desejos e metas <b>não são enviados</b> para a internet, nem para banco de dados. Ninguém vê essas informações — <b>nem o desenvolvedor do aplicativo</b>.</p>
 <p>📊 O site só registra estatísticas anônimas de acesso (como o número de visitas).</p>
 <p>⚠️ <b>Se você limpar o histórico (ou os dados) do navegador, você perde tudo</b> o que anotou aqui, e não tem como recuperar.</p>
 <p>💾 Antes de limpar, toque em <b>Exportar</b> aqui nas Configurações. Isso salva uma cópia (um arquivo "JSON") no seu aparelho.</p>
 <p>📤 Para trazer tudo de volta, ou passar para outro celular, é só tocar em <b>Importar</b> e escolher esse arquivo.</p></div>`;
 if(!$('#gd').open)$('#gd').showModal()}
async function wipeAll(){
 if(!await dlg({t:'🗑️ Limpar tudo',m:'Isso apaga TODAS as suas contas, salário, desejos e metas deste aparelho. Não dá para desfazer. Dica: toque em Exportar antes, para guardar uma cópia.',ok:'Continuar',danger:1}))return;
 if(!await dlg({t:'⚠️ Última confirmação',m:'Tem certeza de que quer apagar tudo?',ok:'Sim, apagar tudo',danger:1}))return;
 S=norm(null);save();cur=nowM;$('#cf').close();render();tab('cart')}
function exp(){let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S)],{type:'application/json'}));a.download='minha-saude-financeira-backup-'+today+'.json';a.click()}
function imp(i){let f=i.files[0];if(!f)return;f.text().then(async t=>{let d;try{d=JSON.parse(t);if(!d||!Array.isArray(d.bills))throw 0}catch(e){return dlg({t:'⚠️ Arquivo inválido',m:'Não foi possível ler este backup.',one:1})}
 if(!await dlg({t:'📤 Restaurar backup',m:'Substituir os dados atuais pelo backup?',ok:'Restaurar',danger:1}))return;S=norm(d);save();render();fillCfg()});i.value=''}

/* ===== LISTA DE DESEJOS ===== */
const WC=[['casa','🛋️','Móveis para casa'],['pessoal','👤','Pessoal'],['edu','🎓','Educação'],['viagem','✈️','Viagem'],['outros','📦','Outros']];
let wEd=null;
function renderWish(){let L=S.wish,pend=L.filter(x=>!x.done),dn=L.length-pend.length;
 $('#wtot').textContent=R(sumV(pend));
 $('#wsub').textContent=L.length?`${pend.length} ${pend.length==1?'item':'itens'} na lista`+(dn?` · ${dn} já realizado${dn>1?'s':''} 🎉`:''):'Sua lista está vazia';
 let h='';WC.forEach(([k,e,l])=>{let it=L.filter(x=>(WC.some(w=>w[0]==x.cat)?x.cat:'outros')==k);if(!it.length)return;
  h+=`<div class="gh"><div>${e} ${l}</div><span>${R(sumV(it.filter(x=>!x.done)))}</span></div>`+it.map(x=>`<div class="it ${x.done?'done':''}"><button class="ck ${x.done?'on':''}" onclick="wtog('${x.id}')" title="Marcar como realizado">${x.done?'✓':''}</button><div class="grow"><span class="nm">${esc(x.name)}</span></div><span class="val">${R(x.value)}</span><button class="ic" onclick="openWish('${x.id}')">✏️</button><button class="ic" onclick="wdel('${x.id}')">🗑️</button></div>`).join('')});
 $('#wlist').innerHTML=h||'<div class="empty">🛍️<br>Aqui você monta a sua lista de desejos.<br>Toque em <b>Adicionar desejo</b> para começar.</div>'}
function openWish(id){wEd=id?S.wish.find(x=>x.id==id):null;$('#wt').textContent=wEd?'Editar desejo':'Novo desejo';$('#wn').value=wEd?wEd.name:'';$('#wv').value=wEd?wEd.value:'';
 $('#wc').innerHTML=WC.map(([k,e,l])=>`<option value="${k}" ${wEd&&wEd.cat==k?'selected':''}>${e} ${l}</option>`).join('');$('#wd').showModal()}
async function saveWish(){let n=$('#wn').value.trim(),v=parseFloat($('#wv').value),c=$('#wc').value;
 if(!n||!(v>0))return dlg({t:'⚠️ Atenção',m:'Preencha o nome do item e o valor.',one:1});
 if(wEd)Object.assign(wEd,{name:n,value:v,cat:c});else S.wish.push({id:uid(),name:n,value:v,cat:c,done:false});
 save();$('#wd').close();render()}
function wtog(id){let x=S.wish.find(w=>w.id==id);x.done=!x.done;save();render()}
async function wdel(id){let x=S.wish.find(w=>w.id==id);if(!await dlg({t:'🗑️ Excluir desejo',m:'Excluir "'+x.name+'" da sua lista?',ok:'Excluir',danger:1}))return;S.wish=S.wish.filter(w=>w.id!=id);save();render()}

/* ===== METAS DO ANO ===== */
const DIF={1:['🟢','Fácil'],2:['🟡','Média'],3:['🔴','Difícil']};
let gY=appYear,gEd=null,gD=2;
function renderGoals(){let L=S.goals.filter(g=>(g.year||appYear)==gY),dn=L.filter(g=>g.done).length;
 $('#gyl').textContent=gY;$('#gtt').textContent='Metas de '+gY;
 $('#gsub').textContent=L.length?`${dn} de ${L.length} cumprida${dn==1?'':'s'}`:'Nenhuma meta ainda';
 $('#gbar').style.width=(L.length?dn/L.length*100:0)+'%';
 let ord=L.filter(g=>!g.done).concat(L.filter(g=>g.done));
 $('#glist').innerHTML=ord.map(g=>`<div class="it ${g.done?'done':''}"><button class="ck ${g.done?'on':''}" onclick="gtog('${g.id}')" title="Marcar como cumprida">${g.done?'✓':''}</button><div class="grow"><span class="nm">${esc(g.name)}${g.done?' 🎉':''}</span><span class="badge d${g.diff}">${DIF[g.diff][0]} ${DIF[g.diff][1]}</span></div><button class="ic" onclick="openGoal('${g.id}')">✏️</button><button class="ic" onclick="gdel('${g.id}')">🗑️</button></div>`).join('')||'<div class="empty">🎯<br>Escreva aqui tudo o que você quer realizar neste ano.<br>Toque em <b>Nova meta</b> para começar.</div>'}
function gnav(k){gY+=k;renderGoals()}
function setD(d){gD=d;$('#gp').innerHTML=[1,2,3].map(k=>`<button class="d${k} ${gD==k?'on':''}" onclick="setD(${k})">${DIF[k][0]} ${DIF[k][1]}</button>`).join('')}
function openGoal(id){gEd=id?S.goals.find(x=>x.id==id):null;$('#gt').textContent=gEd?'Editar meta':'Nova meta';$('#gn').value=gEd?gEd.name:'';setD(gEd?gEd.diff:2);$('#gl').showModal()}
async function saveGoal(){let n=$('#gn').value.trim();if(!n)return dlg({t:'⚠️ Atenção',m:'Escreva a sua meta.',one:1});
 if(gEd)Object.assign(gEd,{name:n,diff:gD});else S.goals.push({id:uid(),name:n,diff:gD,done:false,year:gY});
 save();$('#gl').close();render()}
function gtog(id){let x=S.goals.find(g=>g.id==id);x.done=!x.done;save();render()}
async function gdel(id){let x=S.goals.find(g=>g.id==id);if(!await dlg({t:'🗑️ Excluir meta',m:'Excluir a meta "'+x.name+'"?',ok:'Excluir',danger:1}))return;S.goals=S.goals.filter(g=>g.id!=id);save();render()}

/* ===== INÍCIO ===== */
function render(){renderCart();renderWish();renderGoals();if($('#cf').open)fillCfg()}
document.title=APP_NAME+' '+appYear;
$('#ttl').textContent=APP_NAME;$('#yr').textContent=appYear;
$('#cfpay').innerHTML='<option value="0">Sem dia fixo</option>'+[...Array(31)].map((_,i)=>`<option value="${i+1}">Dia ${i+1}</option>`).join('');
$('#lc').href=LINK_COMPRAS;
render();
