import assert from 'node:assert/strict';
import { SKILLS, makeQuestion, parseAnswer, gradeAnswer, emptyProgress, recordAttempt, selectNext } from './engine.js';

const rounded=(n,p)=>Math.round((n+Number.EPSILON)*10**p)/10**p;
function independentlyCalculate(q) {
  const [a,b,c]=q.math.operands;
  const operation=q.math.operation;
  let v;
  switch(operation) {
    case 'divide':v=a/b;break;
    case 'multiply':v=a*b;break;
    case 'ratio_share':v=a*b/(b+c);break;
    case 'ratio_scale':v=a/b*c;break;
    case 'percent_part':v=a*b/100;break;
    case 'percent_rate':v=a/b*100;break;
    case 'percent_whole':v=a/(b/100);break;
    case 'percent_change':v=Math.abs(b-a)/a*100;break;
    case 'discount_price':v=a-a*b/100;break;
    case 'discount_tax':{const sale=a-a*b/100;v=sale+sale*c/100;break;}
    case 'tax_tip':v=a+a*b/100+a*c/100;break;
    case 'successive_changes':{const increased=a+a*b/100;v=increased-increased*b/100;break;}
    default:throw new Error(`Unknown operation ${operation}`);
  }
  return q.math.roundTo===undefined?v:rounded(v,q.math.roundTo);
}

let generated=0;
for(const skill of SKILLS) for(let level=1;level<=3;level++) for(let seed=1;seed<=120;seed++) for(const format of ['choice','numeric']) {
  const q=makeQuestion(skill.id,level,seed,format);
  assert.ok(Number.isFinite(q.answer),q.id);
  assert.ok(Math.abs(q.answer-independentlyCalculate(q))<=1e-6,`${q.id}: arithmetic`);
  assert.equal(q.choices.length,4,q.id);
  assert.equal(new Set(q.choices.map(c=>c.label)).size,4,`${q.id}: unique choices`);
  assert.equal(q.choices.filter(c=>Math.abs(c.value-q.answer)<=1e-6).length,1,`${q.id}: one correct choice`);
  assert.equal(gradeAnswer(q,q.answer).correct,true,q.id);
  assert.equal(gradeAnswer(q,q.answer+0.001).correct,false,`${q.id}: tolerance`);
  assert.ok(q.prompt.length>30&&q.steps.length>=2&&q.hints.length>=2,q.id);
  assert.ok(!q.prompt.includes('undefined')&&!q.prompt.includes('NaN'),q.id);
  assert.deepEqual(q,makeQuestion(skill.id,level,seed,format),`${q.id}: deterministic`);
  for(const c of q.choices) {
    assert.equal(gradeAnswer(q,c.value).correct,c.error===null,`${q.id}: distractor grade`);
    // Displayed labels must represent the same numeric answer as their values.
    const displayed=parseAnswer(c.label);
    assert.ok(displayed!==null,`${q.id}: label parses`);
    assert.equal(gradeAnswer(q,displayed).correct,c.error===null,`${q.id}: label grade`);
  }
  generated++;
}

for(const [text,value] of [['1/4',0.25],['25%',25],['1,250',1250],['1,250.25',1250.25],['.25',0.25],['0.75',0.75],['-1 1/2',-1.5],['2 1/4',2.25],['$24.50',24.5],['3 / 4',0.75],['−2',-2]]) assert.equal(parseAnswer(text),value,text);
for(const text of ['', ' ', '1/0','2+2','1,2','1,234,56','Infinity','NaN','1e3','25%%','hello','<script>',null,undefined,'2/3/4']) assert.equal(parseAnswer(text),null,`Reject ${text}`);
assert.equal(gradeAnswer(makeQuestion('division'), 'abc').valid,false);

// Units are part of the answer: decorations cannot silently change a decimal
// into a percent or dollars into a noncurrency quantity.
const decimalQuestion={...makeQuestion('percent_decimal'),answer:0.25,unit:''};
assert.equal(gradeAnswer(decimalQuestion,'0.25').correct,true);
assert.equal(gradeAnswer(decimalQuestion,'1/4').correct,true);
assert.equal(gradeAnswer(decimalQuestion,'0.25%').valid,false);
assert.equal(gradeAnswer(decimalQuestion,'$0.25').valid,false);
const percentQuestion={...makeQuestion('percent_rate'),answer:25,unit:'%'};
assert.equal(gradeAnswer(percentQuestion,'25%').correct,true);
assert.equal(gradeAnswer(percentQuestion,'25').correct,true);
assert.equal(gradeAnswer(percentQuestion,'$25').valid,false);
assert.equal(gradeAnswer(percentQuestion,'$25%').valid,false);
const dollarQuestion={...makeQuestion('applications'),answer:25,unit:'dollars'};
assert.equal(gradeAnswer(dollarQuestion,'$25').correct,true);
assert.equal(gradeAnswer(dollarQuestion,'25%').valid,false);
const rateQuestion={...makeQuestion('unit_rate'),answer:2,unit:'dollars per kilogram'};
assert.equal(gradeAnswer(rateQuestion,'$2').correct,true);
assert.equal(gradeAnswer(makeQuestion('percent_part'),'$25').valid,false);

const original=emptyProgress(),snapshot=JSON.stringify(original);
const q=makeQuestion('percent_part',1,10,'numeric');
let p=recordAttempt(original,q,{correct:true,hintUsed:false,timestamp:100});
assert.equal(JSON.stringify(original),snapshot,'recordAttempt must not mutate input');
assert.equal(p.skills.percent_part.independentCorrect,1);
assert.equal(p.skills.percent_part.mastered,false,'one correct answer is insufficient');
p=recordAttempt(p,q,{correct:true,timestamp:101});
assert.equal(p.skills.percent_part.attempts,1,'repeated submissions are not new first attempts');

let hinted=emptyProgress();
for(let seed=1;seed<=8;seed++) hinted=recordAttempt(hinted,makeQuestion('percent_part',1,seed,'numeric'),{correct:true,hintUsed:true,timestamp:seed});
assert.equal(hinted.skills.percent_part.mastered,false,'hint-supported work does not imply mastery');
assert.equal(hinted.skills.percent_part.independentCorrect,0);
assert.equal(hinted.skills.percent_part.supportedCorrect,8);

let choiceOnly=emptyProgress();
for(let seed=1;seed<=8;seed++) choiceOnly=recordAttempt(choiceOnly,makeQuestion('percent_part',1,seed,'choice'),{correct:true,timestamp:seed});
assert.equal(choiceOnly.skills.percent_part.mastered,false,'choice-only success is insufficient');

let singleContext=emptyProgress(),n=0;
for(let seed=1;n<6;seed++) {
  const item=makeQuestion('percent_part',1,seed,'numeric');
  if(item.context!=='pool') continue;
  singleContext=recordAttempt(singleContext,item,{correct:true,timestamp:seed});n++;
}
assert.equal(singleContext.skills.percent_part.mastered,false,'one context is insufficient');

let mastered=emptyProgress();
for(let seed=1;seed<=5;seed++) mastered=recordAttempt(mastered,makeQuestion('percent_part',1,seed,seed===1?'numeric':'choice'),{correct:true,timestamp:Date.now()-10*86400000});
assert.equal(mastered.skills.percent_part.mastered,true,'five independent varied successes establish mastery');
assert.equal(mastered.skills.percent_part.independentCorrect,5);

let struggling=emptyProgress();
struggling=recordAttempt(struggling,makeQuestion('percent_rate',1,1),{correct:false,error:'reverse_division',timestamp:1});
assert.equal(selectNext(struggling).skill,'percent_rate','first error gives same-skill retry');
struggling=recordAttempt(struggling,makeQuestion('percent_rate',1,2),{correct:false,error:'reverse_division',timestamp:2});
assert.equal(selectNext(struggling).skill,'division','repeated first-level errors trigger prerequisite');
assert.equal(selectNext(struggling,{focus:'percent_rate'}).skill,'division','focused practice still allows relevant remediation');

let advanced=emptyProgress();advanced.skills.percent_part.level=3;
advanced=recordAttempt(advanced,makeQuestion('percent_part',3,1),{correct:false,error:'calculation_or_setup'});
advanced=recordAttempt(advanced,makeQuestion('percent_part',3,2),{correct:false,error:'calculation_or_setup'});
assert.equal(advanced.skills.percent_part.level,2,'repeated error reduces difficulty');
assert.equal(selectNext(advanced).level,2);

for(const skill of ['percent_rate','percent_part','percent_whole']) {
  let scaleError=emptyProgress();
  for(const seed of [31,32]) scaleError=recordAttempt(scaleError,makeQuestion(skill,2,seed),{correct:false,error:'percent_scale'});
  assert.equal(selectNext(scaleError).skill,'percent_decimal',`${skill}: percent-scale diagnosis`);
  assert.equal(selectNext(scaleError,{focus:skill}).skill,'percent_decimal',`${skill}: focused remediation`);
}
for(const [skill,target,error] of [['percent_change','percent_rate','wrong_base'],['applications','percent_part','wrong_base'],['applications','percent_decimal','percent_as_amount']]) {
  let routed=emptyProgress();
  for(const seed of [41,42]) routed=recordAttempt(routed,makeQuestion(skill,2,seed),{correct:false,error});
  assert.equal(selectNext(routed,{focus:skill}).skill,target,`${skill}: targeted ${error}`);
}

// Abstract tables do not become different contexts because of an unused RNG draw.
let tables=emptyProgress(),tableCount=0;
for(let seed=1;tableCount<6;seed++) {
  const item=makeQuestion('proportional',1,seed,'numeric');
  if(!item.prompt.startsWith('A proportional relationship has these pairs')) continue;
  assert.equal(item.context,'table');
  tables=recordAttempt(tables,item,{correct:true,timestamp:seed});tableCount++;
}
assert.equal(tables.skills.proportional.mastered,false,'abstract table-only responses are one context');

// Spaced review takes precedence over a new skill at the review slot.
mastered.history=mastered.history.slice(0,4);
assert.equal(selectNext(mastered).skill,'percent_part');
assert.match(selectNext(mastered).reason,/spaced review/);
assert.deepEqual(JSON.parse(JSON.stringify(mastered)),mastered,'progress is plain serializable data');
assert.throws(()=>makeQuestion('unknown'),RangeError);
console.log(`PASS: ${generated} generated questions; arithmetic, distractors, parsing and units, first attempts, real contexts, mastery, targeted remediation, and spaced review.`);
