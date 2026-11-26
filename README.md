# İlçe Atlası

**GMT 458 Web GIS · Assignment 2 GeoGame**

İlçe Atlası is a browser-based geography game about Türkiye’s administrative districts. Choose a province, use its district boundaries as spatial clues, and type the names you recognize. Correct guesses reveal and label the corresponding polygons. All 81 provinces on the national map are playable. The interface is available in Turkish and English. Players can explore at their own pace in **Free Play** or compete for a province record in the **60-Second Challenge**.

## Functional requirements

- Provide a home screen with **Free Play**, **60-Second Challenge**, **How to Play**, and **Settings**. Save the selected interface language in the browser.
- Display an interactive, unlabeled map. Let players choose a playable province by clicking it or by searching for its name.
- Draw the selected province’s district boundaries and accept correct names as the player types, without requiring Enter. Accept spellings without Turkish diacritics. Fill and label the matching polygon after a correct guess.
- Offer progressive hints, calculate scores and area coverage, and summarize progress across playable provinces.
- Save guesses, hints, scores, and the active province in browser storage. Allow each province to be reset independently.

## Frontend layout sketches

**Home screen**

```text
+------------------------------------------------------------+
| Ilce Atlasi                                     [Settings] |
|                                                            |
| Explore Türkiye's districts.        +-------------------+  |
|                                     |   Türkiye map     |  |
| [Free Play] [60-Second Challenge]          |   illustration    |  |
|                                     +-------------------+  |
| Map data                                                   |
+------------------------------------------------------------+
```

**Game screen**

```text
+------------------------------------------------------------+
| [Home] [Türkiye Map]                     [Progress   2/81] |
|                                          +---------------+ |
|                                          | Total score   | |
|          Full-window interactive map     | Province stats| |
|          Province or district boundaries | Progress by   | |
|                                          | province/reset| |
|                                          +---------------+ |
|                   [District name] [Hint]                   |
|                  [Search for a province]                   |
+------------------------------------------------------------+
```

The progress panel expands on request. The district input and hint controls appear after a province is selected. The game rules and language settings open in dialogs from the home screen.

## Game progression

1. Pick any playable province. Its district polygons start as outlines without names.
2. Guess districts in any order. A correct answer reveals its polygon and name and updates the score, district count, and area coverage.
3. If you need help, request a hint. It highlights a randomly chosen, unguessed district. The next hint shows its letter count, and each further hint reveals a random remaining letter.
4. Find every district to complete the province. You can switch provinces whenever you like and return to your saved progress. Provinces vary in size and number of districts, so players choose their own difficulty.

**Tasks and lives.** There are 973 district-name tasks across all 81 playable provinces. The game has no lives. Incorrect guesses do not subtract points or limit attempts.

**Scoring and high scores.** A district earns 100 points without hints. Each hint used for that district deducts 15 points, with a minimum of 10 points. A correct guess scores once per district until its province is reset. Free Play saves cumulative and province scores. The 60-Second Challenge uses the same scoring rules and saves the highest completed-round score separately for each province. A tie keeps the previous record. Challenge scores and guesses are separate from Free Play. The results show the round score, province best, districts found, and area coverage.

## 60-Second Challenge

Choose **60-Second Challenge** on the home screen, select a province, and choose **Start Round** after the map finishes loading and zooming.

- Each round starts with all districts unguessed. The clock begins at 1:00 and keeps running while you use hints or switch browser tabs.
- The round ends at 0:00 or as soon as all districts are found. Only guesses accepted before the deadline score points.
- A correct answer starts at 100 points. Each hint for that district costs 15 points, with a minimum of 10. Incorrect guesses carry no point penalty.
- The results show districts found, area coverage, round score, and the province record. A higher finished-round score replaces the browser’s saved record for that province.
- Leaving or refreshing during a round discards that round. Challenge records are stored separately from untimed **Free Play** progress.

## Web GIS and JavaScript libraries

| Technology | Use |
| --- | --- |
| HTML, CSS, vanilla JavaScript | Responsive layout, controls, game state, and interaction |
| Leaflet 1.9.4 | Draw GeoJSON polygons, handle map selection, and animate the transition to a selected province with `flyToBounds` |
| Turf.js 7.2.0 | Calculate geodesic polygon areas with `turf.area` and place district labels with `pointOnFeature` |

The area coverage percentage divides the total area of found district polygons by the total area of all district polygons in the selected province. The province list shows district completion by count. These percentages can differ because districts have different sizes.

The province and district boundaries come from the Türkiye Harita Verisi project, which publishes HDX-derived administrative boundaries. Province and district names are joined to their geometries by ID, and district records are grouped using their parent province IDs. See the data notice for attribution and licensing information. [Türkiye Harita Verisi](https://github.com/ttezer/turkiye-harita-verisi) · [HDX dataset](https://data.humdata.org/dataset/cod-ab-tur) · [Data notice](data/NOTICE)

## Implementation

### Three event handlers

| Event | What the handler does |
| --- | --- |
| Province polygon `click` | Opens the district map for the clicked province if it is playable. Otherwise, it displays an availability tooltip. [Map code](js/map.js) |
| District input `input` | Normalizes the guess, checks it against unguessed districts, and updates the score, map, and saved progress on a match. [Game controller](js/app.js) |
| Hint button `click` | Advances the current hint, saves it, and refreshes the map highlight or the letter clue. [Game controller](js/app.js) · [Hint logic](js/game.js) |

### Closures

`createMap()` returns methods that retain access to the Leaflet map, its current layer, and the district-layer lookup. This keeps map state private while allowing the controller to switch layers and update individual districts. Each reset button also gets a callback that captures its own province, so it resets the correct record even when another province is open.

### DOM interaction

The controller looks up controls by ID, uses `createElement` and `replaceChildren` to build search results and progress rows, assigns `textContent` for labels and scores, and toggles `hidden` to switch between screens. Rules and settings use native dialogs. Progress and language preference are stored with `localStorage`.

## Run and publish

Open `index.html` directly to play locally. The libraries and data are included in the project. On a web server, the game loads GeoJSON files directly. Local file mode uses the equivalent `.geojson.js` files.

To publish, push the project to a GitHub repository and configure GitHub Pages to serve the branch root. Enter the repository URL in the course peer-review system. [Course peer-review system](https://gmt458.hacettepe.edu.tr/)

- [GitHub repository](https://github.com/teddyyoga/District-Atlas)
- [Play District Atlas on GitHub Pages](https://teddyyoga.github.io/District-Atlas/)

## AI assistance and lessons

ChatGPT helped plan the game, identify how to connect district geometry with name data, and work through browser loading and game state. The project illustrates how to normalize Turkish text for matching, why local file loading differs from loading over HTTP, and how to separate district-count progress from geographic area coverage. It also shows how province-level state can support independent resets without deleting the rest of the saved game.

- ChatGPT interaction URL — pending addition of the shared conversation link.
