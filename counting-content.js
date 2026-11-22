// Chapter 2: original, concise teaching text. Sources inform scope, not copied questions.
export const COUNTING_QUICK = {
  counting_choices: {
    title: 'Count one choice at a time',
    idea: 'List the choices in a clear order. When every first choice has the same later options, multiply the numbers of choices.',
    rule: 'Total outfits = shirt choices × hat choices.',
    example: {
      question: 'Choose one of 2 different shirts and one of 3 different hats. Every shirt can go with every hat. How many outfits are possible?',
      steps: ['Each shirt makes 3 outfits: one with each hat.', 'There are 2 shirts, so 2 × 3 = 6 outfits.'],
      answer: '6 different outfits.'
    }
  },
  permutations: {
    title: 'Permutations: order matters',
    idea: 'A permutation is an arrangement where order matters. Ava then Ben is different from Ben then Ava. Without repeats, each choice leaves fewer options.',
    rule: 'Fill each position, then multiply its available choices.',
    example: {
      question: 'Choose a captain and a different helper from Ava, Ben, and Cam. How many assignments are possible?',
      steps: ['Choose the captain: 3 people. Choose the helper: 2 people remain.', '3 × 2 = 6. Ava as captain and Ben as helper differs from the reverse.'],
      answer: '6 assignments.'
    }
  },
  combinations: {
    title: 'Combinations: order does not matter',
    idea: 'A combination is a group where order does not matter. Choosing Ava and Ben gives the same team as choosing Ben and Ava.',
    rule: 'Count each group once. For pairs, divide ordered choices by 2.',
    example: {
      question: 'Choose 2 different people from Ava, Ben, and Cam for a team with no assigned roles. How many teams are possible?',
      steps: ['The teams are Ava–Ben, Ava–Cam, and Ben–Cam.', 'Ordered choices give 3 × 2 = 6. Each team appears twice, so 6 ÷ 2 = 3.'],
      answer: '3 teams.'
    }
  },
  counting_repeats: {
    title: 'Can a choice repeat?',
    idea: 'Read the repeat rule first. If repeats are allowed, a choice stays available. If repeats are forbidden, used choices are removed.',
    rule: 'Repeats allowed: keep the same count in each position.',
    example: {
      question: 'Make a 2-letter code using A, B, and C. Letters may repeat, so AA is allowed. How many codes are possible?',
      steps: ['The first position has 3 choices. The second also has 3 choices.', '3 × 3 = 9 codes. AB and BA count as different codes.'],
      answer: '9 codes.'
    }
  },
  counting_probability: {
    title: 'Use counting to find probability',
    idea: 'When outcomes are equally likely, count all outcomes and then the ones that match your event. Probability compares those two counts.',
    rule: 'Probability = matching outcomes ÷ all equally likely outcomes.',
    example: {
      question: 'Flip a fair coin twice, independently. What is the probability of exactly one head?',
      steps: ['The equally likely results are HH, HT, TH, and TT.', 'HT and TH have exactly one head: 2 ÷ 4 = 1/2.'],
      answer: '1/2, or 0.5.'
    }
  }
};

export const COUNTING_LESSONS = [
  {
    id: 'counting_choices',
    title: 'Counting choices: lists and multiplication',
    standard: 'Supports 7.SP.C.8b: organized lists, tables, and tree diagrams',
    minutes: 8,
    goal: 'List every possible result once and use multiplication when each step has a fixed number of choices.',
    keyIdea: 'Count complete outcomes, not just the separate choices.',
    explanation: [
      'An outcome is one complete result. An outfit needs both a shirt and a hat. Two shirts plus three hats counts five clothing items; it does not count all the outfits.',
      'Work systematically. Call the shirts R and B, and the hats 1, 2, and 3. List R1, R2, R3, then B1, B2, B3. This gives six outcomes without missing or repeating one.',
      'A table has one row per shirt and one column per hat. Each cell is an outfit. A tree starts with a branch for each shirt, then a branch for each hat. Each path to the end is one outfit.',
      'Multiplication is a shortcut for these equal groups: 2 × 3 = 6. It also works for three steps: 2 shirts × 3 hats × 2 pairs of shoes = 12 outfits, provided every listed item can be used with every choice at the other steps.'
    ],
    vocabulary: [
      {term:'outcome',meaning:'One complete result of all the choices.'},
      {term:'organized list',meaning:'A list made in a pattern so no result is missed or repeated.'},
      {term:'tree diagram',meaning:'Branches showing choices; each complete path represents an outcome.'}
    ],
    workedExamples: [
      COUNTING_QUICK.counting_choices.example,
      {
        question: 'A robot must choose one of 3 routes, then one of 2 signals. Either signal works on every route. How many route-and-signal plans are possible?',
        steps: ['For route 1, list its 2 signals. Do the same for routes 2 and 3.', 'There are 3 equal groups of 2 plans: 3 × 2 = 6.'],
        answer: '6 route-and-signal plans.'
      }
    ],
    check: {prompt:'Choose 1 sandwich from 4 options and 1 drink from 2 options. Any pairing is allowed. How many meals are possible?',answer:'4 × 2 = 8 meals. Each of the four sandwiches can be paired with either drink.'},
    parentZh: '先问“一种完整结果包含什么”。两件上衣加三顶帽子是五件物品，不是五种搭配。按第一件上衣列完三种，再列第二件；孩子能列全、不漏不重后，再用乘法简写。',
    watchOut: 'Adding the numbers of options counts separate items. Multiply when a complete result uses one choice from each step and every first choice has the same later options.',
    extension: 'If some pairings are forbidden, do not multiply the original counts blindly. Make a list or table and count only the allowed pairings.'
  },
  {
    id: 'permutations',
    title: 'Permutations: count ordered arrangements',
    standard: 'Ordered-counting extension supporting 7.SP.C.8b',
    minutes: 8,
    goal: 'Recognize when changing the order or assigned roles changes the result, and count arrangements without repeating items.',
    keyIdea: 'If swapping two choices changes the result, order matters.',
    explanation: [
      'Imagine choosing a captain and a helper. Ava as captain with Ben as helper is different from Ben as captain with Ava as helper. The roles make the two assignments different.',
      'Using A, B, and C for three different people, list the captain first and the helper second: AB, AC, BA, BC, CA, CB. There are six assignments. A person cannot fill both roles, so AA, BB, and CC are not allowed.',
      'Count the first position, then the second. There are 3 choices for captain. After choosing that person, only 2 people remain for helper. Multiply: 3 × 2 = 6.',
      'For a line of three different books, all three positions matter. There are 3 choices for the first place, 2 for the second, and 1 for the last: 3 × 2 × 1 = 6. Always decide how many positions you actually need to fill.'
    ],
    vocabulary: [
      {term:'permutation',meaning:'An ordered arrangement; changing positions can change the result.'},
      {term:'position',meaning:'A place in an arrangement, such as first, second, or third.'},
      {term:'without repetition',meaning:'An item or person cannot be selected again in the same arrangement.'}
    ],
    workedExamples: [
      COUNTING_QUICK.permutations.example,
      {
        question: 'Put 3 different books in a row on a shelf. How many orders are possible?',
        steps: ['Choose the first book in 3 ways, the next in 2 ways, and the final book in 1 way.', '3 × 2 × 1 = 6. For books A, B, C, the orders are ABC, ACB, BAC, BCA, CAB, CBA.'],
        answer: '6 orders.'
      }
    ],
    check: {prompt:'Four different runners finish a race with no ties. How many possibilities are there for first and second place?',answer:'4 × 3 = 12. First place can be any runner; second place must be one of the three remaining runners.'},
    parentZh: '抓住“交换位置后，结果是否改变”。队长与助手是不同职务；甲当队长、乙当助手，与反过来不同。用三张写着 A、B、C 的卡片实际摆出六种，再解释为什么第二个位置只剩两个选择。',
    watchOut: 'Without repeats, do not use the original number of choices for every position. The number available shrinks after each selection.',
    extension: 'The product 3 × 2 × 1 is written 3!, pronounced “three factorial.” Arranging all n different items gives n!. Formal permutation notation is an optional extension here.'
  },
  {
    id: 'combinations',
    title: 'Combinations: count groups once',
    standard: 'Unordered-counting extension supporting 7.SP.C.8b',
    minutes: 8,
    goal: 'Recognize when only the members of a group matter and remove duplicate orders when counting groups.',
    keyIdea: 'A team with no assigned roles is counted once, whichever member is named first.',
    explanation: [
      'A team containing Ava and Ben has the same members as a team containing Ben and Ava. If there are no assigned roles or positions, these are one team. We call an unordered selection a combination.',
      'From Ava, Ben, and Cam, the two-person teams are Ava–Ben, Ava–Cam, and Ben–Cam. Compare this with the six captain-and-helper assignments. Removing roles changes what counts as a different result.',
      'You can count the ordered choices first: 3 × 2 = 6. Each pair appears twice, once in each order. Divide by 2 to keep one copy of each pair: 6 ÷ 2 = 3.',
      'The number of duplicate orders depends on the group size. Three different people can be listed in 3 × 2 × 1 = 6 orders. When choosing a three-person team, divide the ordered count by 6, not by 3.'
    ],
    vocabulary: [
      {term:'combination',meaning:'A selection where the members matter but their order does not.'},
      {term:'duplicate',meaning:'A second copy of an outcome already counted.'},
      {term:'group size',meaning:'The number of different members chosen.'}
    ],
    workedExamples: [
      COUNTING_QUICK.combinations.example,
      {
        question: 'Choose 2 different flavors from chocolate, vanilla, mint, and strawberry. The order of the flavors does not matter. How many pairs are possible?',
        steps: ['Ordered choices: 4 × 3 = 12. Each pair is counted in two orders.', 'Divide by 2: 12 ÷ 2 = 6 pairs.'],
        answer: '6 flavor pairs.'
      }
    ],
    check: {prompt:'Choose 2 different books from 5 for a trip. Packing order does not matter. How many pairs can you choose?',answer:'5 × 4 ÷ 2 = 10 pairs. Each unordered pair appears twice in the ordered count.'},
    parentZh: '与上一课用同样三个人对照：选队长和助手有六种，选没有职务的两人小组只有三种。不要先背公式；先让孩子指出 AB 与 BA 为什么是同一个小组，再解释除以 2 是去掉重复计数。',
    watchOut: 'Divide by the number of orders of each selected group. That is 2 for a pair and 6 for a group of three; it is not always the group size.',
    extension: 'Optional notation: choosing r different items from n, with no repeats and no roles, is written nCr = n! / (r! × (n − r)!). For 5 choose 3, 5 × 4 × 3 ÷ (3 × 2 × 1) = 10 groups. This formal formula is an extension, not required to use the counting method.'
  },
  {
    id: 'counting_repeats',
    title: 'Counting with and without repetition',
    standard: 'Supports 7.SP.C.8b: compare sample spaces under different rules',
    minutes: 8,
    goal: 'Read whether repetition is allowed and adjust the number of choices in later positions.',
    keyIdea: 'Order and repetition are separate questions. Check both before counting.',
    explanation: [
      'A code has positions, so AB and BA are different. The repeat rule answers another question: may the same letter appear more than once? You cannot decide this just from the word “code”; read the instructions.',
      'For a two-letter code made from A, B, and C with repeats allowed, list AA, AB, AC, BA, BB, BC, CA, CB, CC. There are 3 choices in each position, giving 3 × 3 = 9.',
      'If repeats are forbidden, AA, BB, and CC disappear. There are still 3 choices for the first position, but only 2 for the second: 3 × 2 = 6.',
      'This same idea appears in experiments with objects. If a selected object is put back before another draw, it remains available. If it is kept out, the next draw has fewer available objects.'
    ],
    vocabulary: [
      {term:'repetition allowed',meaning:'A choice may be used again in another position.'},
      {term:'repetition forbidden',meaning:'A used choice cannot appear again in the same result.'},
      {term:'replacement',meaning:'Putting a drawn object back before the next draw.'}
    ],
    workedExamples: [
      COUNTING_QUICK.counting_repeats.example,
      {
        question: 'Make a 3-letter code from A, B, C, and D. No letter may repeat. How many codes are possible?',
        steps: ['The positions have 4, then 3, then 2 available letters.', '4 × 3 × 2 = 24 codes. There is no division because changing the order changes the code.'],
        answer: '24 codes.'
      }
    ],
    check: {prompt:'Use A, B, C, and D for a two-letter code. How many codes allow repeats? How many forbid repeats?',answer:'Repeats allowed: 4 × 4 = 16. Repeats forbidden: 4 × 3 = 12. In both cases, AB and BA are different.'},
    parentZh: '先分别问两个问题：“顺序重要吗？”“可以重复吗？”两者不能混在一起。用 AA 是否允许来检查重复规则，再用 AB 与 BA 是否算两种来检查顺序规则。',
    watchOut: 'Do not divide by 2 simply because two letters are chosen. Codes have positions. Divide out duplicate orders only when the problem treats those orders as the same result.',
    extension: 'For three positions using A, B, C, repeats allowed gives 3 × 3 × 3 = 27 codes. With no repeats, the count is 3 × 2 × 1 = 6.'
  },
  {
    id: 'counting_probability',
    title: 'Probability from equally likely outcomes',
    standard: '7.SP.C.7a; 7.SP.C.8a–b',
    minutes: 10,
    goal: 'List equally likely outcomes and use the matching fraction to calculate a compound probability.',
    keyIdea: 'Count outcomes consistently in the numerator and denominator.',
    explanation: [
      'The sample space is the set of all possible complete outcomes. For two coin flips, record the first flip and then the second: HH, HT, TH, TT. H means heads and T means tails.',
      'For two independent flips of a fair coin, these four ordered outcomes are equally likely. Exactly one head happens in HT or TH, so its probability is 2/4 = 1/2.',
      'The categories “zero heads,” “one head,” and “two heads” are not equally likely. The middle category contains two ordered outcomes, while the others contain one each. Counting three category names would give the wrong denominator.',
      'The matching-outcomes divided by all-outcomes method requires equally likely outcomes. A table or tree helps identify the outcomes before calculating. A probability must lie between 0 and 1.'
    ],
    vocabulary: [
      {term:'sample space',meaning:'All possible complete outcomes of an experiment.'},
      {term:'event',meaning:'The outcomes that match the condition being asked about.'},
      {term:'equally likely',meaning:'Having the same chance of occurring.'}
    ],
    workedExamples: [
      COUNTING_QUICK.counting_probability.example,
      {
        question: 'Flip a fair coin and independently spin a fair spinner numbered 1, 2, 3, 4. What is the probability of heads and an even number?',
        steps: ['There are 2 × 4 = 8 equally likely outcomes: H1, H2, H3, H4, T1, T2, T3, T4.', 'H2 and H4 match. The probability is 2/8 = 1/4.'],
        answer: '1/4, or 0.25.'
      }
    ],
    check: {prompt:'Flip a fair coin twice, independently. What is the probability of two tails?',answer:'Only TT matches, out of HH, HT, TH, TT. The probability is 1/4 = 0.25.'},
    parentZh: '先把等可能的完整结果列出来，再找符合条件的结果。两次抛硬币的 HH、HT、TH、TT 是四种；“零个、一个、两个正面”这三个类别并不等可能。让孩子说明分母为什么是四。',
    watchOut: 'HT and TH are different ordered outcomes, even though both contain one head. Keep both when counting the equally likely results of two flips.',
    extension: 'Three independent fair coin flips have 2 × 2 × 2 = 8 equally likely outcomes. Exactly one head occurs in HTT, THT, or TTH, giving probability 3/8.'
  }
];

export const COUNTING_REFERENCES = [
  {
    title: 'Michigan Mathematics Standards: Grade 7 probability and sample spaces',
    url: 'https://www.michigan.gov/-/media/Project/Websites/mde/Literacy/Content-Standards/Math_Standards.pdf',
    use: 'Grade 7 standard 7.SP.C.8 supports organized lists, tables, tree diagrams, and compound probability. This chapter adds simple ordered and unordered counting as supporting extensions. Formal permutations and combinations appear explicitly in high-school S-CP.9(+), not as a required Grade 7 formula list.',
    license: 'Official state standards; linked as a scope reference. Our explanations and exercises are original.'
  },
  {
    title: 'Illustrative Mathematics, classic Grade 7 Unit 8: Probability and Sampling',
    url: 'https://im.kendallhunt.com/MS/teachers/2/8/index.html',
    use: 'Reference for representing sample spaces with lists, tables, and trees before calculating compound probabilities. The chapter uses original examples and does not reproduce the source problem sets.',
    license: 'Classic 2019 curriculum: CC BY 4.0; trademarks and individual images retain their stated terms.'
  }
];
