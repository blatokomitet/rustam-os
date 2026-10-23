import React,{useEffect,useMemo,useState} from 'react';
import './os3.css';
type Task={id:string;title:string;done:boolean};
type Habit={id:string;title:string;completedOn:string[]};
type RecordItem={id:string;title:string;amount?:number;date?:string;kind?:string;done?:boolean};
type Page='Сегодня'|'Работа'|'Финансы'|'План'|'Персонаж';
const dateKey=()=>new Date().toLocaleDateString('en-CA');
const read=<T,>(key:string,fallback:T):T=>{try{const x=localStorage.getItem(key);return x?JSON.parse(x) as T:fallback}catch{return fallback}};
const useStored=<T,>(key:string,fallback:T)=>{const [value,setValue]=useState<T>(()=>read(key,fallback));useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}},[key,value]);return [value,setValue] as const};
const id=()=>crypto.randomUUID();
const money=(n:number)=>n.toLocaleString('pl-PL',{maximumFractionDigits:2})+' zł';
const icon:Record<string,string>={'Сегодня':'⌂','Работа':'▣','Финансы':'▥','План':'▦','Персонаж':'♙'};
function App(){
 const [page,setPage]=useState<Page>('Сегодня');
 const [tasks,setTasks]=useStored<Task[]>('rustam-os-demo-v1',[{id:'1',title:'Проверить план на неделю',done:false},{id:'2',title:'30 минут активности',done:true},{id:'3',title:'Обновить бюджет',done:false}]);
 const [habits,setHabits]=useStored<Habit[]>('rustam-os-habits-v1',[]);
 const [work,setWork]=useStored<RecordItem[]>('rustam-os-Работа-v1',[]);
 const [finance,setFinance]=useStored<RecordItem[]>('rustam-os-Финансы-v1',[]);
 const [events,setEvents]=useStored<RecordItem[]>('rustam-os-Календарь-v1',[]);
 const [projects,setProjects]=useStored<RecordItem[]>('rustam-os-Проекты-v1',[]);
 const [newTask,setNewTask]=useState('');
 const [panel,setPanel]=useState<'task'|'work'|'finance'|'event'|'project'|'habit'|null>(null);
 const [name,setName]=useState('');const [amount,setAmount]=useState('');const [day,setDay]=useState(dateKey());const [kind,setKind]=useState('Расход');
 const [planTab,setPlanTab]=useState<'Календарь'|'Задачи'|'Цели'|'Проекты'>('Календарь');
 const [workTab,setWorkTab]=useState<'Смены'|'Статистика'|'Объекты'>('Смены');
 const [financeTab,setFinanceTab]=useState<'Обзор'|'Доходы'|'Расходы'>('Обзор');
 const [calendarMonth,setCalendarMonth]=useState(()=>new Date(new Date().getFullYear(),new Date().getMonth(),1));
 const [selectedDay,setSelectedDay]=useState(dateKey());
 const [timerStart,setTimerStart]=useStored<number|null>('rustam-os-shift-start-v1',null);
 const [now,setNow]=useState(Date.now());
 useEffect(()=>{if(timerStart===null)return;const t=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(t)},[timerStart]);
 const completed=tasks.filter(t=>t.done).length,habitDone=habits.filter(h=>h.completedOn.includes(dateKey())).length;
 const xp=completed*10+habitDone*5,level=Math.floor(xp/100)+1;
 const income=finance.filter(x=>x.kind==='Доход').reduce((s,x)=>s+(x.amount||0),0);
 const expense=finance.filter(x=>x.kind!=='Доход').reduce((s,x)=>s+(x.amount||0),0);
 const balance=income-expense;
 const workTotal=work.reduce((s,x)=>s+(x.amount||0),0);
 const addTask=()=>{if(!newTask.trim())return;setTasks(x=>[{id:id(),title:newTask.trim(),done:false},...x]);setNewTask('')};
 const toggleTask=(taskId:string)=>setTasks(x=>x.map(t=>t.id===taskId?{...t,done:!t.done}:t));
 const open=(p:typeof panel)=>{setPanel(p);setName('');setAmount('');setDay(dateKey());setKind('Расход')};
 const save=()=>{if(!name.trim())return;const monetary=panel==='work'||panel==='finance';const value=monetary?Number(amount):undefined;if(monetary&&(!amount.trim()||!Number.isFinite(value)||(value??-1)<0))return;
 const row:RecordItem={id:id(),title:name.trim(),date:day,amount:value,kind:panel==='finance'?kind:undefined};
 if(panel==='task')setTasks(x=>[{id:row.id,title:row.title,done:false},...x]);
 if(panel==='work')setWork(x=>[row,...x]);if(panel==='finance')setFinance(x=>[row,...x]);if(panel==='event')setEvents(x=>[row,...x]);if(panel==='project')setProjects(x=>[row,...x]);
 if(panel==='habit')setHabits(x=>[{id:row.id,title:row.title,completedOn:[]},...x]);setPanel(null)};
 const pageNav=(p:Page)=>{setPage(p);window.scrollTo({top:0,behavior:'smooth'})};
 const week=useMemo(()=>{const d=new Date();const monday=new Date(d);monday.setDate(d.getDate()-((d.getDay()+6)%7));return Array.from({length:7},(_,i)=>{const x=new Date(monday);x.setDate(monday.getDate()+i);return x})},[]);
 const shiftTime=timerStart===null?'00:00:00':new Date(Math.max(0,now-timerStart)).toISOString().slice(11,19);
 const taskList=(limit?:number)=><div className="os3-list">{tasks.slice(0,limit).map(t=><label className="os3-task" key={t.id}><input type="checkbox" checked={t.done} onChange={()=>toggleTask(t.id)}/><span className={t.done?'os3-strike':''}>{t.title}</span></label>)}{!tasks.length&&<div className="os3-empty">Нет задач. Добавьте первую.</div>}</div>;
 const entries=(rows:RecordItem[],empty:string)=><div className="os3-list">{rows.length?rows.map(r=><div className="os3-entry" key={r.id}><div className="os3-entry-icon">{r.kind==='Расход'?'−':r.kind==='Доход'?'+':'▣'}</div><div><strong>{r.title}</strong><small>{r.date||'Без даты'}</small></div>{r.amount!==undefined&&<b className={r.kind==='Расход'?'os3-negative':'os3-positive'}>{r.kind==='Расход'?'-':'+'}{money(r.amount)}</b>}</div>):<div className="os3-empty">{empty}</div>}</div>;
 const dayEvents=events.filter(e=>e.date===selectedDay);
 const monthStart=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth(),1),offset=(monthStart.getDay()+6)%7,monthDays=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()+1,0).getDate();
 const monthGrid=Array.from({length:Math.ceil((offset+monthDays)/7)*7},(_,i)=>i-offset+1);
 return <div className="os3"><div className="os3-frame"><div className="os3-status"><span>9:41</span><span>▂ ▄ ▆ ▰</span></div><header className="os3-header"><button className="os3-brand" onClick={()=>pageNav('Сегодня')}><span>✦</span> RUSTAM <em>OS</em></button><div className="os3-header-actions"><span aria-label="Демонстрационная версия" title="Данные сохраняются в этом браузере">●</span><button className="os3-avatar" onClick={()=>pageNav('Персонаж')} aria-label="Персонаж">R</button></div></header>
 <main className="os3-content">
 {page==='Сегодня'&&<><div className="os3-intro"><small>{new Date().toLocaleDateString('ru-RU',{weekday:'long',day:'numeric',month:'long'})}</small><h1>Привет, Rustam <span>⌄</span></h1><p>Держи курс. Всё важное — в одном месте.</p></div>
 <section className="os3-hero"><div className="os3-hero-copy"><h2>Уровень {level}</h2><p>{xp%100} / 100 XP</p><div className="os3-progress"><div style={{width:xp%100+'%'}}/></div><div className="os3-hero-bottom"><span>♛</span><p>Дисциплина<br/>создаёт свободу.</p></div></div><div className="os3-orb"><div className="os3-orb-core">R</div></div></section>
 <div className="os3-stats"><button onClick={()=>{pageNav('План');setPlanTab('Задачи')}}><span className="os3-stat-icon green">✓</span><small>Задачи</small><b>{completed}<em> / {tasks.length}</em></b></button><button onClick={()=>open('habit')}><span className="os3-stat-icon amber">♨</span><small>Привычки</small><b>{habitDone}<em> / {habits.length}</em></b></button><button onClick={()=>pageNav('Персонаж')}><span className="os3-stat-icon blue">★</span><small>Уровень</small><b>{level}</b></button></div>
 <div className="os3-section-heading"><h2>Сегодня</h2><button className="os3-plus" onClick={()=>open('task')}>+</button></div>{taskList(4)}
 <div className="os3-section-heading"><h2>Быстрые действия</h2></div><div className="os3-actions">{[['✓','Задача','task'],['▤','Заметка','project'],['↗','Расход','finance'],['▦','Событие','event']].map(([symbol,label,target])=><button key={label} onClick={()=>{open(target as typeof panel);if(target==='finance')setKind('Расход')}}><span>{symbol}</span>{label}</button>)}</div>
 <div className="os3-quote"><strong>Лучше, чем вчера.</strong><small>RUSTAM OS</small></div></>}
 {page==='Работа'&&<><div className="os3-intro"><h1>Работа</h1><p>Смены, объекты, доходы.</p></div><div className="os3-segments">{(['Смены','Статистика','Объекты'] as const).map(t=><button key={t} className={workTab===t?'active':''} onClick={()=>setWorkTab(t)}>{t}</button>)}</div>
 {workTab==='Смены'&&<><div className="os3-week">{week.map((d,i)=><div className={d.toDateString()===new Date().toDateString()?'active':''} key={i}><span>{['Пн','Вт','Ср','Чт','Пт','Сб','Вс'][i]}</span><b>{d.getDate()}</b></div>)}</div>
 <section className="os3-shift"><div className="os3-between"><strong>Текущая смена</strong><span className="os3-live">{timerStart?'● В работе':'● Не начата'}</span></div><p>{work[0]?.title||'Укажите объект и начните смену'}</p><div className="os3-shift-hours">{timerStart?'Идёт учёт времени':'Готов к работе'}</div><div className="os3-between os3-timer"><b>{shiftTime}</b><button onClick={()=>setTimerStart(v=>v===null?Date.now():null)} aria-label={timerStart?'Остановить таймер':'Запустить таймер'}>{timerStart?'Ⅱ':'▶'}</button></div></section>
 <div className="os3-section-heading"><h2>Записи о работе</h2><button className="os3-plus" onClick={()=>open('work')}>+</button></div>{entries(work,'Добавьте первую смену с датой и оплатой.')}</>}
 {workTab==='Статистика'&&<><div className="os3-balance"><small>Начислено по записям</small><strong>{money(workTotal)}</strong><p>Записей: {work.length}</p></div>{entries(work,'Статистика появится после добавления смен.')}</>}
 {workTab==='Объекты'&&<>{entries(work,'Список объектов появится после добавления смен.')}</>}
 </>}
 {page==='Финансы'&&<><div className="os3-intro"><h1>Финансы</h1><p>Доходы, расходы, цели.</p></div><div className="os3-segments">{(['Обзор','Доходы','Расходы'] as const).map(t=><button className={financeTab===t?'active':''} key={t} onClick={()=>setFinanceTab(t)}>{t}</button>)}</div>
 <section className="os3-balance"><small>Текущий баланс</small><strong>{money(balance)}</strong><div className="os3-chart" aria-hidden="true"><svg viewBox="0 0 330 100" preserveAspectRatio="none"><defs><linearGradient id="os3grad" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#58ed7d" stopOpacity=".3"/><stop offset="1" stopColor="#58ed7d" stopOpacity="0"/></linearGradient></defs><path d="M0 80 L55 68 L105 73 L155 50 L205 53 L255 28 L330 12 L330 100 L0 100Z" fill="url(#os3grad)"/><path d="M0 80 L55 68 L105 73 L155 50 L205 53 L255 28 L330 12" stroke="#58ed7d" strokeWidth="3" fill="none"/></svg></div><div className="os3-balance-bottom"><div><span>Доходы</span><b>{money(income)}</b></div><div><span>Расходы</span><b>{money(expense)}</b></div></div><small className="os3-chart-note">График декоративный · суммы рассчитаны по записям</small></section>
 <div className="os3-finance-actions"><button onClick={()=>{open('finance');setKind('Доход')}}>＋ Доход</button><button onClick={()=>{open('finance');setKind('Расход')}}>－ Расход</button></div>
 <div className="os3-section-heading"><h2>Последние операции</h2><span>Все</span></div>{entries(finance.filter(x=>financeTab==='Обзор'||x.kind===(financeTab==='Доходы'?'Доход':'Расход')),'Операций пока нет. Добавьте доход или расход.')}</>}
 {page==='План'&&<><div className="os3-intro"><h1>План</h1><p>Календарь, задачи, цели.</p></div><div className="os3-segments">{(['Календарь','Задачи','Цели','Проекты'] as const).map(t=><button className={planTab===t?'active':''} key={t} onClick={()=>setPlanTab(t)}>{t}</button>)}</div>
 {planTab==='Календарь'&&<><section className="os3-calendar"><div className="os3-between"><strong>{calendarMonth.toLocaleDateString('ru-RU',{month:'long',year:'numeric'})}</strong><div className="os3-calendar-arrows"><button onClick={()=>setCalendarMonth(d=>new Date(d.getFullYear(),d.getMonth()-1,1))}>‹</button><button onClick={()=>setCalendarMonth(d=>new Date(d.getFullYear(),d.getMonth()+1,1))}>›</button></div></div><div className="os3-calendar-grid">{['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d=><span key={d} className="os3-weekday">{d}</span>)}{monthGrid.map((n,i)=>{const valid=n>0&&n<=monthDays;const iso=valid?[calendarMonth.getFullYear(),String(calendarMonth.getMonth()+1).padStart(2,'0'),String(n).padStart(2,'0')].join('-'):'';return <button disabled={!valid} key={i} className={selectedDay===iso?'selected':events.some(e=>e.date===iso)?'has-event':''} onClick={()=>setSelectedDay(iso)}>{valid?n:''}</button>})}</div></section><div className="os3-section-heading"><h2>{new Date(selectedDay+'T12:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'long'})}</h2><button className="os3-plus" onClick={()=>{open('event');setDay(selectedDay)}}>+</button></div>{entries(dayEvents,'На выбранную дату событий нет.')}</>}
 {planTab==='Задачи'&&<><div className="os3-section-heading"><h2>Мои задачи</h2><button className="os3-plus" onClick={()=>open('task')}>+</button></div>{taskList()}</>}
 {planTab==='Цели'&&<div className="os3-empty">Цели пока не добавлены. Для отслеживания прогресса используйте проекты и задачи.</div>}
 {planTab==='Проекты'&&<><div className="os3-section-heading"><h2>Проекты</h2><button className="os3-plus" onClick={()=>open('project')}>+</button></div>{entries(projects,'Пока нет проектов.')}</>}</>}
 {page==='Персонаж'&&<><div className="os3-intro"><h1>Персонаж</h1><p>Развитие, навыки, достижения.</p></div><section className="os3-character"><div className="os3-character-art"><div className="os3-character-orb">R</div></div><div className="os3-between"><h2>Уровень {level}</h2><span>{xp%100} / 100 XP</span></div><div className="os3-progress"><div style={{width:xp%100+'%'}}/></div></section><div className="os3-stats"><div><small>Задачи</small><b>{completed}</b></div><div><small>Привычки</small><b>{habitDone}</b></div><div><small>Проекты</small><b>{projects.length}</b></div></div><div className="os3-section-heading"><h2>Навыки</h2></div><div className="os3-skills">{[['⚒','Работа',work.length],['▥','Финансы',finance.length],['♨','Привычки',habitDone],['✦','Дисциплина',completed]].map(([symbol,label,value])=><div key={String(label)}><span>{symbol}</span><strong>{label}</strong><small>{value} действий</small><div className="os3-skillbar"><div style={{width:Math.min(100,Number(value)*10)+'%'}}/></div></div>)}</div><div className="os3-section-heading"><h2>Привычки</h2><button className="os3-plus" onClick={()=>open('habit')}>+</button></div><div className="os3-list">{habits.map(h=><label className="os3-task" key={h.id}><input type="checkbox" checked={h.completedOn.includes(dateKey())} onChange={()=>setHabits(x=>x.map(z=>z.id===h.id?{...z,completedOn:z.completedOn.includes(dateKey())?z.completedOn.filter(d=>d!==dateKey()):[...z.completedOn,dateKey()]}:z))}/><span>{h.title}</span></label>)}{!habits.length&&<div className="os3-empty">Добавьте привычку, чтобы получать XP.</div>}</div></>}
 </main>
 <nav className="os3-nav" aria-label="Главная навигация">{(['Сегодня','Работа','Финансы','План','Персонаж'] as const).map(t=><button key={t} className={page===t?'active':''} onClick={()=>pageNav(t)}><span>{icon[t]}</span><small>{t}</small></button>)}</nav>
 {panel&&<div className="os3-overlay" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setPanel(null)}}><form className="os3-modal" onSubmit={e=>{e.preventDefault();save()}}><div className="os3-between"><h2>{({task:'Новая задача',work:'Новая смена',finance:'Операция',event:'Новое событие',project:'Новый проект',habit:'Новая привычка'} as const)[panel]}</h2><button type="button" onClick={()=>setPanel(null)} aria-label="Закрыть">×</button></div><input autoFocus required maxLength={120} value={name} onChange={e=>setName(e.target.value)} placeholder="Название"/>{(panel==='work'||panel==='finance')&&<input type="number" min="0" step="0.01" required placeholder="Сумма, zł" value={amount} onChange={e=>setAmount(e.target.value)}/>}{panel==='finance'&&<select value={kind} onChange={e=>setKind(e.target.value)}><option>Расход</option><option>Доход</option></select>}{['work','finance','event'].includes(panel)&&<input type="date" value={day} onChange={e=>setDay(e.target.value)} required/>}<button className="os3-submit" type="submit">Сохранить</button></form></div>}
 </div></div>
}
export default App;
