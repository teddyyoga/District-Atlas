function normalize(value) {
  return value.toLocaleLowerCase('tr').normalize('NFD')
    .replace(/\p{Mark}/gu, '').replace(/ı/g, 'i').replace(/[^a-z0-9]/g, '');
}

const raceDifficulties = ['hard', 'medium', 'easy'];

function raceDuration(districtCount, difficulty) {
  const baseMinutes = { hard: 1, medium: 2, easy: 5 };
  const provinceTier = districtCount <= 10 ? 0 : districtCount <= 25 ? 1 : 2;
  return (baseMinutes[difficulty] + provinceTier) * 60;
}

function shuffleDistricts(items) {
  const shuffled = [...items];
  for (let end = shuffled.length - 1; end > 0; end--) {
    const index = Math.floor(Math.random() * (end + 1));
    [shuffled[index], shuffled[end]] = [shuffled[end], shuffled[index]];
  }
  return shuffled;
}

function mapAnswerPoints(wrongCount, hints) {
  return Math.max(10, Math.max(25, 100 - wrongCount * 25) - hints * 15);
}

function compassDirection([lon, lat], [west, south, east, north]) {
  const x = (lon - (west + east) / 2) / (east - west);
  const y = (lat - (south + north) / 2) / (north - south);
  if (Math.hypot(x, y) < .17) return 'center';
  const sectors = ['east', 'northeast', 'north', 'northwest', 'west', 'southwest', 'south', 'southeast'];
  return sectors[(Math.round(Math.atan2(y, x) / (Math.PI / 4)) + 8) % 8];
}

const newProgress = () => ({ found: {}, hint: null });

function pointsForHint(hint) {
  return Math.max(10, 100 - 15 * (hint?.steps ?? 0));
}

function takeHint(progress, districts, random = Math.random) {
  const unknown = districts.filter(({ id }) => !Object.hasOwn(progress.found, id));
  if (unknown.length === 0) return;
  const current = progress.hint;
  if (!current) {
    const { id } = unknown[Math.floor(random() * unknown.length)];
    progress.hint = { id, steps: 1, revealed: [] };
    return;
  }
  if (current.steps === 1) {
    current.steps = 2;
    return;
  }
  const district = unknown.find(({ id }) => id === current.id);
  const available = Array.from(district.name)
    .map((letter, index) => /\p{L}/u.test(letter) && !current.revealed.includes(index) ? index : -1)
    .filter(index => index >= 0);
  if (available.length) {
    current.revealed.push(available[Math.floor(random() * available.length)]);
    current.steps++;
  }
}

function clueText(district, hint) {
  return Array.from(district.name, (letter, index) =>
    /\p{L}/u.test(letter) && !hint.revealed.includes(index) ? '_' : letter).join(' ');
}
