import { SKILLS, makeQuestion, emptyProgress, selectNext, recordAttempt, gradeAnswer } from './engine.js';
import { LESSONS, ROADMAP, REFERENCES, PARENT_GUIDE } from './content.js';

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
let currentView = 'learn';
let poolMode = 'part';
let poolPercent = 25;
let poolWhole = 800;

try {
  const saved = JSON.parse(localStorage.getItem(STORAGE) || 'null');
  if (saved?.version === 1 && saved.skills && Array.isArray(saved.history)) {
    const valid = SKILLS.every(s => saved.skills[s.id] && Number.isFinite(saved.skills[s.id].attempts) && Array.isArray(saved.skills[s.id].recent));
    if (valid) progress = saved;
  }
  chineseParents = localStorage.getItem(PREFERENCE) === 'true';
} catch { $('#storage-warning').hidden = false; }

function saveProgress() {
  try { localStorage.setItem(STORAGE, JSON.stringify(progress)); }
  catch { $('#storage-warning').hidden = false; }
}

function renderLessonNavigation() {
  $('#lesson-nav').innerHTML = LESSONS.map((lesson, i) => `<a class="lesson-link${activeLesson === lesson.id ? ' active' : ''}" href="#learn/${lesson.id}"${activeLesson === lesson.id ? ' aria-current="page"' : ''}><span class="lesson-icon">${String(i+1).padStart(2,'0')}</span><span>${escapeHtml(lesson.title)}</span></a>`).join('');
}

function heroArtwork() {
  return `<div class="hero-art" aria-label="A model showing that 25 percent of 800 liters equals 200 liters"><p class="art-title">ONE POOL. THREE WAYS TO THINK.</p><svg viewBox="0 0 360 210" role="img" aria-label="Four equal sections. One shaded section is 25 percent."><rect x="16" y="42" width="328" height="98" rx="17" fill="#fff" stroke="#a7d2e0" stroke-width="3"/><path d="M33 43H98V139H33Q17 139 17 123V59Q17 43 33 43" fill="#289fc2"/><path d="M98 43V140M180 43V140M262 43V140" stroke="#a7d2e0" stroke-width="2" stroke-dasharray="5 5"/><text x="57" y="99" font-size="23" fill="white" font-weight="700" text-anchor="middle">25%</text><text x="180" y="27" font-size="15" fill="#326077" text-anchor="middle">100% = 800 L</text><path d="M19 152v10h78v-10" fill="none" stroke="#148578" stroke-width="2"/><text x="57" y="188" font-size="18" fill="#086f67" font-weight="700" text-anchor="middle">200 L</text><text x="249" y="188" font-size="14" fill="#516878" text-anchor="middle">Each equal part is 200 L</text></svg><p class="caption">Start with the picture. Then find the equation.</p></div>`;
}

function explorerHtml() {
  return `<section class="explorer" aria-labelledby="explorer-title"><p class="eyebrow">MOVE IT. SEE IT. UNDERSTAND IT.</p><h2 id="explorer-title">The pool explorer</h2><p class="intro-text">The full pool is 100%. Keep the same relationship and change what you are looking for.</p><div class="mode-buttons" aria-label="Choose the unknown"><button type="button" data-pool="part">Find the part</button><button type="button" data-pool="percent">Find the percent</button><button type="button" data-pool="whole">Find the whole</button></div><div class="controls"><label class="range">Fill level: <output id="percent-output">${poolPercent}%</output><input id="pool-percent" aria-label="Pool fill percentage" type="range" min="5" max="95" step="5" value="${poolPercent}"></label><label>Full capacity <select id="pool-whole" aria-label="Pool full capacity">${[200,400,600,800,1000,1200,1600,2000].map(n=>`<option value="${n}"${n===poolWhole?' selected':''}>${n} L</option>`).join('')}</select></label></div><div class="pool"><div id="pool-drawing"></div><div id="pool-equation" class="equation" aria-live="polite"></div></div><p class="form-note">Try 25%, then 50%. Explain why changing the unknown changes the calculation.</p></section>`;
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

function renderLearn() {
  const lesson = LESSONS.find(l=>l.id===activeLesson);
  if (!lesson) {
    $('#learn-view').innerHTML = `<div class="hero"><div><span class="pill">A book you can learn with</span><h1>Make sense of<br>ratios & percentages.</h1><p>Clear explanations. Pictures that move. Practice that meets you where you are.</p><div class="button-row"><a class="primary button" href="#learn/percent_part">Start with the pool</a><button class="secondary" type="button" id="home-check">Take a short check</button></div></div>${heroArtwork()}</div>${explorerHtml()}<div class="section-heading"><h2>Two parts. One clear path.</h2><p>Use the book in any order.</p></div><div class="two-col"><div class="card"><p class="eyebrow">PART 1 · UNDERSTAND</p><h3>Learn one idea at a time</h3><p>Ten short lessons connect division, ratios, rates, and percentages. Each includes worked examples, a check, and a common mistake to watch for.</p><a class="secondary button" href="#learn/division">Open the first lesson</a></div><div class="card"><p class="eyebrow">PART 2 · TRY IT YOURSELF</p><h3>Practice, then try a new situation</h3><p>Type an answer or choose an option. Get useful feedback, use a hint, and revisit an idea with fresh numbers. Print a sheet whenever you want.</p><a class="primary button" href="#practice">Start a short session</a></div></div><div class="milestones"><div><strong>10 skills</strong>From equal groups to percent change</div><div><strong>8 questions</strong>A manageable practice session</div><div><strong>Print anytime</strong>Fresh sheets and a complete workbook</div></div><p class="form-note">This first volume focuses on ratios and percentages, including a review of Grade 6 foundations. It is part of a planned Grade 7 course, not a complete year of mathematics.</p>`;
    $('#home-check').addEventListener('click',()=>startPractice(true));
  } else {
    const number = LESSONS.indexOf(lesson)+1;
    $('#learn-view').innerHTML = `<div class="tag-row"><span>Lesson ${number} of ${LESSONS.length}</span><span>${escapeHtml(lesson.standard)}</span><span>${escapeHtml(lesson.minutes)} minutes</span></div><h1>${escapeHtml(lesson.title)}</h1><div class="goal"><strong>Today I can</strong><p>${escapeHtml(lesson.goal)}</p></div><div class="card"><h2>Build the idea</h2>${lesson.explanation.map(p=>`<p>${escapeHtml(p)}</p>`).join('')}<div class="key-idea">${escapeHtml(lesson.keyIdea)}</div>${lesson.vocabulary?.length?`<div class="vocab">${lesson.vocabulary.map(v=>`<span><strong>${escapeHtml(v.term)}</strong>${escapeHtml(v.meaning)}</span>`).join('')}</div>`:''}</div>${['percent_part','percent_rate','percent_whole','percent_decimal'].includes(lesson.id)?explorerHtml():lesson.id==='proportional'?proportionalModelHtml():''}<div class="card"><h2>Work through it</h2>${lesson.workedExamples.map((example,i)=>`<article class="example"><p class="eyebrow">EXAMPLE ${i+1}</p><p class="question">${escapeHtml(example.question)}</p><ol>${example.steps.map(step=>`<li>${escapeHtml(step)}</li>`).join('')}</ol><p class="answer-line">${escapeHtml(example.answer)}</p></article>`).join('')}<div class="watch-out"><strong>Pause and check</strong>${escapeHtml(lesson.watchOut)}</div>${chineseParents?`<div class="parent-note" lang="zh-Hans"><strong>家长讲解提示</strong><p>${escapeHtml(lesson.parentZh)}</p></div>`:''}</div><div class="card"><h2>Try it before you look</h2><p>${escapeHtml(lesson.check.prompt)}</p><details><summary>Check your thinking</summary><p>${escapeHtml(lesson.check.answer)}</p></details><p class="form-note">${escapeHtml(lesson.extension)}</p><div class="button-row"><button class="primary" type="button" id="lesson-practice">Practice this idea</button>${LESSONS[number]?`<a class="secondary button" href="#learn/${LESSONS[number].id}">Next lesson</a>`:`<a class="secondary button" href="#print">Open the workbook</a>`}</div></div>`;
    $('#lesson-practice').addEventListener('click',()=>startPractice(false,lesson.id));
    if(lesson.id==='percent_rate') poolMode='percent';
    else if(lesson.id==='percent_whole') poolMode='whole';
    else poolMode='part';
  }
  attachExplorer();
}

function skillOptions(includeMixed=true) { return `${includeMixed?'<option value="">Let the practice adapt</option>':''}${SKILLS.map(s=>`<option value="${s.id}">${escapeHtml(s.title)}</option>`).join('')}`; }

function renderPractice() {
  if(practiceSession) {renderQuestion();return;}
  $('#practice-view').innerHTML = `<p class="eyebrow">PART 2 · PRACTICE</p><h1>A little practice.<br>A clearer idea.</h1><p class="intro-text">Answer one question at a time. If something is tricky, we will revisit it with new numbers and a useful hint. A short check can help you choose where to start.</p><div class="card practice-card"><h2>Choose today's session</h2><div class="fields"><label class="field">Focus<select id="practice-focus">${skillOptions()}</select></label><label class="field">Session length<select id="practice-length"><option value="8">8 questions</option><option value="12">12 questions</option></select></label></div><div class="button-row"><button class="primary" id="start-practice" type="button">Start practice</button><button class="secondary" id="start-check" type="button">8-question starting check</button></div><p class="form-note" style="margin-top:20px">Hints are welcome. We track answers completed with help separately from answers completed independently. You can finish early at any time.</p></div>`;
  $('#start-practice').addEventListener('click',()=>startPractice(false,$('#practice-focus').value,Number($('#practice-length').value)));
  $('#start-check').addEventListener('click',()=>startPractice(true));
}

function startPractice(diagnostic=false,focus='',length=8) {
  practiceSession={diagnostic,focus,length:diagnostic?8:length,index:0,answers:[],seed:Date.now()+questionCounter++,current:null,hints:0,graded:false,reason:''};
  prepareQuestion();
  if(location.hash==='#practice') renderPractice(); else location.hash='practice';
}

function prepareQuestion() {
  const session=practiceSession;
  if(!session || session.index>=session.length) return;
  const order=['division','percent_decimal','percent_part','percent_rate','percent_whole','ratios','unit_rate','percent_change'];
  const next=session.diagnostic?{skill:order[session.index],level:1,format:session.index%3===1?'choice':'numeric',reason:'A starting check. Take your time and show your thinking on paper.'}:selectNext(progress,{focus:session.focus||undefined,seed:session.seed+session.index});
  session.current=makeQuestion(next.skill,next.level,`${session.seed}-${session.index}-${questionCounter++}`,next.format);
  session.reason=next.reason;session.hints=0;session.graded=false;session.raw='';
}

function renderQuestion() {
  const s=practiceSession;
  if(!s) return renderPractice();
  if(s.index>=s.length || s.finished) return renderSessionSummary();
  const q=s.current;
  $('#practice-view').innerHTML=`<div class="practice-card"><div class="practice-meta"><span>${s.diagnostic?'Starting check':'Practice'} · Question ${s.index+1} of ${s.length}</span><button class="text-button" id="finish-session" type="button">Finish for now</button></div><div class="session-dots" aria-label="Question ${s.index+1} of ${s.length}">${Array.from({length:s.length},(_,i)=>`<span class="${i<s.index?'done':i===s.index?'current':''}"></span>`).join('')}</div><div class="card"><p class="eyebrow">${escapeHtml(skillById(q.skill).title)}</p><p class="form-note">${escapeHtml(s.reason)}</p><h1 class="practice-title" id="question-prompt">${escapeHtml(q.prompt)}</h1><form id="answer-form"><fieldset style="border:0;margin:0;padding:0"><legend class="visually-hidden">Your answer</legend>${q.format==='choice'?`<div class="choice-list">${q.choices.map((c,i)=>`<label class="choice-label"><input type="radio" name="choice" value="${c.value}"${s.graded?' disabled':''}><span class="option">${String.fromCharCode(65+i)}</span><span>${escapeHtml(c.label)}${q.unit&&!['%','dollars'].includes(q.unit)?' '+escapeHtml(q.unit):''}</span></label>`).join('')}</div>`:`<div class="numeric-answer"><input id="numeric-input" name="answer" type="text" inputmode="decimal" autocomplete="off" aria-label="Your answer" aria-describedby="answer-format"${s.graded?' disabled':''}><label for="numeric-input">${escapeHtml(q.unit||'answer')}</label></div><p class="form-note" id="answer-format">You may type a number or fraction, such as 25, 0.25, or 1/4.${q.unit==='%'?' Enter the percent number: for 25%, type 25.':''}</p>`}</fieldset><p id="answer-error" class="error-text" role="alert"></p><div id="hint-area"></div><div class="button-row"><button class="primary" id="check-answer" type="submit"${s.graded?' disabled':''}>Check answer</button><button class="secondary" id="show-hint" type="button"${s.graded?' disabled':''}>Show a hint</button></div></form><div id="feedback-area" aria-live="polite"></div></div><p class="form-note">Before calculating: What is known? What is missing? Which unit belongs in the answer?</p></div>`;
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
    $('#hint-area').innerHTML=`<div class="hint"><strong>Hint ${s.hints}</strong><p>${escapeHtml(q.hints[s.hints-1])}</p></div>`;
    $('#show-hint').textContent=s.hints>=q.hints.length?'All hints shown':'Another hint';
    $('#show-hint').disabled=s.graded||s.hints>=q.hints.length;
  }
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
  const headline=result.correct?(s.hints?'You worked it out with support.':'You worked it out.'):'Let’s work through this one.';
  $('#feedback-area').innerHTML=`<div class="feedback${result.correct?' correct':''}"><h3>${headline}</h3><p>${escapeHtml(result.message)}</p>${!result.correct?'<p class="form-note">This suggests a step to check; one answer does not tell us exactly why a mistake happened.</p>':''}<ol>${q.steps.map(step=>`<li>${escapeHtml(step)}</li>`).join('')}</ol><div class="button-row"><button class="primary" id="next-question" type="button">${s.index+1>=s.length?'See this session':'Next question'}</button><a class="secondary button" href="#learn/${q.skill}">Review the lesson</a></div></div>`;
  $('#next-question').addEventListener('click',()=>{s.index++;prepareQuestion();renderQuestion();$('#practice-view').scrollIntoView({behavior:'smooth',block:'start'});});
  $('#next-question').focus({preventScroll:true});
}

function renderSessionSummary() {
  const s=practiceSession;if(!s)return renderPractice();
  const independent=s.answers.filter(a=>a.correct&&!a.hintUsed).length;
  const supported=s.answers.filter(a=>a.correct&&a.hintUsed).length;
  const missed=[...new Set(s.answers.filter(a=>!a.correct).map(a=>a.skill))];
  const next=selectNext(progress,{seed:Date.now()});
  $('#practice-view').innerHTML=`<p class="eyebrow">SESSION COMPLETE</p><h1>One step forward.</h1><div class="card"><h2>You made time to practice.</h2><div class="session-summary"><div><strong>${s.answers.length}</strong><span>questions explored</span></div><div><strong>${independent}</strong><span>correct independently</span></div><div><strong>${supported}</strong><span>correct with hints</span></div></div><p>${missed.length?`Next time, revisit ${missed.map(id=>escapeHtml(skillById(id).title.toLowerCase())).join(', ')}.`:'Next time, try a different situation to see whether the idea still makes sense.'}</p><p class="form-note">A short session is practice, not a school grade. Come back after a break to check what you remember.</p><div class="button-row"><button class="primary" id="again-practice" type="button">Practice again</button><a class="secondary button" href="#learn/${next.skill}">Read the next useful lesson</a><a class="secondary button" href="#progress">See progress</a></div></div>`;
  $('#again-practice').addEventListener('click',()=>{practiceSession=null;renderPractice();});
}

function renderPrint() {
  $('#print-view').innerHTML=`<p class="eyebrow">THE PRINTABLE WORKBOOK</p><h1>Room for your thinking.</h1><p class="intro-text">Work on paper, circle the whole, draw a picture, and explain your method. Download the first edition, or make a fresh practice sheet below.</p><div class="button-row no-print"><a class="primary button" href="downloads/Grade-7-Math-Student-Workbook.pdf" target="_blank" rel="noopener">Student workbook PDF</a><a class="secondary button" href="downloads/Grade-7-Math-Answer-Guide.pdf" target="_blank" rel="noopener">Parent answer guide PDF</a></div><div class="card no-print" style="margin-top:25px"><h2>Make a practice sheet</h2><div class="fields"><label class="field">Skill<select id="sheet-skill"><option value="mixed">Mixed review</option>${skillOptions(false)}</select></label><label class="field">Difficulty<select id="sheet-level"><option value="1">Start simple</option><option value="2">Build confidence</option><option value="3">Stretch</option></select></label><label class="field">Questions<select id="sheet-count"><option value="8">8</option><option value="12" selected>12</option><option value="20">20</option><option value="40">40</option></select></label></div><label class="form-note"><input type="checkbox" id="include-answers"> Include the answer key when printing</label><div class="button-row"><button class="primary" type="button" id="generate-sheet">Generate new sheet</button><button class="secondary" type="button" id="print-sheet">Print this sheet</button></div></div><div class="worksheet" id="worksheet"></div>`;
  $('#generate-sheet').addEventListener('click',()=>{sheetSeed=Date.now();generateSheet();});
  $('#print-sheet').addEventListener('click',()=>window.print());
  $('#include-answers').addEventListener('change',paintSheet);
  generateSheet();
}

function generateSheet() {
  const skill=$('#sheet-skill').value,level=Number($('#sheet-level').value),count=Number($('#sheet-count').value);
  worksheetQuestions=Array.from({length:count},(_,i)=>makeQuestion(skill==='mixed'?SKILLS[i%SKILLS.length].id:skill,level,`${sheetSeed}-${i}`,i%3===0?'choice':'numeric'));
  paintSheet();
}

function paintSheet() {
  const include=$('#include-answers').checked;
  $('#worksheet').innerHTML=`<h2>Grade 7 Math Lab · Practice sheet</h2><p class="worksheet-meta">Name: ____________________ &nbsp; Date: __________ &nbsp; Sheet ${String(sheetSeed).slice(-6)}<br>Show the relationship, calculate, and check your answer. Use the units requested.</p>${worksheetQuestions.map((q,i)=>`<article class="sheet-question"><p><strong>${i+1}.</strong> ${escapeHtml(q.prompt)}</p>${q.format==='choice'?`<div class="sheet-choices">${q.choices.map((c,j)=>`<span>${String.fromCharCode(65+j)}. ${escapeHtml(c.label)}${q.unit&&!['%','dollars'].includes(q.unit)?' '+escapeHtml(q.unit):''}</span>`).join('')}</div>`:'<p>Answer: ____________________</p>'}<div class="work-space"></div></article>`).join('')}${include?`<section class="answer-key"><h2>Answer key</h2>${worksheetQuestions.map((q,i)=>`<div class="sheet-answer"><strong>${i+1}. ${pretty(q.answer)} ${escapeHtml(q.unit)}</strong><br>${q.steps.map(escapeHtml).join(' ')}</div>`).join('')}</section>`:''}`;
}

function renderProgress() {
  const attempts=SKILLS.reduce((a,s)=>a+progress.skills[s.id].attempts,0);
  $('#progress-view').innerHTML=`<p class="eyebrow">YOUR LEARNING RECORD</p><h1>Notice what is growing.</h1><p class="intro-text">Use this record to choose the next useful lesson. “Ready for review” means recent practice went well; try it again on another day.</p><div class="card"><div class="section-heading"><h2>${attempts} questions explored</h2><p>First submitted answers only</p></div><div class="table-wrap"><table class="progress-table"><thead><tr><th>Idea</th><th>Independent</th><th>With hints</th><th>Next step</th></tr></thead><tbody>${SKILLS.map(skill=>{const p=progress.skills[skill.id];const recent=p.recent.slice(-5);const right=recent.filter(r=>r.independent).length;return `<tr><td><a href="#learn/${skill.id}">${escapeHtml(skill.title)}</a><div class="progress-track" aria-label="${right} independent correct answers in the last ${recent.length} questions"><span style="width:${right/5*100}%"></span></div></td><td>${p.independentCorrect} / ${p.attempts}</td><td>${p.supportedCorrect}</td><td><span class="status ${p.mastered?'ready':p.attempts?'building':''}">${p.mastered?'Ready for review':p.attempts?'Keep building':'Try this idea'}</span><br><small>Practice level ${p.level}</small></td></tr>`;}).join('')}</tbody></table></div><p class="form-note" style="margin-top:18px">A review signal needs 4 independent correct answers in the last 5 attempts, at least 2 contexts, and a typed answer. It is a practice rule, not a validated mastery score or grade-level assessment.</p><div class="button-row"><button class="secondary" id="export-progress" type="button">Export progress</button><button class="text-button danger" id="reset-progress" type="button">Reset this browser's progress</button></div></div><div class="card"><h2>Where your progress lives</h2><p>Your answers are stored on this browser and device. The book does not send them to GitHub or an AI service. Another device will have its own record. Clearing browser data may remove this record.</p><p class="form-note">Export creates a local JSON file for a parent to review or keep. The first edition does not import records or synchronize devices.</p></div>`;
  $('#export-progress').addEventListener('click',()=>{
    const blob=new Blob([JSON.stringify({book:'Grade 7 Math Lab',exportedAt:new Date().toISOString(),...progress},null,2)],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`math-lab-progress-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  });
  $('#reset-progress').addEventListener('click',()=>{if(confirm('Reset all practice progress stored in this browser? Export it first if you want to keep a copy.')){progress=emptyProgress();practiceSession=null;saveProgress();renderProgress();}});
}

function renderParents() {
  $('#parents-view').innerHTML=`<p class="eyebrow">FOR PARENTS & TEACHERS</p><h1>Teach the relationship.<br>Then build fluency.</h1><p class="intro-text">This first volume connects clear instruction with targeted practice. English lessons are written for the learner; the 家长中文 button shows Chinese parent notes.</p>${chineseParents?'<div class="parent-note" lang="zh-Hans"><strong>使用建议</strong><p>先让孩子指出“谁是整体，也就是 100%”，再判断求的是部分、百分率还是整体。题库可以很大，每次练习只做 8–12 题；根据具体错因补练，换情境后再检验。</p></div>':''}<div class="card"><h2>A practical routine</h2>${PARENT_GUIDE.map(g=>`<h3>${escapeHtml(g.heading)}</h3><p>${escapeHtml(g.body)}</p>${chineseParents?`<p class="parent-note" lang="zh-Hans">${escapeHtml(g.zh)}</p>`:''}`).join('')}</div><div class="card"><h2>What the adaptive practice actually does</h2><p>Questions come from original, checked templates. A seeded number generator varies the quantities and context. The answer is computed by code. No live AI model writes or grades a child's response.</p><ol><li>A starting check samples eight foundational skills.</li><li>An incorrect answer or a hint triggers another question on that idea.</li><li>Repeated difficulty lowers the level or revisits a prerequisite.</li><li>Three independent correct answers in succession can raise the level.</li><li>Recent independent success across contexts triggers a “Ready for review” signal. In adaptive mode, older review-ready skills are revisited after 2 days, or 7 days at the highest level.</li></ol><p>These are transparent first-edition rules, not a clinically or psychometrically validated assessment. A wrong choice suggests a possible misconception; ask the learner to explain before drawing conclusions. This system responds to work shown through answers and hints. It does not infer personality or label a fixed learning style.</p><p class="form-note">Spaced review happens when the learner returns and starts adaptive practice. There are no reminders or background tasks. A selected focus keeps practice on that topic and its prerequisites.</p></div><div class="card"><h2>Michigan alignment and suggested fall plan</h2><p>Michigan publishes annual Grade 7 expectations. Schools choose their curriculum and sequence; there is no single statewide fall chapter order. The plan below is a suggested sequence and should be adjusted to the learner's actual course.</p><div class="table-wrap"><table class="roadmap-table"><thead><tr><th>Weeks</th><th>Focus</th><th>Standards</th><th>In this edition</th></tr></thead><tbody>${ROADMAP.map(r=>`<tr><td>${escapeHtml(r.weeks)}</td><td>${escapeHtml(r.focus)}</td><td>${escapeHtml(r.standards)}</td><td>${escapeHtml(r.status)}</td></tr>`).join('')}</tbody></table></div><p class="form-note" style="margin-top:18px">The whole Grade 7 year also includes rational-number operations, expressions and equations, geometry, statistics, and probability. This volume supplies selected ratio/percent foundations and extensions. It does not claim to cover every Grade 7 standard.</p></div><div class="card"><h2>Sources and teaching references</h2><p>The book's lessons, examples, question templates, and diagrams are original. These references informed scope and teaching design. Free access and permission to republish are different; the links retain their own licenses.</p>${REFERENCES.concat(TEACHING_REFERENCES).map(r=>`<article class="resource"><h3><a href="${escapeHtml(r.url)}" target="_blank" rel="noopener">${escapeHtml(r.title)}</a></h3><p>${escapeHtml(r.use)}</p><small>${escapeHtml(r.license)}</small></article>`).join('')}<p class="form-note">Source review: November 19, 2026. External publishers are not affiliated with or endorsing this book.</p></div>`;
}

function route() {
  const [candidate,lessonId]=(location.hash.slice(1)||'learn').split('/');
  currentView=['learn','practice','print','progress','parents'].includes(candidate)?candidate:'learn';
  activeLesson=currentView==='learn'&&LESSONS.some(l=>l.id===lessonId)?lessonId:null;
  document.querySelectorAll('.view').forEach(v=>v.hidden=v.id!==`${currentView}-view`);
  document.querySelectorAll('[data-tab]').forEach(a=>{a.classList.toggle('active',a.dataset.tab===currentView);if(a.dataset.tab===currentView)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  $('#sidebar').hidden=currentView!=='learn';
  $('.shell').style.gridTemplateColumns=currentView==='learn'?'':'minmax(0, 1fr)';
  $('main').style.margin=currentView==='learn'?'':'0 auto';
  renderLessonNavigation();
  ({learn:renderLearn,practice:renderPractice,print:renderPrint,progress:renderProgress,parents:renderParents})[currentView]();
  $('#parent-language').setAttribute('aria-pressed',String(chineseParents));
  $('#parent-language').textContent=chineseParents?'中文提示已开':'家长中文';
  document.title=`${activeLesson?LESSONS.find(l=>l.id===activeLesson).title:({learn:'Ratios, Rates & Percentages',practice:'Adaptive Practice',print:'Printable Workbook',progress:'My Progress',parents:'Parent Guide'})[currentView]} · Grade 7 Math Lab`;
  window.scrollTo({top:0,behavior:'instant'});
}

$('#parent-language').addEventListener('click',()=>{
  chineseParents=!chineseParents;
  try{localStorage.setItem(PREFERENCE,String(chineseParents));}catch{}
  if(!['learn','parents'].includes(currentView))location.hash='parents';else route();
});
window.addEventListener('hashchange',route);
route();
