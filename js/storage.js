const key = 'ilce-tahmin-v1';
const emptyState = () => ({ active: null, provinces: {}, bestScores: {}, raceRecords: {}, mapRecords: {} });
function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    return saved?.provinces ? { ...emptyState(), ...saved } : emptyState();
  } catch {
    return emptyState();
  }
}
function saveState(state) {
  try {
    localStorage.setItem(key, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
