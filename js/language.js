const translations = {
  tr: {
    brand: 'İlçe Atlası', settings: 'Ayarlar', headline: 'Türkiye’nin ilçelerini keşfet',
    intro: 'Haritadan bir il seç, ilçelerini tahmin et ve ilerlemeni takip et.',
    start: 'Serbest Oyun', rules: 'Nasıl Oynanır?', source: 'Harita verisi', home: 'Ana Sayfa',
    turkey: 'Türkiye Haritası', map: 'Türkiye il ve ilçe sınırları', progress: 'İlerleme',
    total: 'Toplam puan', found: 'Bulunan ilçe', points: 'İl puanı', area: 'Alan kapsaması',
    byProvince: 'İllere göre ilerleme', storage: 'Tarayıcı ilerlemeyi kaydedemiyor.',
    guess: 'İlçe adını yaz', hint: 'İpucu al', search: 'İl ara', ready: 'Oynanabilir',
    started: 'Devam ediyor', done: 'Tamamlandı', unavailable: 'Henüz eklenmedi',
    rule1: 'Haritadan bir il seç veya alttaki arama çubuğunu kullan.',
    rule2: 'İlçe adını yaz. Doğru tahmin Enter’a basmadan işlenir. Türkçe karakterler isteğe bağlıdır.',
    rule3: 'İpuçları sırayla ilçenin konumunu, harf sayısını ve rastgele harfleri gösterir.',
    rule4: 'Her doğru tahmin 100 puan kazandırır. Her ipucu 15 puan düşürür. En düşük puan 10’dur.',
    rule5: 'İlerleme bölümündeki il yüzdeleri bulunan ilçe oranıdır. Seçili ilin alan kapsaması ayrıca gösterilir.',
    close: 'Kapat', language: 'Arayüz dili', reset: 'Sıfırla', noResults: 'İl bulunamadı.',
    loading: 'Harita yükleniyor…', loadError: 'Harita yüklenemedi. Sayfayı yenileyerek tekrar dene.',
    provinceLoading: name => name + ' yükleniyor…',
    provinceError: name => name + ' yüklenemedi. Yeniden seçerek tekrar dene.',
    completed: name => name + ' tamamlandı!', earned: points => '+' + points + ' puan',
    mapQuiz: 'Haritada Bul', playType: 'Oyun biçimi', untimed: 'Süresiz', timed: 'Süreli',
    locateStart: 'Turu Başlat', skip: 'Pas geç',
    districtChoice: n => 'Harita ilçesi ' + n, locate: name => name + ' nerede?',
    wrongDistrict: 'Bu ilçe değil. Tekrar dene.', passedDistrict: name => name + ' haritada gösterildi. Puan yok.',
    narrowHint: 'Üç sarı ilçeden biri doğru.', mapRoundDone: 'Tüm sorular tamamlandı!',
    mapRule: 'Haritada Bul modunda adı verilen ilçeye tıkla. İlk doğru seçim 100 puan. Her yanlış seçim 25, her ipucu 15 puan düşürür. Doğru seçimin taban puanı 10’dur. Pas geçilen soru puan getirmez.',
    compass: direction => 'Yaklaşık konum · ' + ({ center:'Orta kesimler', north:'Kuzey', northeast:'Kuzeydoğu', east:'Doğu', southeast:'Güneydoğu', south:'Güney', southwest:'Güneybatı', west:'Batı', northwest:'Kuzeybatı' })[direction],
    challenge: 'Yarış Modu', raceStart: 'Yarışı Başlat', timeLeft: 'Kalan süre',
    raceResult: 'Yarış Sonucu', raceScore: 'Yarış puanı', best: 'İl rekoru',
    difficulty: 'Zorluk', hard: 'Zor', medium: 'Orta', easy: 'Kolay', legacyRace: 'Eski 60 sn',
    records: 'İl rekorları', retry: 'Tekrar Yarış', changeProvince: 'İl Değiştir',
    timeout: 'Süre doldu!', newBest: 'Yeni il rekoru!',
    cancelRace: 'Bu yarışı bırakmak istiyor musun? Tur puanı kaydedilmeyecek.',
    raceRule: 'Yarış Modu’nda süre ilin ilçe sayısına ve seçtiğin zorluğa göre belirlenir. Sayaç Yarışı Başlat düğmesiyle başlar ve ipucu alırken de işler. Yalnızca süre içinde kabul edilen tahminler puan getirir. Yarım bırakılan turlar kaydedilmez. Rekorlar il ve zorluk bazında tutulur.',
    locationHint: 'İpucu verilen ilçe haritada sarı.',
    resetTitle: name => name + ' ilerlemesini sıfırla',
    confirmReset: name => name + ' ilinin puanları, tahminleri ve ipuçları sıfırlansın mı?',
  },
  en: {
    brand: 'District Atlas', settings: 'Settings', headline: 'Explore Türkiye’s districts',
    intro: 'Pick a province, guess its districts and track your progress.',
    start: 'Free Play', rules: 'How to Play', source: 'Map data', home: 'Home',
    turkey: 'Türkiye Map', map: 'Province and district boundaries of Türkiye', progress: 'Progress',
    total: 'Total score', found: 'Districts found', points: 'Province score', area: 'Area coverage',
    byProvince: 'Progress by province', storage: 'Your browser cannot save progress.',
    guess: 'Type a district name', hint: 'Get a hint', search: 'Search for a province', ready: 'Playable',
    started: 'In progress', done: 'Completed', unavailable: 'Not yet available',
    rule1: 'Pick a province on the map or use the search bar at the bottom.',
    rule2: 'Type a district name. Correct guesses count automatically. Turkish characters are optional.',
    rule3: 'Hints show the district’s location first, then its letter count and random letters.',
    rule4: 'A correct guess earns 100 points. Each hint costs 15 points, with a minimum score of 10.',
    rule5: 'Province percentages show the share of districts found. Area coverage is shown separately for the selected province.',
    close: 'Close', language: 'Interface language', reset: 'Reset', noResults: 'No provinces found.',
    loading: 'Loading map…', loadError: 'The map could not load. Refresh and try again.',
    provinceLoading: name => 'Loading ' + name + '…',
    provinceError: name => 'Could not load ' + name + '. Select it again to retry.',
    completed: name => name + ' completed!', earned: points => '+' + points + ' points',
    mapQuiz: 'Find on the Map', playType: 'Play type', untimed: 'Untimed', timed: 'Timed',
    locateStart: 'Start Round', skip: 'Skip',
    districtChoice: n => 'Map district ' + n, locate: name => 'Where is ' + name + '?',
    wrongDistrict: 'That is a different district. Try again.', passedDistrict: name => name + ' was revealed. No points.',
    narrowHint: 'One of the three yellow districts is correct.', mapRoundDone: 'All questions completed!',
    mapRule: 'In Find on the Map, click the named district. A first-try answer earns 100 points. Each wrong guess costs 25 and each hint costs 15. A correct answer earns at least 10. Skipping earns no points.',
    compass: direction => 'Approximate location · ' + ({ center:'Central area', north:'North', northeast:'Northeast', east:'East', southeast:'Southeast', south:'South', southwest:'Southwest', west:'West', northwest:'Northwest' })[direction],
    challenge: 'Race Mode', raceStart: 'Start Round', timeLeft: 'Time left',
    raceResult: 'Round Results', raceScore: 'Round score', best: 'Province best',
    difficulty: 'Difficulty', hard: 'Hard', medium: 'Medium', easy: 'Easy', legacyRace: 'Legacy 60s',
    records: 'Province records', retry: 'Try Again', changeProvince: 'Change Province',
    timeout: 'Time is up!', newBest: 'New province record!',
    cancelRace: 'Leave this round? Your round score will not be saved.',
    raceRule: 'In Race Mode, the time limit depends on the number of districts and your chosen difficulty. The clock starts when you select Start Round and keeps running during hints. Only guesses accepted before time runs out earn points. Abandoned rounds are discarded. Records are tracked per province and difficulty.',
    locationHint: 'The hinted district is highlighted in yellow.',
    resetTitle: name => 'Reset progress for ' + name,
    confirmReset: name => 'Reset the score, guesses and hints for ' + name + '?',
  },
};

let language = 'tr';
try {
  if (localStorage.getItem('ilce-language') === 'en') language = 'en';
} catch { /* The page can still use its default language. */ }

function translate(key, value) {
  const text = translations[language][key];
  return typeof text === 'function' ? text(value) : text;
}

function percentText(value, digits = 0) {
  return (value / 100).toLocaleString(language === 'tr' ? 'tr-TR' : 'en', {
    style: 'percent', maximumFractionDigits: digits,
  });
}

function applyLanguage() {
  document.documentElement.lang = language;
  document.title = translate('brand');
  for (const node of document.querySelectorAll('[data-text]')) node.textContent = translate(node.dataset.text);
  for (const node of document.querySelectorAll('[data-label]')) node.setAttribute('aria-label', translate(node.dataset.label));
  for (const node of document.querySelectorAll('[data-placeholder]')) node.placeholder = translate(node.dataset.placeholder);
}
