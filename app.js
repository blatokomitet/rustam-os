"use strict";
/* RUSTAM OS MVP: local-first, no analytics, network requests or external libraries. */
const STORAGE_KEY = "rustam-os:v1";
const XP = {habit:15,task:20,goal:25};
const directions = [
  {id:"career",name:"Карьера",subtitle:"Мастерство и работа",symbol:"▣",color:"#a996ff",detail:"Навыки, профессиональный рост, достижения и новые возможности."},
  {id:"finance",name:"Финансы",subtitle:"Капитал и стабильность",symbol:"◈",color:"#66caff",detail:"Планирование бюджета, накопления и финансовые цели."},
  {id:"health",name:"Здоровье",subtitle:"Энергия и баланс",symbol:"♡",color:"#65ddc6",detail:"Восстановление, движение, сон и полезные привычки."},
  {id:"relations",name:"Отношения",subtitle:"Люди и близость",symbol:"♧",color:"#ffacac",detail:"Семья, друзья, общение и качество отношений."},
  {id:"growth",name:"Развитие",subtitle:"Знания и характер",symbol:"✦",color:"#ffc378",detail:"Обучение, дисциплина, личные качества и новые компетенции."},
  {id:"order",name:"Порядок",subtitle:"Система и привычки",symbol:"◎",color:"#b9adff",detail:"Повседневная организация, привычки и управление временем."}
];
const habits = [
  {id:"move",name:"Движение",symbol:"↗"},
  {id:"learn",name:"Изучить что-то новое",symbol:"✧"},
  {id:"plan",name:"Спланировать день",symbol:"◇"},
  {id:"recharge",name:"Уделить время восстановлению",symbol:"☼"}
];
const $=id=>document.getElementById(id);
const dateKey=(date=new Date())=>date.getFullYear()+"-"+String(date.getMonth()+1).padStart(2,"0")+"-"+String(date.getDate()).padStart(2,"0");
const validDate=v=>typeof v==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(new Date(v+"T12:00:00").getTime());
const uid=()=>typeof crypto!=="undefined"&&crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2);
const defaultState=()=>({version:1,name:"Rustam",habits:{},tasks:[],goals:[]});
const label=(v,max)=>String(v||"").trim().slice(0,max);
function normalize(input){
  if(!input||typeof input!=="object"||input.version!==1||Array.isArray(input))throw new Error("Неподдерживаемый формат резервной копии.");
  const out=defaultState();out.name=label(input.name,32)||"Rustam";
  if(input.habits&&typeof input.habits==="object"&&!Array.isArray(input.habits)){
    for(const [day,items] of Object.entries(input.habits).slice(-1000)){
      if(validDate(day)&&Array.isArray(items)){
        const chosen=[...new Set(items.filter(v=>habits.some(h=>h.id===v)))];
        if(chosen.length)out.habits[day]=chosen;
      }
    }
  }
  if(Array.isArray(input.tasks))out.tasks=input.tasks.slice(0,1000).filter(t=>t&&typeof t==="object"&&typeof t.text==="string"&&label(t.text,180)&&validDate(t.createdAt)).map(t=>({
    id:label(t.id,100)||uid(),text:label(t.text,180),createdAt:t.createdAt,
    completedAt:validDate(t.completedAt)?t.completedAt:null
  }));
  if(Array.isArray(input.goals))out.goals=input.goals.slice(0,1000).filter(g=>g&&typeof g==="object"&&label(g.title,100)&&directions.some(d=>d.id===g.domain)).map(g=>({
    id:label(g.id,100)||uid(),title:label(g.title,100),domain:g.domain,
    log:Array.isArray(g.log)?g.log.filter(validDate).slice(0,5):[]
  }));
  return out;
}
let memoryOnly=false;
function load(){
  try{const saved=localStorage.getItem(STORAGE_KEY);return saved?normalize(JSON.parse(saved)):defaultState()}
  catch(error){memoryOnly=true;return defaultState()}
}
let state=load();
function save(){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));memoryOnly=false}
  catch(error){memoryOnly=true}
  $("privacyStatus").textContent=memoryOnly?"БЕЗ СОХРАНЕНИЯ":"ЛОКАЛЬНЫЙ РЕЖИМ";
}
function element(tag,cls,txt){
  const node=document.createElement(tag);
  if(cls)node.className=cls;
  if(txt!==undefined)node.textContent=String(txt);
  return node;
}
function toast(message){
  const n=$("toast");n.textContent=message;n.hidden=false;
  clearTimeout(toast.timer);toast.timer=setTimeout(()=>n.hidden=true,2600);
}
const activeHabits=day=>state.habits[day]||[];
const completedTasks=()=>state.tasks.filter(t=>t.completedAt!==null);
const goalSteps=()=>state.goals.reduce((sum,g)=>sum+g.log.length,0);
function score(){
  return Object.values(state.habits).reduce((sum,h)=>sum+h.length*XP.habit,0)
    +completedTasks().length*XP.task+goalSteps()*XP.goal;
}
function stats(){
  const checked=Object.values(state.habits).reduce((sum,v)=>sum+v.length,0);
  const days=new Set();
  for(const [day,v] of Object.entries(state.habits))if(v.length)days.add(day);
  for(const t of completedTasks())days.add(t.completedAt);
  for(const g of state.goals)for(const day of g.log)days.add(day);
  return {xp:score(),checked,completed:checked+completedTasks().length+goalSteps(),days:days.size};
}
function rank(level){return level<2?"Новичок":level<4?"Исследователь":level<7?"Стратег":level<10?"Мастер":"Легенда"}
function levelStats(){const xp=score();return{level:Math.floor(xp/150)+1,progress:xp%150,all:xp}}
function renderIdentity(){
  const data=levelStats();const s=stats();
  $("displayName").textContent=state.name;$("profileFullName").textContent=state.name;
  $("avatarLetter").textContent=state.name.slice(0,1).toUpperCase();
  $("profileLetter").textContent=state.name.slice(0,1).toUpperCase();
  $("rankName").textContent=rank(data.level);
  $("playerLevel").textContent=String(data.level).padStart(2,"0");
  $("xpCount").textContent=data.progress+" / 150 XP";
  $("xpProgress").style.width=(data.progress/150*100)+"%";
  $("levelMessage").textContent=data.progress?"Вперёд до следующего уровня":"Каждый шаг имеет значение";
  $("totalXp").textContent=s.xp;
  $("completedActions").textContent=s.completed;
  $("activeDays").textContent=s.days;
  $("profileRank").textContent="Уровень "+data.level+" · "+rank(data.level);
}
let activeDirection="career";
function renderDirections(){
  const grid=$("domainsGrid");grid.replaceChildren();
  for(const d of directions){
    const related=state.goals.filter(g=>g.domain===d.id);
    const steps=related.reduce((n,g)=>n+g.log.length,0);
    const pct=related.length?Math.round(100*steps/(related.length*5)):0;
    const card=element("button","domain-card");card.type="button";card.style.setProperty("--tint",d.color);
    const head=element("div","domain-head");head.append(element("span","domain-icon",d.symbol),element("span","domain-arrow","↗"));
    card.append(head,element("h3","",d.name),element("p","",d.subtitle));
    const foot=element("div","domain-bottom");
    foot.append(element("span","",related.length?pct+"% прогресса":"Нет целей"));
    const line=element("span","tiny-track");const fill=element("i");fill.style.width=pct+"%";line.append(fill);foot.append(line);card.append(foot);
    card.addEventListener("click",()=>showDirection(d.id));
    grid.append(card);
  }
}
function showDirection(id){
  activeDirection=id;const d=directions.find(v=>v.id===id);if(!d)return;
  const goals=state.goals.filter(g=>g.domain===id);
  $("dialogIcon").textContent=d.symbol;$("dialogIcon").style.color=d.color;
  $("dialogTitle").textContent=d.name;$("dialogDescription").textContent=d.detail;
  $("dialogSummary").textContent=goals.length+" целей · "+goals.reduce((n,g)=>n+g.log.length,0)+" выполненных шагов";
  $("directionDialog").showModal();
}
function renderHabits(){
  const today=dateKey();const chosen=activeHabits(today);
  $("habitCount").textContent=chosen.length+"/"+habits.length;
  const list=$("habitsList");list.replaceChildren();
  for(const h of habits){
    const done=chosen.includes(h.id);
    const row=element("button","habit-row"+(done?" is-done":""));row.type="button";row.setAttribute("aria-pressed",String(done));
    row.append(element("span","check-box",done?"✓":""),element("span","habit-name",h.name),element("span","row-xp",done?"ГОТОВО":"+15 XP"));
    row.addEventListener("click",()=>{
      const today=dateKey();const checked=new Set(activeHabits(today));
      if(checked.has(h.id))checked.delete(h.id);else checked.add(h.id);
      if(checked.size)state.habits[today]=[...checked];else delete state.habits[today];
      save();renderAll();
    });
    list.append(row);
  }
}
function renderTasks(){
  const list=$("tasksList");list.replaceChildren();
  const open=state.tasks.filter(t=>!t.completedAt).length;
  $("taskCount").textContent=open;
  if(!state.tasks.length){list.append(element("div","empty-state","Добавь первую задачу — и начни прокачку."));return}
  for(const t of [...state.tasks].reverse().slice(0,40)){
    const row=element("div","task-row"+(t.completedAt?" is-done":""));
    const toggle=element("button","task-toggle");toggle.type="button";toggle.setAttribute("aria-pressed",String(!!t.completedAt));toggle.setAttribute("aria-label",(t.completedAt?"Отменить выполнение: ":"Выполнить: ")+t.text);
    toggle.append(element("span","check-box",t.completedAt?"✓":""),element("span","task-name",t.text));
    toggle.addEventListener("click",()=>{t.completedAt=t.completedAt?null:dateKey();save();renderAll()});
    const del=element("button","remove-task","×");del.type="button";del.setAttribute("aria-label","Удалить задачу: "+t.text);
    del.addEventListener("click",()=>{if(confirm("Удалить задачу?")){state.tasks=state.tasks.filter(x=>x.id!==t.id);save();renderAll()}});
    row.append(toggle,del);list.append(row);
  }
  if(state.tasks.length>40)list.append(element("div","empty-state","Показаны последние 40 задач. Остальные сохранены в данных."));
}
function xpOnDay(day){
  return activeHabits(day).length*XP.habit
    +state.tasks.filter(t=>t.completedAt===day).length*XP.task
    +state.goals.reduce((total,g)=>total+g.log.filter(d=>d===day).length*XP.goal,0);
}
function renderChart(){
  const list=$("weekChart");list.replaceChildren();
  const days=Array.from({length:7},(_,i)=>{const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-(6-i));return{date:d,key:dateKey(d)}});
  const max=Math.max(...days.map(d=>xpOnDay(d.key)),1);
  for(const d of days){
    const amount=xpOnDay(d.key);
    const col=element("div","chart-col");
    const value=element("span","chart-value",amount?amount:"·");
    const bar=element("div","chart-bar"+(amount?"":" zero"));
    bar.style.height=(amount?Math.max(12,amount/max*88):5)+"px";
    bar.title=d.key+": "+amount+" XP";
    const day=element("span","chart-day",new Intl.DateTimeFormat("ru-RU",{weekday:"short"}).format(d.date));
    col.append(value,bar,day);list.append(col);
  }
}
function renderGoals(){
  const list=$("goalsList");list.replaceChildren();
  $("goalsCount").textContent=state.goals.length;
  if(!state.goals.length){list.append(element("div","empty-state","Здесь появятся твои цели. Создай первую миссию выше."));return}
  for(const goal of state.goals){
    const d=directions.find(x=>x.id===goal.domain);
    const card=element("article","goal-card");const head=element("div","");
    head.append(element("h3","",goal.title),element("div","goal-sub",d.name+" · "+(goal.log.length===5?"Завершено":"В процессе")));
    const track=element("div","goal-track");const fill=element("div");fill.style.width=(goal.log.length/5*100)+"%";track.append(fill);
    const controls=element("div","goal-controls");
    const minus=element("button","", "−");minus.type="button";minus.disabled=goal.log.length===0;minus.setAttribute("aria-label","Отменить шаг");minus.addEventListener("click",()=>{goal.log.pop();save();renderAll()});
    const count=element("strong","",goal.log.length+" / 5");
    const plus=element("button","","+");plus.type="button";plus.disabled=goal.log.length===5;plus.setAttribute("aria-label","Отметить шаг");plus.addEventListener("click",()=>{goal.log.push(dateKey());save();renderAll()});
    const del=element("button","goal-delete","Удалить");del.type="button";del.addEventListener("click",()=>{if(confirm("Удалить цель и заработанный по ней XP?")){state.goals=state.goals.filter(x=>x.id!==goal.id);save();renderAll()}});
    controls.append(minus,count,plus,del);card.append(head,track,controls);list.append(card);
  }
}
function renderAll(){
  renderIdentity();renderDirections();renderHabits();renderTasks();renderChart();renderGoals();
  $("privacyStatus").textContent=memoryOnly?"БЕЗ СОХРАНЕНИЯ":"ЛОКАЛЬНЫЙ РЕЖИМ";
  $("todayLabel").textContent=new Intl.DateTimeFormat("ru-RU",{day:"numeric",month:"long"}).format(new Date());
}
function go(page){
  const target=["home","goals","matches","profile"].includes(page)?page:"home";
  document.querySelectorAll("[data-page]").forEach(n=>{n.hidden=n.dataset.page!==target});
  document.querySelectorAll("[data-tab]").forEach(n=>{
    const active=n.dataset.tab===target;n.classList.toggle("active",active);
    if(active)n.setAttribute("aria-current","page");else n.removeAttribute("aria-current");
  });
  if(location.hash!=="#"+target)history.replaceState(null,"","#"+target);
  window.scrollTo({top:0,behavior:"instant"});
}
function editName(){
  const answer=prompt("Имя персонажа (максимум 32 символа):",state.name);
  if(answer===null)return;
  const next=label(answer,32);if(!next){toast("Имя не может быть пустым");return}
  state.name=next;save();renderAll();
}
$("editProfile").addEventListener("click",editName);
$("editProfileSecond").addEventListener("click",editName);
$("taskForm").addEventListener("submit",e=>{
  e.preventDefault();const field=$("taskInput");const value=label(field.value,180);if(!value)return;
  state.tasks.push({id:uid(),text:value,createdAt:dateKey(),completedAt:null});
  field.value="";save();renderAll();toast("Задача добавлена");
});
for(const d of directions){
  const option=element("option","",d.name);option.value=d.id;$("goalDomain").append(option);
}
$("goalForm").addEventListener("submit",e=>{
  e.preventDefault();const field=$("goalInput");const value=label(field.value,100);
  const domain=$("goalDomain").value;if(!value||!directions.some(d=>d.id===domain))return;
  state.goals.push({id:uid(),title:value,domain,log:[]});field.value="";
  save();renderAll();toast("Новая миссия создана");
});
document.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.tab)));
window.addEventListener("hashchange",()=>go(location.hash.slice(1)));
$("closeDirection").addEventListener("click",()=>$("directionDialog").close());
$("directionAddGoal").addEventListener("click",()=>{
  $("directionDialog").close();go("goals");$("goalDomain").value=activeDirection;$("goalInput").focus();
});
function exportBackup(){
  const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);const link=document.createElement("a");
  link.href=url;link.download="rustam-os-backup-"+dateKey()+".json";document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1500);toast("Резервная копия подготовлена");
}
$("exportData").addEventListener("click",exportBackup);
$("importData").addEventListener("click",()=>$("importFile").click());
$("importFile").addEventListener("change",async e=>{
  const file=e.target.files[0];e.target.value="";if(!file)return;
  if(file.size>1024*1024){toast("Файл слишком большой (до 1 МБ)");return}
  try{
    const parsed=normalize(JSON.parse(await file.text()));
    if(!confirm("Восстановить данные из файла? Текущий прогресс будет заменён."))return;
    state=parsed;save();renderAll();toast("Данные восстановлены");
  }catch(error){toast("Ошибка импорта: проверь JSON версии 1")}
});
$("resetData").addEventListener("click",()=>{
  if(!confirm("Безвозвратно сбросить локальные задачи, цели и XP? Сначала экспортируй копию."))return;
  state=defaultState();save();renderAll();go("home");toast("Прогресс сброшен");
});
renderAll();go(location.hash.slice(1)||"home");
