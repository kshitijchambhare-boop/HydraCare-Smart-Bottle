(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],KEY='hydracare_v1';
const PRO={ravi:{name:'Ravi Kumar',age:68,weight:72,target:2400,wake:'07:00',sleep:'22:00',interval:90,notes:'Post-surgery recovery; on daily medication.'},
meera:{name:'Meera Deshmukh',age:74,weight:58,target:1900,wake:'06:30',sleep:'21:30',interval:60,notes:'Elderly care; low thirst sensation.'},
aarav:{name:'Aarav Sharma',age:35,weight:80,target:2600,wake:'07:30',sleep:'23:00',interval:120,notes:'Outpatient on a medication course.'}};
const def=(k='ravi')=>({p:{...PRO[k]},logs:[],b:{cap:750,level:750},rem:0,miss:0,active:false,since:0,snz:0,alerts:[],hist:[1900,2200,1600,2400,1800,2100],dark:false,gap:120,cg:180,temp:22.4,cgf:'',low:false,goalD:''});
let S;try{S=JSON.parse(localStorage[KEY])}catch{S=null}S=S||def();
let sim=null,NX=0,demoRun=false,dirty=true,C={};
const now=()=>sim||Date.now(),save=()=>{try{localStorage[KEY]=JSON.stringify(S)}catch{}};
const dk=t=>new Date(t).toDateString(),today=()=>S.logs.filter(l=>dk(l.t)==dk(now())),tot=()=>today().reduce((a,l)=>a+l.ml,0);
const hm=(s,b=now())=>{const[h,m]=s.split(':');const d=new Date(b);d.setHours(+h,+m,0,0);return d.getTime()};
const fT=t=>new Date(t).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
const dur=m=>{m=Math.floor(m);return m>=60?Math.floor(m/60)+' h '+m%60+' min':m+' min'};
const awake=()=>now()>=hm(S.p.wake)&&now()<=hm(S.p.sleep),week=()=>[...S.hist,tot()];
const note=(msg,lvl='info')=>{S.alerts.unshift({t:now(),msg,lvl});S.alerts=S.alerts.slice(0,30)};
const toast=m=>{const t=$('#toast');t.textContent=m;t.className='on';setTimeout(()=>t.className='',2500)};
function beep(){try{const a=new(window.AudioContext||window.webkitAudioContext)(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.frequency.value=880;g.gain.value=.15;o.start();setTimeout(()=>{o.stop();a.close()},350)}catch{}}
function gaps(){const L=today().map(l=>l.t).sort((a,b)=>a-b),pts=[hm(S.p.wake),...L],g=[];for(let i=1;i<pts.length;i++)g.push((pts[i]-pts[i-1])/6e4);
 return{g,cur:awake()?Math.max(0,(now()-pts[pts.length-1])/6e4):0,last:L.length?L[L.length-1]:0}}
function score(){const T=S.p.target,{g,cur}=gaps(),resp=S.rem?Math.max(0,1-S.miss/S.rem):1,cons=week().filter(x=>x>=T*.8).length/7,long=[...g,cur].filter(x=>x>S.gap).length;
 return Math.round(Math.min(1,tot()/T)*50+resp*20+cons*15+Math.max(0,15-long*5))}
function status(){const{cur}=gaps();if(cur>S.gap)return['bad','🔴 Long Gap'];const w=hm(S.p.wake),s=hm(S.p.sleep),f=Math.min(1,Math.max(0,(now()-w)/(s-w)));
 return tot()/S.p.target>=f*.8?['ok','🟢 Hydrated']:['warn','🟡 Needs Attention']}
const streak=()=>{let s=0;for(let i=S.hist.length-1;i>=0&&S.hist[i]>=S.p.target*.8;i--)s++;return s+(tot()>=S.p.target?1:0)};
function drink(ml,src='manual'){if(S.b.level<ml){S.b.level=S.b.cap;S.low=false;note('Bottle refilled automatically')}
 S.b.level-=ml;S.logs.push({t:now(),ml,src});S.active=false;S.snz=0;
 if(tot()>=S.p.target&&S.goalD!=dk(now())){S.goalD=dk(now());note('🎉 Daily goal achieved!','info')}
 if(S.b.level/S.b.cap<.2&&!S.low){S.low=true;note('Low bottle level – please refill','warn')}
 dirty=true;save();refresh()}
function refill(){S.b.level=S.b.cap;S.low=false;note('Bottle refilled');dirty=true;save();refresh()}
function fire(){S.active=true;S.since=now();S.rem++;note('Reminder: time to drink water 💧','warn');beep();
 if('Notification'in window&&Notification.permission=='granted')new Notification('HydraCare 💧',{body:'Time to drink water, '+S.p.name.split(' ')[0]+'!'})}
function tick(){const{last}=gaps();let nx=(last||hm(S.p.wake))+S.p.interval*6e4;if(S.snz>nx)nx=S.snz;NX=nx;
 if(awake()&&!demoRun){if(!S.active&&now()>=nx)fire();else if(S.active&&now()-S.since>6e5){S.miss++;S.since=now();note('Missed reminder recorded','bad')}
  const{cur}=gaps(),key=String(last);if(cur>S.cg&&S.cgf!==key){S.cgf=key;note('CAREGIVER ALERT: no hydration logged for '+dur(cur),'bad')}}
 save();refresh()}
function mk(id,type,labels,sets){const el=$('#'+id);if(!el||!el.offsetParent||!window.Chart)return;C[id]&&C[id].destroy();
 C[id]=new Chart(el,{type,data:{labels,datasets:sets},options:{responsive:true,maintainAspectRatio:false,animation:{duration:500},plugins:{legend:{display:sets.length>1}}}})}
function charts(){const T=S.p.target,d=['-6d','-5d','-4d','-3d','-2d','Yest','Today'],wk=week(),L=today().sort((a,b)=>a.t-b.t);let cum=0;
 const cd=[{label:'Cumulative ml',data:L.map(l=>cum+=l.ml),borderColor:'#1d6fe0',backgroundColor:'rgba(29,111,224,.15)',fill:true,tension:.3}];
 mk('cDaily','line',L.map(l=>fT(l.t)),cd);mk('cDaily2','line',L.map(l=>fT(l.t)),cd);
 mk('cWeek','bar',d,[{label:'ml',data:wk,backgroundColor:'#1d6fe0',borderRadius:8}]);
 const h=Array(24).fill(0);L.forEach(l=>h[new Date(l.t).getHours()]+=l.ml);
 mk('cHour','bar',h.map((_,i)=>i+':00'),[{label:'ml',data:h,backgroundColor:'#13c2c2',borderRadius:6}]);
 mk('cTvA','bar',d,[{label:'Target',data:wk.map(()=>T),backgroundColor:'#b9cbe6'},{label:'Actual',data:wk,backgroundColor:'#1d6fe0'}]);
 mk('cCare','line',d,[{label:'Hydration %',data:wk.map(x=>Math.round(x/T*100)),borderColor:'#13c2c2',tension:.3}])}
function refresh(){const T=S.p.target,t=tot(),pct=Math.min(100,Math.round(t/T*100)),{cur,last}=gaps(),st=status(),lp=Math.round(S.b.level/S.b.cap*100),sc=score(),wk=week();
 const V={name:S.p.name,intake:t+' ml',target:T+' ml',remain:Math.max(0,T-t)+' ml',pct:pct+'%',rem:S.rem,miss:S.miss,last:last?fT(last):'—',next:awake()?fT(NX):'—',lvl:lp+'%',lvlml:S.b.level+' / '+S.b.cap+' ml',score:sc,status:st[1],streak:streak()+' days',weekc:Math.round(wk.filter(x=>x>=T*.8).length/7*100)+'%',cur:dur(cur),cap:S.b.cap+' ml',used:(S.b.cap-S.b.level)+' ml',temp:S.temp.toFixed(1)+' °C',weight:(S.b.level+180)+' g'};
 $$('[data-k]').forEach(e=>e.textContent=V[e.dataset.k]??'');
 $$('.rf').forEach(c=>c.style.strokeDashoffset=326.7*(1-(c.dataset.r=='pct'?pct:sc)/100));
 $$('#app .water').forEach(w=>w.style.height=lp+'%');$$('.pill.st').forEach(p=>p.className='pill st '+st[0]);
 $('#gapbox').hidden=!(cur>S.gap);$('#banner').hidden=!S.active;$('#bellN').textContent=S.alerts.length||'';
 const tl=today().sort((a,b)=>a.t-b.t).map(l=>`<li><b>${fT(l.t)}</b><span style="width:${l.ml/4}px"></span>${l.ml} ml</li>`).join('')||'<li class="mut">No water logged yet today.</li>';
 $$('.tl').forEach(e=>e.innerHTML=tl);
 const al=S.alerts.map(a=>`<li class="${a.lvl}"><b>${fT(a.t)}</b> ${a.msg}</li>`).join('')||'<li>No alerts.</li>';$$('.al:not(#evs)').forEach(e=>e.innerHTML=al);
 let sc2=[],x=hm(S.p.wake);while(x<=hm(S.p.sleep)){sc2.push(`<span>${fT(x)}</span>`);x+=S.p.interval*6e4}$('#sched').innerHTML=sc2.join('');
 if(dirty){dirty=false;charts()}}
function fill(){const p=S.p;$('#fName').value=p.name;$('#fAge').value=p.age;$('#fW').value=p.weight;$('#fT').value=p.target;$('#fWake').value=p.wake;$('#fSleep').value=p.sleep;$('#fInt').value=p.interval;$('#intIn').value=p.interval;$('#fNotes').value=p.notes;
 $('#capIn').value=S.b.cap;$('#gapIn').value=S.gap;$('#cgIn').value=S.cg;$('#dark').checked=S.dark;est()}
const estV=()=>Math.round((+$('#fW').value||0)*33/50)*50,est=()=>$('#est').textContent=estV()+' ml/day';
function go(p){$$('.pg').forEach(s=>s.hidden=s.id!='p-'+p);$$('#side nav button').forEach(b=>b.classList.toggle('on',b.dataset.go==p));$('#side').classList.remove('open');dirty=true;refresh()}
function theme(){document.documentElement.dataset.theme=S.dark?'dark':''}
const ingest=d=>{if(d.temp!=null)S.temp=+d.temp;if(d.weight!=null)S.b.level=Math.max(0,Math.min(S.b.cap,d.weight-180));
 if(d.event=='drink')drink(d.ml||250,'sensor');else if(d.event=='refill')refill();else if(d.event=='low'){S.b.level=Math.round(S.b.cap*.1);S.low=true;note('Low bottle level – please refill','warn')}
 save();refresh()};
window.HydrationAPI={patient:()=>S.p,today:()=>({total:tot(),logs:today()}),weekly:week,log:m=>drink(m,'api'),refill,sensor:()=>({level:S.b.level,temp:S.temp}),alerts:()=>S.alerts,ingest};
function resetDay(){S.logs=S.logs.filter(l=>dk(l.t)!=dk(now()));S.rem=S.miss=0;S.active=false;S.snz=0;S.b.level=S.b.cap;S.cgf='';sim=null;dirty=true;save();refresh()}
function demo(){if(demoRun)return;resetDay();demoRun=true;toast('▶ Demo: simulating a full patient day…');
 const st=[[8,0,'Patient wakes up ☀️'],[9,0,250],[11,0,'rem'],[11,15,200],[13,0,300],[15,30,'miss'],[17,0,250]];let i=0;
 const id=setInterval(()=>{if(i>=st.length){clearInterval(id);demoRun=false;toast('Demo complete ✔ (use "Back to live time" in Caregiver)');return}
  const[h,m,a]=st[i++];sim=hm(h+':'+m,Date.now());
  if(typeof a=='number')drink(a,'demo');else if(a=='rem'){S.rem++;S.active=true;S.since=now();note('Reminder sent (11:00)','warn');beep()}
  else if(a=='miss'){S.rem++;S.miss++;S.active=false;note('Reminder missed (15:30)','bad')}else note(a);
  dirty=true;save();refresh()},1500)}
const A={enter(b){$('#landing').hidden=true;$('#app').hidden=false;go(b?.dataset.p||'dash')},drink:b=>drink(+b.dataset.ml),refill,demo,resetday(){resetDay();toast('Day reset')},
 snooze(){S.active=false;S.snz=now()+3e5;note('Reminder snoozed 5 min');save();refresh()},test(){fire();save();refresh()},
 notif(){'Notification'in window?Notification.requestPermission().then(r=>toast('Notifications: '+r)):toast('Not supported')},
 useEst(){$('#fT').value=estV()},gap(){sim=now()+(S.cg+15)*6e4;toast('Simulated time jumped ahead');dirty=true;tick()},live(){sim=null;tick()},
 saveP(){const w=+$('#fW').value,t=+$('#fT').value,i=+$('#fInt').value;if(!$('#fName').value.trim()||w<2||t<500||i<15)return toast('Please enter valid values');
  Object.assign(S.p,{name:$('#fName').value.trim(),age:+$('#fAge').value,weight:w,target:t,wake:$('#fWake').value,sleep:$('#fSleep').value,interval:i,notes:$('#fNotes').value});dirty=true;save();fill();refresh();toast('Profile saved')},
 csv(){const r=['date,time,ml,source',...S.logs.map(l=>`${new Date(l.t).toLocaleDateString()},${fT(l.t)},${l.ml},${l.src}`)];const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([r.join('\n')],{type:'text/csv'}));a.download='hydration_report.csv';a.click()},
 resetall(){if(confirm('Erase all data?')){S=def();sim=null;theme();fill();dirty=true;save();refresh()}}};
document.addEventListener('click',e=>{const s=e.target.closest('[data-sim]');if(s){const k=s.dataset.sim,P={drink:{event:'drink',ml:250,temp:+(21+Math.random()*3).toFixed(1)},refill:{event:'refill',weight:S.b.cap+180},low:{event:'low'},read:{event:'reading',temp:+(20+Math.random()*6).toFixed(1),weight:S.b.level+180}};
  if(k=='resp'){if(S.active){drink(250,'reminder');$('#payload').textContent='{"event":"reminder_response","ml":250}'}else toast('No active reminder – press Test reminder');return}
  $('#payload').textContent='POST /api/sensor/simulate\n'+JSON.stringify(P[k],null,1);const ev=document.createElement('li');ev.textContent=fT(Date.now())+' · '+k;$('#evs').prepend(ev);ingest(P[k]);return}
 const g=e.target.closest('[data-go]');if(g)return go(g.dataset.go);const b=e.target.closest('[data-act]');if(b)A[b.dataset.act]?.(b)});
$$('[data-ring]').forEach(e=>e.innerHTML=`<circle class="rb" cx="60" cy="60" r="52"/><circle class="rf" data-r="${e.dataset.ring}" cx="60" cy="60" r="52"/><text x="60" y="66" data-k="${e.dataset.ring=='pct'?'pct':'score'}"></text>`);
$('#menu').onclick=()=>$('#side').classList.toggle('open');$('#fW').oninput=est;
$('#prof').onchange=e=>{const d=S.dark;S=def(e.target.value);S.dark=d;sim=null;fill();dirty=true;save();refresh()};
$('#intIn').onchange=e=>{S.p.interval=Math.max(15,+e.target.value||90);fill();save();refresh()};
$('#capIn').onchange=e=>{S.b.cap=Math.max(250,Math.min(2000,+e.target.value||750));S.b.level=Math.min(S.b.level,S.b.cap);save();refresh()};
$('#gapIn').onchange=e=>{S.gap=Math.max(30,+e.target.value||120);save();refresh()};$('#cgIn').onchange=e=>{S.cg=Math.max(30,+e.target.value||180);save();refresh()};
$('#dark').onchange=e=>{S.dark=e.target.checked;theme();save()};
theme();fill();setInterval(tick,1000);tick();
})();
