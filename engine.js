/* Grade 7 Mathematics: deterministic, browser-local practice engine.
 * No network requests, learner names, external libraries, or generated text APIs.
 * Original questions; see SOURCES.md for curricular references.
 */

export const SKILLS = Object.freeze([
  { id: 'division', title: 'What division means', standard: '6.NS.B.3; 6.RP.A.2 (review)', prerequisites: [] },
  { id: 'percent_decimal', title: 'Percent, decimal, and fraction', standard: '6.RP.A.3c (review); 7.RP.A.3', prerequisites: ['division'] },
  { id: 'ratios', title: 'Ratios and equal groups', standard: '6.RP.A.1, 6.RP.A.3 (review)', prerequisites: ['division'] },
  { id: 'unit_rate', title: 'Find the amount for one', standard: '7.RP.A.1', prerequisites: ['division', 'ratios'] },
  { id: 'proportional', title: 'Proportional relationships', standard: '7.RP.A.2', prerequisites: ['unit_rate'] },
  { id: 'percent_part', title: 'Find the part', standard: '7.RP.A.3', prerequisites: ['percent_decimal'] },
  { id: 'percent_rate', title: 'Find the percent', standard: '7.RP.A.3', prerequisites: ['division', 'percent_decimal', 'percent_part'] },
  { id: 'percent_whole', title: 'Find the whole', standard: '7.RP.A.3', prerequisites: ['percent_decimal', 'percent_part'] },
  { id: 'percent_change', title: 'Percent increase and decrease', standard: '7.RP.A.3', prerequisites: ['percent_rate'] },
  { id: 'applications', title: 'Discounts, tax, and two-step problems', standard: '7.RP.A.3', prerequisites: ['percent_part', 'percent_change'] },
]);

const IDS = new Set(SKILLS.map(s => s.id));
const DAY = 86400000;
const EPS = 1e-6;
const clampLevel = n => Math.min(3, Math.max(1, Math.floor(Number(n) || 1)));
const round = (n, dp = 2) => Math.round((n + Number.EPSILON) * 10 ** dp) / 10 ** dp;
const fmt = n => Number.isInteger(n) ? String(n) : String(round(n, 6));
const money = n => Number(n).toFixed(2);
const same = (a, b) => Math.abs(a - b) <= EPS;

function hashSeed(seed) {
  const str = String(seed);
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

function random(seed) {
  let t = hashSeed(seed);
  return () => {
    t += 0x6D2B79F5;
    let a = Math.imul(t ^ t >>> 15, t | 1);
    a ^= a + Math.imul(a ^ a >>> 7, a | 61);
    return ((a ^ a >>> 14) >>> 0) / 4294967296;
  };
}

function picker(rng) {
  return a => a[Math.floor(rng() * a.length)];
}

function shuffle(a, rng) {
  const out = a.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function err(value, code, message) { return { value, code, message }; }

function division(level, rng) {
  const pick = picker(rng);
  const kind = pick(['pool', 'recipe', 'robotics', 'sports']);
  const n = pick([3, 4, 5, 6, 8]);
  let each = pick([4, 6, 7, 9, 12]);
  if (level === 2) each = pick([1.25, 1.5, 2.4, 2.75, 3.2, 4.5]);
  if (level === 3) {
    const groupSize = pick([0.25, 0.4, 0.5, 0.75, 1.25]);
    const groups = pick([6, 8, 10, 12, 16]);
    const total = round(groupSize * groups, 4);
    const texts = {
      pool: `A small tank holds ${fmt(total)} liters of water. Each bucket holds ${fmt(groupSize)} liters. How many full buckets can you fill?`,
      recipe: `You have ${fmt(total)} cups of flour. One batch needs ${fmt(groupSize)} cup of flour. How many complete batches can you make?`,
      robotics: `A robot has a ${fmt(total)}-meter strip of cable. Each cable piece must be ${fmt(groupSize)} meter long. How many pieces can be cut?`,
      sports: `A running route is ${fmt(total)} kilometers long. Each lap is ${fmt(groupSize)} kilometer. How many laps make the route?`,
    };
    return {
      prompt: texts[kind], answer: groups, unit: {pool:'buckets',recipe:'batches',robotics:'pieces',sports:'laps'}[kind], context:kind,
      hints:[`Think: how many groups of ${fmt(groupSize)} fit into ${fmt(total)}?`, `Use total amount divided by the amount in one group.`, `${fmt(total)} ÷ ${fmt(groupSize)} = ?`],
      steps:[`Division counts equal groups: total ÷ amount in each group.`, `${fmt(total)} ÷ ${fmt(groupSize)} = ${groups}.`, `Check: ${groups} × ${fmt(groupSize)} = ${fmt(total)}.`],
      math:{operation:'divide',operands:[total,groupSize]},
      errorPatterns:[err(groupSize/total,'reverse_division','You reversed the division. Start with the total, then divide by the size of one group.'),err(total*groupSize,'multiply_instead','Multiplying gives a different quantity. Here we need to count equal groups.'),err(total,'unprocessed_total','That is the total amount. Divide it by the amount needed for one group.')],
    };
  }
  const total = round(each * n, 4);
  const texts = {
    pool:`A tank contains ${fmt(total)} liters of water. The water is shared equally among ${n} buckets. How many liters go in each bucket?`,
    recipe:`A baker uses ${fmt(total)} cups of flour for ${n} equal batches. How many cups of flour are used in one batch?`,
    robotics:`A robot travels ${fmt(total)} meters in ${n} equal moves. How many meters does it travel in one move?`,
    sports:`A runner covers ${fmt(total)} kilometers in ${n} equal laps. How many kilometers long is one lap?`,
  };
  return {
    prompt:texts[kind], answer:each, unit:{pool:'liters',recipe:'cups',robotics:'meters',sports:'kilometers'}[kind], context:kind,
    hints:[`We know the total and the number of equal groups.`, `To find one group, divide the total by ${n}.`, `${fmt(total)} ÷ ${n} = ?`],
    steps:[`The total is ${fmt(total)} and there are ${n} equal groups.`, `${fmt(total)} ÷ ${n} = ${fmt(each)}.`, `Check: ${n} × ${fmt(each)} = ${fmt(total)}.`],
    math:{operation:'divide',operands:[total,n]},
    errorPatterns:[err(n/total,'reverse_division','Use total ÷ number of groups. You divided in the reverse order.'),err(total*n,'multiply_instead','The total is already known. Divide it into groups instead of multiplying.'),err(total-n,'subtract_instead','Subtracting once does not share the total equally. Use division.')],
  };
}

function percentDecimal(level, rng) {
  const pick=picker(rng); let kind=pick(['battery','pool','sports','number']);
  const p=pick(level===1?[10,20,25,30,40,50,60,75,80,90]:level===2?[5,12,15,35,45,65,85,95]:[0.5,2.5,7.5,12.5,37.5,112.5,150]);
  if(p>100) kind='number';
  const decimal=p/100, toPercent=level>1&&rng()<0.5;
  if (level===3 && rng()<0.4) {
    const [num,den]=pick([[1,8],[3,8],[5,8],[7,8],[1,4],[3,4],[2,5],[4,5]]);
    const result=num/den*100;
    return {
      prompt:`Write the fraction ${num}/${den} as a percent.`, answer:result, unit:'%', context:'fraction',
      hints:[`A fraction is a division: numerator ÷ denominator.`, `First find ${num} ÷ ${den} as a decimal. Then multiply by 100.`, `${fmt(num/den)} × 100 = ?`],
      steps:[`${num}/${den} = ${num} ÷ ${den} = ${fmt(num/den)}.`, `${fmt(num/den)} × 100 = ${fmt(result)}, so the answer is ${fmt(result)}%.`],
      math:{operation:'percent_rate',operands:[num,den]},
      errorPatterns:[err(num/den,'percent_scale','You found the decimal. Multiply by 100 to express it as a percent.'),err(den/num*100,'reverse_division','Divide the numerator by the denominator, then multiply by 100.'),err(num*den,'multiply_instead','A fraction means division, not multiplication.')],
    };
  }
  const lead={battery:'A battery display shows',pool:'A pool diagram labels the filled fraction as',sports:'A practice log records a completed fraction of',number:'Convert'}[kind];
  return {
    prompt:toPercent?`${lead} ${fmt(decimal)}. Write ${fmt(decimal)} as a percent.`:`${lead} ${fmt(p)}%. Write ${fmt(p)}% as a decimal.`,
    answer:toPercent?p:decimal, unit:toPercent?'%':'', context:kind,
    hints:toPercent?[`Percent means "out of 100."`,`To turn a decimal into a percent, multiply by 100.`,`${fmt(decimal)} × 100 = ?`]:[`Percent means "out of 100."`,`${fmt(p)}% means ${fmt(p)} ÷ 100.`,`Move from a percent to a decimal by dividing by 100.`],
    steps:toPercent?[`${fmt(decimal)} × 100 = ${fmt(p)}.`,`${fmt(decimal)} = ${fmt(p)}%.`]:[`${fmt(p)}% = ${fmt(p)}/100.`,`${fmt(p)} ÷ 100 = ${fmt(decimal)}.`],
    math:{operation:toPercent?'multiply':'divide',operands:toPercent?[decimal,100]:[p,100]},
    errorPatterns:toPercent?[err(decimal,'percent_scale','That is still the decimal. Multiply by 100 to write a percent.'),err(decimal/100,'percent_direction','You divided by 100. Moving from decimal to percent uses multiplication by 100.'),err(decimal*10,'percent_scale','Use 100, not 10, when converting a decimal into a percent.')]:[err(p,'percent_scale','The percent number must be divided by 100.'),err(p/10,'percent_scale','Divide by 100, not 10.'),err(p*100,'percent_direction','Moving from percent to decimal uses division by 100.')],
  };
}

function ratios(level,rng) {
  const pick=picker(rng), kind=pick(['recipe','robotics','sports','art']);
  const [a,b]=pick([[2,3],[3,5],[2,5],[3,4],[4,7],[5,8]]), scale=pick(level===1?[2,3,4]:[5,6,8,10,12]);
  const items={recipe:['cups of juice','cups of water'],robotics:['red blocks','blue blocks'],sports:['warm-up minutes','practice minutes'],art:['parts of blue paint','parts of white paint']}[kind];
  if(level===3) {
    const total=(a+b)*scale, ans=a*scale;
    return {
      prompt:`The ratio of ${items[0]} to ${items[1]} is ${a}:${b}. There are ${total} total ${kind==='sports'?'minutes':kind==='art'?'parts of paint':kind==='recipe'?'cups':'blocks'}. How many ${items[0]} are there?`,
      answer:ans,unit:items[0],context:kind,
      hints:[`The whole ratio has ${a} + ${b} equal parts.`,`First find the size of one ratio part: ${total} ÷ (${a} + ${b}).`,`Multiply the size of one part by ${a}, because the question asks for the first quantity.`],
      steps:[`Total ratio parts: ${a} + ${b} = ${a+b}.`,`One ratio part: ${total} ÷ ${a+b} = ${scale}.`,`First quantity: ${a} × ${scale} = ${ans}.`],
      math:{operation:'ratio_share',operands:[total,a,b]},
      errorPatterns:[err(total*a/b,'part_vs_whole','The total includes BOTH quantities. The whole has a + b ratio parts, not just b.'),err(b*scale,'wrong_quantity','You found the second quantity. The question asks for the first quantity.'),err(total/(a+b),'one_ratio_part','You found one ratio part. Multiply it by the number of parts for the requested quantity.')],
    };
  }
  const known=a*scale,ans=b*scale;
  return {
    prompt:`There are ${a} ${items[0]} for every ${b} ${items[1]}. If there are ${known} ${items[0]}, how many ${items[1]} are needed to keep the same ratio?`,
    answer:ans,unit:items[1],context:kind,
    hints:[`Equivalent ratios multiply both quantities by the same scale factor.`,`The first quantity was multiplied by ${known} ÷ ${a}.`,`Apply that same multiplier to ${b}.`],
    steps:[`Scale factor: ${known} ÷ ${a} = ${scale}.`,`Second quantity: ${b} × ${scale} = ${ans}.`,`Check: ${a}:${b} and ${known}:${ans} have the same ratio.`],
    math:{operation:'ratio_scale',operands:[known,a,b]},
    errorPatterns:[err(known+(b-a),'add_instead_of_scale','Adding the same amount does not usually preserve a ratio. Multiply both quantities by the same factor.'),err(known*a/b,'reverse_ratio','Use second ÷ first to scale from the first quantity to the second.'),err(scale,'one_ratio_part','You found the scale factor. Now multiply it by the second ratio number.')],
  };
}

function unitRate(level,rng) {
  const pick=picker(rng),kind=pick(['pool','robotics','shopping','sports']);
  let count=pick([3,4,5,6,8]),rate=pick([2,3,4,6,9]);
  if(level===2) rate=pick([1.25,1.5,2.4,3.5,4.75]);
  if(level===3) {
    const pair=pick([[3,4],[1,2],[2,3],[5,4],[3,2]]);
    count=pair[0]/pair[1];rate=pick([2,3,4,6]);
    // Keep the displayed amount exact, including when the time is 2/3.
    if(pair[1]===3 && rate%3!==0) rate=6;
    const amount=count*rate;
    const duration=`${pair[0]}/${pair[1]}`;
    const texts={
      pool:`A pump moves ${fmt(amount)} liters in ${duration} minute at a constant rate. How many liters does it move in 1 minute?`,
      robotics:`A robot travels ${fmt(amount)} meters in ${duration} minute at a constant speed. How many meters does it travel in 1 minute?`,
      shopping:`A ${duration}-kilogram bag of rice costs $${money(amount)}. What is the cost per kilogram? Give your answer in dollars, rounded to the nearest cent.`,
      sports:`A cyclist rides ${fmt(amount)} kilometers in ${duration} hour at a constant speed. How many kilometers does the cyclist ride in 1 hour?`,
    };
    const exactAmount=amount;
    return {
      prompt:texts[kind],answer:rate,unit:{pool:'liters per minute',robotics:'meters per minute',shopping:'dollars per kilogram',sports:'kilometers per hour'}[kind],context:kind,
      hints:[`A unit rate means the amount for exactly 1 unit of time or quantity.`,`Divide ${fmt(exactAmount)} by ${duration}.`,`Dividing by ${duration} is the same as multiplying by ${pair[1]}/${pair[0]}.`],
      steps:[`Unit rate = amount ÷ number of units.`,`${fmt(exactAmount)} ÷ (${duration}) = ${fmt(exactAmount)} × ${pair[1]}/${pair[0]} = ${rate}.`,`Check: ${rate} × (${duration}) = ${fmt(exactAmount)}.`],
      math:{operation:'divide',operands:[exactAmount,count]},
      errorPatterns:[err(count/exactAmount,'reverse_division','The requested rate is amount per 1 unit. Divide the amount by the time or quantity.'),err(exactAmount*count,'fraction_division','To divide by a fraction, multiply by its reciprocal.'),err(exactAmount,'unprocessed_total','That amount is for a fraction of one unit. Scale it to exactly 1 unit.')],
    };
  }
  const amount=round(count*rate,4),texts={
    pool:`A pump moves ${fmt(amount)} liters in ${count} minutes at a constant rate. How many liters does it move in 1 minute?`,
    robotics:`A robot travels ${fmt(amount)} meters in ${count} seconds at a constant speed. How many meters does it travel in 1 second?`,
    shopping:`${count} identical notebooks cost $${money(amount)} in total. What is the price of one notebook in dollars?`,
    sports:`A cyclist rides ${fmt(amount)} kilometers in ${count} hours at a constant speed. How many kilometers does the cyclist ride in 1 hour?`,
  };
  return {
    prompt:texts[kind],answer:rate,unit:{pool:'liters per minute',robotics:'meters per second',shopping:'dollars per notebook',sports:'kilometers per hour'}[kind],context:kind,
    hints:[`The word "per" means for one.`,`Divide the total amount by ${count}.`,`${fmt(amount)} ÷ ${count} = ?`],
    steps:[`Unit rate = total amount ÷ number of units.`,`${fmt(amount)} ÷ ${count} = ${fmt(rate)}.`,`Check: ${fmt(rate)} × ${count} = ${fmt(amount)}.`],
    math:{operation:'divide',operands:[amount,count]},
    errorPatterns:[err(count/amount,'reverse_division','Check the units: amount ÷ time or quantity gives the requested unit rate.'),err(amount*count,'multiply_instead','The total is for several units. Divide to find one.'),err(amount,'unprocessed_total','That is the total for several units, not the amount for one.')],
  };
}

function proportional(level,rng) {
  const pick=picker(rng), kind=pick(['robotics','recipe','pool','shopping']);
  const k=pick(level===1?[2,3,4,5,6]:level===2?[1.5,2.5,3.2,4.5]:[0.75,1.25,1.5,2.25,3.5]);
  const x=pick(level===3&&kind!=='shopping'?[1.5,2.5,3.5,4.5]:[3,4,5,6,8]);
  const y=round(k*x,5), tableMode=rng()<0.5;
  if(tableMode) {
    return {
      prompt:`A proportional relationship has these pairs (x, y): (1, ${fmt(k)}), (2, ${fmt(2*k)}), and (${fmt(x)}, ${fmt(y)}). In the equation y = k × x, what is the constant k?`,
      answer:k,unit:'',context:'table',
      hints:[`In a proportional relationship, y divided by x has the same value for every pair.`,`Use k = y ÷ x.`,`You may use the pair (1, ${fmt(k)}).`],
      steps:[`For the pair (${fmt(x)}, ${fmt(y)}), k = ${fmt(y)} ÷ ${fmt(x)}.`,`The constant of proportionality is ${fmt(k)}.`,`This is also the y-value when x = 1.`],
      math:{operation:'divide',operands:[y,x]},
      errorPatterns:[err(1/k,'reverse_division','Use y ÷ x, not x ÷ y, for y = k × x.'),err(y-x,'additive_difference','A proportional relationship uses the same multiplier y ÷ x, not the same difference y − x.'),err(y,'unprocessed_total','That is one y-value. The constant k is the value per 1 unit of x.')],
    };
  }
  const nouns={robotics:['meters','seconds'],recipe:['cups of flour','batches'],pool:['liters','minutes'],shopping:['dollars','tickets']}[kind];
  return {
    prompt:`The total y (${nouns[0]}) is proportional to x (${nouns[1]}), with y = ${fmt(k)} × x. What is y when x = ${fmt(x)}?`,
    answer:y,unit:nouns[0],context:kind,
    hints:[`The constant ${fmt(k)} is the amount for each 1 unit of x.`,`Substitute ${fmt(x)} for x.`,`Calculate ${fmt(k)} × ${fmt(x)}.`],
    steps:[`Start with y = ${fmt(k)} × x.`,`Substitute x = ${fmt(x)}: y = ${fmt(k)} × ${fmt(x)}.`,`So y = ${fmt(y)}.`],
    math:{operation:'multiply',operands:[k,x]},
    errorPatterns:[err(k+x,'add_instead_of_scale','The equation says multiply the unit rate by x.'),err(x/k,'divide_instead','Here the unit rate is known and we need the total, so multiply.'),err(k,'unit_rate_vs_total','That is the amount for one unit. Multiply by the number of units.')],
  };
}

function percentValues(level,rng) {
  const pick=picker(rng);
  const p=pick(level===1?[10,20,25,50,75]:level===2?[5,15,30,35,40,60,80]:[2.5,7.5,12.5,37.5,62.5,85]);
  const whole=pick(level===1?[40,60,80,100,120,200]:level===2?[80,120,160,240,360,400]:[80,160,240,320,480,800]);
  return {p,whole,part:round(whole*p/100,6)};
}

function percentPart(level,rng) {
  const pick=picker(rng),kind=pick(['pool','sports','robotics','reading']);
  const {p,whole,part}=percentValues(level,rng);
  const prompts={
    pool:`A pool can hold ${whole} liters of water. It is ${fmt(p)}% full. How many liters of water are in the pool?`,
    sports:`A team attempted ${whole} shots. It made ${fmt(p)}% of them. How many shots did it make?`,
    robotics:`A robot's route is ${whole} meters long. It has completed ${fmt(p)}% of the route. How many meters has it traveled?`,
    reading:`A reading plan contains ${whole} pages. ${fmt(p)}% of the pages have been read. How many pages have been read?`,
  };
  return {
    prompt:prompts[kind],answer:part,unit:{pool:'liters',sports:'shots',robotics:'meters',reading:'pages'}[kind],context:kind,
    hints:[`Identify the whole: it is ${whole}, which represents 100%.`,`Convert ${fmt(p)}% to ${fmt(p/100)}.`,`Part = whole × percent as a decimal.`],
    steps:[`Whole = ${whole}; percent = ${fmt(p)}% = ${fmt(p/100)}.`,`Part = ${whole} × ${fmt(p/100)} = ${fmt(part)}.`,`Check: ${fmt(p)}% is below 100%, so the part is smaller than ${whole}.`],
    math:{operation:'percent_part',operands:[whole,p]},
    errorPatterns:[err(whole*p,'percent_scale','Convert the percent to a decimal before multiplying: divide the percent number by 100.'),err(whole/(p/100),'find_whole_instead','The whole is already given. Multiply by the decimal percent to find the part.'),err(whole-part,'remaining_vs_filled','That is the amount left or unfilled. The question asks for the completed or filled part.')],
  };
}

function percentRate(level,rng) {
  const pick=picker(rng),kind=pick(['pool','sports','robotics','reading']);
  const {p,whole,part}=percentValues(level,rng);
  const prompts={
    pool:`A pool can hold ${whole} liters. It currently contains ${fmt(part)} liters. What percent of the pool is full?`,
    sports:`A team made ${fmt(part)} out of ${whole} shots. What percent of its shots did it make?`,
    robotics:`A robot traveled ${fmt(part)} meters of a ${whole}-meter route. What percent of the route has it completed?`,
    reading:`You have read ${fmt(part)} pages of a book with ${whole} pages. What percent of the book have you read?`,
  };
  return {
    prompt:prompts[kind],answer:p,unit:'%',context:kind,
    hints:[`The whole, ${whole}, is the 100% amount.`,`Divide part by whole: ${fmt(part)} ÷ ${whole}.`,`Multiply that decimal by 100 to express it as a percent.`],
    steps:[`Part = ${fmt(part)}; whole = ${whole}.`,`${fmt(part)} ÷ ${whole} = ${fmt(part/whole)}.`,`${fmt(part/whole)} × 100 = ${fmt(p)}, so the answer is ${fmt(p)}%.`],
    math:{operation:'percent_rate',operands:[part,whole]},
    errorPatterns:[err(part/whole,'percent_scale','You found the decimal fraction. Multiply it by 100 to state the percent.'),err(whole/part*100,'reverse_division','Use part ÷ whole × 100. The whole is the 100% reference.'),err(100-p,'remaining_vs_filled','That is the percent left or unfilled. The question asks for the completed or filled percent.')],
  };
}

function percentWhole(level,rng) {
  const pick=picker(rng),kind=pick(['pool','sports','robotics','reading']);
  const {p,whole,part}=percentValues(level,rng);
  const prompts={
    pool:`A pool is ${fmt(p)}% full and contains ${fmt(part)} liters. How many liters can the pool hold when it is 100% full?`,
    sports:`A team made ${fmt(part)} shots, which was ${fmt(p)}% of all its attempts. How many shots did it attempt?`,
    robotics:`A robot has traveled ${fmt(part)} meters, which is ${fmt(p)}% of its entire route. How many meters long is the entire route?`,
    reading:`${fmt(part)} pages are ${fmt(p)}% of a book. How many pages are in the whole book?`,
  };
  return {
    prompt:prompts[kind],answer:whole,unit:{pool:'liters',sports:'attempts',robotics:'meters',reading:'pages'}[kind],context:kind,
    hints:[`The given amount is only ${fmt(p)}% of the whole. The unknown whole is 100%.`,`Write ${fmt(p/100)} × whole = ${fmt(part)}.`,`Undo multiplication: whole = ${fmt(part)} ÷ ${fmt(p/100)}.`],
    steps:[`${fmt(p)}% = ${fmt(p/100)}.`,`Part = percent as a decimal × whole.`,`Whole = ${fmt(part)} ÷ ${fmt(p/100)} = ${whole}.`,`Check: ${whole} × ${fmt(p/100)} = ${fmt(part)}.`],
    math:{operation:'percent_whole',operands:[part,p]},
    errorPatterns:[err(part*p/100,'find_part_instead','The part is already given. To find the whole, divide the part by the decimal percent.'),err(part/p,'percent_scale','Divide by the decimal percent, not the percent number. For example, 25% means 0.25.'),err(part,'part_vs_whole','That is only the given part. The whole represents 100%.')],
  };
}

function percentChange(level,rng) {
  const pick=picker(rng),kind=pick(['shopping','robotics','sports','garden']);
  const original=pick(level===1?[40,80,100,200]:level===2?[60,120,160,240]:[80,160,320,480]);
  const p=pick(level===1?[10,20,25,50]:level===2?[5,15,30,40]:[2.5,7.5,12.5,37.5]);
  const increasing=rng()<0.5, change=round(original*p/100,6), final=round(original+(increasing?change:-change),6);
  const descriptor={shopping:'A price',robotics:'A robot’s travel distance per charge',sports:'A practice time',garden:'A plant’s measured height'}[kind];
  const unit={shopping:'dollars',robotics:'meters',sports:'minutes',garden:'millimeters'}[kind];
  return {
    prompt:`${descriptor} changed from ${original} ${unit} to ${fmt(final)} ${unit}. What was the percent ${increasing?'increase':'decrease'}? Give a positive percent.`,
    answer:p,unit:'%',context:kind,
    hints:[`The original amount is the 100% reference.`,`Find the positive change: ${increasing?`${fmt(final)} − ${original}`:`${original} − ${fmt(final)}`}.`,`Percent change = positive change ÷ original amount × 100.`],
    steps:[`Original amount = ${original}.`,`Positive change = ${fmt(change)}.`,`${fmt(change)} ÷ ${original} × 100 = ${fmt(p)}.`,`The percent ${increasing?'increase':'decrease'} is ${fmt(p)}%.`],
    math:{operation:'percent_change',operands:[original,final]},
    errorPatterns:[err(change/final*100,'wrong_base','Use the original amount as the denominator, not the final amount.'),err(change,'change_vs_percent','That is the change in units. Divide by the original amount and multiply by 100.'),err(final/original*100,'final_vs_change','That compares the final amount with the original. Percent change uses only the amount gained or lost.')],
  };
}

function applications(level,rng) {
  const pick=picker(rng),kind=pick(['shopping','sports','robotics','books']);
  const item={shopping:'a backpack',sports:'sports equipment',robotics:'a robot kit',books:'a set of books'}[kind];
  const price=pick(level===1?[20,40,60,80,100]:[32,48,64,75,80,120,160]);
  const discount=pick([10,15,20,25,30]);
  const sale=price*(1-discount/100);
  if(level===1) {
    return {
      prompt:`The regular price of ${item} is $${money(price)}. It is on sale for ${discount}% off. What is the sale price before tax? Give dollars, rounded to the nearest cent.`,
      answer:round(sale,2),unit:'dollars',context:kind,
      hints:[`The discount is the amount saved, not the amount paid.`,`Find ${discount}% of $${money(price)}.`,`Subtract the discount from the regular price.`],
      steps:[`Discount = ${price} × ${fmt(discount/100)} = $${money(price*discount/100)}.`,`Sale price = ${price} − ${fmt(price*discount/100)} = $${money(sale)}.`],
      math:{operation:'discount_price',operands:[price,discount],roundTo:2},
      errorPatterns:[err(price*discount/100,'discount_vs_price','You found the amount saved. Subtract it from the regular price to find the amount paid.'),err(price*(1+discount/100),'increase_vs_decrease','A discount reduces the price. Subtract the discount.'),err(price-discount,'percent_as_amount','The discount is a percent, not a fixed number of dollars.')],
    };
  }
  if(level===2) {
    const tax=pick([5,6,8,10]),total=round(sale*(1+tax/100),2);
    return {
      prompt:`The regular price of ${item} is $${money(price)}. First take ${discount}% off. Then add ${tax}% sales tax to the discounted price. What is the final total in dollars? Round only the final total to the nearest cent.`,
      answer:total,unit:'dollars',context:kind,
      hints:[`Find the discounted price first.`,`Tax uses the discounted price as its whole.`,`Total = regular price × (1 − discount/100) × (1 + tax/100).`],
      steps:[`Discounted price = ${price} × ${fmt(1-discount/100)} = $${money(sale)}.`,`Tax = ${fmt(sale)} × ${fmt(tax/100)} = $${money(sale*tax/100)} (shown to cents).`,`Final total = ${price} × ${fmt(1-discount/100)} × ${fmt(1+tax/100)} = $${money(total)}, rounded to the nearest cent.`],
      math:{operation:'discount_tax',operands:[price,discount,tax],roundTo:2},
      errorPatterns:[err(round(sale+price*tax/100,2),'wrong_base','Apply tax to the discounted price, as the question states.'),err(round(sale,2),'missing_step','You found the sale price. Add the tax on that price.'),err(round(price*(1+(tax-discount)/100),2),'combine_percentages','These percentages use different whole amounts. Apply the discount first, then the tax.')],
    };
  }
  if(rng()<0.5) {
    const bill=pick([24,32,40,48,60,75]),tax=pick([5,6,8]),tip=pick([15,18,20]);
    const total=round(bill*(1+tax/100+tip/100),2);
    return {
      prompt:`A meal costs $${money(bill)} before tax. Add ${tax}% tax and a ${tip}% tip. Both tax and tip are calculated on the $${money(bill)} pre-tax meal price. What is the final total in dollars? Round only the final total to the nearest cent.`,
      answer:total,unit:'dollars',context:'restaurant',
      hints:[`The problem names the whole for BOTH percentages: the pre-tax meal price.`,`Find tax and tip separately from $${money(bill)}.`,`Final total = meal + tax + tip.`],
      steps:[`Tax = ${bill} × ${fmt(tax/100)} = $${money(bill*tax/100)}.`,`Tip = ${bill} × ${fmt(tip/100)} = $${money(bill*tip/100)}.`,`Total = ${bill} + ${fmt(bill*tax/100)} + ${fmt(bill*tip/100)} = $${money(total)}.`],
      math:{operation:'tax_tip',operands:[bill,tax,tip],roundTo:2},
      errorPatterns:[err(round(bill*(1+tax/100)*(1+tip/100),2),'wrong_base','The question specifies a tip on the pre-tax price. Do not include tax in the tip base.'),err(round(bill*(tax+tip)/100,2),'missing_original','That is only the added tax and tip. Include the original meal price.'),err(round(bill*(1+tip/100),2),'missing_step','This includes the tip but leaves out tax.')],
    };
  }
  const p=pick([10,20,25,30]),after=price*(1+p/100)*(1-p/100);
  return {
    prompt:`The price of ${item} starts at $${money(price)}. It rises by ${p}%, then the new price falls by ${p}%. What is the final price in dollars? Round only the final price to the nearest cent.`,
    answer:round(after,2),unit:'dollars',context:`${kind}-two-changes`,
    hints:[`The decrease is based on the new, higher price.`,`First multiply the original price by ${fmt(1+p/100)}.`,`Then multiply that result by ${fmt(1-p/100)}.`],
    steps:[`After the increase: ${price} × ${fmt(1+p/100)} = $${money(price*(1+p/100))}.`,`After the decrease: ${fmt(price*(1+p/100))} × ${fmt(1-p/100)} = $${money(after)}.`,`Equal percent increases and decreases do not cancel because they use different whole amounts.`],
    math:{operation:'successive_changes',operands:[price,p],roundTo:2},
    errorPatterns:[err(price,'wrong_base','The two percentages use different starting amounts, so the changes do not cancel.'),err(round(price*(1-p/100),2),'missing_step','This skips the first increase.'),err(round(price*(1+p/100),2),'missing_step','This includes the increase but skips the later decrease.')],
  };
}

const FACTORIES={division,percent_decimal:percentDecimal,ratios,unit_rate:unitRate,proportional,percent_part:percentPart,percent_rate:percentRate,percent_whole:percentWhole,percent_change:percentChange,applications};

export function makeQuestion(skillId,level=1,seed=1,format='numeric') {
  if(!IDS.has(skillId)) throw new RangeError(`Unknown skill: ${skillId}`);
  level=clampLevel(level);
  format=format==='choice'?'choice':'numeric';
  const rng=random(`${skillId}|${level}|${seed}`),raw=FACTORIES[skillId](level,rng);
  const answer=round(raw.answer,8);
  if(!Number.isFinite(answer)) throw new Error('Question answer must be finite.');
  const errors=[];
  for(const e of raw.errorPatterns) {
    const value=round(e.value,6);
    if(Number.isFinite(value) && value>=0 && !same(value,answer) && !errors.some(x=>same(x.value,value))) errors.push({...e,value});
  }
  for(const value of [answer*2,answer/2,answer+1,answer+5,answer+10,0]) {
    if(errors.length>=3) break;
    const n=round(value,6);
    if(n>=0&&!same(n,answer)&&!errors.some(x=>same(x.value,n))) errors.push(err(n,'recheck_steps','Recheck which amount is the whole, then choose the operation and calculate again.'));
  }
  const label=n=>raw.unit==='dollars'?`$${money(n)}`:raw.unit==='%'?`${fmt(n)}%`:fmt(n);
  // Keep display labels distinct too: money values round to cents.
  const candidates=[{value:answer,label:label(answer),error:null}];
  for(const e of errors) {
    const text=label(e.value);
    if(!candidates.some(c=>c.label===text)) candidates.push({value:e.value,label:text,error:e.code});
    if(candidates.length===4) break;
  }
  for(let offset=1;candidates.length<4;offset++) {
    const value=round(answer+offset,6),text=label(value);
    if(!candidates.some(c=>c.label===text)) candidates.push({value,label:text,error:'recheck_steps'});
  }
  return {id:`${skillId}:${level}:${String(seed)}:${format}`,skill:skillId,level,format,...raw,answer,errorPatterns:errors,choices:shuffle(candidates,rng)};
}

/** Safe decimal/fraction parser. A trailing % is display notation (25% -> 25). */
export function parseAnswer(text) {
  if(typeof text==='number') return Number.isFinite(text)?text:null;
  if(typeof text!=='string' || text.length>128) return null;
  let s=text.trim().replace(/−/g,'-');
  if(!s) return null;
  if(s.startsWith('$')) s=s.slice(1).trim();
  if(s.endsWith('%')) s=s.slice(0,-1).trim();
  if(!s) return null;
  const numberString=t=>{
    const a=t.trim();
    if(!/^[+-]?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d*)?$/.test(a) && !/^[+-]?\.\d+$/.test(a)) return null;
    const value=Number(a.replace(/,/g,''));
    return Number.isFinite(value)?value:null;
  };
  const mixed=s.match(/^([+-]?\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if(mixed) {
    const whole=Number(mixed[1]),num=Number(mixed[2]),den=Number(mixed[3]);
    if(!den||num>=den) return null;
    return whole+(mixed[1].startsWith('-')?-1:1)*num/den;
  }
  const pieces=s.split('/');
  if(pieces.length===1) return numberString(s);
  if(pieces.length!==2) return null;
  const numerator=numberString(pieces[0]),denominator=numberString(pieces[1]);
  if(numerator===null||denominator===null||denominator===0) return null;
  const result=numerator/denominator;
  return Number.isFinite(result)?result:null;
}

export function gradeAnswer(q,text) {
  // Symbols change the quantity being stated. Parsing 0.25% as the displayed
  // number 0.25 is useful for percent answers, but not for a decimal answer.
  if(typeof text==='string') {
    if(text.includes('%') && q.unit!=='%') {
      const expected=q.skill==='percent_decimal'?'a decimal':q.unit?`an answer in ${q.unit}`:'a number';
      return {valid:false,correct:false,error:null,message:`Enter ${expected} without a percent sign.`};
    }
    if(text.includes('$') && !String(q.unit||'').includes('dollars')) {
      const expected=q.unit==='%'?'a percent':q.unit?`an answer in ${q.unit}`:'a number';
      return {valid:false,correct:false,error:null,message:`Enter ${expected} without a dollar sign.`};
    }
  }
  const value=parseAnswer(text);
  if(value===null) return {valid:false,correct:false,error:null,message:'Enter a number, decimal, or fraction, such as 25, 0.25, or 1/4.'};
  if(same(value,q.answer)) return {valid:true,correct:true,error:null,message:'Correct. Check that your answer fits the situation and units.'};
  const pattern=q.errorPatterns.find(e=>same(value,e.value));
  return {valid:true,correct:false,error:pattern?.code||'calculation_or_setup',message:pattern?.message||'Let’s check the setup. What amount represents one whole, and what quantity are we finding?'};
}

function blankSkill() {
  return {attempts:0,independentCorrect:0,supportedCorrect:0,recent:[],streak:0,level:1,mastered:false,lastSeen:null};
}

export function emptyProgress() {
  return {version:1,skills:Object.fromEntries(SKILLS.map(s=>[s.id,blankSkill()])),history:[],pending:null};
}

function normalizeProgress(input) {
  const p=emptyProgress();
  if(!input||typeof input!=='object') return p;
  for(const s of SKILLS) {
    const old=input.skills?.[s.id];
    if(!old||typeof old!=='object') continue;
    p.skills[s.id]={...blankSkill(),...old,recent:Array.isArray(old.recent)?old.recent.slice(-8).map(x=>({...x})):[]};
    p.skills[s.id].level=clampLevel(p.skills[s.id].level);
  }
  p.history=Array.isArray(input.history)?input.history.slice(-1000).map(x=>({...x})):[];
  p.pending=input.pending&&IDS.has(input.pending.skill)?{...input.pending}:null;
  return p;
}

function isPrerequisite(skillId,candidate,seen=new Set()) {
  if(seen.has(skillId)) return false;
  seen.add(skillId);
  const prerequisites=SKILLS.find(s=>s.id===skillId)?.prerequisites||[];
  return prerequisites.includes(candidate)||prerequisites.some(id=>isPrerequisite(id,candidate,seen));
}

/** Route only errors for which the question supplies a specific diagnostic cue. */
function targetedRemediation(skill,error) {
  let target=null;
  if(['percent_scale','percent_direction','percent_as_amount'].includes(error)) target='percent_decimal';
  if(error==='wrong_base') {
    if(skill==='percent_change') target='percent_rate';
    if(skill==='applications') target='percent_part';
  }
  if(error==='part_vs_whole' && skill==='percent_whole') target='percent_part';
  if(error==='reverse_division') target=skill==='proportional'?'unit_rate':'division';
  if(error==='fraction_division') target='division';
  return target!==skill && isPrerequisite(skill,target)?target:null;
}

/** Record one scored first submission per question. Later retries never inflate mastery. */
export function recordAttempt(progress,q,{correct=false,hintUsed=false,error=null,timestamp=Date.now()}={}) {
  const p=normalizeProgress(progress);
  if(!IDS.has(q.skill)) throw new RangeError('Cannot record an unknown skill.');
  if(p.history.some(h=>h.id===q.id)) return p;
  const ms=typeof timestamp==='string'?Date.parse(timestamp):Number(timestamp);
  const at=Number.isFinite(ms)?ms:Date.now();
  const independent=Boolean(correct)&&!hintUsed;
  const event={id:q.id,skill:q.skill,level:clampLevel(q.level),context:q.context,format:q.format,correct:Boolean(correct),hintUsed:Boolean(hintUsed),independent,error:correct?null:error||'calculation_or_setup',timestamp:at};
  p.history.push(event);p.history=p.history.slice(-1000);
  const s=p.skills[q.skill];
  s.attempts+=1;s.independentCorrect+=independent?1:0;s.supportedCorrect+=correct&&hintUsed?1:0;
  s.recent.push(event);s.recent=s.recent.slice(-8);s.lastSeen=at;
  s.streak=independent?s.streak+1:0;
  const lastFive=s.recent.slice(-5),successful=lastFive.filter(e=>e.independent);
  s.mastered=lastFive.length===5&&successful.length>=4&&new Set(successful.map(e=>e.context)).size>=2&&successful.some(e=>e.format==='numeric');
  if(s.streak>=3&&s.level<3){s.level+=1;s.streak=0;}
  const previous=s.recent.at(-2);
  const repeatError=!correct&&previous&&!previous.correct&&(previous.error===event.error || s.recent.slice(-3).filter(e=>!e.correct).length===3);
  p.pending=null;
  if(repeatError) {
    const target=targetedRemediation(q.skill,event.error);
    if(target) {
      s.level=Math.max(1,s.level-1);
      p.pending={skill:target,level:1,reason:`A short ${SKILLS.find(x=>x.id===target).title.toLowerCase()} check will help with that step.`};
    } else if(s.level>1) {
      s.level-=1;
      p.pending={skill:q.skill,level:s.level,reason:'Let’s use smaller numbers and rebuild this idea.'};
    } else {
      const prerequisites=SKILLS.find(x=>x.id===q.skill).prerequisites;
      const prerequisite=prerequisites.find(id=>!p.skills[id].mastered)||prerequisites.at(-1);
      p.pending={skill:prerequisite||q.skill,level:1,reason:prerequisite?'A short foundation question will help with that step.':'Let’s use an equal-groups example with smaller numbers.'};
    }
  } else if(!correct || hintUsed) {
    p.pending={skill:q.skill,level:Math.max(1,Math.min(s.level,q.level)),reason:hintUsed?'Try the same idea with new numbers and less support.':'Try the same idea in a new situation.'};
  }
  return p;
}

/** Select a skill/level only; the UI supplies a fresh seed to makeQuestion. */
export function selectNext(progress,{focus,seed=1}={}) {
  const p=normalizeProgress(progress),rng=random(`select:${seed}`);
  const result=(skill,level,reason)=>({skill,level:clampLevel(level),format:p.skills[skill].attempts%3===0?'choice':'numeric',reason});
  if(p.pending && (!focus || p.pending.skill===focus || isPrerequisite(focus,p.pending.skill))) {
    return result(p.pending.skill,p.pending.level,p.pending.reason);
  }
  if(focus&&IDS.has(focus)) return result(focus,p.skills[focus].level,'Practice the skill you selected.');
  const now=Date.now();
  const due=SKILLS.filter(s=>p.skills[s.id].mastered && now-p.skills[s.id].lastSeen>=DAY*(p.skills[s.id].level>=3?7:2));
  if(due.length && p.history.length%4===0) {
    due.sort((a,b)=>(p.skills[a.id].lastSeen||0)-(p.skills[b.id].lastSeen||0));
    return result(due[0].id,p.skills[due[0].id].level,'A short spaced review of a skill you have learned.');
  }
  // Begin with the learner's current focus; use prerequisites for remediation.
  const preferred=['percent_part','percent_rate','percent_whole','percent_decimal','division','ratios','unit_rate','proportional','percent_change','applications'];
  const unpracticed=preferred.find(id=>p.skills[id].attempts===0);
  if(unpracticed) return result(unpracticed,1,'A quick check will help choose the next practice.');
  const needs=SKILLS.filter(s=>!p.skills[s.id].mastered);
  if(needs.length) {
    needs.sort((a,b)=>{
      const score=id=>{
        const s=p.skills[id],recent=s.recent.slice(-5);
        return recent.filter(e=>e.independent).length/Math.max(1,recent.length)+Math.min(s.attempts,20)*0.015;
      };
      return score(a.id)-score(b.id);
    });
    const pool=needs.slice(0,Math.min(2,needs.length));
    const selected=pool[Math.floor(rng()*pool.length)];
    return result(selected.id,p.skills[selected.id].level,'Extra practice for an idea that is still developing.');
  }
  const oldest=SKILLS.slice().sort((a,b)=>(p.skills[a.id].lastSeen||0)-(p.skills[b.id].lastSeen||0))[0];
  return result(oldest.id,p.skills[oldest.id].level,'Mixed review to keep familiar ideas ready to use.');
}
