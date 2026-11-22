// Original teaching text and diagrams. Sources inform the choice of representations,
// not a copied textbook layout or problem bank. No external images are required.
const ink = '#24332e';
const teal = '#086f63';
const muted = '#53645c';
const line = '#dce5df';
const light = '#f2f7f4';
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text = (x,y,label,extra='',color=ink) => `<text x="${x}" y="${y}" font-size="20" fill="${color}" ${extra}>${escape(label)}</text>`;
const center = (x,y,label,extra='',color=ink) => text(x,y,label,`text-anchor="middle" ${extra}`,color);
const box = (x,y,w,h,fill=light,extra='') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${muted}" ${extra}/>`;
const rule = (x1,y1,x2,y2,color=muted,extra='') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2" ${extra}/>`;
const figure = (height,alt,body) => `<div class="teaching-figure-surface"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 ${height}" role="img" aria-label="${escape(alt)}" font-family="Arial, sans-serif" style="display:block;width:100%;height:auto">${body}</svg></div>`;

function divisionPicture() {
  const dots = (x,y,cols,rows) => Array.from({length:cols*rows},(_,i)=>`<circle cx="${x+(i%cols)*20}" cy="${y+Math.floor(i/cols)*20}" r="5" fill="${teal}"/>`).join('');
  return figure(315,'The same 24 counters are shown as six groups of four and as four groups of six. The meaning of the quotient depends on what is known.',
    center(260,24,'24 counters shared among 6 bags')+
    Array.from({length:6},(_,i)=>box(12+i*84,45,76,66,'#fff')+dots(40+i*84,67,2,2)).join('')+
    center(260,143,'24 ÷ 6 = 4 counters in each bag')+
    center(260,189,'24 counters packed 6 in each box')+
    Array.from({length:4},(_,i)=>box(22+i*126,207,98,66,'#fff')+dots(51+i*126,229,3,2)).join('')+
    center(260,307,'24 ÷ 6 = 4 boxes'));
}

function hundredGrid() {
  const cells = Array.from({length:100},(_,i)=>{
    const row=Math.floor(i/10),col=i%10;
    return box(130+col*26,30+row*26,26,26,row<5&&col<5?teal:'#fff',`style="stroke:${line}"`);
  }).join('');
  return figure(350,'A ten-by-ten grid has 100 equal squares. A five-by-five block shades 25 squares, one quarter of the whole grid.',
    center(260,22,'One whole = 100 equal squares')+cells+
    center(260,324,'25/100 = 0.25 = 25% = 1/4'));
}

function ratioTape() {
  return figure(275,'The red quantity has two equal boxes and the blue quantity has three equal boxes. Each box represents five tiles. Red is ten, blue is fifteen, and the total is twenty-five.',
    center(260,24,'Red : blue = 2 : 3')+
    text(18,86,'Red')+Array.from({length:2},(_,i)=>box(110+110*i,50,110,54,light)+center(165+110*i,84,'5')).join('')+text(347,86,'= 10 tiles')+
    text(18,167,'Blue')+Array.from({length:3},(_,i)=>box(110+110*i,131,110,54,light)+center(165+110*i,165,'5')).join('')+text(447,167,'=15')+
    center(275,219,'Each equal box = 5 tiles')+
    center(260,258,'2 + 3 = 5 parts in the whole'));
}

function unitRateLines() {
  const tick=(x,y,label)=>rule(x,y-7,x,y+7)+center(x,y+34,label);
  return figure(292,'Two aligned number lines show notebooks from zero to six and cost from zero to nine dollars. One notebook aligns with one dollar fifty cents.',
    `<rect x="95" y="43" width="48" height="190" fill="${light}"/>`+
    text(30,25,'Notebooks')+text(30,147,'Cost ($)')+
    rule(50,67,470,67)+rule(50,187,470,187)+
    [0,1,2,3,4,5,6].map((n)=>tick(50+n*70,67,n)+tick(50+n*70,187,[0,'1.50',3,'4.50',6,'7.50',9][n])).join('')+
    center(260,272,'$9 ÷ 6 = $1.50 for 1 notebook'));
}

function proportionalGraph() {
  const x=n=>60+n*105,y=n=>258-n*16;
  return figure(328,'A graph has number of notebooks on the horizontal axis and cost in dollars on the vertical axis. Points zero zero, one three, two six, three nine and four twelve follow y equals three x through the origin.',
    text(15,25,'Cost ($)')+
    [0,3,6,9,12].map(n=>rule(60,y(n),480,y(n),line)+text(27,y(n)+7,n)).join('')+
    [0,1,2,3,4].map(n=>rule(x(n),64,x(n),258,line)+center(x(n),290,n)).join('')+
    rule(60,48,60,258)+rule(60,258,493,258)+
    `<path d="M60 258L480 66" fill="none" stroke="${teal}" stroke-width="3"/>`+
    [0,1,2,3,4].map(n=>`<circle cx="${x(n)}" cy="${y(3*n)}" r="6" fill="${teal}"/>`).join('')+
    text(316,57,'y = 3x')+text(177,206,'(1, 3)')+
    center(280,321,'Number of notebooks (x)'));
}

function percentPartBar() {
  return figure(207,'A bar represents a full 800-liter pool. Four equal sections each represent 200 liters and 25 percent. The first quarter is shaded.',
    center(260,27,'The whole: 800 L = 100%')+
    Array.from({length:4},(_,i)=>box(40+i*110,56,110,60,i===0?teal:'#fff')+center(95+i*110,94,'200 L','',i===0?'#fff':ink)+center(95+i*110,146,'25%')).join('')+
    center(260,192,'One quarter of 800 L is 200 L'));
}

function percentRateLines() {
  return figure(263,'Two aligned number lines compare liters and percentage of a full pool. Zero liters is zero percent, 200 liters is 25 percent, and 800 liters is 100 percent.',
    `<rect x="125" y="42" width="50" height="180" fill="${light}"/>`+
    text(35,25,'Water (L)')+text(35,143,'Percent of the full pool')+
    rule(40,65,480,65)+rule(40,181,480,181)+
    [0,1,2,3,4].map(n=>rule(40+110*n,58,40+110*n,72)+center(40+110*n,99,200*n)+rule(40+110*n,174,40+110*n,188)+center(40+110*n,215,`${25*n}%`)).join('')+
    center(260,254,'200 ÷ 800 = 1/4 = 25%'));
}

function percentWholeBar() {
  return figure(232,'The full capacity of a pool is unknown. Four equal quarters make 100 percent. The first quarter is known to hold 200 liters, so each quarter holds 200 liters and the whole holds 800 liters.',
    center(260,27,'Full capacity = ? liters')+
    Array.from({length:4},(_,i)=>box(40+i*110,57,110,62,i===0?teal:'#fff',i===0?'':'stroke-dasharray="5 4"')+center(95+i*110,96,'200 L','',i===0?'#fff':ink)+center(95+i*110,151,'25%')).join('')+
    center(260,190,'Four equal quarters make 100%')+
    center(260,223,'200 × 4 = 800 liters'));
}

function percentChangeBars() {
  return figure(275,'Practice time starts at 40 minutes, shown by four equal blocks of ten minutes. It increases to 50 minutes, shown by five blocks. The extra ten minutes is one quarter of the original forty, a 25 percent increase.',
    text(40,27,'Start: 40 min = 100%')+
    Array.from({length:4},(_,i)=>box(40+i*88,48,88,55,'#fff')+center(84+i*88,83,'10')).join('')+
    text(40,142,'Now: 50 min = 125%')+
    Array.from({length:5},(_,i)=>box(40+i*88,163,88,55,i===4?teal:'#fff')+center(84+i*88,198,'10','',i===4?'#fff':ink)).join('')+
    text(40,258,'Each block = 10 min')+center(436,258,'+25%'));
}

function twoStepPicture() {
  return figure(282,'A price flow shows an original price of forty dollars, a sale price of thirty dollars after a twenty-five percent discount, and a final cost of thirty-three dollars after ten percent tax on the sale price.',
    box(10,24,140,100,'#fff')+center(80,57,'Original')+center(80,96,'$40')+
    box(190,24,140,100,light)+center(260,57,'Sale price')+center(260,96,'$30')+
    box(370,24,140,100,'#fff')+center(440,57,'Final cost')+center(440,96,'$33')+
    rule(151,74,183,74)+`<path d="M176 68L184 74L176 80" fill="none" stroke="${muted}" stroke-width="2"/>`+
    rule(331,74,363,74)+`<path d="M356 68L364 74L356 80" fill="none" stroke="${muted}" stroke-width="2"/>`+
    text(30,174,'Discount: 25% of $40 = $10')+
    text(30,213,'Tax: 10% of $30 = $3')+
    text(30,260,'The tax uses the new $30 price.'));
}

export const RATIO_TEACHING = {
  division: {
    goal: 'Decide whether division finds the size of each group or the number of groups.',
    paragraphs: [
      'A division calculation answers a missing-number question about multiplication. In 24 ÷ 6 = 4, we are finding the number that makes 6 × ? = 24 true. The story tells us what the numbers count.',
      'If 24 counters are shared among 6 bags, the unknown is counters per bag. If each box must hold 6 counters, the unknown is how many boxes we can fill. The calculation looks the same, but the answer has a different unit.',
      'Name the answer you need before calculating. Then multiply to check that all the groups together give the starting total. Division can also count fractional groups: 3 liters fills six half-liter bottles, because 6 × 0.5 = 3.'
    ],
    figure: {html:divisionPicture(),alt:'Two meanings of 24 divided by 6.',caption:'Read the group labels. Six bags share the counters; six counters fill each box. Both calculations give 4, with different units.'},
    worked: {
      prompt:'A pump adds 180 liters to a pool in 6 minutes at a steady rate. How much water does it add each minute?',
      steps:[
        'The total is 180 liters, and the time is 6 minutes. We want liters for one minute.',
        'Share the total into 6 equal one-minute groups: 180 ÷ 6 = 30.',
        'Attach the unit: 30 liters per minute.',
        'Check by multiplying: 6 minutes × 30 liters per minute = 180 liters.'
      ],
      answer:'30 liters per minute.'
    },
    check:{prompt:'There are 18 liters of water. Each container holds 3 liters. Does 18 ÷ 3 find liters per container or the number of containers?',answer:'6 containers.',why:'The size of each group is already known: 3 liters. The missing quantity is the number of those groups. Check: 6 × 3 = 18 liters.'}
  },
  percent_decimal: {
    goal:'Connect a percent, a decimal, and a fraction to the same picture of one whole.',
    paragraphs:[
      'Percent means per hundred. Imagine cutting one whole into 100 equal pieces. One piece is 1/100 of the whole, written 0.01 or 1%. The whole itself is 100/100 = 1 = 100%.',
      'The shaded grid contains 25 of those 100 pieces. The fraction 25/100, the decimal 0.25, and the percentage 25% all name the same shaded amount. Grouping the squares into four equal blocks shows why it is also 1/4.',
      'To convert a percentage to a decimal, divide its number by 100. To convert a decimal to a percentage, multiply by 100 and include the percent sign. Use one half as a check: 50% = 0.5, so 25% must be smaller than 0.5.'
    ],
    figure:{html:hundredGrid(),alt:'A hundred-square grid with exactly 25 squares shaded.',caption:'The shaded 5-by-5 block has 25 squares. Four equal blocks fill the 100-square whole.'},
    worked:{
      prompt:'A battery has 35% of its full charge. Write this as a decimal and a fraction in simplest form.',
      steps:[
        'The full battery is the whole. 35% means 35 of every 100 equal parts: 35/100.',
        'Divide by 100 to write the decimal: 35 ÷ 100 = 0.35.',
        'Simplify the fraction by dividing both numbers by 5: 35/100 = 7/20.',
        'Check: 35% is below 50%, and 0.35 and 7/20 are both below one half.'
      ],answer:'35% = 0.35 = 7/20 of a full charge.'
    },
    check:{prompt:'Write 0.06 as a percentage. Explain why it is not 60%.',answer:'0.06 = 6%.',why:'0.06 is six hundredths, or 6 out of 100. Sixty percent is 60/100 = 0.60, ten times as much.'}
  },
  ratios: {
    goal:'Scale both parts of a ratio together and distinguish a part from the whole.',
    paragraphs:[
      'A ratio compares two quantities in a stated order. A red-to-blue ratio of 2:3 means that every 2 red tiles go with 3 blue tiles. Switching the order gives a different comparison: blue to red is 3:2.',
      'A tape diagram uses equal boxes to show the relationship. Red needs two boxes and blue needs three. If each box stands for 5 tiles, there are 10 red tiles and 15 blue tiles. Each number was multiplied by the same factor, 5.',
      'The whole contains five boxes altogether. That is why the red fraction of all the tiles is 2/5, even though the red-to-blue ratio is 2:3. Always ask whether you are comparing one part with another part or with the entire whole.'
    ],
    figure:{html:ratioTape(),alt:'Two equal ratio parts for red and three for blue, each containing five tiles.',caption:'Equivalent ratios keep equal-sized boxes: 2:3 and 10:15 describe the same mixture.'},
    worked:{
      prompt:'A mosaic has 30 tiles. The ratio of red tiles to blue tiles is 2:3. How many tiles of each color are there?',
      steps:[
        'Count all the ratio parts: 2 + 3 = 5 equal parts make the whole mosaic.',
        'Find one part: 30 ÷ 5 = 6 tiles per part.',
        'Red has 2 parts: 2 × 6 = 12 tiles. Blue has 3 parts: 3 × 6 = 18 tiles.',
        'Check both facts: 12 + 18 = 30, and dividing 12:18 by 6 gives 2:3.'
      ],answer:'12 red tiles and 18 blue tiles.'
    },
    check:{prompt:'Green and yellow counters are in the ratio 3:2. What fraction of all the counters is green?',answer:'3/5 of the counters are green.',why:'The whole has 3 + 2 = 5 equal ratio parts. Green takes three of those five parts, not three of two.'}
  },
  unit_rate: {
    goal:'Use equal scaling to find how much corresponds to one unit.',
    paragraphs:[
      'A unit rate tells us an amount for one unit of something else. Dollars per notebook means the price of one notebook. Liters per minute means the amount added during one minute. The word per helps you choose the order of division.',
      'On a double number line, matching positions represent matching quantities. Six notebooks line up with $9. Dividing both numbers by 6 makes the notebook count 1 and the cost $1.50. Scaling both quantities preserves their relationship.',
      'A package that costs less is not always cheaper for each item. Compare prices per one of the same item. For fractions, use the same idea: if a robot goes 3/4 meter in 1/2 second, it goes twice as far in one second at the same speed.'
    ],
    figure:{html:unitRateLines(),alt:'Notebooks and dollars on aligned number lines show one notebook costs one dollar fifty cents.',caption:'The highlighted pair is the unit rate. Every one-notebook step adds $1.50 to the cost.'},
    worked:{
      prompt:'Pack A has 6 notebooks for $9. Pack B has 4 of the same notebooks for $7. Which pack costs less per notebook?',
      steps:[
        'The comparison needs dollars per notebook, so divide cost by notebook count.',
        'Pack A: $9 ÷ 6 = $1.50 per notebook.',
        'Pack B: $7 ÷ 4 = $1.75 per notebook.',
        'Compare the same unit: $1.50 is $0.25 less than $1.75. Check Pack A: 6 × $1.50 = $9.'
      ],answer:'Pack A has the lower unit price: $1.50 per notebook.'
    },
    check:{prompt:'A robot travels 2.4 meters in 3 seconds at a steady speed. How many meters does it travel per second?',answer:'0.8 meter per second.',why:'We want meters per second, so divide 2.4 meters by 3 seconds. Multiplying 0.8 by 3 gives the original 2.4 meters.'}
  },
  proportional: {
    goal:'Connect a constant rate with an equation and a graph through the origin.',
    paragraphs:[
      'Two quantities are proportional when one is always the other multiplied by the same number. If every notebook costs $3 and there is no extra fee, total cost is 3 times the notebook count. Twice as many notebooks costs twice as much.',
      'Let x be the number of notebooks and y be the cost in dollars. The rule y = 3x describes every pair. For any positive notebook count, y ÷ x is 3 dollars per notebook. This fixed rate is called the constant of proportionality.',
      'The graph shows a straight line through (0, 0): buying no notebooks costs nothing. The point (1, 3) displays the unit rate. A $4 order fee would change the rule to y = 3x + 4; that line starts above zero, so that relationship is not proportional.'
    ],
    figure:{html:proportionalGraph(),alt:'Graph of notebook cost y equals three x through the origin, with the unit-rate point one comma three.',caption:'Each plotted point is a notebook count and its matching cost. The point (1, 3) means one notebook costs $3.'},
    worked:{
      prompt:'Each notebook costs $3, with no fee. Write a rule for the total cost and use it to find the cost of 4 notebooks.',
      steps:[
        'Identify the constant rate: $3 for each notebook.',
        'Let x be the notebook count and y the cost in dollars. Then y = 3x.',
        'Substitute x = 4: y = 3 × 4 = 12.',
        'Check: the graph includes (4, 12), and 12 ÷ 4 = 3. The rule also gives $0 for 0 notebooks.'
      ],answer:'y = 3x; four notebooks cost $12.'
    },
    check:{prompt:'A service charges $3 per item plus a $4 order fee. Is total cost proportional to the number of items?',answer:'No. The relationship is not proportional.',why:'The rule is y = 3x + 4. The extra fee makes cost per item vary with order size, and the rule gives y = 4 when x = 0.'}
  },
  percent_part: {
    goal:'Find an amount when the whole and the percentage are known.',
    paragraphs:[
      'First name the whole: the amount that represents 100%. In a pool problem, this is the full capacity, not just the water already inside. A percentage tells us what fraction of that full amount to take.',
      'The bar splits an 800-liter pool into four equal quarters. Each quarter is 25% of the full pool. Because the parts are equal, one quarter contains 800 ÷ 4 = 200 liters. This gives a picture of what 25% means before using a formula.',
      'Multiplying by a decimal takes the same fraction of the whole: 25% = 0.25, so 800 × 0.25 = 200. For a percentage below 100%, the part should be smaller than the whole. This is a useful check on your result.'
    ],
    figure:{html:percentPartBar(),alt:'An 800-liter whole split into four 200-liter quarters; one quarter is shaded.',caption:'Four equal parts fill the pool. One of those parts is 25%, so it contains one quarter of 800 liters.'},
    worked:{
      prompt:'A pool holds 800 liters when full. It is 25% full. How many liters of water are in it?',
      steps:[
        'Name the whole: 800 liters corresponds to 100%. We are finding the water amount, or part.',
        'Write the percentage as a fraction of one: 25% = 25/100 = 0.25.',
        'Take that fraction of the capacity: 800 × 0.25 = 200 liters.',
        'Check with the picture: 25% is one of four equal quarters, and 4 × 200 = 800.'
      ],answer:'The pool contains 200 liters of water.'
    },
    check:{prompt:'A different pool holds 600 liters when full. How much water is in it when it is 30% full?',answer:'180 liters.',why:'600 liters is the 100% whole. Thirty percent is 0.30, so 600 × 0.30 = 180 liters. Three 10% parts also give 3 × 60 = 180.'}
  },
  percent_rate: {
    goal:'Find what percentage one amount is of a named whole.',
    paragraphs:[
      'Now the water amount and full capacity are known, but the percentage is missing. We need to compare the part with the whole. Dividing part by whole tells us what fraction of one full pool is present.',
      'Two hundred liters out of 800 liters gives 200/800 = 1/4 = 0.25. This quotient has no liter unit: it compares two amounts measured in the same unit. It says that the water is one quarter of the full capacity.',
      'A percent expresses that comparison per hundred. Multiplying 0.25 by 100 gives 25, so the pool is 25% full. Reversing the division would answer how many 200-liter parts fit into the pool; that is a different question.'
    ],
    figure:{html:percentRateLines(),alt:'Aligned liters and percent scales place 200 liters at 25 percent of 800 liters.',caption:'Keep 800 liters aligned with 100%. Every 200-liter step is one quarter of that whole, or 25%.'},
    worked:{
      prompt:'A pool contains 200 liters of water. Its full capacity is 800 liters. What percentage full is it?',
      steps:[
        'Choose the reference whole: the full capacity, 800 liters, is 100%.',
        'Compare part with whole: 200 ÷ 800 = 0.25.',
        'Write the fraction of one as a percentage: 0.25 × 100 = 25%.',
        'Check backward: 25% of 800 liters is 0.25 × 800 = 200 liters.'
      ],answer:'The pool is 25% full.'
    },
    check:{prompt:'A team makes 18 out of 30 shots. What percentage of its shots did it make?',answer:'60%.',why:'All 30 shots are the whole. The made fraction is 18 ÷ 30 = 0.6, which is 60 out of 100. The whole is not the 12 missed shots.'}
  },
  percent_whole: {
    goal:'Rebuild a full amount from a known part and its percentage.',
    paragraphs:[
      'This time, the full capacity is missing. The 200 liters we can see represent only 25% of the pool. Do not label those 200 liters as 100%; the story has already told us that they are one quarter.',
      'A full pool has four equal quarters. If one quarter holds 200 liters, four quarters hold 4 × 200 = 800 liters. The diagram makes the whole larger than the known part, as it should be for a percentage below 100%.',
      'The equation is 0.25 × whole = 200. Division undoes the multiplication: whole = 200 ÷ 0.25. Dividing by 0.25 asks how many quarter-sized units fit, which is why the result is larger than 200.'
    ],
    figure:{html:percentWholeBar(),alt:'Four 25-percent sections reconstruct the whole from one known 200-liter section.',caption:'The solid quarter is given. The other equal quarters complete the whole. Each has the same 200-liter capacity.'},
    worked:{
      prompt:'A pool contains 200 liters. This is 25% of its full capacity. How much water can the full pool hold?',
      steps:[
        'Identify what is known: part = 200 liters and percentage = 25%. The whole is unknown.',
        'Use the relationship: 0.25 × full capacity = 200.',
        'Divide to undo multiplying by 0.25: 200 ÷ 0.25 = 800 liters.',
        'Check by taking a quarter again: 800 × 0.25 = 200 liters.'
      ],answer:'The full pool holds 800 liters.'
    },
    check:{prompt:'Thirty-six pages are 30% of a book. How many pages are in the entire book?',answer:'120 pages.',why:'The equation is 0.30 × whole = 36. Dividing 36 by 0.30 gives 120. Check: 10% is 12 pages, so 30% is 36 pages.'}
  },
  percent_change: {
    goal:'Compare an increase or decrease with the original amount.',
    paragraphs:[
      'Percent change asks how large a change is compared with where we started. First subtract to find the amount added or removed. Then compare that change with the original amount, which is the 100% reference.',
      'Going from 40 minutes to 50 minutes adds 10 minutes. The original 40 minutes can be drawn as four equal 10-minute blocks. The added block is one of those four, so the increase is 1/4 = 25% of the starting time.',
      'The new amount is 125% of the original, while the increase itself is 25%. These answer different questions. Changing from 50 back to 40 is a 20% decrease, because its starting amount is now 50: 10 ÷ 50 = 0.20.'
    ],
    figure:{html:percentChangeBars(),alt:'Forty minutes is four ten-minute blocks and fifty minutes is five. The fifth block adds 25 percent of the original four blocks.',caption:'The original four blocks are 100%. One extra block is 25% of that starting amount; all five blocks are 125%.'},
    worked:{
      prompt:'Practice time increases from 40 minutes to 50 minutes. What is the percentage increase?',
      steps:[
        'Identify the starting amount: 40 minutes represents 100%.',
        'Find the change: 50 − 40 = 10 minutes added.',
        'Compare the change with the start: 10 ÷ 40 = 0.25 = 25%.',
        'Check: 25% of 40 is 10, and 40 + 10 = 50 minutes.'
      ],answer:'The practice time increased by 25%.'
    },
    check:{prompt:'A tank level falls from 80 liters to 60 liters. What is the percentage decrease?',answer:'A 25% decrease.',why:'The amount removed is 80 − 60 = 20 liters. The original 80 liters are the reference, so 20 ÷ 80 = 0.25 = 25%.'}
  },
  applications: {
    goal:'Solve a discount-and-tax problem while keeping track of the whole at each step.',
    paragraphs:[
      'Some problems use more than one percentage. Read the order of the changes and identify the amount each percentage applies to. A discount is a part removed from the original price. The remaining amount is the sale price.',
      'In this example, tax applies to the sale price. After a 25% discount, a $40 game costs $30. For the tax step, that $30 becomes the new reference amount: 10% of $30 is $3.',
      'Do not simply combine 25% off and 10% tax as a 15% discount. The percentages act on different amounts. A useful shortcut keeps both steps: $40 × 0.75 × 1.10 = $33, where 0.75 keeps 75% and 1.10 includes the sale price plus its tax.'
    ],
    figure:{html:twoStepPicture(),alt:'A forty-dollar price becomes thirty dollars after discount and thirty-three dollars after tax on the sale price.',caption:'Follow the amounts from left to right. The second percentage uses the result of the first step.'},
    worked:{
      prompt:'A $40 game is 25% off. Sales tax is 10% of the sale price. What is the final cost?',
      steps:[
        'Calculate the discount from the original price: 0.25 × $40 = $10.',
        'Subtract the discount: $40 − $10 = $30. This is the sale price.',
        'Calculate tax from the sale price: 0.10 × $30 = $3.',
        'Add the tax: $30 + $3 = $33. Check: the final cost is above the $30 sale price and below the $40 original price.'
      ],answer:'The final cost is $33.'
    },
    check:{prompt:'A $50 item is 20% off. Then a 10% charge is applied to its sale price. What is the final cost?',answer:'$44.',why:'Twenty percent of $50 is $10, leaving $40. Ten percent of $40 is $4. The final cost is $40 + $4 = $44.'}
  }
};

export const RATIO_TEACHING_REFERENCES = [
  {
    title:'Illustrative Mathematics / Open Up Resources: Percentages and Tape Diagrams',
    url:'https://im.kendallhunt.com/MS_ACC/teachers/1/2/21/preparation.html',
    use:'Teaching reference for showing the whole as 100% and connecting a percentage to equal parts in a tape diagram. The diagrams and lesson text in this book are original.',
    license:'The linked 2020 accelerated curriculum credits CC BY 4.0 materials; trademarks and individual images have separate conditions. No source images are reproduced.'
  },
  {
    title:'Illustrative Mathematics / Open Up Resources: Ratios and Rates With Fractions',
    url:'https://im.kendallhunt.com/MS/teachers/2/4/2/preparation.html',
    use:'Teaching reference for unit rates, equal scaling, tape diagrams and double number lines, including fractional quantities.',
    license:'The linked 2019 curriculum is CC BY 4.0, subject to its stated exceptions. The examples and figures here are original.'
  },
  {
    title:'Illustrative Mathematics / Open Up Resources: One Hundred Percent',
    url:'https://im.kendallhunt.com/MS/students/2/4/7/index.html',
    use:'Teaching reference for explicitly marking the original amount as 100% when reasoning about percent increase and decrease.',
    license:'The linked 2019 curriculum is CC BY 4.0, subject to its stated exceptions. No text or images are copied into this book.'
  }
];
