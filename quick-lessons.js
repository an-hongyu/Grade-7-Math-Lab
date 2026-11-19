// Short, original web lessons. The full explanations remain in content.js.
export const QUICK_LESSONS = {
  division: {
    title: 'What does division find?',
    idea: 'Division finds a missing amount. You might find how much is in each equal group, or how many groups fit.',
    rule: 'Amount in each group × number of groups = total.',
    example: {
      question: 'Share 24 counters equally among 6 bags. How many counters go in each bag?',
      steps: [
        'Counters per bag: 24 ÷ 6 = 4.',
        'Check: 6 bags × 4 counters = 24 counters.'
      ],
      answer: '4 counters per bag.'
    }
  },
  percent_decimal: {
    title: 'Percent, decimal, and fraction',
    idea: 'Percent means out of 100. A percent, a decimal, and a fraction can describe the same part of one whole.',
    rule: '25% = 25/100 = 0.25 = 1/4.',
    example: {
      question: 'A pool is 25% full. Write the filled fraction as a decimal and a fraction in simplest form.',
      steps: [
        '25% means 25 ÷ 100 = 0.25.',
        'Simplify: 25/100 = 1/4.'
      ],
      answer: '0.25, or 1/4 of the pool.'
    }
  },
  ratios: {
    title: 'Keep the same ratio',
    idea: 'A ratio compares quantities in order. In a red-to-blue ratio of 2:3, the whole has 2 + 3 = 5 equal parts.',
    rule: 'Multiply both quantities by the same factor.',
    example: {
      question: 'Use 2 red tiles for every 3 blue tiles. With 10 red tiles, how many blue tiles do you need?',
      steps: [
        'Red changed from 2 to 10: multiply by 5.',
        'Multiply blue by 5 too: 3 × 5 = 15.'
      ],
      answer: '15 blue tiles.'
    }
  },
  unit_rate: {
    title: 'Find the amount for one',
    idea: 'A unit rate tells you the amount for one. Read the units first: dollars per notebook means dollars divided by notebooks.',
    rule: 'Cost per notebook = total cost ÷ number of notebooks.',
    example: {
      question: 'Six identical notebooks cost $9. What is the price of one notebook?',
      steps: [
        'Divide dollars by notebooks: $9 ÷ 6 = $1.50.',
        'Check: 6 × $1.50 = $9.'
      ],
      answer: '$1.50 per notebook.'
    }
  },
  proportional: {
    title: 'One constant multiplier',
    idea: 'In a proportional relationship, y is always x multiplied by the same number. Its graph is a straight line through (0, 0).',
    rule: 'y = k × x, where k is the amount per one.',
    example: {
      question: 'Each notebook costs $3, with no extra fee. What is the cost of 4 notebooks?',
      steps: [
        'The multiplier is $3 per notebook: cost = 3 × number of notebooks.',
        'For 4 notebooks: 3 × 4 = 12. For 0 notebooks, the cost is $0.'
      ],
      answer: '$12 for 4 notebooks.'
    }
  },
  percent_part: {
    title: 'Find the part',
    idea: 'The whole is 100%. When you know the whole and the percent, multiply to find the part.',
    rule: 'Part = whole × decimal form of the percent.',
    example: {
      question: 'A pool holds 800 liters when full. It is 25% full. How much water is in it?',
      steps: [
        'The whole is 800 liters. Change 25% to 0.25.',
        '800 × 0.25 = 200. This is one quarter of the full pool.'
      ],
      answer: '200 liters of water.'
    }
  },
  percent_rate: {
    title: 'Find the percent',
    idea: 'Compare the part with the whole. The whole is the amount that represents 100%.',
    rule: 'Divide the part by the whole, then write the result as a percent.',
    example: {
      question: 'A pool holds 800 liters when full. It contains 200 liters. What percent full is it?',
      steps: [
        '200 ÷ 800 = 0.25 of the full pool.',
        '0.25 = 25 out of 100 = 25%.'
      ],
      answer: '25% full.'
    }
  },
  percent_whole: {
    title: 'Find the whole',
    idea: 'You know the part and its percent. Work back to the full amount: the whole is 100%.',
    rule: 'Whole = part ÷ decimal form of the percent.',
    example: {
      question: 'A pool contains 200 liters. This is 25% of its full capacity. How much can the full pool hold?',
      steps: [
        '25% is one quarter. Four quarters hold 200 × 4 = 800 liters.',
        'The division says the same thing: 200 ÷ 0.25 = 800.'
      ],
      answer: '800 liters when full.'
    }
  },
  percent_change: {
    title: 'Compare with the starting amount',
    idea: 'Percent change compares the increase or decrease with the starting amount. First find how much the amount changed.',
    rule: 'Divide the change by the starting amount, then write it as a percent.',
    example: {
      question: 'Practice time increases from 40 minutes to 50 minutes. What is the percent increase?',
      steps: [
        'Increase: 50 − 40 = 10 minutes.',
        'Compare with the start: 10 ÷ 40 = 0.25 = 25%.'
      ],
      answer: 'A 25% increase.'
    }
  },
  applications: {
    title: 'Solve one step at a time',
    idea: 'A discount lowers a price. If tax applies to the sale price, that new price is the whole for the tax calculation.',
    rule: 'Find the sale price first. Calculate tax on that price.',
    example: {
      question: 'A $40 game is 25% off. Sales tax is 10% of the sale price. What is the final cost?',
      steps: [
        'Sale price: $40 − (0.25 × $40) = $30.',
        'Tax: 0.10 × $30 = $3. Total: $30 + $3 = $33.'
      ],
      answer: '$33 including tax.'
    }
  }
};
