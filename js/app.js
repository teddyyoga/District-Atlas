
const ui = Object.fromEntries(Array.from(document.querySelectorAll('[id]'), node => [node.id, node]));
let state = loadState();
let map, provinces, active, progress, districts, totalArea;
let request = 0;
let guessTimer;
let playable = [];
let challengeMode = false;
let round = null;
let roundTimer;
const roundSeconds = 60;
const cache = new Map();
const score = record => Object.values(record?.found ?? {}).reduce((sum, points) => sum + points, 0);
const owns = (record, id) => Object.hasOwn(record.found, id);

function loadLocalData(path) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = path + '.js';
    script.onload = () => {
      const data = script.geojson;
      script.remove();
      if (data) resolve(data);
      else reject(new Error(path));
    };
    script.onerror = () => {
      script.remove();
      reject(new Error(path));
    };
    document.head.append(script);
  });
}

async function fetchData(path) {
  if (location.protocol === 'file:') return loadLocalData(path);
  // Bump the version when the published GeoJSON changes.
  const response = await fetch(path + '?v=81-provinces', { cache: 'no-cache' });
  if (!response.ok) throw new Error(path + ' · ' + response.status);
  return response.json();
}

function persist() {
  ui['storage-note'].hidden = saveState(state);
}

function status(province) {
  const record = state.provinces[province.id];
  if (!province.districtCount) return 'unavailable';
  if (Object.keys(record?.found ?? {}).length >= province.districtCount) return 'done';
  return record && (score(record) || record.hint) ? 'started' : 'ready';
}

function renderRecords() {
  const records = Object.entries(state.bestScores);
  ui.summary.textContent = active ? (state.bestScores[active.id] ?? '—') : records.length + ' / ' + playable.length;
  ui['progress-list'].replaceChildren(...playable.map(province => {
    const row = document.createElement('li');
    const name = document.createElement('span');
    const best = document.createElement('span');
    name.textContent = province.name;
    best.className = 'percent';
    best.textContent = state.bestScores[province.id] ?? '—';
    row.append(name, best);
    return row;
  }));
}

function renderProgress() {
  if (challengeMode) {
    renderRecords();
    return;
  }
  const complete = playable.filter(province => status(province) === 'done').length;
  ui.summary.textContent = complete + ' / ' + playable.length;
  const rows = playable.map(province => {
    const record = state.provinces[province.id];
    const count = Object.keys(record?.found ?? {}).length;
    const row = document.createElement('li');
    const name = document.createElement('span');
    name.textContent = province.name;
    const percentage = document.createElement('span');
    percentage.className = 'percent';
    percentage.textContent = percentText(100 * count / province.districtCount, 1);
    const reset = document.createElement('button');
    reset.type = 'button';
    reset.textContent = translate('reset');
    reset.setAttribute('aria-label', translate('resetTitle', province.name));
    reset.disabled = !count && !record?.hint;
    reset.addEventListener('click', () => resetProvince(province));
    row.append(name, percentage, reset);
    return row;
  });
  ui['progress-list'].replaceChildren(...rows);
}

function resetProvince(province) {
  if (!confirm(translate('confirmReset', province.name))) return;
  delete state.provinces[province.id];
  if (active?.id === province.id) {
    clearTimeout(guessTimer);
    progress = newProgress();
    state.provinces[province.id] = progress;
    ui.guess.value = ui.feedback.textContent = '';
    renderGame();
  } else if (!active) {
    renderMenu(false);
  } else {
    totals();
    renderProgress();
  }
  persist();
  ui['province-progress'].querySelector('summary').focus();
}

function totals() {
  ui.total.textContent = Object.values(state.provinces).reduce((sum, record) => sum + score(record), 0);
}

function message(text) {
  ui['map-status'].textContent = text;
  ui['map-status'].hidden = !text;
}

function renderMenu(animate = true) {
  discardRound();
  request++;
  active = null;
  ui.game.hidden = ui.back.hidden = ui['province-stats'].hidden = true;
  ui.legend.hidden = false;
  ui.province.disabled = false;
  closeSearch(true);
  message('');
  totals();
  renderProgress();
  map.showProvinces(provinces, challengeMode ? province => province.districtCount ? 'ready' : 'unavailable' : status, openProvince, animate);
}

async function openProvince(id, restoring = false) {
  const province = provinces.features.find(feature => feature.properties.id === id)?.properties;
  if (!province?.districtCount || round?.phase === 'running') return;
  const token = ++request;
  closeSearch(true);
  if (challengeMode) ui['race-start'].disabled = true;
  message(translate('provinceLoading', province.name));
  try {
    const data = cache.get(id) ?? await fetchData('data/districts/' + id + '.geojson');
    cache.set(id, data);
    if (token !== request) return;
    discardRound();
    active = province;
    districts = data.features.map(feature => ({
      ...feature.properties, answer: normalize(feature.properties.name), area: turf.area(feature),
    }));
    totalArea = districts.reduce((sum, district) => sum + district.area, 0);
    if (challengeMode) {
      progress = newProgress();
      round = { phase: 'ready', deadline: null };
      ui['race-clock'].hidden = false;
      ui['race-ready'].hidden = false;
      ui['race-start'].textContent = translate('raceStart');
      ui['race-province'].textContent = active.name;
      ui['guess-row'].hidden = true;
      setClock(roundSeconds);
    } else {
      progress = state.provinces[id] ?? newProgress();
      state.provinces[id] = progress;
      state.active = id;
      persist();
    }
    ui.legend.hidden = true;
    ui.back.hidden = ui.game.hidden = ui['province-stats'].hidden = false;
    ui.title.textContent = province.name;
    ui.guess.value = ui.feedback.textContent = '';
    map.showDistricts(data, challengeMode ? () => {
      if (token === request && round?.phase === 'ready') ui['race-start'].disabled = false;
    } : undefined);
    message('');
    renderGame();
    if (!challengeMode && !restoring && matchMedia('(pointer: fine)').matches) ui.guess.focus();
  } catch (error) {
    if (token === request) {
      ui.province.value = '';
      if (challengeMode && round) ui['race-start'].disabled = false;
      message(translate('provinceError', province.name));
      console.error(error);
    }
  }
}

function renderGame(celebrateId) {
  const found = districts.filter(district => owns(progress, district.id));
  const completed = found.length === districts.length;
  const area = completed ? 100 : (100 * found.reduce((sum, district) => sum + district.area, 0) / totalArea);
  const hint = progress.hint;
  ui.count.textContent = found.length + ' / ' + districts.length;
  ui.points.textContent = score(progress);
  ui.area.textContent = percentText(area, 1);
  ui.coverage.value = area;
  const locked = challengeMode && round?.phase !== 'running';
  ui.guess.disabled = locked || completed;
  for (const district of districts) {
    map.paintDistrict(district, owns(progress, district.id), hint?.id === district.id, celebrateId === district.id);
  }
  const target = districts.find(district => district.id === hint?.id);
  const letters = target && clueText(target, hint);
  renderClue(target, hint);
  ui.hint.disabled = locked || completed || Boolean(hint?.steps >= 2 && letters && !letters.includes('_'));
  if (completed && !celebrateId) ui.feedback.textContent = translate('completed', active.name);
  totals();
  renderProgress();
}

function renderClue(target, hint) {
  const signature = target ? target.id + ':' + hint.steps : '';
  if (ui.clue.dataset.clue === signature) return;
  const previous = ui.clue.dataset.clue?.startsWith(target?.id + ':') ? [...ui.clue.children] : [];
  ui.clue.dataset.clue = signature;
  ui.clue.replaceChildren();
  if (!target) return;
  if (hint.steps === 1) {
    const message = document.createElement('span');
    message.className = 'clue-reveal';
    message.textContent = translate('locationHint');
    ui.clue.append(message);
    return;
  }
  const tiles = Array.from(target.name, (letter, index) => {
    const tile = document.createElement('span');
    const isLetter = /\p{L}/u.test(letter);
    tile.className = 'clue-tile';
    tile.textContent = isLetter && !hint.revealed.includes(index) ? '_' : letter;
    if (isLetter && tile.textContent !== previous[index]?.textContent) {
      tile.classList.add('clue-reveal');
      if (hint.steps === 2) tile.style.animationDelay = Math.min(index * 24, 280) + 'ms';
    }
    return tile;
  });
  ui.clue.append(...tiles);
}

function setClock(seconds) {
  const time = Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
  if (ui['race-time'].textContent !== time) ui['race-time'].textContent = time;
  ui['race-clock'].classList.toggle('low-time', seconds <= 10);
}

function discardRound() {
  clearTimeout(guessTimer);
  clearInterval(roundTimer);
  round = null;
  ui['race-clock'].hidden = ui['race-ready'].hidden = true;
  ui['guess-row'].hidden = false;
}

function updateClock() {
  if (round?.phase !== 'running') return false;
  const remaining = Math.max(0, Math.ceil((round.deadline - Date.now()) / 1000));
  setClock(remaining);
  if (remaining === 0) finishRound(false);
  return remaining > 0;
}

function finishRound(completed) {
  round.phase = 'finished';
  clearInterval(roundTimer);
  clearTimeout(guessTimer);
  ui.province.disabled = false;
  const points = score(progress);
  const previousBest = state.bestScores[active.id];
  const newBest = previousBest === undefined || points > previousBest;
  if (newBest) {
    state.bestScores[active.id] = points;
    persist();
  }
  renderGame();
  ui['race-result-province'].textContent = active.name;
  ui['race-result-status'].textContent = (completed ? translate('completed', active.name) : translate('timeout'))
    + (newBest ? ' · ' + translate('newBest') : '');
  ui['race-result-count'].textContent = ui.count.textContent;
  ui['race-result-area'].textContent = ui.area.textContent;
  ui['race-result-score'].textContent = points;
  ui['race-result-best'].textContent = state.bestScores[active.id];
  ui['race-ready'].hidden = false;
  ui['race-start'].textContent = translate('retry');
  ui['race-start'].disabled = false;
  ui['guess-row'].hidden = true;
  ui['race-dialog'].showModal();
}

function canLeaveRound() {
  return round?.phase !== 'running' || (updateClock() && confirm(translate('cancelRace')));
}

ui['race-start'].addEventListener('click', () => {
  if (ui['race-start'].disabled) return;
  if (round?.phase === 'finished') {
    openProvince(active.id);
    return;
  }
  if (round?.phase !== 'ready') return;
  round.phase = 'running';
  round.deadline = Date.now() + roundSeconds * 1000;
  ui['race-ready'].hidden = true;
  ui['guess-row'].hidden = false;
  ui.province.disabled = true;
  closeSearch(true);
  renderGame();
  ui.guess.focus();
  roundTimer = setInterval(updateClock, 100);
});

document.addEventListener('visibilitychange', updateClock);
ui['race-retry'].addEventListener('click', () => {
  ui['race-dialog'].close();
  openProvince(active.id);
});
ui['race-change'].addEventListener('click', () => {
  ui['race-dialog'].close();
  renderMenu();
});

function acceptGuess(district) {
  if (challengeMode && !updateClock()) return;
  const hint = progress.hint?.id === district.id ? progress.hint : null;
  const earned = pointsForHint(hint);
  progress.found[district.id] = earned;
  if (hint) progress.hint = null;
  if (!challengeMode) persist();
  ui.guess.value = '';
  const completed = districts.every(item => owns(progress, item.id));
  ui.feedback.textContent = district.name + ' · ' + translate('earned', earned) + (completed ? ' · ' + translate('completed', active.name) : '');
  renderGame(district.id);
  if (challengeMode && completed) finishRound(true);
}

function onGuess(event) {
  clearTimeout(guessTimer);
  if (event.isComposing || !active || (challengeMode && !updateClock())) return;
  const value = normalize(ui.guess.value);
  const unknown = districts.filter(district => !owns(progress, district.id));
  const correct = unknown.find(district => district.answer === value);
  if (!correct) return;
  if (unknown.some(district => district !== correct && district.answer.startsWith(value))) {
    guessTimer = setTimeout(() => acceptGuess(correct), 500);
    return;
  }
  acceptGuess(correct);
}

ui.guess.addEventListener('input', onGuess);
ui.guess.addEventListener('compositionend', onGuess);
ui.hint.addEventListener('click', () => {
  if (challengeMode && !updateClock()) return;
  takeHint(progress, districts);
  if (!challengeMode) persist();
  renderGame();
});
function matchingProvinces() {
  const query = normalize(ui.province.value);
  return playable.filter(province => normalize(province.name).includes(query));
}

function closeSearch(clear = false) {
  ui.results.hidden = true;
  if (clear) ui.province.value = '';
}

function renderSearch() {
  const rows = matchingProvinces().map(province => {
    const row = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = province.name;
    button.addEventListener('click', () => openProvince(province.id));
    row.append(button);
    return row;
  });
  if (!rows.length) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent = translate('noResults');
    rows.push(empty);
  }
  ui.results.replaceChildren(...rows);
  ui.results.hidden = false;
}

ui.province.addEventListener('focus', renderSearch);
ui.province.addEventListener('input', renderSearch);
ui.province.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeSearch(true);
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    if (ui.results.hidden) renderSearch();
    ui.results.querySelector('button')?.focus();
  }
  if (event.key === 'Enter') {
    const match = matchingProvinces()[0];
    if (!ui.results.hidden && match) openProvince(match.id);
  }
});
ui.results.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    ui.province.focus();
    closeSearch(true);
  }
});
ui.province.parentElement.addEventListener('focusout', event => {
  if (!ui.province.parentElement.contains(event.relatedTarget)) closeSearch();
});
document.addEventListener('pointerdown', event => {
  if (!ui.province.parentElement.contains(event.target)) closeSearch();
});
ui.back.addEventListener('click', () => {
  if (!canLeaveRound()) return;
  if (!challengeMode) {
    state.active = null;
    persist();
  }
  renderMenu();
});
ui['home-button'].addEventListener('click', () => {
  if (!canLeaveRound()) return;
  request++;
  discardRound();
  closeSearch();
  active = null;
  ui.play.hidden = true;
  ui.home.hidden = false;
  (challengeMode ? ui.challenge : ui.start).focus();
});
ui['rules-button'].addEventListener('click', () => ui['rules-dialog'].showModal());
ui['settings-button'].addEventListener('click', () => ui['settings-dialog'].showModal());
ui.language.value = language;
ui.language.addEventListener('change', () => {
  language = ui.language.value;
  try { localStorage.setItem('ilce-language', language); } catch { /* Apply for this session. */ }
  applyLanguage();
});
applyLanguage();

async function openGame(timed) {
  challengeMode = timed;
  ui['free-score'].hidden = timed;
  ui['province-progress-label'].textContent = translate(timed ? 'records' : 'byProvince');
  ui.home.hidden = true;
  ui.play.hidden = false;
  ui['home-button'].focus();
  const token = ++request;
  message(translate('loading'));
  try {
    if (!window.L || !window.turf) throw new Error('Leaflet / Turf');
    const data = provinces ?? await fetchData('data/provinces.geojson');
    if (token !== request) return;
    provinces = data;
    playable = data.features.map(feature => feature.properties).filter(province => province.districtCount);
    playable.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    map ??= createMap(ui.map);
    map.refresh();
    renderMenu(false);
    if (!timed && state.active) await openProvince(state.active, true);
  } catch (error) {
    if (token === request) message(translate('loadError'));
    console.error(error);
  }
}

ui.start.addEventListener('click', () => openGame(false));
ui.challenge.addEventListener('click', () => openGame(true));
