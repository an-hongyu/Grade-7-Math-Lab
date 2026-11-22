// Original teaching text and mathematically exact diagrams for Chapter 2.
// References inform the use of organized outcomes; no source artwork is copied.
const INK = '#24332e';
const TEAL = '#086f63';
const MUTED = '#53645c';
const LINE = '#dce5df';
const LIGHT = '#edf5f0';
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text = (x, y, value, options = '') => `<text x="${x}" y="${y}" text-anchor="middle" ${options}>${esc(value)}</text>`;
const svg = (width, height, alt, body) => `<svg class="counting-teaching-diagram" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(alt)}" xmlns="http://www.w3.org/2000/svg"><g font-family="system-ui, sans-serif" font-size="20" fill="${INK}">${body}</g></svg>`;
const surface = body => `<div class="teaching-figure-surface">${body}</div>`;
const box = (x,y,w,h,fill = '#fff',stroke = LINE) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;

const choicesAlt = 'A table lists six shirt-and-hat outfits. Shirt R makes R1, R2, and R3. Shirt B makes B1, B2, and B3. There are two rows of three outfits.';
const choicesFigure = surface(svg(520, 245, choicesAlt,
  [1,2,3].map((n,i)=>text(223+i*110,33,`Hat ${n}`,'font-size="19"')).join('') +
  ['R','B'].map((shirt,row)=>{
    const y=54+row*66;
    return text(76,y+37,`Shirt ${shirt}`,'font-size="19"')+
      [1,2,3].map((hat,col)=>box(172+col*110,y,102,58,LIGHT)+text(223+col*110,y+38,`${shirt}${hat}`,'font-size="25" font-weight="600"')).join('');
  }).join('') +
  text(260,220,'3 + 3 = 2 × 3 = 6 outfits',`fill="${TEAL}" font-weight="600"`)
));

const orderedAlt = 'A branching diagram lists all six assignments of a captain and a different helper from A, B, and C: AB, AC, BA, BC, CA, and CB. The first letter is the captain.';
const orderedFigure = surface(svg(520, 430, orderedAlt,
  text(77,28,'Captain','font-size="19"') + text(245,28,'Helper','font-size="19"') + text(421,28,'Assignment','font-size="19"') +
  ['A','B','C'].map((captain,row)=>{
    const y=100+row*120;
    return `<circle cx="77" cy="${y}" r="23" fill="${LIGHT}" stroke="${TEAL}" stroke-width="2"/>` + text(77,y+7,captain,'font-size="23" font-weight="600"') +
      ['A','B','C'].filter(helper=>helper!==captain).map((helper,j)=>{
        const yy=y+(j===0?-30:30);
        return `<path d="M100 ${y} L222 ${yy}" fill="none" stroke="${TEAL}" stroke-width="2"/><circle cx="245" cy="${yy}" r="21" fill="#fff" stroke="${LINE}" stroke-width="2"/>`+
          text(245,yy+7,helper,'font-size="22"')+
          `<path d="M267 ${yy} H357" fill="none" stroke="${LINE}" stroke-width="2"/>`+
          box(357,yy-22,128,44,LIGHT)+text(421,yy+7,`${captain}${helper}`,'font-size="23" font-weight="600"');
      }).join('');
  }).join('') + text(260,414,'3 captain choices × 2 helper choices = 6',`fill="${TEAL}" font-size="20" font-weight="600"`)
));

const groupsAlt = 'Six ordered lists are paired into three teams. AB and BA make team A plus B. AC and CA make team A plus C. BC and CB make team B plus C. Each team appears in two orders.';
const groupsFigure = surface(svg(520, 360, groupsAlt,
  text(132,28,'Two orders','font-size="20"') + text(391,28,'One team','font-size="20"') +
  [['A','B'],['A','C'],['B','C']].map(([a,b],i)=>{
    const y=48+i*78;
    return box(31,y,92,52)+text(77,y+34,a+b,'font-size="24"')+
      box(141,y,92,52)+text(187,y+34,b+a,'font-size="24"')+
      `<path d="M247 ${y+26} H295 M285 ${y+17} L295 ${y+26} L285 ${y+35}" fill="none" stroke="${TEAL}" stroke-width="2"/>`+
      box(314,y,154,52,LIGHT,TEAL)+text(391,y+34,`${a} + ${b}`,'font-size="24" font-weight="600"');
  }).join('') +
  text(260,309,'6 ordered lists ÷ 2 orders per team',`fill="${MUTED}" font-size="20"`)+
  text(260,342,'= 3 different teams',`fill="${TEAL}" font-size="23" font-weight="600"`)
));

function codeGrid(repeats) {
  const letters=['A','B','C'];
  const alt=repeats
    ? 'With repeated letters allowed, all nine codes are possible: AA, AB, AC, BA, BB, BC, CA, CB, CC.'
    : 'With no repeated letters, AA, BB, and CC are crossed out. The six allowed codes are AB, AC, BA, BC, CA, and CB.';
  return `<div class="figure-panel">${svg(260,285,alt,
    text(130,23,repeats?'With repeats':'No repeats','font-size="20" font-weight="600"')+
    letters.map((v,i)=>text(77+i*61,57,v,'font-size="20"')).join('')+
    letters.map((first,row)=>{
      const y=71+row*56;
      return text(22,y+32,first,'font-size="20"')+
        letters.map((second,col)=>{
          const x=48+col*61;
          const removed=!repeats&&first===second;
          return box(x,y,57,49,removed?'#f3f4f3':LIGHT,removed?MUTED:LINE)+
            text(x+28.5,y+32,first+second,`font-size="21"${removed?` fill="${MUTED}"`:''}`)+
            (removed?`<path d="M${x+6} ${y+42} L${x+51} ${y+7}" stroke="${MUTED}" stroke-width="2"/>`:'');
        }).join('');
    }).join('')+
    text(130,266,repeats?'3 × 3 = 9 codes':'3 × 2 = 6 codes',`fill="${TEAL}" font-size="20" font-weight="600"`)
  )}</div>`;
}
const repeatsAlt = 'Two code tables compare A, B, and C in two positions. Repeats allowed gives nine codes. Removing AA, BB, and CC leaves six codes when repeats are forbidden.';
const repeatsFigure=surface(`<div class="figure-comparison">${codeGrid(true)}${codeGrid(false)}</div>`);

const probabilityAlt='The four equally likely results of two independent fair coin flips are HH, HT, TH, and TT. HT and TH are marked as matches for exactly one head. Two matches out of four give one half.';
const probabilityFigure=surface(svg(520,338,probabilityAlt,
  text(260,28,'First letter: flip 1. Second letter: flip 2.','font-size="19"')+
  ['HH','HT','TH','TT'].map((outcome,i)=>{
    const x=20+(i%2)*260, y=53+Math.floor(i/2)*102;
    const heads=outcome.split('').filter(c=>c==='H').length;
    const matches=heads===1;
    return box(x,y,220,88,matches?LIGHT:'#fff',matches?TEAL:LINE)+
      text(x+110,y+33,outcome,'font-size="27" font-weight="600"')+
      text(x+110,y+60,`${heads} ${heads===1?'head':'heads'}`,'font-size="19"')+
      (matches?text(x+110,y+80,'matches',`fill="${TEAL}" font-size="18" font-weight="600"`):'');
  }).join('')+
  text(260,281,'2 matching outcomes out of 4','font-size="20"')+
  text(260,319,'2/4 = 1/2 = 50%',`fill="${TEAL}" font-size="25" font-weight="600"`)
));

export const COUNTING_TEACHING = {
  counting_choices: {
    goal: 'Count complete outcomes once, then explain why multiplication works.',
    paragraphs: [
      'Start by naming one complete result. An outfit in this lesson needs one shirt and one hat. A shirt by itself is not an outfit, and a hat by itself is not an outfit.',
      'Call the two shirts R and B and the three hats 1, 2, and 3. Keep the shirt fixed while you list all its hats. Then change the shirt and repeat. The table makes a pattern that prevents missed or repeated outfits.',
      'Each shirt gives a group of three outfits. Two equal groups of three make 3 + 3, which is 2 × 3. This shortcut works here because every shirt can go with every hat. If a pairing is forbidden, mark it out and count only the allowed outcomes.'
    ],
    figure: {
      html:choicesFigure,
      caption:'Each cell is a complete outfit. Read across one row before moving to the next.',
      alt:choicesAlt
    },
    worked: {
      prompt:'You have 2 different shirts and 3 different hats. Every shirt can go with every hat. How many outfits can you make?',
      steps:[
        'Define an outfit: choose one shirt AND one hat.',
        'For shirt R, list R1, R2, and R3. That is 3 outfits.',
        'For shirt B, list B1, B2, and B3. That is another 3 outfits.',
        'Add the equal groups or multiply: 3 + 3 = 2 × 3 = 6. The table has exactly 6 filled cells.'
      ],
      answer:'6 different outfits.'
    },
    check:{
      prompt:'A robot can take 3 routes and send 2 signals. Either signal works on every route. How many route-and-signal plans are possible?',
      answer:'6 plans.',
      why:'Each of the 3 routes pairs with both signals, so there are 3 equal groups of 2: 3 × 2 = 6. Adding 3 + 2 would count the separate options, not complete plans.'
    }
  },
  permutations: {
    goal:'Decide when roles or positions matter, then count the choices left at each step.',
    paragraphs:[
      'A permutation is an arrangement in which order matters. For a captain and a helper, the roles make the result different: Ava as captain with Ben as helper is not the same assignment as Ben as captain with Ava as helper.',
      'Use A, B, and C for Ava, Ben, and Cam. In AB, the first letter names the captain and the second names the helper. Follow each branch in the diagram to one complete assignment. The list contains AB, AC, BA, BC, CA, and CB.',
      'There are 3 choices for captain. Once a captain is chosen, that person is unavailable for the helper role, leaving 2 choices. Multiplication counts the two helper choices for each captain: 3 × 2. We do not divide by 2 because reversing the roles creates a different assignment.'
    ],
    figure:{
      html:orderedFigure,
      caption:'One path gives one assignment. For example, AB means captain A and helper B; BA reverses the roles.',
      alt:orderedAlt
    },
    worked:{
      prompt:'Choose a captain and a different helper from Ava, Ben, and Cam. How many assignments are possible?',
      steps:[
        'Ask whether swapping people changes the result. Yes: captain and helper are different roles.',
        'Choose the captain in 3 ways.',
        'For each captain, choose the helper from the 2 remaining people. One person cannot fill both roles.',
        'Multiply: 3 × 2 = 6. Check against the six complete paths in the diagram.'
      ],
      answer:'6 captain-and-helper assignments.'
    },
    check:{
      prompt:'Four different runners finish a race with no ties. How many possible first-place and second-place results are there?',
      answer:'12 results.',
      why:'There are 4 choices for first place and 3 remaining choices for second place: 4 × 3 = 12. The other two runners do not need to be placed.'
    }
  },
  combinations: {
    goal:'Recognize duplicate orders and count each group only once.',
    paragraphs:[
      'A combination is a selection where only the members matter. A team of Ava and Ben has the same two people as a team of Ben and Ava. With no different jobs or positions, these are two ways to name one team.',
      'Compare the six ordered assignments from the last lesson. Put AB with BA, AC with CA, and BC with CB. Each pair of ordered lists describes one team. The diagram turns six lists into three groups.',
      'Division removes the repeated counting. For a team of two different people, every team appears in exactly two orders, so divide the ordered count by 2. This divisor belongs to pairs: a group of three different people has six orders, not three. Always ask how many times each group was counted.'
    ],
    figure:{
      html:groupsFigure,
      caption:'The arrow joins two names for the same team. There are three different teams: A + B, A + C, and B + C.',
      alt:groupsAlt
    },
    worked:{
      prompt:'Choose 2 different people from Ava, Ben, and Cam for a team with no assigned roles. How many teams are possible?',
      steps:[
        'Ask whether swapping the names changes the team. No: the members stay the same.',
        'Count in order first: 3 choices for the first name and 2 for the second, giving 3 × 2 = 6 lists.',
        'Pair each list with its reverse. AB and BA are one team, and the same duplication happens for every pair.',
        'Divide by the 2 orders per team: 6 ÷ 2 = 3. Check by listing A + B, A + C, and B + C.'
      ],
      answer:'3 different teams.'
    },
    check:{
      prompt:'Choose 2 different books from 5 to pack for a trip. The packing order does not matter. How many pairs can you choose?',
      answer:'10 pairs.',
      why:'There are 5 × 4 = 20 ordered lists. Each pair is listed twice, so 20 ÷ 2 = 10 different pairs.'
    }
  },
  counting_repeats: {
    goal:'Treat order and repetition as two separate questions before counting.',
    paragraphs:[
      'A two-letter code has a first position and a second position, so AB and BA are different codes. Next ask a separate question: may the same letter appear twice? The problem must tell you whether AA is allowed.',
      'In the left table, letters may repeat. After choosing A first, you can still choose A, B, or C second. The same is true after choosing B or C first. All nine cells are allowed: 3 × 3.',
      'In the right table, letters cannot repeat. Cross out AA, BB, and CC. Every first letter now has only two allowed second letters, so 3 × 2 = 6. There is no division by 2: AB and BA still occupy different cells and are different codes.'
    ],
    figure:{
      html:repeatsFigure,
      caption:'Rows give the first letter; columns give the second. Crossing out the three repeated-letter codes changes 9 outcomes into 6.',
      alt:repeatsAlt
    },
    worked:{
      prompt:'Make a 2-letter code from A, B, and C. How does allowing repeated letters change the number of codes?',
      steps:[
        'Keep the order rule fixed: the first and second positions matter in both cases.',
        'With repeats allowed, each position has 3 choices. Count 3 × 3 = 9 codes.',
        'With no repeats, the first position has 3 choices, but the chosen letter is removed for the second position. Count 3 × 2 = 6 codes.',
        'Check the difference: the only removed codes are AA, BB, and CC, so 9 − 3 = 6.'
      ],
      answer:'9 codes with repeats; 6 codes without repeats.'
    },
    check:{
      prompt:'Use A, B, C, and D for a 3-letter code. How many codes are possible if no letter can repeat?',
      answer:'24 codes.',
      why:'The positions have 4, then 3, then 2 choices: 4 × 3 × 2 = 24. Fill only the three positions requested; one letter remains unused.'
    }
  },
  counting_probability: {
    goal:'Use a complete list of equally likely outcomes to explain a probability fraction.',
    paragraphs:[
      'The sample space contains every possible complete outcome. For two coin flips, write the first flip before the second: HH, HT, TH, and TT. H means heads and T means tails.',
      'Assume a fair coin and independent flips: each side has probability 1/2, and one flip does not change the next. Each ordered pair then has probability 1/4. Because these four outcomes are equally likely, we can compare their counts.',
      'An event is the condition we want. Exactly one head includes HT and TH, so it matches two of the four outcomes. Do not use the three categories “zero, one, or two heads” as three equal chances: the one-head category contains two outcomes, while each other category contains only one.'
    ],
    figure:{
      html:probabilityFigure,
      caption:'The outlined matching cells are HT and TH. They are different outcomes even though both contain one head.',
      alt:probabilityAlt
    },
    worked:{
      prompt:'Flip a fair coin twice, independently. What is the probability of getting exactly one head?',
      steps:[
        'List all complete outcomes in order: HH, HT, TH, TT. There are 2 × 2 = 4.',
        'Check equal likelihood: the coin is fair and the flips are independent, so each ordered pair has the same chance.',
        'Mark the outcomes with exactly one head: HT and TH. There are 2 matches.',
        'Write matches over all outcomes: 2/4 = 1/2 = 50%. The fraction is between 0 and 1, as a probability should be.'
      ],
      answer:'1/2, or 50%.'
    },
    check:{
      prompt:'For the same two independent fair coin flips, what is the probability of at least one head?',
      answer:'3/4, or 75%.',
      why:'At least one includes one OR two heads. HH, HT, and TH match; only TT does not. Count 3 matching outcomes out of 4 equally likely outcomes.'
    }
  }
};

export const COUNTING_TEACHING_REFERENCES = [
  {
    title:'Illustrative Mathematics: Grade 7, Lesson 8 — Keeping Track of All Possible Outcomes',
    url:'https://im.kendallhunt.com/MS/students/2/8/8/index.html',
    use:'Teaching reference for organized outcome lists, tables, and branching trees. Our small outcome diagrams and English explanations are original.',
    license:'Classic IM 6–8 / Open Up Resources curriculum: CC BY 4.0; separate image and trademark terms apply. No source images are reproduced.'
  },
  {
    title:'OpenStax Contemporary Mathematics: 7.3 Combinations',
    url:'https://openstax.org/books/contemporary-mathematics/pages/7-3-combinations',
    use:'Background reference for distinguishing ordered arrangements from groups and removing duplicate orders. We introduce this through two-person teams, before formal notation.',
    license:'Openly viewable textbook reference. The figures and lesson wording in this book are original; source artwork is not reproduced.'
  },
  {
    title:'OpenStax Contemporary Mathematics: 7.4 Tree Diagrams, Tables, and Outcomes',
    url:'https://openstax.org/books/contemporary-mathematics/pages/7-4-tree-diagrams-tables-and-outcomes',
    use:'Reference for using organized representations to describe complete outcomes. Our probability lesson separately states the equal-likelihood assumptions.',
    license:'Openly viewable textbook reference. No source prose or artwork is reproduced.'
  }
];
