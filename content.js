// Original teaching text and examples. External resources are references, not copied problem banks.
export const LESSONS = [
  {
    id: 'division',
    title: 'Division: what are we finding?',
    standard: 'Grade 6 review: 6.NS.A.1, 6.NS.B.2–3; preparation for 7.RP.A.1',
    minutes: 10,
    goal: 'Explain a division calculation as equal sharing, counting groups, or finding an amount per one.',
    keyIdea: 'Division finds a missing factor. Name the quantity you want before choosing the order of the numbers.',
    explanation: [
      'In 24 ÷ 6 = 4, the answer tells us what number makes 6 × ? = 24 true. The story tells us what 6 and 4 mean. Sharing 24 counters among 6 people gives 4 counters per person. Putting 24 counters into groups of 6 gives 4 groups.',
      'For a rate, write the units in the order you want. Liters per minute means liters ÷ minutes. Minutes per liter means minutes ÷ liters. Both can describe the same situation, but they answer different questions.',
      'Division does not always make a number smaller. A small container can fit into a larger amount many times. Dividing by 0.5 asks how many halves fit, so 6 ÷ 0.5 = 12. Check a quotient by multiplying it by the divisor.'
    ],
    vocabulary: [
      { term: 'quotient', meaning: 'The result of division.' },
      { term: 'per', meaning: 'For each one; it identifies the unit in the denominator of a rate.' },
      { term: 'missing factor', meaning: 'An unknown number in a multiplication relationship.' }
    ],
    workedExamples: [
      {
        question: 'A pump adds 180 liters to a pool in 6 minutes at a steady rate. How many liters does it add each minute?',
        steps: [
          'We want liters per minute, so divide the number of liters by the number of minutes.',
          '180 ÷ 6 = 30.',
          'Check: 30 liters each minute × 6 minutes = 180 liters.'
        ],
        answer: '30 liters per minute.'
      },
      {
        question: 'There are 9 liters of juice. Each bottle holds 0.75 liter. How many full bottles can be filled?',
        steps: [
          'We are counting groups of 0.75 liter. The missing-factor equation is 0.75 × number of bottles = 9.',
          '9 ÷ 0.75 = 900 ÷ 75 = 12. Multiplying both quantities by 100 changes liters to hundredths of a liter without changing the number of groups.',
          'Check: 12 × 0.75 = 9. A bottle holds less than one liter, so more than 9 bottles is reasonable.'
        ],
        answer: '12 full bottles.'
      }
    ],
    check: {
      prompt: 'A machine makes 42 parts in 7 minutes at a steady rate. Which division gives parts per minute, and what is the result?',
      answer: '42 ÷ 7 = 6 parts per minute. The units tell us which quantity to divide by which.'
    },
    parentZh: '先让学生说出“我要找的是什么”：每份多少、能分几份，还是每一分钟多少。不要先问“用乘法还是除法”。要求写上单位，再用乘法检查答案；这部分属于六年级基础复习。',
    watchOut: 'Do not reverse the division just because one number is larger. Let the meaning and the units choose the order.',
    extension: 'A robot travels 3/4 meter in 1/2 second. Finding meters per second means (3/4) ÷ (1/2) = 3/2 = 1.5 meters per second. Check: 1.5 × 0.5 = 0.75.'
  },
  {
    id: 'percent_decimal',
    title: 'Percent, decimal, and fraction',
    standard: 'Grade 6 review: 6.RP.A.3c; connects to 7.NS.A.2d',
    minutes: 8,
    goal: 'Recognize a percent, a decimal, and a fraction as different ways to name the same amount relative to one whole.',
    keyIdea: 'Percent means per hundred. 25% = 25/100 = 0.25 = 1/4.',
    explanation: [
      'Imagine one whole divided into 100 equal pieces. Taking 35 pieces means taking 35/100 of the whole, or 35%. As a decimal, that amount is 0.35. A percent is a comparison with one whole, not a unit such as liters or dollars.',
      'To change a percent to a decimal, divide the percent number by 100. To write a decimal as a percent, multiply the decimal by 100 and attach the percent sign. The amount stays the same; only its representation changes.',
      'Use familiar landmarks to check: 10% = 0.1, 25% = 0.25, 50% = 0.5, and 100% = 1. Percentages can be above 100% when a quantity is greater than the reference amount, or below 1% when it is a very small part.'
    ],
    vocabulary: [
      { term: 'percent', meaning: 'A rate per 100, written with the % symbol.' },
      { term: 'equivalent', meaning: 'Representing the same value in different forms.' },
      { term: 'whole', meaning: 'The reference quantity that represents 100%.' }
    ],
    workedExamples: [
      {
        question: 'Write 35% as a decimal and as a fraction in simplest form.',
        steps: [
          '35% means 35 out of every 100: 35/100.',
          '35 ÷ 100 = 0.35.',
          'Divide the numerator and denominator of 35/100 by 5: 35/100 = 7/20.',
          'Check: 35% is less than 50%, and both 0.35 and 7/20 are less than one half.'
        ],
        answer: '35% = 0.35 = 7/20.'
      },
      {
        question: 'A battery indicator shows 0.8 of a full charge. What percentage of a full charge is this?',
        steps: [
          'One full charge is 1, which is 100%.',
          '0.8 = 80/100, so the indicator represents 80%.',
          'Check: 0.8 is more than one half and less than one whole. 80% fits that description.'
        ],
        answer: '80% of a full charge.'
      }
    ],
    check: {
      prompt: 'Write 0.06 as a percentage. Is it the same as 60%?',
      answer: '0.06 = 6%. It is six hundredths. 60% = 0.60, which is ten times as large.'
    },
    parentZh: '把百分数、小数和分数放在同一条线上比较。重点区分 6%、0.06 和 0.6；让学生用“每一百份中的几份”解释，而不是只背小数点移动规则。',
    watchOut: 'The percent sign already means divide by 100. 25% is 0.25, not 25 and not 0.025.',
    extension: '150% = 1.5 = 3/2, which is one and a half times the reference amount. 0.5% = 0.005, which is half of one percent.'
  },
  {
    id: 'ratios',
    title: 'Ratios: keep the relationship',
    standard: 'Grade 6 review: 6.RP.A.1, 6.RP.A.3; preparation for 7.RP.A.2',
    minutes: 10,
    goal: 'Distinguish part-to-part from part-to-whole comparisons and make equivalent ratios.',
    keyIdea: 'An equivalent ratio multiplies both quantities by the same factor.',
    explanation: [
      'A ratio compares two quantities in a stated order. A red-to-blue ratio of 2:3 means 2 red objects for every 3 blue objects. The order matters: blue to red is 3:2.',
      'A 2:3 red-to-blue ratio does not mean that 2/3 of all the objects are red. There are 2 + 3 = 5 equal ratio parts altogether, so the red fraction of the total is 2/5. Always ask whether the comparison is with another part or with the whole.',
      'To preserve the relationship, scale both quantities by the same factor. Doubling 2:3 gives 4:6. Adding the same number to both quantities usually changes the ratio: 3:4 is a different mixture from 2:3.'
    ],
    vocabulary: [
      { term: 'ratio', meaning: 'A comparison of two quantities in a specified order.' },
      { term: 'equivalent ratios', meaning: 'Ratios that describe the same multiplicative relationship.' },
      { term: 'scale factor', meaning: 'The multiplier applied to each quantity to make an equivalent ratio.' }
    ],
    workedExamples: [
      {
        question: 'A mosaic uses red and blue tiles in a ratio of 2:3. If it uses 10 red tiles, how many blue tiles does it need?',
        steps: [
          'The red quantity changes from 2 to 10, a scale factor of 10 ÷ 2 = 5.',
          'Apply the same factor to blue: 3 × 5 = 15.',
          'Check: 10:15 simplifies to 2:3. The total is 25 tiles; red is 10/25 = 2/5 of the total.'
        ],
        answer: '15 blue tiles.'
      },
      {
        question: 'A different mosaic has 30 tiles in the same red-to-blue ratio of 2:3. How many tiles of each color are there?',
        steps: [
          'There are 2 + 3 = 5 equal ratio parts in the whole mosaic.',
          'Each ratio part represents 30 ÷ 5 = 6 tiles.',
          'Red: 2 × 6 = 12. Blue: 3 × 6 = 18.',
          'Check both conditions: 12 + 18 = 30, and 12:18 simplifies to 2:3.'
        ],
        answer: '12 red tiles and 18 blue tiles.'
      }
    ],
    check: {
      prompt: 'A bag has green and yellow counters in a ratio of 3:2. What fraction of all the counters is green?',
      answer: '3/(3 + 2) = 3/5. The denominator counts all five ratio parts.'
    },
    parentZh: '最容易混淆的是“部分比部分”和“部分占整体”。2:3 的整体是 5 份，不是 3 份。可以画五个等大的小格，先看整体，再算每一份。',
    watchOut: 'A part-to-part ratio is not automatically a fraction of the total. Identify what each number counts.',
    extension: 'For a drink mixed from 2 cups concentrate and 3 cups water, the concentrate is 2/5 = 40% of the mixture, assuming the volumes add. Doubling the recipe changes the amount but preserves 40%.'
  },
  {
    id: 'unit_rate',
    title: 'Unit rates: find the amount per one',
    standard: '7.RP.A.1; 7.RP.A.2b',
    minutes: 10,
    goal: 'Calculate and interpret a unit rate, including when the given quantities are fractions.',
    keyIdea: 'A unit rate compares a quantity with one unit of another quantity.',
    explanation: [
      'A unit rate makes comparisons easier. A package price alone does not tell us which package is the better buy. Dollars per notebook compares the cost of one notebook, so divide dollars by notebooks.',
      'The same idea works with fractions. If a distance is traveled in half an hour, finding the distance in one hour means scaling the time by 2 and scaling the distance by 2. Dividing by 1/2 performs that scaling.',
      'Read the units aloud. Miles per hour and hours per mile are reciprocal rates. Neither is automatically wrong, but only one answers a particular question. A larger speed is faster; a smaller cost per item is cheaper.'
    ],
    vocabulary: [
      { term: 'unit rate', meaning: 'An amount for one unit of another quantity.' },
      { term: 'unit price', meaning: 'The cost of one item or one unit of measure.' },
      { term: 'reciprocal rate', meaning: 'The rate with the quantities reversed, such as minutes per liter instead of liters per minute.' }
    ],
    workedExamples: [
      {
        question: 'A walker travels 3/4 mile in 1/2 hour at a steady speed. What is the speed in miles per hour?',
        steps: [
          'We want miles ÷ hours: (3/4) ÷ (1/2).',
          'One hour contains two half-hours, so the distance in one hour is 2 × 3/4 = 3/2 miles.',
          '(3/4) ÷ (1/2) = (3/4) × 2 = 1.5.',
          'Check: 1.5 miles per hour × 0.5 hour = 0.75 mile.'
        ],
        answer: '1.5 miles per hour.'
      },
      {
        question: 'Pack A contains 6 identical notebooks for $9. Pack B contains 4 of the same notebooks for $7. Which has the lower price per notebook?',
        steps: [
          'Pack A: $9 ÷ 6 = $1.50 per notebook.',
          'Pack B: $7 ÷ 4 = $1.75 per notebook.',
          'Compare equal units: $1.50 is $0.25 less than $1.75.',
          'Pack B costs less per package, but Pack A costs less for each notebook.'
        ],
        answer: 'Pack A, at $1.50 per notebook.'
      }
    ],
    check: {
      prompt: 'A robot travels 2.4 meters in 3 seconds at a steady speed. What is its speed in meters per second?',
      answer: '2.4 ÷ 3 = 0.8 meter per second. Check: 0.8 × 3 = 2.4.'
    },
    parentZh: '先把目标单位写出来，例如 dollars/notebook 或 meters/second，再对应分子和分母。分数除法先用“半小时到一小时扩大几倍”解释，然后再连接到乘倒数。',
    watchOut: 'A cheaper package is not always a cheaper unit price. Compare the same units and comparable items.',
    extension: 'At 0.8 meter per second, the time for one meter is 1 ÷ 0.8 = 1.25 seconds per meter. These two rates describe the same motion in opposite unit directions.'
  },
  {
    id: 'proportional',
    title: 'Proportional relationships: tables, equations, graphs',
    standard: '7.RP.A.2a–d',
    minutes: 12,
    goal: 'Connect a constant unit rate with a table, the equation y = kx, and a graph through the origin.',
    keyIdea: 'A proportional relationship has one constant multiplier: y = kx.',
    explanation: [
      'In a proportional relationship, multiplying one quantity by a factor multiplies the other by the same factor. For positive x-values in a table, the ratio y ÷ x stays constant. That constant is k in the equation y = kx.',
      'On a graph, x is the horizontal coordinate and y is the vertical coordinate. A proportional relationship lies on a straight line through (0, 0). The point (1, k) gives the amount of y for one unit of x. Each point must be interpreted using the quantities and units from the situation.',
      'A straight line alone is not enough. The rule y = kx + b has a starting amount b. When b is not zero, the line does not pass through the origin and the relationship is not proportional, even if y increases by a constant amount whenever x increases by one.'
    ],
    vocabulary: [
      { term: 'constant of proportionality', meaning: 'The fixed multiplier k in y = kx; it is the unit rate.' },
      { term: 'origin', meaning: 'The graph point (0, 0).' },
      { term: 'coordinate pair', meaning: 'A point (x, y) giving corresponding values of the two quantities.' }
    ],
    workedExamples: [
      {
        question: 'Each notebook costs $3 with no extra fee. Let x be the number of notebooks and y be the cost in dollars. Represent the relationship.',
        steps: [
          'A table can use these pairs: (0, 0), (1, 3), (2, 6), and (4, 12).',
          'For nonzero x, the ratios are 3 ÷ 1 = 3, 6 ÷ 2 = 3, and 12 ÷ 4 = 3.',
          'The constant is k = 3 dollars per notebook, so y = 3x.',
          'The points lie on a straight line through the origin. (0, 0) means no notebooks cost $0; (1, 3) means one notebook costs $3. Only whole-number x-values represent purchases of whole notebooks.'
        ],
        answer: 'The relationship is proportional, with y = 3x and k = 3 dollars per notebook.'
      },
      {
        question: 'A delivery service charges a $5 starting fee plus $2 per kilometer. Is cost proportional to distance?',
        steps: [
          'Let x be kilometers and y be dollars. The rule is y = 2x + 5.',
          'A table includes (0, 5), (1, 7), and (3, 11). The starting fee makes the zero-distance cost $5.',
          'The ratios 7 ÷ 1 and 11 ÷ 3 are not equal.',
          'The graph is a straight line, but it passes through (0, 5), not (0, 0).'
        ],
        answer: 'No. The nonzero starting fee makes the relationship nonproportional.'
      }
    ],
    check: {
      prompt: 'A table has pairs (1, 4), (2, 8), and (3, 12). What proportional rule fits? What point should it include when x = 0?',
      answer: 'y = 4x fits every given pair. A proportional rule also includes (0, 0). A few matching pairs support this rule; the context or rule must establish that it continues.'
    },
    parentZh: '让学生在表格、y=kx 和图像之间来回翻译。关键问题是“买零个时花多少钱”和“每一个多少钱”。直线不一定是正比例；有固定起步费的 y=kx+b 就是很好的反例。',
    watchOut: 'Do not divide by x = 0 when checking a table. Check the origin separately and compare y/x only where x is nonzero.',
    extension: 'A scale drawing with 1 centimeter representing 4 meters uses actual length = 4 × drawing length when those units are fixed. Lengths scale by a constant; areas scale by the square of the length scale factor when both lengths use the same units.'
  },
  {
    id: 'percent_part',
    title: 'Find the part: a percent of a whole',
    standard: 'Grade 6 review: 6.RP.A.3c; foundation for 7.RP.A.3',
    minutes: 8,
    goal: 'Find a part when the whole and percentage are known, and explain why multiplication fits.',
    keyIdea: 'Part = whole × percent as a decimal.',
    explanation: [
      'First identify 100%. It is the whole named in the problem: a full capacity, an original price, or a total number of objects. The percent tells you what fraction of that whole to take.',
      'To find 25% of a whole, take 25/100 = 1/4 of it. Multiplication scales the whole to the requested part. You can also reason through 1%, 10%, or another easy benchmark; the methods describe the same relationship.',
      'Check whether the part is reasonable. For a percent between 0% and 100%, the part should be between zero and the whole. If the percent is over 100%, the result may be greater than the reference whole.'
    ],
    vocabulary: [
      { term: 'part', meaning: 'The amount corresponding to the stated percentage.' },
      { term: 'reference whole', meaning: 'The quantity that is 100% in this problem.' },
      { term: 'benchmark percent', meaning: 'An easy percentage, such as 10%, 25%, or 50%, used to reason.' }
    ],
    workedExamples: [
      {
        question: 'A pool holds 800 liters when full. It is 25% full. How much water is in the pool?',
        steps: [
          'The whole is the full capacity: 800 liters = 100%. We are looking for the water amount, the part.',
          '25% = 0.25 = 1/4.',
          'Part = 800 × 0.25 = 200 liters. Equivalently, 800 ÷ 4 = 200.',
          'Check: four equal 200-liter parts make the full 800 liters.'
        ],
        answer: '200 liters of water.'
      },
      {
        question: 'A club orders 50 shirts. Eighteen percent are green. How many green shirts does it order?',
        steps: [
          'The whole is 50 shirts. The part is the number of green shirts.',
          '18% = 0.18, so 50 × 0.18 = 9.',
          'A benchmark check: 20% of 50 is 10. Since 18% is a little smaller, 9 is reasonable.'
        ],
        answer: '9 green shirts.'
      }
    ],
    check: {
      prompt: 'A tank holds 300 liters when full and is 40% full. Find the water amount and name the whole.',
      answer: 'The whole is 300 liters. The water amount is 300 × 0.40 = 120 liters.'
    },
    parentZh: '固定提问：“这里的 100% 是多少？”再问“现在求的是部分、整体还是百分数？”游泳池三道关联例题保持 800 L、25%、200 L 不变，只改变未知量，帮助学生看清结构。',
    watchOut: 'Multiply by the decimal percent, not by the whole-number percent label: 25% means ×0.25, not ×25.',
    extension: 'Compare 25% of 800 with 800% of 25. Both equal 200, but the reference whole and the meaning of the comparison are different.'
  },
  {
    id: 'percent_rate',
    title: 'Find the percent: compare part with whole',
    standard: '6.RP.A.3c review; 7.RP.A.3',
    minutes: 8,
    goal: 'Find the percentage when the part and the reference whole are known.',
    keyIdea: 'Percent = (part ÷ whole) × 100%.',
    explanation: [
      'When you know the part and whole, first find the fraction of the whole. Part ÷ whole gives a decimal comparison. Converting that decimal to a percentage expresses the comparison per hundred.',
      'The reference whole belongs in the denominator. If 200 liters are in an 800-liter pool, we compare the water with the full capacity: 200/800. Reversing the numbers answers how many times the water amount fits into the capacity, which is a different question.',
      'Percentages let us compare different-sized totals fairly. Eighteen correct answers out of 24 and 30 correct answers out of 40 both represent 75%, even though the counts differ.'
    ],
    vocabulary: [
      { term: 'percent rate', meaning: 'The part expressed as a number of hundredths of the whole.' },
      { term: 'denominator', meaning: 'The number below a fraction bar; here it represents the reference whole.' },
      { term: 'relative amount', meaning: 'An amount compared with a chosen reference quantity.' }
    ],
    workedExamples: [
      {
        question: 'A pool contains 200 liters of water and holds 800 liters when full. What percent full is it?',
        steps: [
          'The part is 200 liters. The whole, or 100%, is 800 liters.',
          'Part ÷ whole = 200 ÷ 800 = 0.25.',
          '0.25 = 25%.',
          'Check by reversing the calculation: 25% of 800 is 200.'
        ],
        answer: 'The pool is 25% full.'
      },
      {
        question: 'A learner answers 18 of 24 questions correctly. What percentage is correct?',
        steps: [
          'The reference whole is all 24 questions, and the correct part is 18.',
          '18 ÷ 24 = 3/4 = 0.75.',
          '0.75 × 100% = 75%.',
          'Check: one quarter of 24 is 6; three quarters is 18.'
        ],
        answer: '75% correct.'
      }
    ],
    check: {
      prompt: 'There are 12 blue beads in a collection of 40 beads. What percentage of all the beads is blue?',
      answer: '(12 ÷ 40) × 100% = 30%. The whole is 40 beads, not the 28 beads of other colors.'
    },
    parentZh: '如果学生写成 800÷200，不要只说“除反了”。问他这个算式比较的是谁和谁，再让他把“水量占容量”写成 200/800。答案得到 0.25 后，还需要表达成 25%。',
    watchOut: 'Do not compare the part with the leftover amount unless the question explicitly asks for that comparison.',
    extension: 'A team collects 60 cans against a goal of 40 cans. Relative to the goal, 60 ÷ 40 = 1.5 = 150%. A percentage above 100% can make sense when the reference is a goal.'
  },
  {
    id: 'percent_whole',
    title: 'Find the whole: work back to 100%',
    standard: '6.RP.A.3c review; 7.RP.A.3; connects to 7.EE.B.4a',
    minutes: 10,
    goal: 'Find the whole from a known part and percentage, using a diagram idea, a unit-percent strategy, or an equation.',
    keyIdea: 'Whole = part ÷ percent as a decimal, when the percent is nonzero.',
    explanation: [
      'A known amount is not always the whole. If a pool is 25% full and contains 200 liters, the 200 liters are only one quarter of its capacity. We must rebuild 100% from the known part.',
      'Start from the relationship part = decimal percent × whole. Finding the whole is a missing-factor problem, so divide the part by the decimal percent. For familiar percentages, you can also count equal parts: four 25% parts make 100%.',
      'A unit-percent table offers another route. If 25% corresponds to 200 liters, then 1% corresponds to 200 ÷ 25 = 8 liters, and 100% corresponds to 8 × 100 = 800 liters. Distinguish dividing by 25 to find 1% from dividing by 0.25 to find the whole.'
    ],
    vocabulary: [
      { term: 'unknown whole', meaning: 'The missing reference quantity that represents 100%.' },
      { term: 'inverse operation', meaning: 'An operation that reverses another; division reverses multiplication by a nonzero number.' },
      { term: 'unit-percent strategy', meaning: 'Find the amount for 1%, then scale it to the desired percentage.' }
    ],
    workedExamples: [
      {
        question: 'A pool is 25% full and contains 200 liters of water. How many liters does it hold when full?',
        steps: [
          'The known 200 liters are the part. The unknown capacity is 100%.',
          'Let W be the full capacity. Then 0.25 × W = 200.',
          'W = 200 ÷ 0.25 = 800. Equivalently, four quarters give 4 × 200 = 800.',
          'Check: 25% of 800 is 200; the full pool should hold more than its current water amount.'
        ],
        answer: '800 liters when full.'
      },
      {
        question: 'Eighteen students, which is 60% of a club, attend a workshop. How many students are in the club?',
        steps: [
          'The attending part is 18. The whole club represents 100%.',
          '0.60 × whole = 18, so whole = 18 ÷ 0.60 = 30.',
          'Using equal percent groups: 60% is six 10% groups, so 10% is 18 ÷ 6 = 3 students. Ten such groups give 30 students.',
          'Check: 0.60 × 30 = 18.'
        ],
        answer: '30 students in the club.'
      }
    ],
    check: {
      prompt: 'Forty percent of a reading goal is 32 pages. What is the full goal?',
      answer: '32 ÷ 0.40 = 80 pages. Check: 40% of 80 is 32.'
    },
    parentZh: '这是最需要区分“已知量”和“整体”的一课。看到 200 L 不代表它就是整体。先在纸上写“25% ↔ 200 L，100% ↔ ?”，再选择分成四份、求 1% 或列方程的方法。',
    watchOut: 'Multiplying the known part by the percentage finds a smaller part of that part. It does not recover the original whole.',
    extension: 'If 0% of an unknown whole is 0, that information cannot determine the whole. This is why the whole-finding division requires a nonzero percentage.'
  },
  {
    id: 'percent_change',
    title: 'Percent change: name the starting amount',
    standard: '7.RP.A.3; 7.EE.A.2; 7.EE.B.3',
    minutes: 10,
    goal: 'Distinguish the change from the final amount and use the original amount as the percent-change reference.',
    keyIdea: 'Percent change compares the change with the original amount. New amount = original × (1 ± decimal rate).',
    explanation: [
      'An increase or decrease has three quantities: the original amount, the change, and the new amount. A 20% discount is the amount removed; it is not the sale price. The original amount is 100%.',
      'To find a percent increase, divide the increase by the original amount, then convert to a percent. To find a percent decrease, divide the decrease by the original amount. Using the new amount as the denominator answers a different comparison.',
      'A 20% increase leaves 120% of the original, so multiply by 1.20. A 20% decrease leaves 80%, so multiply by 0.80. These are compact versions of adding or subtracting 20% of the original.'
    ],
    vocabulary: [
      { term: 'original amount', meaning: 'The starting value, used as the reference for percent change.' },
      { term: 'increase', meaning: 'The amount added to the original.' },
      { term: 'decrease', meaning: 'The amount removed from the original.' }
    ],
    workedExamples: [
      {
        question: 'A club grows from 60 members to 75 members. What is the percent increase?',
        steps: [
          'Find the increase: 75 − 60 = 15 members.',
          'Compare the increase with the original 60: 15 ÷ 60 = 0.25.',
          '0.25 = 25%.',
          'Check: 60 × 1.25 = 75. The new membership is 125% of the old membership, so the increase is 25%.'
        ],
        answer: 'A 25% increase.'
      },
      {
        question: 'An $80 jacket is discounted by 20%. Find the discount amount and the sale price before any tax.',
        steps: [
          'The original $80 is 100%. The discount amount is 80 × 0.20 = $16.',
          'Subtract the discount: 80 − 16 = $64.',
          'Equivalent method: 100% − 20% = 80% remains, and 80 × 0.80 = $64.',
          'Check: the $16 discount plus the $64 sale price equals the original $80.'
        ],
        answer: '$16 discount; $64 sale price before tax.'
      }
    ],
    check: {
      prompt: 'A value changes from 50 to 40. What is the decrease, and what is the percent decrease?',
      answer: 'The decrease is 10. The percent decrease is (10 ÷ 50) × 100% = 20%.'
    },
    parentZh: '要求学生分别标出 original、change、new 三个量。“降价 20%”与“剩下 20%”不同。计算增长率或下降率时，分母是变化前的量；先说明比较基准再计算。',
    watchOut: 'A rise of 20% followed by a fall of 20% does not return to the start: the second percent uses a different reference amount.',
    extension: 'Starting with 100, a 20% increase gives 120. A subsequent 20% decrease gives 120 × 0.80 = 96. For an original value of zero, the usual percent-change formula is undefined.'
  },
  {
    id: 'applications',
    title: 'Use percentages in more than one step',
    standard: '7.RP.A.3; 7.EE.B.3',
    minutes: 12,
    goal: 'Choose the correct reference amount at each step of a real-world percent problem.',
    keyIdea: 'Label the whole for every percentage. It may change from one step to the next.',
    explanation: [
      'A multistep problem is a sequence of smaller relationships. Read what each percentage applies to: the original price, a discounted price, a bill before tax, or an initial amount of money. Write that reference next to the percentage before calculating.',
      'A discount followed by tax usually uses two different reference amounts when the problem says tax applies to the discounted price. Do not simply subtract the discount percentage and add the tax percentage. Follow the amounts through the story.',
      'Other Grade 7 applications include simple interest and percent error. This first workbook introduces those ideas, but its main practice focus is ratios, rates, part–whole percentages, and changes. Further multistep work and later Grade 7 topics remain part of the full-year course.'
    ],
    vocabulary: [
      { term: 'subtotal', meaning: 'An amount calculated before a later charge or adjustment.' },
      { term: 'principal', meaning: 'The initial money amount used to calculate simple interest.' },
      { term: 'simple interest', meaning: 'Interest calculated from the original principal for each time period, without interest on previous interest.' },
      { term: 'percent error', meaning: 'The absolute difference from a nonzero reference value, expressed as a percent of the reference magnitude.' }
    ],
    workedExamples: [
      {
        question: 'A game costs $50 before a 20% discount. A 6% sales tax is then applied to the discounted price. What is the total?',
        steps: [
          'Discount reference: the original $50. The discount is 50 × 0.20 = $10.',
          'Discounted subtotal: 50 − 10 = $40.',
          'Tax reference: the discounted $40. Tax is 40 × 0.06 = $2.40.',
          'Total: 40 + 2.40 = $42.40. Equivalent calculation: 50 × 0.80 × 1.06.',
          'Check: the total is above $40 because of tax, but below the original $50.'
        ],
        answer: '$42.40. The stated 6% rate is an exercise assumption.'
      },
      {
        question: 'An account starts with $400 and earns simple interest at 5% per year for 2 years. With no deposits, withdrawals, or fees, how much interest is earned and what is the final amount?',
        steps: [
          'The principal is $400. The annual rate is 5% = 0.05, and the time is 2 years.',
          'Simple interest each year is 400 × 0.05 = $20, always using the original $400.',
          'Total interest = principal × annual rate × years = 400 × 0.05 × 2 = $40.',
          'Final amount = 400 + 40 = $440. The $40 interest and the $440 final amount answer different questions.'
        ],
        answer: '$40 interest; $440 final amount.'
      }
    ],
    check: {
      prompt: 'A restaurant bill is $30 before a tip. The tip is 15% of that $30, with no other charges in this exercise. Find the tip and total.',
      answer: 'Tip = 30 × 0.15 = $4.50. Total = 30 + 4.50 = $34.50.'
    },
    parentZh: '多步骤题每做一步都重新标出百分数的基准。例如先打折，再按折后价计算税。练习中的税率只是题目设定。单利和百分误差在本册先介绍，不能因此认为已完整覆盖七年级所有应用。',
    watchOut: 'Do not combine percentages until you know they use the same reference amount. Keep the interest, discount, tip, or tax amount separate from the final total.',
    extension: 'Percent error example: a sensor reports 48 cm when the reference length is 50 cm. The absolute difference is |48 − 50| = 2 cm. Percent error = (2 ÷ 50) × 100% = 4%. The reading is low, but the usual absolute percent error is positive. More generally use |measured − reference| ÷ |reference| × 100%, with a nonzero reference.'
  }
];

// A suggested sequence for home learning, not a Michigan-mandated semester syllabus.
export const ROADMAP = [
  { weeks: '1–2', focus: 'Meaning of division; fraction, decimal, and percent connections', standards: '6.NS review; 6.RP.A.3c; preparation for 7.NS.A.2d', status: 'Foundation lessons included in this first edition.' },
  { weeks: '3–4', focus: 'Ratios, part-to-part versus part-to-whole, and unit rates', standards: '6.RP review; 7.RP.A.1; 7.RP.A.2b', status: 'Lessons included; revisit division when needed.' },
  { weeks: '5–6', focus: 'Proportional tables, y = kx, graph meaning, and nonproportional examples', standards: '7.RP.A.2a–d', status: 'Introductory lesson included; add hand-drawn graph practice.' },
  { weeks: '7–8', focus: 'Find the part, the percentage, and the whole; mix the three question types', standards: '6.RP.A.3c review; 7.RP.A.3; 7.EE.B.4a connection', status: 'Core focus of this first edition.' },
  { weeks: '9–10', focus: 'Percent change, discounts, tax, tips; introductions to simple interest and percent error', standards: '7.RP.A.3; 7.EE.A.2; 7.EE.B.3', status: 'Lessons included; extend multistep applications after the foundations are secure.' },
  { weeks: '11–12', focus: 'Positive and negative rational numbers; all four operations; terminating and repeating decimals', standards: '7.NS.A.1–3', status: 'Next-volume topic; not fully taught by this workbook.' },
  { weeks: '13–14', focus: 'Equivalent expressions, equations, inequalities, and reasonableness checks', standards: '7.EE.A.1–2; 7.EE.B.3–4', status: 'Next-volume topic; this workbook provides percent and equation connections only.' },
  { weeks: '15–16', focus: 'Scale drawings and circles; cumulative projects and review', standards: '7.G.A.1; 7.G.B.4', status: 'Suggested later fall work; geometry and statistics/probability still need fuller study across the year.' }
];

export const REFERENCES = [
  { title: 'Michigan K–12 Mathematics Standards', url: 'https://www.michigan.gov/mde/-/media/Project/Websites/mde/Literacy/Content-Standards/Math_Standards.pdf', license: 'Official state standards; linked as an alignment reference.', use: 'Grade 6 prerequisites and Grade 7 annual learning expectations. Standard descriptions in this workbook are brief paraphrases.' },
  { title: 'Michigan Academic Standards: role of local curriculum', url: 'https://www.michigan.gov/mde/services/academic-standards/michigan-academic-standards', license: 'Official state guidance; linked, not republished.', use: 'Clarifies that local curriculum sets instructional resources and progressions. The 16-week roadmap here is an author suggestion.' },
  { title: 'Illustrative Mathematics, classic Grade 7 Unit 2', url: 'https://im.kendallhunt.com/MS/teachers/2/2/index.html', license: 'Classic 2019 curriculum: CC BY 4.0; trademarks and some images have separate terms.', use: 'Reference for connecting proportionality across tables, equations, graphs, and unit rates. Our examples are original.' },
  { title: 'Illustrative Mathematics, classic Grade 7 Unit 4', url: 'https://im.kendallhunt.com/MS/teachers/2/4/index.html', license: 'Classic 2019 curriculum: CC BY 4.0; check asset-specific notices before reuse.', use: 'Reference for fractional rates, percentage representations, and real-world applications. Our explanations and questions are original.' },
  { title: 'Eureka Math, Grade 7 Module 1 teacher edition', url: 'https://greatminds.org/hubfs/knowledge/resources/math/EM_Basic_Curriculum_Files/Teacher_Editions/G7_TeacherEditions/EM_G7_M1_TeacherEdition.pdf', license: 'Inspected classic edition: CC BY-NC-SA 4.0 for noncommercial use.', use: 'Reference for a structured progression from proportionality to fractional rates and scale drawings. Percent extensions appear later in Module 4; no problem sets are copied here.' },
  { title: 'Utah Middle School Math Project: Grade 7 student workbook', url: 'https://www.uen.org/emedia/resources/MSM/7-Student-Workbook-Complete.pdf', license: 'The published PDF identifies Creative Commons CC-BY; verify its exact edition notice before adapting.', use: 'A substantial free printable workbook model, with varied exercises and review. This is a large PDF download.' },
  { title: 'Open Up Resources: official licensing information', url: 'https://www.openupresources.org/help-support/licensing-questions/', license: 'Edition-specific: first/second editions generally CC BY 4.0; third edition generally CC BY-NC 4.0, with stated exclusions.', use: 'Distinguishes free access from permission to republish; consult before adapting assessments, images, or text.' },
  { title: 'Khan Academy: Grade 7 Eureka Math/EngageNY course', url: 'https://www.khanacademy.org/math/engageny/on-grade-engageny/7th-engage-ny', license: 'Free learning access; reuse depends on the particular content and current terms.', use: 'Optional external video and practice support for proportionality, percents, rational numbers, and later Grade 7 topics.' },
  { title: 'Khan Academy: official content-reuse guidance', url: 'https://support.khanacademy.org/hc/en-us/articles/202262954-Can-I-use-Khan-Academy-s-videos-name-materials-links-in-my-project', license: 'Eligible materials have attribution, noncommercial, and share-alike requirements; the platform is not licensed for copying.', use: 'Explains why linking a free learning resource does not imply unrestricted permission to copy its entire content or service.' }
];

export const PARENT_GUIDE = [
  {
    heading: 'Start with meaning, then calculate',
    body: 'Ask what quantity is unknown, what the units mean, and which amount represents 100%. Let the learner sketch equal parts or a small table before choosing an operation. A correct calculation with the wrong reference whole still needs discussion.',
    zh: '先问未知量、单位和 100% 是什么。可以画等份图或小表格，再选择运算。计算本身正确，并不代表题意理解正确。'
  },
  {
    heading: 'Change one feature at a time',
    body: 'First keep the story and change the numbers. Next keep the relationship and change the story. Finally mix part, percent, and whole questions so the learner must identify the structure. Invite a short explanation or a multiplication check, not only an answer.',
    zh: '先同情境换数字，再同结构换情境，最后混合不同未知量。让学生解释一句“为什么这样算”或用逆运算检查，避免只认题目外形。'
  },
  {
    heading: 'Use hints as teaching evidence',
    body: 'An answer reached after a hint is useful progress, but it is different from an independent first attempt. If errors repeat, use a worked example and an easier related question. Keep sessions manageable, pause when needed, and revisit the idea on another day.',
    zh: '提示后做对也有价值，但应与首次独立做对区分。连续出错时回到一个讲解例题，再做更简单的关联题；不要把同样的困难无限重复下去。'
  },
  {
    heading: 'Treat adaptation as a practical guide',
    body: 'The practice system uses tagged skills, answer attempts, and explicit selection rules to choose follow-up problems. It does not diagnose a learner, infer personality, or provide a scientifically validated mastery score. Use its progress indicators together with the learner’s explanations, new contexts, and later review.',
    zh: '自适应按知识点、答题记录和明确规则调整后续练习，不是人格判断，也不是经过验证的掌握度测量。需要结合口头解释、换情境后的表现和隔天复习来判断。'
  },
  {
    heading: 'Know where progress is kept',
    body: 'Progress is stored locally in the browser on the current device. It is not automatically shared with a parent on another device or synchronized through GitHub. Clearing site data, changing browsers, or using private browsing can remove or separate the record. Use any available export control when you want to keep a copy.',
    zh: '进度保存在当前设备的浏览器中，不会通过 GitHub 自动同步到家长的其他设备。清理网站数据、换浏览器或使用隐私模式可能导致记录丢失或分开；需要留存时可使用页面提供的导出功能。'
  }
];
