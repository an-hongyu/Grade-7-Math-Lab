#!/usr/bin/env python3
"""Build the paired print books from content.js and the deterministic question engine.

Run: python3 build_workbook.py
Dependencies: reportlab, pypdf. The fixed book-v1 seed gives stable IDs and choices.
The original diagnostic and reasoning prompts are included in data/assessment_notes.json.
All inputs resolve relative to this script, so the downloaded repository is reproducible.
"""
from __future__ import annotations

import json
import math
import re
import subprocess
from dataclasses import dataclass
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph
from pypdf import PdfReader

BASE = Path(__file__).resolve().parent
OUT = BASE / 'downloads'
SCRATCH = BASE / 'build'
STUDENT = OUT / 'Grade-7-Math-Student-Workbook.pdf'
ANSWERS = OUT / 'Grade-7-Math-Answer-Guide.pdf'

NAVY = colors.HexColor('#14344B')
TEAL = colors.HexColor('#087C86')
INK = colors.HexColor('#253A4A')
MUTED = colors.HexColor('#596B78')
LINE = colors.HexColor('#C7D5DD')
PALE = colors.HexColor('#EEF6F8')
GOLD = colors.HexColor('#F1B65B')
PAGE_W, PAGE_H = 612, 792
LEFT, RIGHT = 50, 562
WIDTH = RIGHT - LEFT
BOTTOM = 48


def normalize(text):
    return str(text).replace('\u2011', '-').replace('\u2013', '-').replace('\u2014', '-').replace('\u2212', '-').replace('\u00a0', ' ')


def safe(text):
    return escape(normalize(text))


def load_data():
    js = '''
import fs from "node:fs";
const load=async path=>import("data:text/javascript;base64,"+fs.readFileSync(path).toString("base64"));
const c=await load("content.js");const e=await load("engine.js");const questions=[];const seen=new Set();
for(const skill of e.SKILLS){for(let level=1;level<=3;level++){for(let j=0;j<4;j++){
 let q;let attempt=0;do{q=e.makeQuestion(skill.id,level,`book-v1-${skill.id}-${level}-${j}-${attempt++}`,j%2?"choice":"numeric");}while(seen.has(q.prompt)&&attempt<100);
 if(seen.has(q.prompt))throw Error("Could not produce a unique question");seen.add(q.prompt);
 questions.push({...q,bookId:`P${String(questions.length+1).padStart(3,"0")}`});
}}}
console.log(JSON.stringify({...c,questions}));
'''
    result = subprocess.run(['node', '--input-type=module', '-e', js], cwd=BASE, check=True, capture_output=True, text=True)
    data = json.loads(result.stdout)
    source = BASE / 'data' / 'assessment_notes.json'
    data['assessment'] = json.loads(source.read_text())
    assert len(data['questions']) == 120
    assert len(data['assessment']['diagnostic']) == 8
    assert len(data['assessment']['explainQuestions']) == 12
    # Independent arithmetic and choice validation for the shared student/key dataset.
    for q in data['questions']:
        a = q['math']['operands']
        op = q['math']['operation']
        expected = {
            'divide': lambda: a[0] / a[1],
            'multiply': lambda: a[0] * a[1],
            'ratio_share': lambda: a[0] * a[1] / (a[1] + a[2]),
            'ratio_scale': lambda: a[0] / a[1] * a[2],
            'percent_part': lambda: a[0] * a[1] / 100,
            'percent_rate': lambda: a[0] / a[1] * 100,
            'percent_whole': lambda: a[0] / (a[1] / 100),
            'percent_change': lambda: abs(a[1] - a[0]) / a[0] * 100,
            'discount_price': lambda: a[0] * (1 - a[1] / 100),
            'discount_tax': lambda: a[0] * (1 - a[1] / 100) * (1 + a[2] / 100),
            'tax_tip': lambda: a[0] * (1 + a[1] / 100 + a[2] / 100),
            'successive_changes': lambda: a[0] * (1 + a[1] / 100) * (1 - a[1] / 100),
        }[op]()
        if 'roundTo' in q['math']:
            factor = 10 ** q['math']['roundTo']
            expected = math.floor(expected * factor + 0.500000001) / factor
        assert abs(expected - q['answer']) < 1e-6, (q['bookId'], expected, q['answer'])
        assert len(q['choices']) == 4
        assert sum(abs(c['value'] - q['answer']) < 1e-6 for c in q['choices']) == 1
        assert len({c['label'] for c in q['choices']}) == 4
    return data


def fonts():
    candidates = [Path('/usr/share/fonts/truetype/dejavu'), Path('/usr/share/fonts/dejavu')]
    folder = next((p for p in candidates if (p / 'DejaVuSans.ttf').exists()), None)
    if folder:
        pdfmetrics.registerFont(TTFont('Book', str(folder / 'DejaVuSans.ttf')))
        pdfmetrics.registerFont(TTFont('BookBold', str(folder / 'DejaVuSans-Bold.ttf')))
        pdfmetrics.registerFont(TTFont('BookItalic', str(folder / 'DejaVuSans-Oblique.ttf')))
        pdfmetrics.registerFontFamily('Book', normal='Book', bold='BookBold', italic='BookItalic', boldItalic='BookBold')
        return 'Book', 'BookBold'
    raise RuntimeError('DejaVu Sans fonts are required for consistent math glyph rendering.')


FONT, BOLD = fonts()
STYLES = {
    'body': ParagraphStyle('body', fontName=FONT, fontSize=10.5, leading=14, textColor=INK),
    'body11': ParagraphStyle('body11', fontName=FONT, fontSize=11.2, leading=15.4, textColor=INK),
    'step': ParagraphStyle('step', fontName=FONT, fontSize=10.3, leading=13.4, textColor=INK),
    'small': ParagraphStyle('small', fontName=FONT, fontSize=9.0, leading=12.2, textColor=MUTED),
    'h1': ParagraphStyle('h1', fontName=BOLD, fontSize=21, leading=26, textColor=NAVY),
    'h2': ParagraphStyle('h2', fontName=BOLD, fontSize=13, leading=17, textColor=NAVY),
    'h3': ParagraphStyle('h3', fontName=BOLD, fontSize=10.8, leading=14, textColor=NAVY),
    'answer': ParagraphStyle('answer', fontName=BOLD, fontSize=10.5, leading=14, textColor=TEAL),
}


@dataclass
class Page:
    kind: str
    title: str
    data: object = None


class Book:
    def __init__(self, path, pages, role):
        self.path, self.pages, self.role = path, pages, role
        self.c = canvas.Canvas(str(path), pagesize=(PAGE_W, PAGE_H), pageCompression=1)
        self.c.setTitle('Grade 7 Math Lab - ' + role)
        self.c.setAuthor('Hongyu An')
        self.c.setSubject('Original Michigan-aligned ratios, rates, and percentages learning materials')
        self.lowest = []

    def para(self, text, y, style='body', x=LEFT, width=WIDTH, gap=6, markup=False):
        p = Paragraph(text if markup else safe(text), STYLES[style])
        _, h = p.wrap(width, 1000)
        if y - h < BOTTOM - 1:
            raise RuntimeError(f'Overflow on {self.role} page {self.n}: {text[:100]} reaches {y-h:.1f}')
        p.drawOn(self.c, x, y - h)
        self.lowest.append((self.n, y - h))
        return y - h - gap

    def rule(self, y, x=LEFT, width=WIDTH, color=LINE):
        self.c.setStrokeColor(color)
        self.c.setLineWidth(0.6)
        self.c.line(x, y, x + width, y)

    def lines(self, top, bottom, x=LEFT, width=WIDTH, step=20):
        for y in range(int(top), int(bottom), -step):
            self.rule(y, x, width)

    def title(self, text, subtitle=None):
        y = self.para(text, 733, 'h1', gap=9)
        if subtitle:
            y = self.para(subtitle, y, 'small', gap=14)
        return y

    def callout(self, text, y, color=PALE):
        p = Paragraph(safe(text), STYLES['h3'])
        _, h = p.wrap(WIDTH - 24, 1000)
        self.c.setFillColor(color)
        self.c.roundRect(LEFT, y - h - 20, WIDTH, h + 20, 6, fill=1, stroke=0)
        p.drawOn(self.c, LEFT + 12, y - h - 10)
        return y - h - 29

    def header(self):
        c = self.c
        c.setFillColor(TEAL)
        c.rect(LEFT, 759, 20, 3, fill=1, stroke=0)
        c.setFillColor(MUTED)
        c.setFont(FONT, 8.5)
        c.drawString(LEFT + 28, 756, 'GRADE 7 MATH LAB')
        c.drawRightString(RIGHT, 756, self.role.upper())
        self.rule(746)
        c.setFillColor(MUTED)
        c.setFont(FONT, 8)
        c.drawString(LEFT, 27, 'Ratios, Rates & Percentages  |  First edition  |  Book-v1')
        c.drawRightString(RIGHT, 27, f'{self.n} / {len(self.pages)}')

    def render(self, data):
        for self.n, page in enumerate(self.pages, 1):
            self.c.bookmarkPage(f'p{self.n}')
            if page.kind != 'cover':
                self.header()
            method = getattr(self, 'draw_' + page.kind)
            method(page, data)
            self.c.showPage()
        self.c.save()

    def draw_cover(self, page, data):
        c = self.c
        c.setFillColor(NAVY)
        c.rect(0, 530, PAGE_W, 262, fill=1, stroke=0)
        c.setFillColor(GOLD)
        c.roundRect(LEFT, 720, 92, 25, 6, fill=1, stroke=0)
        c.setFillColor(NAVY)
        c.setFont(BOLD, 10)
        c.drawString(LEFT + 12, 728, 'GRADE 7')
        c.setFillColor(colors.white)
        c.setFont(BOLD, 37)
        c.drawString(LEFT, 663, 'Math Lab')
        c.setFont(FONT, 21)
        c.drawString(LEFT, 624, 'Ratios, Rates & Percentages')
        c.setFont(FONT, 13)
        c.drawString(LEFT, 581, self.role)
        c.setFont(FONT, 10)
        c.drawString(LEFT, 553, 'Understand the relationship. Choose an operation. Check the result.')
        y = 492
        if self.role == 'Student Workbook':
            y = self.para('Learn it. Try it. Explain it.', y, 'h1', gap=13)
            y = self.para('10 short lessons + 140 numbered questions', y, 'body11')
            y = self.para('8 starting checks  |  120 skill questions  |  12 reasoning questions', y, 'small')
        else:
            y = self.para('Answers that show the thinking.', y, 'h1', gap=13)
            y = self.para('A matching guide for all 140 numbered questions', y, 'body11')
            y = self.para('Answers, units, methods, diagnostic notes, and parent guidance', y, 'small')
        self.pool_diagram(LEFT, 300, WIDTH, 61)
        y = self.para('ONE RELATIONSHIP, THREE QUESTIONS', 277, 'h3')
        y = self.para('800 liters is the whole. 200 liters is the part. 25% is the comparison.', y, 'body11')
        y = self.para('This first volume strengthens Grade 6 foundations and develops selected Michigan Grade 7 standards. It is not a complete full-year Grade 7 course.', 184, 'small', gap=12)
        y = self.para('English student text. Original explanations, examples, and exercises. Suggested pacing is flexible and is not a statewide semester schedule.', y, 'small')
        c.setFillColor(MUTED)
        c.setFont(FONT, 9)
        c.drawString(LEFT, 53, 'FIRST EDITION  |  NOVEMBER 2026')
        c.drawRightString(RIGHT, 53, 'Book-v1 paired print set')

    def pool_diagram(self, x, y, width, height):
        c = self.c
        c.setFillColor(PALE)
        c.roundRect(x, y, width, height, 6, fill=1, stroke=0)
        c.setFillColor(TEAL)
        c.rect(x, y, width / 4, height, fill=1, stroke=0)
        c.setStrokeColor(NAVY)
        c.setLineWidth(0.8)
        c.rect(x, y, width, height, fill=0, stroke=1)
        for i in range(1, 4):
            c.line(x + i * width / 4, y, x + i * width / 4, y + height)
        c.setFont(BOLD, 12)
        c.setFillColor(colors.white)
        c.drawCentredString(x + width / 8, y + height / 2 + 3, '200 L')
        c.setFont(FONT, 10)
        c.drawCentredString(x + width / 8, y + height / 2 - 14, '25%')
        c.setFillColor(NAVY)
        for i in range(1, 4):
            cx = x + (i + 0.5) * width / 4
            c.setFont(FONT, 11)
            c.drawCentredString(cx, y + height / 2 + 3, '200 L')
            c.setFont(FONT, 9)
            c.drawCentredString(cx, y + height / 2 - 14, 'empty capacity')
        c.setFont(FONT, 9)
        c.drawString(x, y + height + 11, '0%')
        c.drawRightString(x + width, y + height + 11, 'Full capacity: 800 L = 100%')

    def draw_contents(self, page, data):
        y = self.title('Inside this workbook', 'Use the matching Answer Guide after an independent attempt.')
        if self.role == 'Student Workbook':
            rows = [
                ('How to use this book', 'use'), ('Starting check: D01-D08', 'diagnostic'),
                ('Learn: 10 short lessons', 'lesson'), ('Visual models', 'visuals'),
                ('Practice: P001-P120', 'practice'), ('Explain your reasoning: R01-R12', 'reasoning'),
                ('Suggested fall roadmap', 'roadmap'), ('Sources and scope', 'sources')]
        else:
            rows = [('Using the answer guide', 'parent'), ('Diagnostic answers: D01-D08', 'diagnostic_key'),
                    ('Practice solutions: P001-P120', 'practice_key'), ('Reasoning guide: R01-R12', 'reasoning_key'),
                    ('Lesson self-check answers', 'selfchecks'), ('Sources and scope', 'sources')]
        for label, kind in rows:
            num = next(i + 1 for i, p in enumerate(self.pages) if p.kind == kind)
            y = self.para(label, y, 'body11', width=WIDTH - 48, gap=10)
            self.c.setFont(BOLD, 11)
            self.c.setFillColor(TEAL)
            self.c.drawRightString(RIGHT, y + 13, str(num))
            self.c.linkRect('', f'p{num}', (LEFT, y + 7, RIGHT, y + 27), relative=0, thickness=0)
            self.rule(y + 3)
            y -= 10
        y -= 9
        y = self.para('The ten skills', y, 'h2', gap=10)
        for index, lesson in enumerate(data['LESSONS'], 1):
            if self.role == 'Student Workbook':
                num = next(i + 1 for i, p in enumerate(self.pages) if p.kind == 'lesson' and p.data['id'] == lesson['id'])
                label = f'{index:02d}  {lesson["title"]}'
                y = self.para(label, y, 'small', width=WIDTH - 35, gap=5)
                self.c.setFont(FONT, 9)
                self.c.setFillColor(MUTED)
                self.c.drawRightString(RIGHT, y + 8, str(num))
            else:
                y = self.para(f'{index:02d}  {lesson["title"]}', y, 'small', gap=5)

    def draw_use(self, page, data):
        y = self.title('Make the practice useful', 'A short, thoughtful session is a good place to start.')
        blocks = [
            ('1  Start with a conversation', 'Try D01-D08 without a score target. Write an answer, show a little work, and mark any item where you needed help. These questions help choose a starting lesson; they are not a standardized test.'),
            ('2  Learn the relationship', 'Read one short lesson. Say what is known, what is unknown, and what the units mean. For percentage problems, point to the amount that represents 100%.'),
            ('3  Work through four questions', 'Each practice page contains four questions. Use the space to draw, write a table, or show equations. For a multiple-choice question, circle one answer and still show a reason or calculation.'),
            ('4  Check and adjust', 'Use the separate Answer Guide after trying. If an idea is unclear, compare the method with your own. Try a changed-number example, then a different context. An answer reached with help is useful progress; keep it distinct from an independent answer.'),
            ('5  Explain and revisit', 'Use R01-R12 to explain a mistake, compare methods, or draw a model. Come back to familiar skills on another day and mix question types. Knowing which operation to use is part of the learning.')
        ]
        for title, body in blocks:
            y = self.para(title, y, 'h2', gap=5)
            y = self.para(body, y, 'body11', gap=17)
        y = self.callout('Before calculating: What is the whole? What are we finding? What units should the answer have?', y)
        y = self.para('Practice levels describe these exercises, not the learner: Level 1 uses friendlier numbers; Level 2 extends the arithmetic; Level 3 adds fractional quantities or more steps. Use a calculator only when the learning goal allows it, and show the setup.', y, 'small')

    def draw_diagnostic(self, page, data):
        y = self.title('Starting check', 'D01-D08  |  Try first. Discuss next. This is not a grade.')
        items = page.data
        gap = 145
        for i, q in items:
            top = y
            y = self.para(f'D{i+1:02d}', top, 'h3', width=52, gap=0)
            y = self.para(q['prompt'], top, 'body11', x=LEFT + 55, width=WIDTH - 55, gap=11)
            self.lines(y - 5, top - 106, x=LEFT + 55, width=WIDTH - 55, step=22)
            self.para('I worked independently / I used help / I want to discuss this', top - 121, 'small', x=LEFT + 55, width=WIDTH - 55, gap=0)
            y = top - gap

    def draw_lesson(self, page, data):
        l = page.data
        index = data['LESSONS'].index(l) + 1
        title = {
            'division': 'Division: what are we finding?', 'percent_decimal': 'Percent, decimal, and fraction',
            'ratios': 'Ratios: keep the relationship', 'unit_rate': 'Unit rates: amount per one',
            'proportional': 'Proportional relationships', 'percent_part': 'Find the part',
            'percent_rate': 'Find the percent', 'percent_whole': 'Find the whole',
            'percent_change': 'Percent change', 'applications': 'Percentages in more than one step'
        }[l['id']]
        y = self.title(f'{index:02d}  {title}', l['standard'])
        y = self.callout(l['keyIdea'], y)
        for text in l['explanation']:
            y = self.para(text, y, 'body', gap=5)
        for n, ex in enumerate(l['workedExamples'], 1):
            y -= 4
            y = self.para(f'Worked example {n}', y, 'h3', gap=3)
            y = self.para(ex['question'], y, 'body', gap=5)
            for j, step in enumerate(ex['steps'], 1):
                y = self.para(f'{j}. {step}', y, 'step', x=LEFT + 10, width=WIDTH - 10, gap=2)
            y = self.para(ex['answer'], y, 'answer', gap=6)
        y = self.para('Quick self-check', y - 3, 'h3', gap=3)
        y = self.para(l['check']['prompt'], y, 'body', gap=3)
        if l['id'] == 'applications':
            y = self.para('Extension: percent error', y - 7, 'h3', gap=3)
            y = self.para('A sensor reads 48 cm; the reference is 50 cm. The absolute difference is 2 cm. Percent error = (2 ÷ 50) × 100% = 4%. Use a nonzero reference value as the comparison base.', y, 'step', gap=0)
        elif y > 78:
            self.rule(y - 15)

    def draw_visuals(self, page, data):
        if page.data == 1:
            y = self.title('See the whole before you calculate', 'A visual model helps the numbers keep their meaning.')
            self.pool_diagram(LEFT, 555, WIDTH, 62)
            y = self.para('The pool relationship', 532, 'h2')
            y = self.para('The bar represents a full capacity of 800 liters. Each of four equal sections is 200 liters, or 25%. The colored section is water already present; the uncolored sections are empty capacity.', y, 'body11', gap=15)
            rows = [('Known', 'Find', 'Relationship'), ('800 L and 25%', 'Part', '800 × 0.25 = 200 L'), ('200 L and 800 L', 'Percent', '200 ÷ 800 = 0.25 = 25%'), ('200 L and 25%', 'Whole', '200 ÷ 0.25 = 800 L')]
            y = self.table(rows, y, [150, 95, 267]) - 22
            y = self.para('Equal ratio parts', y, 'h2')
            y = self.para('Red:blue = 2:3. The whole has five ratio parts, so red is 2/5 of the whole. Scaling the quantities changes the amount while preserving the relationship.', y, 'body11', gap=12)
            rows = [('Red tiles', 'Blue tiles', 'All tiles'), ('2', '3', '5'), ('4', '6', '10'), ('10', '15', '25')]
            y = self.table(rows, y, [170, 170, 172]) - 17
            self.para('Ask yourself: Does this fraction compare one part with another part, or one part with the whole?', y, 'h3')
        else:
            y = self.title('A straight line is not enough', 'Compare y = 3x with y = 2x + 5.')
            self.graph(LEFT + 28, 374, 390, 237)
            y = self.para('Read a point as a statement', 347, 'h2')
            y = self.para('On y = 3x, the point (1, 3) means one unit of x corresponds to three units of y. The point (4, 12) means four units of x correspond to twelve units of y. The graph includes (0, 0), and y/x = 3 for every nonzero x on the line.', y, 'body11', gap=14)
            y = self.para('Notice the starting amount', y, 'h2')
            y = self.para('The line y = 2x + 5 starts at (0, 5). Its y-values increase steadily, but y/x is not constant. It represents a constant rate plus a starting amount, so it is not a proportional relationship.', y, 'body11', gap=18)
            y = self.callout('Proportional: one fixed multiplier, y = kx, and a graph through the origin.', y)
            self.para('Try it on paper: make a table for x = 0, 1, 2, 3, and 4 for each rule. Compare the ratios where x is nonzero.', y, 'body11')

    def table(self, rows, y, widths):
        c = self.c
        for r, row in enumerate(rows):
            heights = [Paragraph(safe(t), STYLES['h3' if r == 0 else 'body']).wrap(w - 16, 1000)[1] for t, w in zip(row, widths)]
            h = max(heights) + 16
            c.setFillColor(PALE if r == 0 else colors.white)
            c.rect(LEFT, y - h, sum(widths), h, fill=1, stroke=0)
            x = LEFT
            for text, width in zip(row, widths):
                self.para(text, y - 8, 'h3' if r == 0 else 'body', x=x + 8, width=width - 16, gap=0)
                x += width
            self.rule(y - h)
            y -= h
        return y

    def graph(self, x, y, w, h):
        c = self.c
        def point(a, b): return x + w * a / 5, y + h * b / 16
        for i in range(6):
            px, _ = point(i, 0)
            c.setStrokeColor(LINE); c.setLineWidth(0.45); c.line(px, y, px, y + h)
            c.setFont(FONT, 9); c.setFillColor(MUTED); c.drawCentredString(px, y - 15, str(i))
        for j in range(0, 17, 2):
            _, py = point(0, j)
            c.setStrokeColor(LINE); c.line(x, py, x + w, py)
            c.setFillColor(MUTED); c.drawRightString(x - 9, py - 3, str(j))
        c.setStrokeColor(NAVY); c.setLineWidth(1); c.line(x, y, x + w + 10, y); c.line(x, y, x, y + h + 8)
        c.setFont(FONT, 10); c.setFillColor(NAVY); c.drawString(x + w + 14, y - 2, 'x'); c.drawString(x - 3, y + h + 17, 'y')
        c.setStrokeColor(TEAL); c.setLineWidth(2.3); c.line(*point(0, 0), *point(5, 15))
        c.setStrokeColor(colors.HexColor('#A65B12')); c.setDash(5, 3); c.line(*point(0, 5), *point(5, 15)); c.setDash()
        c.setFillColor(TEAL)
        for a,b in [(0,0),(1,3),(4,12)]: c.circle(*point(a,b), 3.6, fill=1, stroke=0)
        c.setFont(BOLD, 10); c.drawString(x + 95, y + 28, 'y = 3x')
        c.setFillColor(colors.HexColor('#A65B12')); c.circle(*point(0,5), 3.6, fill=1, stroke=0)
        c.drawString(x + 72, y + 154, 'y = 2x + 5')

    def draw_practice(self, page, data):
        group = page.data
        lesson = next(l for l in data['LESSONS'] if l['id'] == group[0]['skill'])
        y = self.title(lesson['title'], f"Practice {group[0]['bookId']}-{group[-1]['bookId']}  |  Level {group[0]['level']}  |  Show the setup. Include units.")
        # Fixed-height blocks preserve writing room and keep every question intact.
        height = (y - 53) / 4
        for q in group:
            top, bottom = y, y - height
            self.para(q['bookId'], top, 'h3', width=53, gap=0)
            qy = self.para(q['prompt'], top, 'body', x=LEFT + 56, width=WIDTH - 56, gap=7)
            if q['format'] == 'choice':
                for row in range(2):
                    row_h = 0
                    for col in range(2):
                        i = row * 2 + col
                        text = f"{chr(65+i)}. {choice_display(q, q['choices'][i])}"
                        new_y = self.para(text, qy, 'body', x=LEFT + 56 + col * 225, width=222, gap=0)
                        row_h = max(row_h, qy - new_y)
                    qy -= row_h + 3
            if qy - bottom > 32:
                self.lines(qy - 9, bottom + 20, x=LEFT + 56, width=WIDTH - 56, step=19)
            self.para('Answer / reason:', bottom + 18, 'small', x=LEFT + 56, width=120, gap=0)
            self.rule(bottom + 4)
            y = bottom

    def draw_reasoning(self, page, data):
        y = self.title('Explain your reasoning', 'A clear drawing, table, or equation can be part of an explanation.')
        height = (y - 56) / 2
        for i, q in page.data:
            top, bottom = y, y - height
            self.para(f'R{i+1:02d}', top, 'h3', width=52, gap=0)
            qy = self.para(q['prompt'], top, 'body11', x=LEFT + 55, width=WIDTH - 55, gap=10)
            self.lines(qy - 5, bottom + 18, x=LEFT + 55, width=WIDTH - 55, step=22)
            y = bottom

    def draw_roadmap(self, page, data):
        y = self.title('A suggested fall roadmap', '16 flexible weeks. This is an author-designed sequence, not a Michigan-mandated calendar.')
        for row in page.data:
            y = self.para('Weeks ' + row['weeks'], y, 'h2', gap=5)
            y = self.para(row['focus'], y, 'body11', gap=5)
            y = self.para(row['standards'], y, 'small', gap=5)
            y = self.para(row['status'], y, 'small', gap=18)
            self.rule(y + 8)
        if page.data[-1] == data['ROADMAP'][-1]:
            y = self.callout('Use demonstrated understanding to adjust the pace; the week numbers are planning suggestions.', y - 7)
            self.para('Across the full year, Grade 7 also includes signed rational-number operations, expressions and equations, inequalities, geometry, sampling, and probability. This volume does not claim complete coverage of those areas.', y, 'body11')

    def draw_sources(self, page, data):
        y = self.title('Sources, scope, and reuse', 'The teaching text and questions in this paired print set are original.')
        for ref in page.data:
            y = self.para(ref['title'], y, 'h3', gap=5)
            url = ref['url']
            y = self.para(f'<link href="{escape(url)}" color="#087C86">{safe(url)}</link>', y, 'small', markup=True, gap=7)
            if ref.get('use'):
                y = self.para(ref['use'], y, 'small', gap=5)
            if ref.get('license'):
                y = self.para(ref['license'], y, 'small', gap=14)
            else:
                y -= 14
        y = self.para('Reference does not imply endorsement. A free-to-read resource is not automatically free to republish. No third-party textbook exercises or illustrations have been copied into this workbook.', y - 7, 'small')
        if page.data == source_groups(data)[-1]:
            y = self.para('The printed activities are fixed. The companion website can select follow-up problems using explicit rules and local attempt history; that feature is not a validated measurement of ability or personality.', y - 3, 'small')

    def draw_parent(self, page, data):
        y = self.title('A guide for the adult helper', 'Use evidence from the explanation as well as the final answer.')
        for item in page.data:
            y = self.para(item['heading'], y, 'h2', gap=6)
            y = self.para(item['body'], y, 'body11', gap=20)
        if page.data[-1] == data['PARENT_GUIDE'][-1]:
            y = self.para('How the print set is matched', y, 'h2', gap=6)
            y = self.para('D01-D08 are the starting questions. P001-P120 use the fixed book-v1 seeds and the same choice order in both PDFs. R01-R12 ask for reasoning. The lesson self-checks are additional learning prompts and are not part of the 140 numbered questions.', y, 'body11', gap=15)
            y = self.para('Mark a first independent response separately from work completed with a hint. For an explanation, accept different valid methods and wording when the quantities, reference whole, operation, and conclusion are correct. Ask a follow-up question before inferring why an error occurred.', y, 'body11', gap=15)
            self.para('Chinese parent notes are available in the companion online lessons. This print guide uses English throughout.', y, 'small')

    def draw_diagnostic_key(self, page, data):
        y = self.title('Starting-check answers', 'A response helps choose the next conversation; it does not assign a fixed ability label.')
        for i, q in page.data:
            y = self.para(f'D{i+1:02d}  {q["answer"]}', y, 'answer', gap=6)
            y = self.para(q['why'], y, 'body11', gap=8)
            note = diagnostic_note(i)
            y = self.para('Discuss: ' + note, y, 'small', gap=19)
            self.rule(y + 9)

    def draw_practice_key(self, page, data):
        group = page.data
        skill = next(l for l in data['LESSONS'] if l['id'] == group[0]['skill'])
        y = self.title(skill['title'], f"Solutions {group[0]['bookId']}-{group[-1]['bookId']}  |  Student and guide use the same Book-v1 questions.")
        for q in group:
            correct = next(i for i,c in enumerate(q['choices']) if abs(c['value'] - q['answer']) < 1e-6)
            choice = f'{chr(65+correct)}. ' if q['format'] == 'choice' else ''
            y = self.para(f'{q["bookId"]}  {choice}{answer_display(q)}', y, 'answer', gap=4)
            y = self.para(q['prompt'], y, 'small', gap=4)
            for step in q['steps']:
                y = self.para(step, y, 'step', x=LEFT + 10, width=WIDTH - 10, gap=2)
            y -= 10
            self.rule(y + 4)

    def draw_reasoning_key(self, page, data):
        y = self.title('Reasoning: what to look for', 'These are model explanations. Equivalent valid reasoning is welcome.')
        for i, q in page.data:
            y = self.para(f'R{i+1:02d}', y, 'answer', gap=4)
            y = self.para(q['prompt'], y, 'small', gap=7)
            y = self.para(q['answer'], y, 'body11', gap=18)
            self.rule(y + 7)

    def draw_selfchecks(self, page, data):
        y = self.title('Lesson self-check answers', 'Additional learning checks, outside the 140 numbered workbook questions.')
        for l in page.data:
            y = self.para(l['title'], y, 'h3', gap=5)
            y = self.para(l['check']['answer'], y, 'body11', gap=8)
            y = self.para('Watch for: ' + l['watchOut'], y, 'small', gap=18)


def num(n):
    return f'{n:.6f}'.rstrip('0').rstrip('.') if not float(n).is_integer() else str(int(n))


def answer_display(q):
    n, unit = q['answer'], q['unit']
    if unit == 'dollars': return f'${n:.2f}'
    if unit.startswith('dollars per '): return f'${n:.2f} per ' + unit.removeprefix('dollars per ')
    if unit == '%': return num(n) + '%'
    return (num(n) + ' ' + unit).strip()


def choice_display(q, choice):
    if q['unit'] in ['dollars', '%', '']: return choice['label']
    # The question specifies units; omitting repeated unit strings keeps choices legible.
    return choice['label']


def diagnostic_note(i):
    return [
        'Ask whether the quotient counts containers or liters per container. Rebuild the total by multiplication.',
        'Ask what the percent sign means. Compare 35%, 0.35, and 0.35%.',
        'Ask which quantity is the full capacity and why the answer should be less than it.',
        'Ask the learner to label the numerator and denominator before converting to percent.',
        'Ask why the full capacity must exceed the water currently present. Try four equal quarter-parts.',
        'Ask how many total ratio parts there are. Distinguish red-to-blue from red-to-all.',
        'Ask for the units of 15/6 and of 6/15. The rate direction matters.',
        'Ask which amount is the starting reference. Distinguish the $20 change from a 20% change.'
    ][i]


def chunks(items, n):
    return [items[i:i+n] for i in range(0, len(items), n)]


def source_groups(data):
    refs = data['REFERENCES'][:]
    refs += [{**ref, 'license': 'Linked for instructional context; no content is reproduced here.', 'use': 'Reference for visual representations, worked examples, explicit instruction, or review design.'} for ref in data['assessment']['sources'][:3]]
    return chunks(refs, 4)


def make_pages(data):
    d = data['assessment']
    student = [Page('cover', 'Cover'), Page('contents', 'Contents'), Page('use', 'How to use this book')]
    student += [Page('diagnostic', 'Starting check', g) for g in chunks(list(enumerate(d['diagnostic'])), 4)]
    student += [Page('lesson', l['title'], l) for l in data['LESSONS']]
    student += [Page('visuals', 'The whole and ratio parts', 1), Page('visuals', 'Graphs and proportionality', 2)]
    student += [Page('practice', 'Practice', g) for g in chunks(data['questions'], 4)]
    student += [Page('reasoning', 'Explain your reasoning', g) for g in chunks(list(enumerate(d['explainQuestions'])), 2)]
    student += [Page('roadmap', 'Suggested fall roadmap', g) for g in chunks(data['ROADMAP'], 4)]
    student += [Page('sources', 'Sources and scope', g) for g in source_groups(data)]

    answers = [Page('cover', 'Cover'), Page('contents', 'Contents')]
    answers += [Page('parent', 'Parent guide', g) for g in chunks(data['PARENT_GUIDE'], 3)]
    answers += [Page('diagnostic_key', 'Diagnostic answers', g) for g in chunks(list(enumerate(d['diagnostic'])), 4)]
    # Four fully worked answers per page avoid dense type and keep steps together.
    answers += [Page('practice_key', 'Practice solutions', g) for g in chunks(data['questions'], 4)]
    answers += [Page('reasoning_key', 'Reasoning guide', g) for g in chunks(list(enumerate(d['explainQuestions'])), 3)]
    answers += [Page('selfchecks', 'Self-check answers', g) for g in chunks(data['LESSONS'], 5)]
    answers += [Page('sources', 'Sources and scope', g) for g in source_groups(data)]
    return student, answers


def validate_pdf(path, expected_ids):
    reader = PdfReader(path)
    text = '\n'.join(page.extract_text() or '' for page in reader.pages)
    missing = [qid for qid in expected_ids if not re.search(r'\b' + qid + r'\b', text)]
    assert not missing, (path.name, 'missing', missing)
    assert '\ufffd' not in text, (path.name, 'replacement-character glyph')
    assert all((page.extract_text() or '').strip() for page in reader.pages)
    return len(reader.pages)


def main():
    OUT.mkdir(exist_ok=True)
    SCRATCH.mkdir(exist_ok=True)
    data = load_data()
    student_pages, answer_pages = make_pages(data)
    book = Book(STUDENT, student_pages, 'Student Workbook')
    book.render(data)
    key = Book(ANSWERS, answer_pages, 'Answer Guide')
    key.render(data)
    ids = [f'D{i:02d}' for i in range(1,9)] + [f'P{i:03d}' for i in range(1,121)] + [f'R{i:02d}' for i in range(1,13)]
    report = {
        'edition': 'Book-v1', 'numbered_questions': 140, 'diagnostic': 8, 'generated_practice': 120,
        'reasoning': 12, 'numeric_practice': 60, 'multiple_choice_practice': 60,
        'student_pages': validate_pdf(STUDENT, ids), 'answer_pages': validate_pdf(ANSWERS, ids),
        'student_file': str(STUDENT), 'answer_file': str(ANSWERS),
        'student_page_map': [{'page': i+1, 'kind': p.kind, 'title': p.title} for i,p in enumerate(student_pages)],
        'answer_page_map': [{'page': i+1, 'kind': p.kind, 'title': p.title} for i,p in enumerate(answer_pages)],
        'question_ids': ids,
        'generation_seeds': {q['bookId']: q['id'] for q in data['questions']},
        'lowest_body_baseline': min(y for _,y in book.lowest + key.lowest),
        'arithmetic_validation': '120 independently recomputed answers; one correct, distinct choice among four for each item',
    }
    (SCRATCH / 'pdf-dataset.json').write_text(json.dumps(data, ensure_ascii=False, indent=2))
    (SCRATCH / 'pdf-manifest.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
    print(json.dumps({k:v for k,v in report.items() if k not in ['student_page_map','answer_page_map','question_ids','generation_seeds']}, indent=2))


if __name__ == '__main__':
    main()
