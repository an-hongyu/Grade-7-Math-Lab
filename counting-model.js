// Small, exact models for Chapter 2. All outcomes are enumerated locally.
const SUPPORTED = new Set(['counting_choices', 'permutations', 'combinations', 'counting_repeats', 'counting_probability']);
const LETTERS = ['A', 'B', 'C', 'D'];
const attached = new WeakSet();
const bounded = (value, allowed, fallback) => allowed.includes(Number(value)) ? Number(value) : fallback;
const gcd = (a, b) => b ? gcd(b, a % b) : a;

/** Pure enumerator, also used to check each interactive model independently. */
export function enumerateCountingModel(skillId, options = {}) {
  if (!SUPPORTED.has(skillId)) return null;
  if (skillId === 'counting_choices') {
    const shirts = bounded(options.shirts, [2, 3, 4], 2);
    const pants = bounded(options.pants, [2, 3, 4], 3);
    const outcomes = [];
    for (let a = 0; a < shirts; a++) {
      for (let b = 1; b <= pants; b++) outcomes.push({ first: LETTERS[a], second: b });
    }
    return { kind: 'choices', shirts, pants, outcomes, count: outcomes.length };
  }
  if (skillId === 'permutations' || skillId === 'combinations') {
    const people = bounded(options.people, [3, 4], 3);
    const mode = options.mode === 'arrange' || options.mode === 'choose'
      ? options.mode : skillId === 'permutations' ? 'arrange' : 'choose';
    const outcomes = [];
    for (let a = 0; a < people; a++) {
      for (let b = 0; b < people; b++) {
        if (a === b || (mode === 'choose' && b < a)) continue;
        outcomes.push({ first: LETTERS[a], second: LETTERS[b] });
      }
    }
    return { kind: 'people', people, mode, outcomes, count: outcomes.length };
  }
  if (skillId === 'counting_repeats') {
    const repeats = options.repeats !== false;
    const outcomes = [];
    for (const first of LETTERS.slice(0, 3)) {
      for (const second of LETTERS.slice(0, 3)) {
        if (repeats || first !== second) outcomes.push({ first, second });
      }
    }
    return { kind: 'repeats', repeats, outcomes, count: outcomes.length };
  }
  const event = ['one', 'two', 'at-least-one'].includes(options.event) ? options.event : 'one';
  const outcomes = [];
  for (const first of ['H', 'T']) {
    for (const second of ['H', 'T']) {
      const heads = Number(first === 'H') + Number(second === 'H');
      const matches = event === 'one' ? heads === 1 : event === 'two' ? heads === 2 : heads >= 1;
      outcomes.push({ first, second, matches });
    }
  }
  const favorable = outcomes.filter(outcome => outcome.matches).length;
  const divisor = gcd(favorable, outcomes.length);
  return { kind: 'probability', event, outcomes, count: outcomes.length, favorable, fraction: `${favorable / divisor}/${outcomes.length / divisor}` };
}

function resultHtml(model) {
  if (model.kind === 'choices') {
    return `<div class="cm-table-wrap"><table class="cm-outfit-table"><caption>Every shirt-and-pants outfit</caption><thead><tr><th scope="col">Shirt</th>${Array.from({ length: model.pants }, (_, i) => `<th scope="col">Pants ${i + 1}</th>`).join('')}</tr></thead><tbody>${Array.from({ length: model.shirts }, (_, row) => `<tr><th scope="row">${LETTERS[row]}</th>${model.outcomes.filter(outcome => outcome.first === LETTERS[row]).map(outcome => `<td>${outcome.first} + ${outcome.second}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="cm-count">${model.shirts} × ${model.pants} = <strong>${model.count} outfits</strong></p><p class="cm-note">Each shirt can go with every pair of pants.</p>`;
  }
  if (model.kind === 'people') {
    const ordered = model.mode === 'arrange';
    return `<p class="cm-note">${LETTERS.slice(0, model.people).join(', ')} are ${model.people} different people. ${ordered ? 'Choose a captain, then a helper. One person cannot do both jobs.' : 'Choose a team of two people. The team has no different roles.'}</p><ul class="cm-outcomes" aria-label="${ordered ? 'Every captain and helper arrangement' : 'Every two-person team'}">${model.outcomes.map(outcome => `<li>${ordered ? `<span class="cm-roles"><span><small>Captain</small><strong>${outcome.first}</strong></span><span><small>Helper</small><strong>${outcome.second}</strong></span></span>` : `<strong>${outcome.first} + ${outcome.second}</strong>`}</li>`).join('')}</ul><p class="cm-count">${model.people} × ${model.people - 1}${ordered ? '' : ' ÷ 2'} = <strong>${model.count} ${ordered ? 'arrangements' : 'teams'}</strong></p><p class="cm-note">${ordered ? 'Captain A with helper B is different from captain B with helper A.' : 'A + B and B + A are the same team. Count that team once.'}</p>`;
  }
  if (model.kind === 'repeats') {
    return `<ul class="cm-outcomes cm-codes" aria-label="Every possible two-letter code">${model.outcomes.map(outcome => `<li><span>${outcome.first}${outcome.second}</span></li>`).join('')}</ul><p class="cm-count">3 × ${model.repeats ? 3 : 2} = <strong>${model.count} codes</strong></p><p class="cm-note">${model.repeats ? 'All three letters are available in each slot. AA, BB, and CC are allowed.' : 'After the first letter, only two unused letters remain. AA, BB, and CC are not allowed.'}</p>`;
  }
  return `<ul class="cm-outcomes cm-coins" aria-label="The four equally likely outcomes">${model.outcomes.map(outcome => `<li class="${outcome.matches ? 'cm-matches' : ''}"><strong>${outcome.first} then ${outcome.second}</strong><span>${outcome.matches ? 'Matches' : 'Does not match'}</span></li>`).join('')}</ul><p class="cm-count">${model.favorable} matching outcomes out of ${model.count}.<br>Probability = <strong>${model.favorable}/${model.count}${model.fraction === `${model.favorable}/${model.count}` ? '' : ` = ${model.fraction}`}</strong></p><p class="cm-note">Each ordered outcome has the same chance. Count the matching outcomes, then divide by four.</p>`;
}

export function countingModelHtml(skillId) {
  const model = enumerateCountingModel(skillId);
  if (!model) return '';
  let controls;
  if (model.kind === 'choices') {
    controls = `<h3>Make an outfit</h3><div class="cm-controls"><label>Shirts<select data-model-shirts>${[2, 3, 4].map(n => `<option${n === 2 ? ' selected' : ''}>${n}</option>`).join('')}</select></label><label>Pairs of pants<select data-model-pants>${[2, 3, 4].map(n => `<option${n === 3 ? ' selected' : ''}>${n}</option>`).join('')}</select></label></div>`;
  } else if (model.kind === 'people') {
    controls = `<h3>Does order matter?</h3><div class="cm-controls"><div class="cm-mode" role="group" aria-label="What are we choosing?"><button type="button" data-model-mode="arrange" aria-pressed="${model.mode === 'arrange'}">Different roles</button><button type="button" data-model-mode="choose" aria-pressed="${model.mode === 'choose'}">Same team</button></div><label>People<select data-model-people><option selected>3</option><option>4</option></select></label></div>`;
  } else if (model.kind === 'repeats') {
    controls = `<h3>Make a two-letter code</h3><p>Use A, B, or C in each slot. AB and BA are different codes.</p><label class="cm-toggle"><input type="checkbox" data-model-repeats checked> A letter may repeat</label>`;
  } else {
    controls = `<h3>Toss a coin twice</h3><p>Use a fair coin. The two tosses are independent. H = heads; T = tails.</p><div class="cm-controls"><label>Count this event<select data-model-event><option value="one">Exactly one head</option><option value="two">Two heads</option><option value="at-least-one">At least one head</option></select></label></div>`;
  }
  return `<section class="counting-model" data-counting-model="${skillId}">${controls}<div data-model-result>${resultHtml(model)}</div><p class="visually-hidden" data-model-announcement role="status" aria-live="polite" aria-atomic="true"></p></section>`;
}

/** Attach to the rendered model, or to an ancestor containing it. Safe to call again. */
export function attachCountingModel(rootElement, skillId) {
  if (!rootElement || !SUPPORTED.has(skillId)) return;
  const selector = `[data-counting-model="${skillId}"]`;
  const root = rootElement.matches?.(selector) ? rootElement : rootElement.querySelector(selector);
  if (!root || attached.has(root)) return;
  attached.add(root);
  let mode = skillId === 'combinations' ? 'choose' : 'arrange';
  const update = (announce = true) => {
    const model = enumerateCountingModel(skillId, {
      shirts: root.querySelector('[data-model-shirts]')?.value,
      pants: root.querySelector('[data-model-pants]')?.value,
      people: root.querySelector('[data-model-people]')?.value,
      repeats: root.querySelector('[data-model-repeats]')?.checked,
      event: root.querySelector('[data-model-event]')?.value,
      mode,
    });
    root.querySelectorAll('[data-model-mode]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.modelMode === mode));
    });
    root.querySelector('[data-model-result]').innerHTML = resultHtml(model);
    if (announce) root.querySelector('[data-model-announcement]').textContent = root.querySelector('.cm-count').textContent;
  };
  root.addEventListener('change', event => {
    if (event.target.matches('select, input[data-model-repeats]')) update();
  });
  root.querySelectorAll('[data-model-mode]').forEach(button => button.addEventListener('click', () => {
    mode = button.dataset.modelMode;
    update();
  }));
  update(false);
}
