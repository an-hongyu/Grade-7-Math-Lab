# Grade 7 Math Lab

**An interactive mathematics book with original lessons, adaptive practice, and printable workbooks.**

Two online chapters, with English student lessons and optional Chinese parent notes:

1. **Ratios, Rates & Percentages** — ten lessons, from division foundations to multistep percentage problems.
2. **Counting, Permutations & Combinations** — five lessons: counting choices, ordered arrangements, unordered groups, repetition, and counting-based probability.

The book develops selected Grade 7 skills and supporting foundations/extensions. It is not a complete Grade 7 course.

## Read and use the book

- Website: https://an-hongyu.github.io/Grade-7-Math-Lab/
- Chapter 1 contents: https://an-hongyu.github.io/Grade-7-Math-Lab/#chapter/ratios
- Chapter 2 contents: https://an-hongyu.github.io/Grade-7-Math-Lab/#chapter/counting
- Chapter 2 first lesson: https://an-hongyu.github.io/Grade-7-Math-Lab/#learn/counting_choices
- Chapter 2 practice: https://an-hongyu.github.io/Grade-7-Math-Lab/#practice/counting
- Chapter 1 student PDF: [Grade-7-Math-Student-Workbook.pdf](downloads/Grade-7-Math-Student-Workbook.pdf)
- Chapter 1 answer PDF: [Grade-7-Math-Answer-Guide.pdf](downloads/Grade-7-Math-Answer-Guide.pdf)

The root URL opens a book introduction with direct links to both chapters. A left contents sidebar keeps **Book home**, **Chapter 1**, and **Chapter 2** available, with the active chapter’s lessons underneath. On small screens the sidebar becomes a **Contents** disclosure. Each chapter has its own introduction and lesson list. Each of the fifteen lessons now includes a learning goal, three short reasoning paragraphs, an original teaching figure with a caption, a four-step worked example, a quick check, and **Practice this idea**. Extra examples and interactive models expand on request. Previous/next lesson links support sequential reading; existing lesson and practice deep links still work. **Progress / Print / Parents** remain secondary footer tools. Select **家长中文** on the Parents page to reveal Chinese parent notes. Chapter 1 PDFs and fresh printable sheets for either chapter are available under Print.

### A useful first session

1. Open the book's percentage lesson. Identify what represents 100%. Expand **Try the pool model** if a moving picture helps.
2. Compare three questions using the same quantities: 25% of 800 L; 200 L out of 800 L; and 200 L as 25% of an unknown capacity.
3. Read the worked example for the quantity that is confusing.
4. Complete an eight-question starting check or a focused practice session.
5. Use the answer feedback and return after a break. Large question banks do not require long sessions.

## What's included

| Area | Current online edition |
|---|---|
| Lessons | 15 lessons across 2 chapters; visible reasoning, 15 original teaching figures, worked examples, self-checks, and optional extra detail |
| Skills | Division, percent/decimal/fraction, ratios, unit rates, proportional relationships, finding a part, finding a percent, finding a whole, percent change, applications, counting choices, permutations, combinations, repeated choices, and compound probability |
| Chapter 1 PDF workbook | 8 diagnostic questions, 120 graduated practice questions, and 12 explanation/mistake-analysis questions; 140 numbered exercises plus lesson self-checks |
| Online formats | Numeric/fraction entry and multiple choice |
| Difficulty | Three levels, with new quantities and contexts |
| Printing | Chapter-specific fresh sheets of 8, 12, 20, or 40 questions, with optional answer keys |
| Parents | Local progress view, export, English guidance and Chinese notes |
| Curriculum | Michigan standards map and a suggested 16-week fall sequence |

The full-year roadmap includes material not yet developed in this volume, including signed-number operations, broader equations and inequalities, geometry, statistics, and broader probability. Chapter 2 includes simple counting-based probability. Chapter 1 lessons introduce proportional graphs and equations; the online generator concentrates on numerical problems. Short-answer explanations in the PDF are reviewed by an adult, not automatically scored.

## How adaptive practice works

All problems come from original templates. The engine computes the answers; no external model generates or grades questions at runtime.

- Each chapter has an eight-question starting check. Chapter 2 samples its five skills.
- Practice, remediation, review, progress tables, and mixed worksheets stay within the selected chapter.
- An incorrect answer or a hint causes more practice of the same mathematical idea with fresh numbers.
- Repeated trouble lowers the difficulty or revisits a prerequisite. Selected error patterns route to a relevant prerequisite, such as percent-to-decimal conversion.
- Three successive independent correct answers can raise the practice level.
- A skill becomes **Ready for review** after at least four independent correct answers among the five most recent first attempts, across at least two actual contexts, including a typed answer.
- In adaptive mode, review-ready skills become eligible for spaced review after two days, or seven days at the highest level. Review is selected during a later visit, not through a background reminder.

These are transparent instructional heuristics. They are not a validated diagnostic test, a personality model, a school grade, or proof of durable mastery. A wrong answer suggests a possible issue; an adult should ask the learner to explain before concluding why it occurred. Hinted first-attempt successes are tracked separately. Repeated submission of the same question does not inflate the score.

## Data and privacy

This is a static website. It does not request names, create student accounts, send answers to an AI service, or upload progress to GitHub. Progress and the parent-language preference use `localStorage` in the learner's browser. The hosting provider receives normal website requests; practice answers are not included in those requests by this application.

Adding Chapter 2 fills in new skill records while preserving existing version-1 progress. Each browser/device has its own record. Clearing browser data can remove it. **Export progress** creates a local JSON file; this edition does not import or synchronize records. The repository and published book contain no student records or personal case information.

## Curriculum and sources

Michigan defines annual expectations, while local curricula determine sequencing. This book's fall plan is a proposed learning path, not a state-mandated semester syllabus. Basic percentage part/whole problems are Grade 6 foundations; Grade 7 extends the work to fractional rates, proportional representations, and multistep applications.

Chapter 2 connects organized lists, tables, and sample spaces with 7.SP.C.8. Introductory permutations and combinations support this work; formal permutation/combination formulas are extensions, associated with high-school S-CP.9(+).

See [SOURCES.md](SOURCES.md) and **For parents** in the book for primary sources and license distinctions. The examples, diagrams, exercise templates, and explanations in this repository are original. Linked publishers retain their own copyrights and licenses; no publisher endorsement is implied.

## Run locally

No dependencies or build step are required to use the book. Use a static HTTP server, because browsers may block ES-module imports when opening `index.html` directly as a file.

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000`. Run the arithmetic and adaptive-engine checks with Node.js:

```sh
node engine.test.mjs
```

The suite checks 10,800 generated cases, including 3,600 counting cases checked by independent enumeration, with independent arithmetic, distinct multiple-choice answers, units, fraction parsing, first-attempt tracking, targeted remediation, context diversity, and delayed review eligibility. Human review remains necessary when adding new problem templates or lessons.

To regenerate the paired **Chapter 1** PDFs, install the Python packages listed in `requirements.txt`, keep Node.js available, and run:

```sh
python3 -m pip install -r requirements.txt
python3 build_workbook.py
```

The builder stays scoped to Chapter 1 and uses the fixed `book-v1` seeds and the same dataset for the student book and answer guide. It verifies every generated answer and every exercise ID. Inspect rendered pages after making layout changes.

### Source files

| File | Purpose |
|---|---|
| `content.js` | Full lessons, parent guidance, references, and roadmap |
| `quick-lessons.js` | Concise student-facing lesson summaries and worked examples |
| `counting-content.js` | Full and concise Chapter 2 lessons, examples, parent notes, and sources |
| `ratio-teaching.js` / `counting-teaching.js` | Expanded student explanations, 15 original teaching figures, worked examples, quick checks and specific teaching references |
| `counting-model.js` / `counting-model.css` | Optional enumerated counting models |
| `engine.js` | Deterministic question factories, numeric grading, adaptive rules |
| `engine.test.mjs` | Arithmetic and behavior checks |
| `app.js` | Book navigation, explorer, practice interface, printing, progress |
| `styles.css` / `book-layout.css` | Responsive book sidebar, reading column, teaching figures and print layout |
| `build_workbook.py` | Reproducible PDF authoring script |
| `downloads/` | Student workbook and separate answer guide |

### Updating the published book

GitHub Pages publishes the repository's `main` branch from the root. Make changes on a review branch, run the engine checks, inspect the affected lesson and practice flow, and merge when ready. `.nojekyll` keeps the site as plain static files. Regenerate the Chapter 1 PDFs when that chapter or its fixed exercise set changes. Chapter 2 uses the online workbook generator for printable practice.

Original work prepared for Hongyu An. First edition: November 19, 2026. Chapter 2 and the expanded illustrated online edition added November 22, 2026. The downloadable Chapter 1 PDFs retain their first-edition lesson text; the expanded explanations and new figures are in the online book. No general redistribution license is granted for original book content by this repository; linked source materials keep their stated licenses.

