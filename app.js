import { SKILLS, makeQuestion, emptyProgress, normalizeProgress, selectNext, recordAttempt, gradeAnswer } from './engine.js';
import { LESSONS as RATIO_LESSONS, ROADMAP, REFERENCES, PARENT_GUIDE } from './content.js';
import { QUICK_LESSONS as RATIO_QUICK } from './quick-lessons.js';
import { COUNTING_LESSONS, COUNTING_QUICK, COUNTING_REFERENCES } from './counting-content.js';
import { countingModelHtml, attachCountingModel } from './counting-model.js';
import { RATIO_TEACHING, RATIO_TEACHING_REFERENCES } from './ratio-teaching.js';
import { COUNTING_TEACHING, COUNTING_TEACHING_REFERENCES } from './counting-teaching.js';

const LESSONS = [...RATIO_LESSONS, ...COUNTING_LESSONS];
const QUICK_LESSONS = {...RATIO_QUICK, ...COUNTING_QUICK};
const TEACHING = {...RATIO_TEACHING, ...COUNTING_TEACHING};
const CHAPTERS = [
  {id:'ratios', number:1, title:'Ratios & percentages', start:'percent_part', skills:RATIO_LESSONS.map(l=>l.id), diagnostic:['division','percent_decimal','percent_part','percent_rate','percent_whole','ratios','unit_rate','percent_change']},
  {id:'counting', number:2, title:'Permutations & combinations', start:'counting_choices', skills:COUNTING_LESSONS.map(l=>l.id), diagnostic:['counting_choices','permutations','combinations','counting_repeats','counting_probability','permutations','combinations','counting_repeats']}
];
const chapterById = id => CHAPTERS.find(c=>c.id===id) || CHAPTERS[0];
const chapterForSkill = id => CHAPTERS.find(c=>c.skills.includes(id)) || CHAPTERS[0];
const CHAPTER_INTRO = {
  ratios: {
    description:'Understand how quantities compare. Use division, ratios, and pictures to solve questions about rates and percentages.',
    question:'What is the whole, and how does the part relate to it?',
    goals:['Explain what a division answer means, including its units.','Use equal groups, tables, and graphs to describe a ratio.','Find a part, a percent, or a whole, then solve percent-change problems.']
  },
  counting: {
    description:'Count possibilities without missing any or counting the same result twice. Discover when order and repetition matter.',
    question:'What makes one outcome different from another?',
    goals:['Organize possibilities with lists, tables, and branching trees.','Distinguish arrangements with roles from groups without roles.','Decide whether choices may repeat and use counts to find simple probabilities.']
  }
};

const $ = selector => document.querySelector(selector);
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pretty = value => Number(value).toLocaleString('en-US', {maximumFractionDigits:6});
const skillById = id => SKILLS.find(s => s.id === id) || SKILLS[0];
const STORAGE = 'grade7-math-lab-progress-v1';
const PREFERENCE = 'grade7-math-lab-parent-zh';
const TEACHING_REFERENCES = [
  {title:'People’s Education Press: elementary mathematics teaching design',url:'https://www.pep.com.cn/xw/zt/hd/12/xjcjs/xx/202409/t20240920_1995566.html',use:'Chinese reference for the relationship between examples, real situations, and progressively varied practice. The English lessons in this book are original.',license:'Freely viewable publisher guidance; no open permission for translating and republishing textbook chapters is assumed.'},
  {title:'IES / WWC: Improving Mathematical Problem Solving in Grades 4 Through 8',url:'https://ies.ed.gov/ncee/wwc/PracticeGuide/16/Published',use:'Supports visual representations and reflection on the problem-solving process. This does not validate the particular software or readiness rules used here.',license:'Official US Department of Education practice guide; linked as a teaching reference.'},
  {title:'IES: Organizing Instruction and Study to Improve Student Learning',url:'https://ies.ed.gov/ncee/WWC/Docs/PracticeGuide/20072004.pdf',use:'Reference for spacing practice, alternating worked examples with independent problems, and connecting pictures with explanation.',license:'Public-domain US Department of Education report; the exact review intervals in this book are project design choices.'}
];
let progress = emptyProgress();
let chineseParents = false;
let practiceSession = null;
let worksheetQuestions = [];
let sheetSeed = Date.now();
let questionCounter = 0;
let activeLesson = null;
let activeChapter = 'ratios';
let lastLesson = 'percent_part';
let currentView = 'home';
let poolMode = 'part';
let poolPercent = 25;
let poolWhole = 800;

try {
  const saved = JSON.parse(localStorage.getItem(STORAGE) || 'null');
  if (saved?.version === 1 && saved.skills && Array.isArray(saved.history)) {
    progress = normalizeProgress(saved);
  }
  chineseParents = localStorage.getItem(PREFERENCE) === 'true';
} catch { $('#storage-warning').hidden = false; }

function saveProgress() {
  try { localStorage.setItem(STORAGE, JSON.stringify(progress)); }
  catch { $('#storage-warning').hidden = false; }
}



function poolPictureHtml() {
  return `<div class="pool-picture"><svg viewBox="0 0 560 112" role="img" aria-label="The full pool is 800 liters. One of four equal parts is shaded: 200 liters, or 25 percent."><text x="280" y="20" text-anchor="middle" font-size="17" fill="#263c40">Full pool: 800 L = 100%</text><rect x="1" y="34" width="558" height="43" rx="3" fill="#f4f7f6" stroke="#a7c1bc"/><rect x="2" y="35" width="139" height="41" fill="#087f78"/><path d="M141 35V77M280 35V77M419 35V77" stroke="#a7c1bc"/><text x="72" y="62" text-anchor="middle" font-size="18" fill="#fff">25%</text><text x="72" y="103" text-anchor="middle" font-size="17" fill="#087f78">200 L</text></svg></div>`;
}

function explorerHtml() {
  return `<section class="explorer" aria-labelledby="explorer-title"><h2 id="explorer-title">The pool model</h2><p>The full pool is 100%. Choose what to find.</p><div class="mode-buttons" aria-label="Choose the unknown"><button type="button" data-pool="part">Find the part</button><button type="button" data-pool="percent">Find the percent</button><button type="button" data-pool="whole">Find the whole</button></div><div class="controls"><label class="range">Fill level: <output id="percent-output">${poolPercent}%</output><input id="pool-percent" aria-label="Pool fill percentage" type="range" min="5" max="95" step="5" value="${poolPercent}"></label><label>Full capacity <select id="pool-whole" aria-label="Pool full capacity">${[200,400,600,800,1000,1200,1600,2000].map(n=>`<option value="${n}"${n===poolWhole?' selected':''}>${n} L</option>`).join('')}</select></label></div><div class="pool"><div id="pool-drawing"></div><div id="pool-equation" class="equation" aria-live="polite"></div></div><p class="form-note">Try 25%, then 50%. Explain why changing the unknown changes the calculation.</p></section>`;
}

function updatePool() {
  const part = poolWhole * poolPercent / 100;
  $('#percent-output').textContent = `${poolPercent}%`;
  document.querySelectorAll('[data-pool]').forEach(b => { b.classList.toggle('active', b.dataset.pool === poolMode); b.setAttribute('aria-pressed', b.dataset.pool === poolMode ? 'true' : 'false'); });
  $('#pool-drawing').innerHTML = `<svg viewBox="0 0 390 190" role="img" aria-label="${poolPercent} percent of ${poolWhole} liters is ${part} liters"><defs><clipPath id="pool-clip"><rect x="20" y="33" width="350" height="87" rx="12"/></clipPath></defs><rect x="20" y="33" width="350" height="87" rx="12" fill="white" stroke="#9bcbd6" stroke-width="2"/><rect x="20" y="33" width="${350*poolPercent/100}" height="87" fill="#289fc2" clip-path="url(#pool-clip)"/>${[1,2,3].map(n=>`<line x1="${20+n*87.5}" x2="${20+n*87.5}" y1="33" y2="120" stroke="#c0dae1" stroke-dasharray="4 4"/>`).join('')}<text x="195" y="22" font-size="15" text-anchor="middle" fill="#14334d">100% = ${pretty(poolWhole)} L</text><text x="195" y="147" font-size="17" font-weight="700" text-anchor="middle" fill="#087f78">Water: ${pretty(part)} L = ${poolPercent}%</text><line x1="20" y1="165" x2="370" y2="165" stroke="#789dac" stroke-width="2"/><circle cx="${20+350*poolPercent/100}" cy="165" r="5" fill="#087f78"/><text x="20" y="184" font-size="12" fill="#516878">0%</text><text x="370" y="184" text-anchor="end" font-size="12" fill="#516878">100%</text></svg>`;
  const info = {
    part: [`We know the whole and the percent.`, `part = whole × decimal`, `${pretty(poolWhole)} × ${poolPercent/100} = ${pretty(part)} L`, `Multiplying takes a fraction of the whole.`],
    percent: [`We know the part and the whole.`, `percent = (part ÷ whole) × 100`, `(${pretty(part)} ÷ ${pretty(poolWhole)}) × 100 = ${poolPercent}%`, `Divide to compare the part with one whole; multiply by 100 to name the percent.`],
    whole: [`We know the part and its percent.`, `whole = part ÷ decimal`, `${pretty(part)} ÷ ${poolPercent/100} = ${pretty(poolWhole)} L`, `The part is only a fraction of the pool. Division rebuilds the full amount.`]
  }[poolMode];
  $('#pool-equation').innerHTML = `<p class="form-note">${info[0]}</p><p class="formula">${info[1]}<small>${info[2]}</small></p><p class="form-note">${info[3]}</p>`;
}

function attachExplorer() {
  if (!$('#pool-percent')) return;
  $('#pool-percent').addEventListener('input', e=> {poolPercent=Number(e.target.value);updatePool();});
  $('#pool-whole').addEventListener('change', e=> {poolWhole=Number(e.target.value);updatePool();});
  document.querySelectorAll('[data-pool]').forEach(b=>b.addEventListener('click',()=>{poolMode=b.dataset.pool;updatePool();}));
  updatePool();
}

function proportionalModelHtml() {
  return `<section class="card"><h2>A straight line is not the whole story</h2><p>Notebooks cost $3 each. Compare buying them with no fee and with a $4 order fee.</p><svg viewBox="0 0 540 280" role="img" aria-label="Graph of y equals 3x through the origin, and y equals 3x plus 4 with a starting value of 4. The first is proportional; the second is not." style="width:100%;max-height:340px"><text x="50" y="24" font-size="15" fill="#14334d">Total cost ($)</text>${[0,4,8,12,16].map(y=>`<line x1="50" y1="${220-y*10}" x2="450" y2="${220-y*10}" stroke="#dbe6ec"/><text x="37" y="${225-y*10}" text-anchor="end" font-size="13" fill="#516878">${y}</text>`).join('')}${[0,1,2,3,4].map(x=>`<line x1="${50+x*100}" y1="60" x2="${50+x*100}" y2="220" stroke="#e7eff3"/><text x="${50+x*100}" y="242" text-anchor="middle" font-size="14" fill="#516878">${x}</text>`).join('')}<path d="M50 52V220H466" fill="none" stroke="#516878" stroke-width="2"/><path d="M50 220L450 100" fill="none" stroke="#087f78" stroke-width="3"/><path d="M50 180L450 60" fill="none" stroke="#a54a14" stroke-width="3" stroke-dasharray="7 4"/><circle cx="50" cy="220" r="5" fill="#087f78"/><circle cx="50" cy="180" r="5" fill="#a54a14"/><text x="325" y="127" font-size="15" fill="#087f78">y = 3x</text><text x="322" y="54" font-size="15" fill="#a54a14">y = 3x + 4</text><text x="250" y="271" text-anchor="middle" font-size="15" fill="#14334d">Number of notebooks (x)</text></svg><p class="form-note"><strong>No fee:</strong> y = 3x. The graph goes through (0, 0), and y ÷ x is always 3 when x is positive.<br><strong>$4 fee:</strong> y = 3x + 4. The graph starts at (0, 4), so the total cost is not proportional to the number of notebooks.</p></section>`;
}

function renderBookNav() {
  const chapter = chapterById(activeChapter);
  const showLessons = !['home','parents'].includes(currentView);
  $('#book-contents').innerHTML = `
    <a class="book-home-link${currentView==='home'?' active':''}" href="#home"${currentView==='home'?' aria-current="page"':''}>Book home</a>
    <p class="nav-label">Chapters</p>
    <div class="sidebar-chapters">${CHAPTERS.map(c=>`<a class="sidebar-chapter${showLessons&&c.id===activeChapter?' active':''}" href="#chapter/${c.id}"${currentView==='chapter'&&c.id===activeChapter?' aria-current="page"':''}><span class="chapter-number">${c.number}</span><span>${escapeHtml(c.title)}</span></a>`).join('')}</div>
    ${showLessons?`<div class="sidebar-lessons"><p class="nav-label">In chapter ${chapter.number}</p><ol>${chapter.skills.map((id,i)=>`<li><a href="#learn/${id}"${activeLesson===id?' class="active" aria-current="page"':''}><span>${chapter.number}.${i+1}</span> ${escapeHtml(QUICK_LESSONS[id].title)}</a></li>`).join('')}</ol></div>`:''}`;
}

function renderHome() {
  $('#home-view').innerHTML = `
    <header class="book-intro"><p class="eyebrow">An interactive math book</p><h1>Grade 7 Math Lab</h1>
      <p class="book-subtitle">Understand the idea. See how it works. Try it yourself.</p>
      <p>This book connects everyday questions with clear explanations, teaching diagrams, and worked examples. Practice online, get feedback after each answer, and revisit the ideas that need more work.</p>
      <p class="form-note">The current book has two chapters. It develops selected Grade 7 topics, with supporting foundations and extensions.</p>
    </header>
    <section class="home-chapters" aria-labelledby="home-chapters-heading"><h2 id="home-chapters-heading">Chapters</h2>
      ${CHAPTERS.map(c=>`<article class="chapter-entry"><p class="eyebrow">Chapter ${c.number} · ${c.skills.length} lessons</p><h3><a href="#chapter/${c.id}">${escapeHtml(c.title)}</a></h3><p>${escapeHtml(CHAPTER_INTRO[c.id].description)}</p><div class="chapter-entry-links"><a class="primary button" href="#chapter/${c.id}">Read chapter ${c.number}</a><a href="#practice/${c.id}">Practice</a></div></article>`).join('')}
    </section>
    <section class="how-to-read" aria-labelledby="how-to-heading"><h2 id="how-to-heading">How to use this book</h2><ol><li><strong>Learn one idea.</strong> Read the explanation and look closely at the diagram.</li><li><strong>Work through an example.</strong> Explain why each step makes sense, then try the quick check.</li><li><strong>Practice a little.</strong> Start with eight questions. Use the feedback, and check your record in <a href="#progress/${activeChapter}">Progress</a>.</li></ol><p class="form-note">You can return to any chapter from the contents menu. There is no timer.</p></section>`;
}

function renderChapter() {
  const chapter = chapterById(activeChapter);
  const intro = CHAPTER_INTRO[chapter.id];
  $('#chapter-view').innerHTML = `
    <p class="breadcrumb"><a href="#home">Book home</a><span aria-hidden="true"> / </span>Chapter ${chapter.number}</p>
    <header class="chapter-intro"><p class="eyebrow">Chapter ${chapter.number}</p><h1>${escapeHtml(chapter.title)}</h1><p>${escapeHtml(intro.description)}</p><p class="key-idea">${escapeHtml(intro.question)}</p></header>
    <section class="chapter-goals"><h2>What you will learn</h2><ul>${intro.goals.map(g=>`<li>${escapeHtml(g)}</li>`).join('')}</ul></section>
    <div class="lesson-actions"><a class="primary button" href="#learn/${chapter.skills[0]}">Start the first lesson</a><a href="#practice/${chapter.id}">Practice this chapter</a></div>
    <section class="chapter-lesson-list"><h2>Lessons</h2><ol>${chapter.skills.map((id,i)=>`<li><a href="#learn/${id}"><span class="lesson-list-number">${chapter.number}.${i+1}</span><span><strong>${escapeHtml(QUICK_LESSONS[id].title)}</strong><small>${escapeHtml(TEACHING[id]?.goal||LESSONS.find(l=>l.id===id).goal)}</small></span></a></li>`).join('')}</ol></section>`;
}

function renderLearn() {
  const lesson = LESSONS.find(l=>l.id===activeLesson) || LESSONS.find(l=>l.id===chapterById(activeChapter).start);
  const chapter = chapterForSkill(lesson.id);
  const chapterLessons = LESSONS.filter(l=>chapter.skills.includes(l.id));
  const brief = QUICK_LESSONS[lesson.id];
  const teaching = TEACHING[lesson.id];
  const number = chapterLessons.indexOf(lesson)+1;
  const example = teaching?.worked || {prompt:brief.example.question,steps:brief.example.steps,answer:brief.example.answer};
  const check = teaching?.check || {...lesson.check,why:''};
  const hasPool = ['percent_part','percent_rate','percent_whole','percent_decimal'].includes(lesson.id);
  $('#learn-view').innerHTML = `
    <p class="breadcrumb"><a href="#home">Book home</a><span aria-hidden="true"> / </span><a href="#chapter/${chapter.id}">Chapter ${chapter.number}</a><span aria-hidden="true"> / </span>Lesson ${number}</p>
    <header class="lesson-brief"><p class="eyebrow">${chapter.number}.${number} · ${escapeHtml(chapter.title)}</p><h1>${escapeHtml(brief.title)}</h1><p class="lesson-goal">${escapeHtml(teaching?.goal||lesson.goal)}</p></header>
    <section class="teaching-section"><h2>Understand the idea</h2>${(teaching?.paragraphs||[brief.idea]).map(text=>`<p>${escapeHtml(text)}</p>`).join('')}<p class="key-idea">${escapeHtml(brief.rule)}</p></section>
    ${teaching?.figure?`<figure class="teaching-figure">${teaching.figure.html}<figcaption><strong>Figure ${chapter.number}.${number}.</strong> ${escapeHtml(teaching.figure.caption)}</figcaption></figure>`:''}
    <article class="lesson-example"><h2>Worked example</h2><p class="example-question">${escapeHtml(example.prompt)}</p><ol>${example.steps.map(step=>`<li>${escapeHtml(step)}</li>`).join('')}</ol><p class="answer-line">${escapeHtml(example.answer)}</p></article>
    <section class="quick-check"><h2>Try one</h2><p>${escapeHtml(check.prompt)}</p><details><summary>Check your thinking</summary><p class="answer-line">${escapeHtml(check.answer)}</p>${check.why?`<p>${escapeHtml(check.why)}</p>`:''}</details></section>
    <div class="lesson-actions"><button class="primary" type="button" id="lesson-practice">Practice this idea</button><a class="quiet-link" href="#practice/${chapter.id}">Practice the chapter</a></div>
    ${chapter.id==='counting'?`<details class="optional-detail"><summary>Explore the possibilities</summary><div id="counting-model">${countingModelHtml(lesson.id)}</div></details>`:hasPool?`<details class="optional-detail"><summary>Try the pool model</summary>${explorerHtml()}</details>`:lesson.id==='proportional'?`<details class="optional-detail"><summary>Compare two graphs</summary>${proportionalModelHtml()}</details>`:''}
    <details class="optional-detail"><summary>More examples and explanations</summary>
      <h2>A closer look</h2>${lesson.explanation.map(text=>`<p>${escapeHtml(text)}</p>`).join('')}
      ${lesson.vocabulary?.length?`<div class="vocab">${lesson.vocabulary.map(v=>`<span><strong>${escapeHtml(v.term)}</strong>${escapeHtml(v.meaning)}</span>`).join('')}</div>`:''}
      ${lesson.workedExamples.filter(e=>e.question!==example.prompt).map((e,i)=>`<article class="example"><h3>Another example ${i+1}</h3><p>${escapeHtml(e.question)}</p><ol>${e.steps.map(step=>`<li>${escapeHtml(step)}</li>`).join('')}</ol><p class="answer-line">${escapeHtml(e.answer)}</p></article>`).join('')}
      <p class="watch-out"><strong>Check this</strong>${escapeHtml(lesson.watchOut)}</p>
      ${lesson.extension?`<details><summary>Optional extension</summary><p>${escapeHtml(lesson.extension)}</p></details>`:''}
      ${chineseParents?`<div class="parent-note" lang="zh-Hans"><strong>家长讲解提示</strong><p>${escapeHtml(lesson.parentZh)}</p></div>`:''}
    </details>
    <nav class="lesson-pager" aria-label="Lesson navigation">${number>1?`<a href="#learn/${chapterLessons[number-2].id}"><span>Previous lesson</span>${escapeHtml(QUICK_LESSONS[chapterLessons[number-2].id].title)}</a>`:`<a href="#chapter/${chapter.id}"><span>Chapter ${chapter.number}</span>Chapter contents</a>`}${chapterLessons[number]?`<a href="#learn/${chapterLessons[number].id}"><span>Next lesson</span>${escapeHtml(QUICK_LESSONS[chapterLessons[number].id].title)}</a>`:`<a href="#practice/${chapter.id}"><span>Next step</span>Review this chapter</a>`}</nav>`;
  $('#lesson-practice').addEventListener('click',()=>startPractice(false,lesson.id,8,chapter.id));
  poolMode=lesson.id==='percent_rate'?'percent':lesson.id==='percent_whole'?'whole':'part';
  attachExplorer();
  if(chapter.id==='counting') attachCountingModel($('#counting-model'),lesson.id);
}

function chapterOptions(selected=activeChapter) { return CHAPTERS.map(c=>`<option value="${c.id}"${c.id===selected?' selected':''}>${c.number}. ${escapeHtml(c.title)}</option>`).join(''); }
function chapterSkills(id=activeChapter) { return SKILLS.filter(s=>chapterById(id).skills.includes(s.id)); }
function skillOptions(includeMixed=true,chapterId=activeChapter) { return `${includeMixed?'<option value="">Let the practice adapt</option>':''}${chapterSkills(chapterId).map(s=>`<option value="${s.id}">${escapeHtml(QUICK_LESSONS[s.id].title)}</option>`).join('')}`; }

function renderPractice() {
  if (!practiceSession) return startPractice(false);
  renderQuestion();
}

function practiceOptionsHtml() {
  return `<details class="setup-options"><summary>Change practice</summary><div class="fields"><label class="field">Chapter<select id="practice-chapter">${chapterOptions(practiceSession?.chapter||activeChapter)}</select></label><label class="field">Topic<select id="practice-focus">${skillOptions(true,practiceSession?.chapter||activeChapter)}</select></label><label class="field">Length<select id="practice-length"><option value="8">8 questions</option><option value="12">12 questions</option></select></label></div><div class="button-row"><button class="secondary" id="start-practice" type="button">Start new practice</button><button class="text-button" id="start-check" type="button">Take a starting check</button></div></details>`;
}

function attachPracticeOptions() {
  $('#practice-focus').value=practiceSession?.focus||'';
  $('#practice-length').value=String(practiceSession?.length||8);
  $('#practice-chapter').addEventListener('change',()=>{$('#practice-focus').innerHTML=skillOptions(true,$('#practice-chapter').value);});
  $('#start-practice').addEventListener('click',()=>startPractice(false,$('#practice-focus').value,Number($('#practice-length').value),$('#practice-chapter').value));
  $('#start-check').addEventListener('click',()=>startPractice(true,'',8,$('#practice-chapter').value));
}

function startPractice(diagnostic=false,focus='',length=8,chapterId=activeChapter) {
  const chapter=chapterById(chapterId);
  activeChapter=chapter.id;
  if(!chapter.skills.includes(focus)) focus='';
  practiceSession={diagnostic,focus,chapter:chapter.id,length:diagnostic?8:length,index:0,answers:[],seed:Date.now()+questionCounter++,current:null,hints:0,graded:false,reason:'',seenPrompts:[]};
  prepareQuestion();
  const target=`#practice/${chapter.id}`;
  if(location.hash===target) renderPractice(); else location.hash=target;
}

function prepareQuestion() {
  const session=practiceSession;
  if(!session || session.index>=session.length) return;
  const chapter=chapterById(session.chapter);
  const order=chapter.diagnostic;
  const next=session.diagnostic?{skill:order[session.index],level:1,format:session.index%3===1?'choice':'numeric',reason:'A starting check. Take your time and show your thinking on paper.'}:selectNext(progress,{focus:session.focus||undefined,seed:session.seed+session.index,skillIds:chapter.skills});
    let candidate;
  for(let attempt=0;attempt<1000;attempt++) {
    candidate=makeQuestion(next.skill,next.level,`${session.seed}-${session.index}-${questionCounter++}`,next.format);
    if(!session.seenPrompts.includes(candidate.prompt)) break;
  }
  session.current=candidate;
  session.seenPrompts.push(candidate.prompt);
  session.reason=next.reason;session.hints=0;session.graded=false;session.raw='';
}

function renderQuestion() {
  const s=practiceSession;
  if(!s) return renderPractice();
  if(s.index>=s.length || s.finished) return renderSessionSummary();
  const q=s.current;
  $('#practice-view').innerHTML=`<div class="practice-card">
    <p class="chapter-caption">Chapter ${chapterById(s.chapter).number} · ${escapeHtml(chapterById(s.chapter).title)}</p><div class="practice-header"><span>${s.diagnostic?'Starting check · ':''}Question ${s.index+1} of ${s.length}</span><button class="text-button" id="finish-session" type="button">Finish for now</button></div>
    <div class="question-card"><h1 class="practice-title" id="question-prompt">${escapeHtml(q.prompt)}</h1>
      <form id="answer-form"><fieldset style="border:0;margin:0;padding:0"><legend class="visually-hidden">Your answer</legend>
      ${q.format==='choice'?`<div class="choice-list">${q.choices.map((c,i)=>`<label class="choice-label"><input type="radio" name="choice" value="${c.value}"${s.graded?' disabled':''}><span class="option">${String.fromCharCode(65+i)}</span><span>${escapeHtml(c.label)}${q.unit&&!['%','dollars'].includes(q.unit)?' '+escapeHtml(q.unit):''}</span></label>`).join('')}</div>`:`<div class="numeric-answer"><input id="numeric-input" name="answer" type="text" inputmode="decimal" autocomplete="off" aria-label="Your answer" aria-describedby="answer-format"${s.graded?' disabled':''}><label for="numeric-input">${escapeHtml(q.unit||'answer')}</label></div><p class="form-note" id="answer-format">${q.unit==='%'?'For 25%, type 25.':'Type a number or fraction, like 0.25 or 1/4.'}</p>`}
      </fieldset><p id="answer-error" class="error-text" role="alert"></p><div id="hint-area" aria-live="polite"></div>
      <div class="button-row" id="answer-actions"${s.graded?' hidden':''}><button class="primary" id="check-answer" type="submit">Check answer</button><button class="text-button" id="show-hint" type="button">Need a hint?</button></div></form>
      <div id="feedback-area" aria-live="polite"></div>
    </div>${practiceOptionsHtml()}</div>`;
  $('#answer-form').addEventListener('submit',submitAnswer);
  $('#show-hint').addEventListener('click',showHint);
  $('#finish-session').addEventListener('click',()=>{practiceSession.finished=true;renderSessionSummary();});
  if(q.format==='numeric') {
    $('#numeric-input').value=s.raw||'';
    $('#numeric-input').addEventListener('input',e=>{s.raw=e.target.value;});
  } else {
    document.querySelectorAll('#answer-form input[name=choice]').forEach(input=>{
      input.checked=input.value===s.raw;
      input.addEventListener('change',()=>{s.raw=input.value;});
    });
  }
  if(s.hints>0) {
    $('#hint-area').innerHTML=`<div class="hint"><p>${escapeHtml(q.hints[s.hints-1])}</p></div>`;
    $('#show-hint').textContent=s.hints>=q.hints.length?'All hints shown':'Another hint';
    $('#show-hint').disabled=s.graded||s.hints>=q.hints.length;
  }
  attachPracticeOptions();
  if(s.graded) showFeedback(s.lastResult);
}

function showHint() {
  const s=practiceSession;if(!s||s.graded)return;
  s.hints=Math.min(s.hints+1,s.current.hints.length);
  $('#hint-area').innerHTML=`<div class="hint"><strong>Hint ${s.hints}</strong><p>${escapeHtml(s.current.hints[s.hints-1])}</p></div>`;
  $('#show-hint').textContent=s.hints>=s.current.hints.length?'All hints shown':'Another hint';
  $('#show-hint').disabled=s.hints>=s.current.hints.length;
}

function submitAnswer(event) {
  event.preventDefault();const s=practiceSession;if(!s||s.graded)return;
  const q=s.current;
  const raw=q.format==='choice'?$('#answer-form input[name="choice"]:checked')?.value:$('#numeric-input').value;
  if(raw===undefined){$('#answer-error').textContent='Choose an answer first.';return;}
  const result=gradeAnswer(q,raw);
  if(!result.valid){$('#answer-error').textContent=result.message;return;}
  $('#answer-error').textContent='';s.graded=true;s.lastResult=result;
  s.raw=raw;
  const entry={correct:result.correct,hintUsed:s.hints>0,error:result.error,timestamp:Date.now()};
  progress=recordAttempt(progress,q,entry);saveProgress();
  s.answers.push({...entry,skill:q.skill});
  $('#check-answer').disabled=true;$('#show-hint').disabled=true;
  document.querySelectorAll('#answer-form input').forEach(input=>input.disabled=true);
  showFeedback(result);
}

function showFeedback(result) {
  const s=practiceSession,q=s.current;
  const steps=`<ol>${q.steps.map(step=>`<li>${escapeHtml(step)}</li>`).join('')}</ol>`;
  $('#answer-actions').hidden=true;
  $('#feedback-area').innerHTML=`<div class="feedback${result.correct?' correct':''}"><h2>${result.correct?'Correct.':'Let’s work it out.'}</h2><p>${escapeHtml(result.message)}</p>${result.correct?`<details><summary>See the steps</summary>${steps}</details>`:steps}<div class="button-row"><button class="primary" id="next-question" type="button">${s.index+1>=s.length?'Finish practice':'Next question'}</button><a class="quiet-link" href="#learn/${q.skill}">See the lesson</a></div></div>`;
  $('#next-question').addEventListener('click',()=>{s.index++;prepareQuestion();renderQuestion();$('#practice-view').scrollIntoView({behavior:'smooth',block:'start'});});
  $('#next-question').focus({preventScroll:true});
}

function renderSessionSummary() {
  const s=practiceSession;if(!s)return renderPractice();
  const independent=s.answers.filter(a=>a.correct&&!a.hintUsed).length;
  const supported=s.answers.filter(a=>a.correct&&a.hintUsed).length;
  const next=selectNext(progress,{seed:Date.now(),skillIds:chapterById(s.chapter).skills});
  $('#practice-view').innerHTML=`<h1>${s.answers.length>=s.length?'Practice complete':'Finished for now'}</h1><p>${s.answers.length} questions answered.</p><p>${independent} correct on your own · ${supported} correct with a hint</p><div class="lesson-actions"><a class="primary button" href="#learn/${next.skill}">Learn the next idea</a><button class="text-button" id="again-practice" type="button">Practice again</button></div>${practiceOptionsHtml()}`;
  $('#again-practice').addEventListener('click',()=>startPractice(false));
  attachPracticeOptions();
}

function renderPrint() {
  $('#print-view').innerHTML=`<h1>Print practice</h1><p>Choose a topic and make a practice sheet.</p><label class="field chapter-field">Chapter<select id="sheet-chapter">${chapterOptions()}</select></label><div class="card no-print" style="margin-top:25px"><div class="fields"><label class="field">Skill<select id="sheet-skill"><option value="mixed">Chapter review</option>${skillOptions(false)}</select></label><label class="field">Difficulty<select id="sheet-level"><option value="1">Start simple</option><option value="2">Build confidence</option><option value="3">Stretch</option></select></label><label class="field">Questions<select id="sheet-count"><option value="8">8</option><option value="12" selected>12</option><option value="20">20</option><option value="40">40</option></select></label></div><label class="form-note"><input type="checkbox" id="include-answers"> Include the answer key when printing</label><div class="button-row"><button class="primary" type="button" id="generate-sheet">Generate new sheet</button><button class="secondary" type="button" id="print-sheet">Print this sheet</button></div></div><details class="no-print optional-detail"><summary>Chapter 1 PDF books</summary><p>These PDFs cover ratios and percentages. Use the generator above for Chapter 2.</p><div class="button-row"><a class="secondary button" href="downloads/Grade-7-Math-Student-Workbook.pdf" target="_blank" rel="noopener">Student workbook PDF</a><a class="quiet-link" href="downloads/Grade-7-Math-Answer-Guide.pdf" target="_blank" rel="noopener">Answer guide PDF</a></div></details><div class="worksheet" id="worksheet"></div>`;
  $('#sheet-chapter').addEventListener('change',event=>{location.hash=`print/${event.target.value}`;});
  $('#generate-sheet').addEventListener('click',()=>{sheetSeed=Date.now();generateSheet();});
  $('#print-sheet').addEventListener('click',()=>window.print());
  $('#include-answers').addEventListener('change',paintSheet);
  generateSheet();
}

function generateSheet() {
  const skill=$('#sheet-skill').value,level=Number($('#sheet-level').value),count=Number($('#sheet-count').value);
  const seen=new Set();
  const skills=chapterSkills();
  worksheetQuestions=Array.from({length:count},(_,i)=>{
    let candidate;
    for(let attempt=0;attempt<1000;attempt++) {
      candidate=makeQuestion(skill==='mixed'?skills[i%skills.length].id:skill,level,`${sheetSeed}-${i}-${attempt}`,i%3===0?'choice':'numeric');
      if(!seen.has(candidate.prompt)) break;
    }
    seen.add(candidate.prompt);
    return candidate;
  });
  paintSheet();
}

function paintSheet() {
  const include=$('#include-answers').checked;
  $('#worksheet').innerHTML=`<h2>Chapter ${chapterById(activeChapter).number} · ${escapeHtml(chapterById(activeChapter).title)}</h2><p class="worksheet-meta">Name: ____________________ &nbsp; Date: __________ &nbsp; Sheet ${String(sheetSeed).slice(-6)}<br>Show the relationship, calculate, and check your answer. Use the units requested.</p>${worksheetQuestions.map((q,i)=>`<article class="sheet-question"><p><strong>${i+1}.</strong> ${escapeHtml(q.prompt)}</p>${q.format==='choice'?`<div class="sheet-choices">${q.choices.map((c,j)=>`<span>${String.fromCharCode(65+j)}. ${escapeHtml(c.label)}${q.unit&&!['%','dollars'].includes(q.unit)?' '+escapeHtml(q.unit):''}</span>`).join('')}</div>`:'<p>Answer: ____________________</p>'}<div class="work-space"></div></article>`).join('')}${include?`<section class="answer-key"><h2>Answer key</h2>${worksheetQuestions.map((q,i)=>`<div class="sheet-answer"><strong>${i+1}. ${escapeHtml(q.answerDisplay ?? pretty(q.answer))} ${escapeHtml(q.unit)}</strong><br>${q.steps.map(escapeHtml).join(' ')}</div>`).join('')}</section>`:''}`;
}

function renderProgress() {
  const skills=chapterSkills();
  const attempts=skills.reduce((a,s)=>a+progress.skills[s.id].attempts,0);
  $('#progress-view').innerHTML=`<h1>My progress</h1><label class="field chapter-field">Chapter<select id="record-chapter">${chapterOptions()}</select></label><div class="card"><div class="section-heading"><h2>${attempts} questions explored</h2><p>First submitted answers only</p></div><div class="table-wrap"><table class="progress-table"><thead><tr><th>Idea</th><th>Independent</th><th>With hints</th><th>Next step</th></tr></thead><tbody>${skills.map(skill=>{const p=progress.skills[skill.id];const recent=p.recent.slice(-5);const right=recent.filter(r=>r.independent).length;return `<tr><td><a href="#learn/${skill.id}">${escapeHtml(skill.title)}</a><div class="progress-track" aria-label="${right} independent correct answers in the last ${recent.length} questions"><span style="width:${right/5*100}%"></span></div></td><td>${p.independentCorrect} / ${p.attempts}</td><td>${p.supportedCorrect}</td><td><span class="status ${p.mastered?'ready':p.attempts?'building':''}">${p.mastered?'Ready for review':p.attempts?'Keep building':'Try this idea'}</span><br><small>Practice level ${p.level}</small></td></tr>`;}).join('')}</tbody></table></div><div class="button-row"><button class="secondary" id="export-progress" type="button">Export progress</button></div></div><details class="optional-detail"><summary>About this record</summary><p>A review signal needs 4 independent correct answers in the last 5 attempts, at least 2 contexts, and a typed answer. It is a practice rule, not a validated mastery score.</p><p>Your answers are stored on this browser and device. The book does not send them to GitHub or an AI service. Another device will have its own record. Clearing browser data may remove this record.</p><p class="form-note">Export creates a local JSON file for a parent to review or keep. The first edition does not import records or synchronize devices.</p><button class="text-button danger" id="reset-progress" type="button">Reset this browser's progress</button></details>`;
  $('#record-chapter').addEventListener('change',event=>{location.hash=`progress/${event.target.value}`;});
  $('#export-progress').addEventListener('click',()=>{
    const blob=new Blob([JSON.stringify({book:'Grade 7 Math Lab',exportedAt:new Date().toISOString(),...progress},null,2)],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`math-lab-progress-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  });
  $('#reset-progress').addEventListener('click',()=>{if(confirm('Reset all practice progress stored in this browser? Export it first if you want to keep a copy.')){progress=emptyProgress();practiceSession=null;saveProgress();renderProgress();}});
}

function renderParents() {
  $('#parents-view').innerHTML=`<h1>For parents</h1><p>Start with one short lesson, then eight questions. For counting, ask whether changing the order changes the result.</p>
    <p class="form-note">Choose Chapter 1 for ratios and percentages, or Chapter 2 for counting, permutations, and combinations.</p>
    ${chineseParents?'<div class="parent-note" lang="zh-Hans"><p>每次先看一个知识点，再做 8 道题。第一章先问“谁是 100%”；第二章先问“换顺序算不算不同、能不能重复”。顶部的章节菜单可以切换。</p></div>':''}
    <div class="button-row"><button class="secondary" id="parent-start-check" type="button">Start an 8-question check</button><a class="quiet-link" href="#progress">View progress</a></div>
    <details class="optional-detail"><summary>Helping with a lesson</summary><h3>Counting: name a different outcome</h3><p>Ask whether AB and BA are different. Named roles or positions make order matter; a group with no roles counts once. Check whether repeats are allowed, then list a small example before multiplying.</p>${PARENT_GUIDE.map(g=>`<h3>${escapeHtml(g.heading)}</h3><p>${escapeHtml(g.body)}</p>${chineseParents?`<p class="parent-note" lang="zh-Hans">${escapeHtml(g.zh)}</p>`:''}`).join('')}</details>
    <details class="optional-detail"><summary>How adaptive practice works</summary><p>Original question templates vary the numbers and situations. Code calculates the answers; no live AI model grades a child's response.</p><ol><li>An incorrect answer or a hint leads to more practice of that idea.</li><li>Repeated difficulty lowers the level or revisits a prerequisite.</li><li>Three independent correct answers in succession can raise the level.</li><li>A review signal requires 4 independent successes in the last 5 first attempts, at least 2 contexts, and a typed answer.</li><li>In adaptive mode, review is eligible after 2 days, or 7 days at the highest level, when the learner returns.</li></ol><p>These are practical teaching rules, not a validated mastery assessment. Ask the learner to explain before deciding why an answer was wrong.</p><p>Answers stay in the current browser. They are not uploaded to GitHub or synchronized across devices. Progress can be exported from the Progress page.</p></details>
    <details class="optional-detail"><summary>Michigan standards and the fall plan</summary><p>Michigan defines annual expectations. Local schools choose their sequence. This suggested 16-week plan includes later topics beyond the current volume.</p><div class="table-wrap"><table class="roadmap-table"><thead><tr><th>Weeks</th><th>Focus</th><th>Standards</th><th>In this edition</th></tr></thead><tbody>${ROADMAP.map(r=>`<tr><td>${escapeHtml(r.weeks)}</td><td>${escapeHtml(r.focus)}</td><td>${escapeHtml(r.standards)}</td><td>${escapeHtml(r.status)}</td></tr>`).join('')}</tbody></table></div><p>Chapter 1 covers selected ratio and percentage skills. Chapter 2 develops organized counting and simple compound probability (7.SP.C.8), with introductory permutations and combinations as supporting extensions. Formal permutation and combination formulas appear in the high-school standard S-CP.9(+); they are not required for this chapter. These two chapters do not cover the whole Grade 7 year.</p></details>
    <details class="optional-detail"><summary>Sources and teaching references</summary><p>The book's lessons, examples, question templates, and diagrams are original. These references informed scope and teaching design. Linked materials retain their own licenses.</p>${REFERENCES.concat(COUNTING_REFERENCES,RATIO_TEACHING_REFERENCES,COUNTING_TEACHING_REFERENCES,TEACHING_REFERENCES).map(r=>`<article class="resource"><h3><a href="${escapeHtml(r.url)}" target="_blank" rel="noopener">${escapeHtml(r.title)}</a></h3><p>${escapeHtml(r.use)}</p><small>${escapeHtml(r.license)}</small></article>`).join('')}<p class="form-note">Chapter 2 added November 22, 2026. External publishers do not endorse this book.</p></details>`;
  $('#parent-start-check').addEventListener('click',()=>startPractice(true));
}

function route() {
  const [candidate,item]=(location.hash.slice(1)||'home').split('/');
  currentView=['home','chapter','learn','practice','print','progress','parents'].includes(candidate)?candidate:'home';
  activeLesson=currentView==='learn'?(LESSONS.some(l=>l.id===item)?item:lastLesson):null;
  if(activeLesson) {
    lastLesson=activeLesson;
    activeChapter=chapterForSkill(activeLesson).id;
  } else if(CHAPTERS.some(c=>c.id===item)) activeChapter=item;
  if(currentView==='practice' && practiceSession && practiceSession.chapter!==activeChapter) practiceSession=null;
  document.querySelectorAll('.view').forEach(v=>v.hidden=v.id!==`${currentView}-view`);
  const learnTarget=chapterForSkill(lastLesson).id===activeChapter?lastLesson:chapterById(activeChapter).start;
  document.querySelectorAll('[data-tab]').forEach(a=>{
    const selected=a.dataset.tab===currentView || (currentView==='chapter'&&a.dataset.tab==='learn');
    a.classList.toggle('active',selected);
    if(selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
    a.setAttribute('href',a.dataset.tab==='learn'?`#learn/${learnTarget}`:a.dataset.tab==='parents'?'#parents':`#${a.dataset.tab}/${activeChapter}`);
  });
  $('.brand').setAttribute('href','#home');
  document.body.dataset.view=currentView;
  document.body.dataset.chapter=activeChapter;
  renderBookNav();
  ({home:renderHome,chapter:renderChapter,learn:renderLearn,practice:renderPractice,print:renderPrint,progress:renderProgress,parents:renderParents})[currentView]();
  $('.book-sidebar').classList.remove('is-open');
  $('#contents-toggle').setAttribute('aria-expanded','false');
  $('#parent-language').hidden=currentView!=='parents';
  $('#parent-language').setAttribute('aria-pressed',String(chineseParents));
  $('#parent-language').textContent=chineseParents?'中文提示已开':'家长中文';
  const title=activeLesson?QUICK_LESSONS[activeLesson].title:({chapter:`Chapter ${chapterById(activeChapter).number}: ${chapterById(activeChapter).title}`,practice:'Practice: '+chapterById(activeChapter).title,print:'Printable Workbook',progress:'My Progress',parents:'Parent Guide'})[currentView];
  document.title=currentView==='home'?'Grade 7 Math Lab · Interactive Math Book':`${title} · Grade 7 Math Lab`;
  window.scrollTo({top:0,behavior:'instant'});
}

$('#contents-toggle').addEventListener('click',()=>{
  const open=$('.book-sidebar').classList.toggle('is-open');
  $('#contents-toggle').setAttribute('aria-expanded',String(open));
});

$('#parent-language').addEventListener('click',()=>{
  chineseParents=!chineseParents;
  try{localStorage.setItem(PREFERENCE,String(chineseParents));}catch{}
  if(!['learn','parents'].includes(currentView))location.hash='parents';else route();
});
$('.skip-link').addEventListener('click',event=>{
  event.preventDefault();
  $('#main').focus({preventScroll:true});
  $('#main').scrollIntoView({block:'start'});
});
window.addEventListener('hashchange',route);
route();

