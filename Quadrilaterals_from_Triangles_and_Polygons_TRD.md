# Technical Requirements Document (TRD)
## Quadrilaterals from Triangles and Polygons — Grade 7 Math
**Intellia SG | Global Grade 7 Mathematics Curriculum**

---

| | |
|---|---|
| **Document Version** | 1.0 |
| **Companion Document** | `Quadrilaterals_from_Triangles_and_Polygons_PRD.md` |
| **Reference UI (mirror exactly)** | https://equal-tau.vercel.app/ |
| **Reference Repo** | https://github.com/dsamyak/equal |
| **Technical Lead** | Intellia Engineering Team |

---

## 1. Technical Overview

This document specifies the architecture, state management, geometry engine, component design, question-generation logic, gamification implementation, audio pipeline, and quality standards for the **"Quadrilaterals from Triangles and Polygons"** interactive lesson module (Lesson 5.3) within Intellia SG's Grade 7 Math program.

The module is a **React 18 application (Vite + JSX)**, structured to mirror `github.com/dsamyak/equal` file-for-file wherever the pattern transfers directly (phase components, journey bar, audio engine, gamification utilities), and to extend it only where this topic genuinely requires new capability — principally, **real 2D geometry**: draggable polygon vertices, live angle computation, diagonal-splitting, and fan-triangulation. The reference build never needed this (its simulations were counting/grouping, not shape manipulation), so §6 below is new engineering surface, not a port.

It will be embedded at:

```
https://intelliasg.com/courses/grade-7-math/lessons/quadrilaterals-from-triangles-and-polygons/
```

Audio narration reuses the ElevenLabs pipeline already implemented in the reference build's `src/utils/audio.js`, unchanged in mechanism, with new narration scripts for this lesson's content (§8).

---

## 2. Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| UI Framework | React 18 (JSX, Vite) | Matches reference repo exactly |
| State Management | `useState` per phase + a lightweight `useReducer` in `App.jsx` for cross-phase state (XP, badges, phase) | Same pattern as reference; no external state library needed at this scope |
| Styling | Plain CSS (`index.css`, CSS custom properties) | Matches reference repo's approach exactly — no CSS-in-JS, no Tailwind, to keep the two codebases visually and structurally identical |
| Icons | Emoji + inline SVG | Matches reference (no icon library dependency observed in the reference `package.json`) |
| Geometry rendering | Inline SVG (React) | Required for scalable, crisp, live-recalculated polygons — new for this lesson |
| Geometry math | Vanilla JS (`src/utils/geometry.js`) | No external geometry library needed; all formulas are elementary trigonometry (§6) |
| Animation | CSS keyframes + transitions, plus `requestAnimationFrame` for the exterior-angle walker (§7.3) | Matches reference's CSS-first approach; RAF is the one addition, needed for the walking-marker animation |
| Persistence | `localStorage` | Session state, no backend required — matches reference |
| Audio (primary) | ElevenLabs API via `/api/elevenlabs` proxy, client fallback | Matches reference exactly |
| Audio (playback) | HTML5 `Audio` API | Matches reference |
| SFX | Web Audio API oscillator tones | Matches reference `sounds` object |
| Build Tool | Vite | Matches reference (`vite.config.js` present, identical plugin) |

---

## 3. Project Structure

```
quadrilaterals-from-triangles-and-polygons/
├── public/
│   └── assets/
│       ├── audio/                        # Pre-generated ElevenLabs .mp3 files
│       │   ├── audio_wonder_hook_0.mp3
│       │   ├── audio_story_panel1_0.mp3
│       │   ├── ... (one per narration.js phrase — see §8.3)
│       └── images/
│           ├── mascot-idle.svg
│           ├── mascot-happy.svg
│           ├── mascot-thinking.svg
│           ├── mascot-celebrate.svg
│           └── world-map-bg.svg
├── src/
│   ├── main.jsx                          # React entry point — identical to reference
│   ├── App.jsx                           # Root component, phase state — identical shape to reference
│   ├── index.css                         # Design tokens — inherited verbatim + additions (§11)
│   ├── components/
│   │   ├── FloatingShapes.jsx            # Reference's FloatingNumbers.jsx, re-skinned: drifting
│   │   │                                    polygon outlines instead of digits (this lesson is about
│   │   │                                    shapes, not numbers)
│   │   ├── IntroScreen.jsx
│   │   ├── WonderPhase.jsx
│   │   ├── StoryPhase.jsx                # 6-panel story (PRD §7)
│   │   ├── SimulatePhase.jsx             # Station wrapper/router — mirrors reference structure
│   │   ├── simulations/
│   │   │   ├── TriangleTearStation.jsx   # Station A (PRD §8.1)
│   │   │   ├── DiagonalSplitStation.jsx  # Station B (PRD §8.2) — the signature station
│   │   │   ├── PolygonBuilderStation.jsx # Station C (PRD §8.3)
│   │   │   └── QuadFamilySorterStation.jsx # Station D (PRD §8.4)
│   │   ├── shared/
│   │   │   ├── PolygonCanvas.jsx         # NEW — reusable draggable-vertex SVG polygon (§7.1)
│   │   │   ├── VertexHandle.jsx          # NEW — a single draggable vertex control point
│   │   │   ├── AngleArc.jsx              # NEW — renders the small arc + degree label at a vertex
│   │   │   ├── DiagonalLine.jsx          # NEW — an animatable diagonal/triangulation line
│   │   │   ├── ExteriorAngleWalker.jsx   # NEW — the RAF-driven walking marker (§7.3)
│   │   │   ├── Mascot.jsx                # Identical component to reference (LearnFlow)
│   │   │   ├── NumberPad.jsx             # Identical to reference
│   │   │   └── FeedbackOverlay.jsx       # Identical to reference
│   │   ├── PlayPhase.jsx
│   │   ├── QuestionRenderer.jsx          # Polymorphic dispatcher → type-specific component
│   │   ├── quiz/
│   │   │   ├── TriangleAngleHuntQ.jsx    # Q1
│   │   │   ├── ExteriorAngleQ.jsx        # Q2
│   │   │   ├── QuadAngleHuntQ.jsx        # Q3
│   │   │   ├── PolygonAngleSumQ.jsx      # Q4
│   │   │   ├── SidesFromSumQ.jsx         # Q5
│   │   │   ├── RegularPolygonAngleQ.jsx  # Q6
│   │   │   ├── DiagonalCounterQ.jsx      # Q7
│   │   │   ├── ShapeDetectiveQ.jsx       # Q8 (word problem)
│   │   │   ├── QuadFamilySortQ.jsx       # Q9 (word problem/classification)
│   │   │   ├── TrueFalseAngleQ.jsx       # Q10
│   │   │   └── HintOverlay.jsx           # Identical pattern to reference
│   │   ├── gamification/
│   │   │   ├── XPTracker.jsx             # Identical to reference
│   │   │   ├── StarRating.jsx            # Identical to reference
│   │   │   ├── BadgePanel.jsx            # Identical to reference, new badge set (PRD §9.3)
│   │   │   ├── StreakCounter.jsx         # Identical to reference
│   │   │   └── WorldMap.jsx              # Identical component, new world data (PRD §9.2)
│   │   └── ReflectPhase.jsx
│   ├── data/
│   │   └── storyContent.js               # 6-panel story text + visual refs (PRD §7)
│   ├── hooks/
│   │   ├── useAudio.js                   # Thin wrapper around utils/audio.js (matches reference)
│   │   ├── useGameState.js
│   │   ├── useLocalStorage.js
│   │   └── usePolygonDrag.js             # NEW — pointer-drag state + guard rails for PolygonCanvas
│   └── utils/
│       ├── audioMap.js                   # AUTO-GENERATED: text → .mp3 path map
│       ├── audio.js                      # Ported unmodified from reference
│       ├── narration.js                  # New scripts, same seg()/say()/ask()/... API as reference
│       ├── geometry.js                   # NEW — all polygon math (§6)
│       ├── questionBank.js               # NEW — 10 procedural generators (§5)
│       ├── shuffle.js                    # Ported unmodified (Fisher-Yates)
│       ├── scoring.js                    # XP + star calculation + distractor generation
│       └── badgeEngine.js                # New badge set, same engine shape as reference
├── scripts/
│   ├── generate_audio.js                 # Offline ElevenLabs pre-generation
│   └── clean_audio.js                    # Remove orphaned .mp3 files
├── api/
│   └── elevenlabs.js                     # Ported unmodified from reference
├── index.html                            # Identical <head> pattern, new <title>/description (§11.5)
├── package.json
├── vite.config.js                        # Identical to reference (`@vitejs/plugin-react`, no other plugins)
└── .gitignore
```

---

## 4. Application State Architecture

### 4.1 Root State (`App.jsx`)

Mirrors the reference build's flat `useState` structure exactly — no Redux/Zustand needed at this scope:

```js
const PHASES = ['intro', 'wonder', 'story', 'simulate', 'play', 'reflect'];

const [phase, setPhase] = useState('intro');
const [audioEnabled, setAudioEnabled] = useState(true);
const [playStats, setPlayStats] = useState(null); // { xp, worldResults, maxStreak, badges }
```

### 4.2 Simulate-Phase Local State (`SimulatePhase.jsx`)

```js
const STATIONS = [
  { id: 0, key: 'tear',    title: 'Corner Tear-Up',        subtitle: 'The Triangle Machine' },
  { id: 1, key: 'split',   title: 'Diagonal Split',        subtitle: 'Quadrilaterals from Triangles' },
  { id: 2, key: 'build',   title: 'Polygon Builder',       subtitle: 'From Triangles to Any Shape' },
  { id: 3, key: 'sort',    title: 'Quadrilateral Family',  subtitle: 'Sort the Shapes' },
];

const [stationIndex, setStationIndex] = useState(0);
const [stationsComplete, setStationsComplete] = useState([false, false, false, false]);
```

### 4.3 Play-Phase Local State (`PlayPhase.jsx`) — same shape as reference

```js
const [currentWorld, setCurrentWorld]   = useState(-1);
const [worldResults, setWorldResults]   = useState({});   // { [worldId]: { score, total, stars } }
const [qIndex, setQIndex]               = useState(0);
const [score, setScore]                 = useState(0);
const [totalXP, setTotalXP]             = useState(0);
const [streak, setStreak]               = useState(0);
const [maxStreak, setMaxStreak]         = useState(0);
const [worldQuestions, setWorldQuestions] = useState([]); // freshly generated, not pre-shuffled
```

### 4.4 Session Persistence (24-hour resume, identical policy to reference)

```js
const SESSION_KEY = 'intellia_quad_from_tri_v1';

const saved = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
if (saved && Date.now() - saved.timestamp < 86400000) {
  // restore phase, stationsComplete, worldResults, xp, badges
}
```

---

## 5. Question Data Model & Procedural Generators

### 5.1 Schema

```ts
interface Question {
  id:            string;                 // e.g. "Q4_017"
  type:          QuestionType;           // one of 10 enum values below
  world:         number;                 // 0–9, assigned after generation+shuffle
  difficulty:    1 | 2 | 3;              // 1 = easy, 2 = medium, 3 = hard

  shapeType:     'triangle' | 'quadrilateral' | 'polygon' | 'regularPolygon' | 'none';
  n?:            number;                 // number of sides, when relevant (Q4–Q7)
  angles?:       number[];               // the full set of angle values used to build the question
  missingIndex?: number | string;        // which value the student must find

  questionText:  string;                 // full narrated question text
  visual:        'triangleDiagram' | 'quadrilateralDiagram' | 'polygonDiagram' | 'sentence' | 'trueFalse';

  options?:      (number | string)[];    // 4 MCQ options, always including correctAnswer, never duplicated

  hint1:         string;                 // shown after 1 wrong attempt
  hint2:         string;                 // shown after 2 wrong attempts (triggers a visual re-demo)
  explanation:   string;                 // full explanation after 3 fails (read aloud)

  characterName?: string;                // word problems only (Q8, Q9)
  objectName?:    string;                // word problems only (Q8, Q9)
  isTrue?:        boolean;               // Q10 only

  correctAnswer: number | string;
}

type QuestionType =
  | 'triangle_angle_hunt'      // Q1
  | 'exterior_angle'           // Q2
  | 'quad_angle_hunt'          // Q3
  | 'polygon_angle_sum'        // Q4
  | 'sides_from_sum'           // Q5
  | 'regular_polygon_angle'    // Q6
  | 'diagonal_counter'         // Q7
  | 'shape_detective'          // Q8 — word problem
  | 'quad_family_sort'         // Q9 — word problem / classification
  | 'true_false_angle';        // Q10
```

### 5.2 Shared Helpers

```js
// utils/questionBank.js
const globalNames = [
  'John','Mike','Sarah','Priya','Yuki','Omar','Carlos','Fatima','Wei','Liam',
  'Aisha','Elena','Diego','Mei','Kwame','Sofia','Hassan','Ingrid','Noah','Olivia',
  'Arjun','Lucas','Emma','Amara',
];
const triangleObjects = ['roof truss','sail','garden trellis','kite frame','flag pennant','drone wing'];
const quadObjects     = ['floor tile','picture frame','table top','solar panel','window pane','tabletop mosaic'];
const polygonNames = { 3:'triangle',4:'quadrilateral',5:'pentagon',6:'hexagon',7:'heptagon',
                        8:'octagon',9:'nonagon',10:'decagon',11:'hendecagon',12:'dodecagon' };

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randMultiple(min, max, step) {
  const count = Math.floor((max - min) / step);
  return min + step * randInt(0, count);
}
function polygonName(n) { return polygonNames[n] || `${n}-sided polygon`; }

export function shuffleArray(array) {                 // Fisher-Yates — identical to reference
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateDistractors(correct, min, max, count = 3) {
  const distractors = new Set();
  const offsets = shuffleArray([-15, -10, -5, 5, 10, 15]);
  for (const offset of offsets) {
    const d = correct + offset;
    if (d >= min && d <= max && d !== correct && distractors.size < count) distractors.add(d);
  }
  while (distractors.size < count) {
    const d = correct + (distractors.size + 1) * 5;
    if (d <= max && d !== correct) distractors.add(d);
  }
  return shuffleArray([correct, ...distractors]);
}
```

### 5.3 Representative Generators (full code)

```js
// Q1 — Triangle Angle Hunt: find the missing interior angle
function genQ1(id, diff) {
  let a, b, c;
  const step = diff === 1 ? 5 : 1;
  do {
    a = randMultiple(20, 100, step);
    b = randMultiple(20, 100, step);
    c = 180 - a - b;
  } while (c < 15 || c > 140);
  const known = { a, b, c };
  const missing = pick(['a', 'b', 'c']);
  const shown = Object.keys(known).filter(k => k !== missing).map(k => known[k]);
  return {
    id, type: 'triangle_angle_hunt', difficulty: diff, world: 0, shapeType: 'triangle',
    angles: [a, b, c], missingIndex: missing,
    questionText: `A triangle has angles ${shown[0]}° and ${shown[1]}°. What is the third angle?`,
    visual: 'triangleDiagram',
    hint1: 'Remember: all three angles of a triangle always add up to 180°.',
    hint2: `${shown[0]}° + ${shown[1]}° = ${shown[0] + shown[1]}°. What is left to reach 180°?`,
    explanation: `${a}° + ${b}° + ${c}° = 180°, the Triangle Angle Sum Property.`,
    options: generateDistractors(known[missing], 1, 178),
    correctAnswer: known[missing],
  };
}

// Q4 — Polygon Angle Sum: given n, find the interior angle sum
function genQ4(id, diff) {
  const n = diff === 1 ? randInt(4, 6) : diff === 2 ? randInt(5, 8) : randInt(7, 12);
  const sum = (n - 2) * 180;
  return {
    id, type: 'polygon_angle_sum', difficulty: diff, world: 0, shapeType: 'polygon', n,
    questionText: `Find the sum of the interior angles of a polygon with ${n} sides.`,
    visual: 'polygonDiagram',
    hint1: 'Split the polygon into triangles from one corner. How many triangles do you get?',
    hint2: `A ${n}-sided polygon splits into ${n - 2} triangles. Each triangle is 180°.`,
    explanation: `(${n} − 2) × 180° = ${n - 2} × 180° = ${sum}°.`,
    options: generateDistractors(sum, 180, 1980),
    correctAnswer: sum,
  };
}

// Q6 — Regular Polygon Angle: given n, find one interior angle
function genQ6(id, diff) {
  const n = diff === 1 ? pick([4, 5, 6]) : diff === 2 ? pick([6, 7, 8, 9]) : pick([9, 10, 11, 12]);
  const angle = Math.round(((n - 2) * 180) / n);
  return {
    id, type: 'regular_polygon_angle', difficulty: diff, world: 0, shapeType: 'regularPolygon', n,
    questionText: `Find one interior angle of a regular ${polygonName(n)}.`,
    visual: 'polygonDiagram',
    hint1: 'First find the total angle sum: (n − 2) × 180°.',
    hint2: `Now share that total equally between all ${n} angles.`,
    explanation: `[(${n} − 2) × 180°] ÷ ${n} = ${(n - 2) * 180}° ÷ ${n} = ${angle}°.`,
    options: generateDistractors(angle, 30, 179),
    correctAnswer: angle,
  };
}

// Q8 — Shape Detective (word problem): triangle angle hunt with global name + real object
function genQ8(id, diff) {
  const name = pick(globalNames);
  const obj = pick(triangleObjects);
  let a, b, c;
  do {
    a = randMultiple(20, 100, 1);
    b = randMultiple(20, 100, 1);
    c = 180 - a - b;
  } while (c < 15 || c > 140);
  return {
    id, type: 'shape_detective', difficulty: diff, world: 0, shapeType: 'triangle',
    characterName: name, objectName: obj,
    questionText: `${name} is building a ${obj} shaped like a triangle. Two of the angles measure ${a}° and ${b}°. What is the third angle?`,
    visual: 'triangleDiagram',
    hint1: 'Add the two known angles together first.',
    hint2: `${a}° + ${b}° = ${a + b}°. Subtract that from 180°.`,
    explanation: `180° − (${a}° + ${b}°) = ${c}°.`,
    options: generateDistractors(c, 1, 178),
    correctAnswer: c,
  };
}

// Q10 — True or False: procedurally generated, sometimes true, sometimes false
function genQ10(id, diff) {
  const n = randInt(3, 12);
  const useExterior = Math.random() > 0.5;
  const isTrue = Math.random() > 0.5;
  let statement, correctValue;
  if (useExterior) {
    correctValue = 360;
    const shown = isTrue ? 360 : pick([180, 540, 720]);
    statement = `The exterior angles of a ${polygonName(n)} add up to ${shown}°.`;
  } else {
    correctValue = (n - 2) * 180;
    const shown = isTrue ? correctValue : correctValue + pick([-180, 90, 180]);
    statement = `The interior angles of a ${polygonName(n)} add up to ${shown}°.`;
  }
  return {
    id, type: 'true_false_angle', difficulty: diff, world: 0, isTrue,
    questionText: `"${statement}" — True or False?`,
    visual: 'trueFalse',
    hint1: 'Exterior angles of ANY polygon always sum to 360°. Interior angles depend on the number of sides.',
    hint2: 'Work out the correct total, then compare it with the statement.',
    explanation: `The correct total is ${correctValue}°, so the statement is ${isTrue ? 'True' : 'False'}.`,
    options: ['True', 'False'],
    correctAnswer: isTrue ? 'True' : 'False',
  };
}
```

### 5.4 Remaining Generators (same pattern, formula reference)

| Fn | Type | Core formula | Notes |
|---|---|---|---|
| `genQ2` | Exterior angle | `exterior = remote1 + remote2` | Randomize which of the three values is hidden, same missing-slot pattern as Q1 |
| `genQ3` | Quadrilateral angle hunt | `d = 360 − (a + b + c)` | Same guarded-random pattern as Q1, bounded so `d` stays in `[10, 170]` |
| `genQ5` | Sides from sum | `n = sum / 180 + 2` | Generate `n` first, compute `sum`, ask for `n` — guarantees an integer answer |
| `genQ7` | Diagonal counter | `diagonals = n(n − 3) / 2` | `n` randomized 4–12 by difficulty band |
| `genQ9` | Quad family sort (word problem) | property lookup table (§5.5) | Randomly select a quadrilateral type, generate its defining property sentence, ask student to name it |

### 5.5 Quadrilateral Property Lookup (used by Q9 and Station D)

```js
const QUAD_FAMILY = [
  { name: 'trapezium',    properties: ['Exactly one pair of parallel sides'] },
  { name: 'kite',         properties: ['Two pairs of adjacent equal sides', 'No parallel sides required'] },
  { name: 'parallelogram',properties: ['Two pairs of parallel sides', 'Opposite sides equal', 'Opposite angles equal'] },
  { name: 'rectangle',    properties: ['Two pairs of parallel sides', 'All four angles are 90°'] },
  { name: 'rhombus',      properties: ['Two pairs of parallel sides', 'All four sides equal'] },
  { name: 'square',       properties: ['All four sides equal', 'All four angles are 90°'] },
];
```
The square entry deliberately satisfies both the rectangle and rhombus property sets — this is what drives the nested-family visual in Station D (PRD §8.4) and is checked with `isSubsetMatch()`, not a single fixed lookup, so a square is always accepted in either nest.

### 5.6 Session Assembly

```js
const generators = [genQ1, genQ2, genQ3, genQ4, genQ5, genQ6, genQ7, genQ8, genQ9, genQ10];
const diffDist = {  // 10 entries per type; matches PRD §9.1 distribution (36 easy / 37 medium / 27 hard)
  q1:[1,1,1,1,1,2,2,2,3,3], q2:[1,1,1,1,2,2,2,2,3,3], q3:[1,1,1,1,2,2,2,2,3,3],
  q4:[1,1,1,2,2,2,2,3,3,3], q5:[1,1,2,2,2,2,3,3,3,3], q6:[1,1,1,2,2,2,2,3,3,3],
  q7:[1,1,1,2,2,2,2,3,3,3], q8:[1,1,1,2,2,2,2,3,3,3], q9:[1,1,1,1,2,2,2,3,3,3],
  q10:[1,1,1,1,1,2,2,2,3,3],
};

export function generateSessionQuestions() {
  const bank = [];
  let qid = 1;
  const keys = ['q1','q2','q3','q4','q5','q6','q7','q8','q9','q10'];
  generators.forEach((gen, gi) => {
    diffDist[keys[gi]].forEach(diff => {
      bank.push(gen(`Q${gi + 1}_${String(qid).padStart(3, '0')}`, diff));
      qid++;
    });
  });
  const selected = shuffleArray(bank);
  selected.forEach((q, i) => { q.world = Math.floor(i / 10); });
  return selected;
}
```

**Critical property:** because every generator calls `Math.random()`-backed helpers (`pick`, `randInt`, `randMultiple`) at call time, `generateSessionQuestions()` produces a **fresh set of 100 questions on every call** — re-running it mid-session (e.g. a "Play Again" action) yields entirely new numbers, names, and shapes, not a re-shuffle of the same 100 objects. This is the literal implementation of "every question should be random."

---

## 6. Geometry Engine (`src/utils/geometry.js`) — New for This Lesson

This is the one piece of real computational geometry the lesson requires that the reference build never needed. All of it is elementary trigonometry — no external geometry library is added.

### 6.1 Polygon Winding & Interior Angles

```js
// Shoelace formula: signed area tells us the polygon's winding direction
export function signedArea(points) {
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    sum += p1.x * p2.y - p2.x * p1.y;
  }
  return sum / 2;
}

// Interior angle at every vertex, correct for both convex and reflex (concave) vertices
export function interiorAngles(points) {
  const orientation = Math.sign(signedArea(points)); // +1 = CCW, -1 = CW
  return points.map((curr, i) => {
    const prev = points[(i - 1 + points.length) % points.length];
    const next = points[(i + 1) % points.length];
    const v1 = { x: prev.x - curr.x, y: prev.y - curr.y };
    const v2 = { x: next.x - curr.x, y: next.y - curr.y };
    const dot = v1.x * v2.x + v1.y * v2.y;
    const det = v1.x * v2.y - v1.y * v2.x;
    let angle = Math.atan2(Math.abs(det), dot) * (180 / Math.PI);
    const turnSign = Math.sign(det);
    if (turnSign !== 0 && turnSign !== orientation) angle = 360 - angle; // reflex vertex
    return Math.round(angle * 10) / 10; // one decimal place for on-screen display
  });
}

export function isConvex(points) {
  const orientation = Math.sign(signedArea(points));
  return points.every((curr, i) => {
    const prev = points[(i - 1 + points.length) % points.length];
    const next = points[(i + 1) % points.length];
    const v1 = { x: curr.x - prev.x, y: curr.y - prev.y };
    const v2 = { x: next.x - curr.x, y: next.y - curr.y };
    const cross = v1.x * v2.y - v1.y * v2.x;
    return cross === 0 || Math.sign(cross) === orientation;
  });
}
```

### 6.2 Regular Polygon Generation (Station C)

```js
export function regularPolygonVertices(n, cx, cy, radius, rotationDeg = -90) {
  const rotationRad = (rotationDeg * Math.PI) / 180;
  return Array.from({ length: n }, (_, i) => {
    const theta = rotationRad + (i * 2 * Math.PI) / n;
    return { x: cx + radius * Math.cos(theta), y: cy + radius * Math.sin(theta) };
  });
}

export function interiorAngleSum(n) { return (n - 2) * 180; }
export function regularInteriorAngle(n) { return interiorAngleSum(n) / n; }
export function diagonalCount(n) { return (n * (n - 3)) / 2; }
```

### 6.3 Fan Triangulation & Diagonal Split

```js
// From vertex 0, diagonals to every non-adjacent vertex: n - 3 diagonals -> n - 2 triangles
export function fanTriangulation(points) {
  const n = points.length;
  const diagonals = [];
  const triangles = [];
  for (let i = 1; i < n - 1; i++) {
    triangles.push([points[0], points[i], points[i + 1]]);
    if (i > 1) diagonals.push([points[0], points[i]]);
  }
  return { diagonals, triangles }; // triangles.length === n - 2, always
}

// Quadrilateral-specific: split along either diagonal (Station B)
export function quadDiagonalSplit(points, diagonalIndex = 0) {
  // diagonalIndex 0 -> vertices[0]-vertices[2]; 1 -> vertices[1]-vertices[3]
  const [p0, p1, p2, p3] = points;
  return diagonalIndex === 0
    ? { diagonal: [p0, p2], triangles: [[p0, p1, p2], [p0, p2, p3]] }
    : { diagonal: [p1, p3], triangles: [[p1, p2, p3], [p1, p3, p0]] };
}
```

### 6.4 Drag Guard Rails (`usePolygonDrag.js`)

To keep student-dragged shapes valid and pedagogically meaningful (flagged as a risk in PRD §15), every vertex move is validated before being committed to state:

```js
export function isValidVertexMove(points, index, candidate) {
  const trial = [...points];
  trial[index] = candidate;
  // 1. Reject if any interior angle would fall below 8° (near-degenerate) or above 350°
  const angles = interiorAngles(trial);
  if (angles.some(a => a < 8 || a > 350)) return false;
  // 2. Reject if any two non-adjacent edges would now intersect (standard segment
  //    orientation test — see segmentsIntersect() below)
  return !edgesSelfIntersect(trial);
}
```

`segmentsIntersect()` uses the standard orientation-based test (three colinear-check cases + general case via cross-product sign comparisons); omitted here for brevity but is a direct, well-known algorithm with no topic-specific variation.

---

## 7. Simulation Station Component Specs

### 7.1 `PolygonCanvas.jsx` — Shared Primitive

```
Props:
  points        : {x,y}[]                 required, in order
  editable      : boolean                 default false — enables drag handles
  onChange      : (points) => void        called with the full updated array on a valid drag
  showAngles    : boolean                 default true — renders AngleArc at each vertex
  highlightTriangles?: {x,y}[][]          optional — fills each triangle a distinct color
  diagonals?    : [{x,y},{x,y}][]         optional — animatable diagonal lines
  size          : 'small' | 'medium' | 'large'

Renders:
  <svg viewBox="0 0 W H">
    <polygon points="..." class="polygon-shape" />
    {diagonals.map(d => <DiagonalLine ... />)}
    {highlightTriangles.map(t => <polygon class="triangle-fill-a|b|c" ... />)}
    {points.map((p,i) => <AngleArc .../>)}
    {editable && points.map((p,i) => <VertexHandle onDrag={...} />)}
  </svg>
```

`VertexHandle` uses pointer events (`onPointerDown/Move/Up`, not the legacy HTML5 Drag-and-Drop API — chosen because it behaves identically on touch and mouse, matching the reference build's stated preference for tap-equivalent fallbacks over native drag). Every candidate position is passed through `isValidVertexMove()` (§6.4) before being committed; an invalid drag simply stops the handle at the last valid position rather than snapping or erroring.

### 7.2 Station A — `TriangleTearStation.jsx`

```js
const [points, setPoints] = useState(randomTriangle());   // randomized each round
const [torn, setTorn] = useState(false);
const [round, setRound] = useState(0); // 3 rounds

const angles = interiorAngles(points);
const sum = angles.reduce((a, b) => a + b, 0); // always ≈180, floating-point safe within 0.5°
```
- `<PolygonCanvas points={points} editable={!torn} onChange={setPoints} />`
- "Tear off the corners" button (enabled once the student has dragged at least once, or after 4s idle) triggers the `torn` CSS/animation state: three wedge `<path>` elements animate via CSS `transform` to a shared baseline `y` coordinate, landing edge-to-edge.
- Completion: `Math.abs(sum - 180) < 0.5` (float tolerance) → celebration; advances to next round or Station B after round 3.

### 7.3 Station B — `DiagonalSplitStation.jsx`

```js
const [points, setPoints] = useState(randomQuadrilateral()); // convex, parallelogram, kite, or trapezium
const [diagonalIndex, setDiagonalIndex] = useState(0);
const { diagonal, triangles } = quadDiagonalSplit(points, diagonalIndex);
const [split, setSplit] = useState(false);

const t1Sum = split ? interiorAngles(triangles[0]).reduce((a,b)=>a+b,0) : null;
const t2Sum = split ? interiorAngles(triangles[1]).reduce((a,b)=>a+b,0) : null;
```
- "Draw a diagonal" → `setSplit(true)`, animates the `DiagonalLine`, then reveals both triangle fills and their running 180°+180°=360° total.
- "Try the other diagonal" → `setDiagonalIndex(1 - diagonalIndex)`, re-runs the split on the *same* quadrilateral so students see two different triangle pairs land on the same 360° total.
- "New shape" → regenerates `points` from `randomQuadrilateral()`, resets `split` to `false`.
- Completion: student has split ≥2 different shapes and toggled both diagonals at least once (`stationBPerfect` flag feeds the "Eagle-Eyed" style badge logic — see §10.3).

### 7.4 Station C — `PolygonBuilderStation.jsx`

```js
const [n, setN] = useState(5);
const points = regularPolygonVertices(n, cx, cy, radius);
const { diagonals, triangles } = fanTriangulation(points);
const sum = interiorAngleSum(n);
const eachAngle = regularInteriorAngle(n);
```
- Slider `min=3 max=10` bound to `n`; every change re-renders `<PolygonCanvas>` with the new `regularPolygonVertices` output — no animation needed for the shape itself, only for the triangulation reveal.
- "Fan triangulate" button plays diagonals in sequence (staggered 150ms each) via CSS `stroke-dashoffset` animation, then reveals the running formula `(n − 2) × 180° = {sum}°`.
- `ExteriorAngleWalker.jsx` — the unique addition described in PRD §8.3 — uses `requestAnimationFrame` to move a marker along the polygon's perimeter at constant speed, rotating it by the local exterior angle `180 − eachAngle` at each vertex crossing; a small on-screen counter accumulates the total rotation, landing on exactly 360° when the marker returns to its start, for any `n`.

### 7.5 Station D — `QuadFamilySorterStation.jsx`

```js
const [cards, setCards] = useState(shuffleArray(QUAD_FAMILY).map(randomizeCardGeometry));
const [placements, setPlacements] = useState({}); // { cardName: zoneId }
const [misSorts, setMisSorts] = useState(0);
```
- Each card's `randomizeCardGeometry` step re-derives a fresh, randomly-sized/rotated (but property-correct) instance of that quadrilateral type using `regularPolygonVertices`-style parametric generation, so the same six categories never look pixel-identical twice.
- Drop zones are nested `<div>` regions (rectangle zone is drawn *inside* an outer "has 4 right angles OR all sides equal" boundary shared with rhombus, matching the hierarchy in PRD §5.3/LO7); a square card is accepted in either nested zone.
- `misSorts === 0` at round end → contributes to the **Eagle-Eyed Sorter** badge (§10.3).

---

## 8. Audio Pipeline

### 8.1 Voice Configuration (unchanged from reference)

| | |
|---|---|
| Voice Name | Alice |
| Voice ID | `Xb7hH8MSUJpSbSDYk0k2` |
| Model | `eleven_multilingual_v2` |
| API Key Env Var | `VITE_ELEVENLABS_API_KEY` |
| Backend proxy | `/api/elevenlabs` (POST `{ text, voiceId, voiceSettings }`), with direct-client fallback if the proxy 404s or returns HTML (ported unmodified from reference `audio.js`) |

### 8.2 Speech Style → ElevenLabs Settings (unchanged from reference)

| Style | stability | similarity_boost | style |
|---|---|---|---|
| statement | 0.75 | 0.75 | 0.0 |
| instruction | 0.80 | 0.75 | 0.0 |
| question | 0.60 | 0.80 | 0.3 |
| encouragement | 0.55 | 0.85 | 0.6 |
| emphasis | 0.85 | 0.70 | 0.1 |
| thinking | 0.65 | 0.80 | 0.2 |
| celebration | 0.45 | 0.90 | 0.8 |

### 8.3 New Narration Scripts for This Lesson (`src/utils/narration.js`)

```js
export function introNarration() {
  return [
    cheer('Welcome to Quadrilaterals from Triangles and Polygons!'),
    say('Today we will discover something amazing: every shape\u2019s angles can be figured out, starting from just one triangle.'),
    ask('Ready to build, split, and sort your way to the answer?'),
  ];
}

export function wonderNarration() {
  return [
    ask('Sarah is building a kite frame. How does she know all four corners will always add up to the same total?'),
    say('Let\u2019s find out — starting with something we already know about triangles.'),
  ];
}

export function getStoryNarration(panelIndex) {
  switch (panelIndex) {
    case 0: return [say('Sarah is building a diamond-shaped kite frame with her friends John and Mike.'),
                    ask('Mike wonders: how do we know the four corners of the fabric will fit the frame exactly?')];
    case 1: return [say('John tears the three corners off a paper triangle and lines them up edge to edge.'),
                    emphasize('However we draw the triangle, the three corners always make a straight line — 180 degrees, every time.')];
    case 2: return [say('Sarah folds the kite fabric along its diagonal, revealing two triangles.'),
                    emphasize('180 degrees plus 180 degrees equals 360 degrees — that\u2019s the whole kite!')];
    case 3: return [say('Mike is building a hexagonal skateboard ramp and wonders about shapes with even more sides.'),
                    emphasize('Every polygon can be cut into triangles from one corner.')];
    case 4: return [say('They lay out the finished pieces: a rectangle, a rhombus, and the kite.'),
                    emphasize('They\u2019re all quadrilaterals, but each one is special in its own way.')];
    case 5: return [cheer('Now it\u2019s your turn — go build and break some shapes yourself!')];
    default: return [];
  }
}

export function stationIntro(stationKey) {
  const intros = {
    tear:  [instruct('Drag the corners of the triangle, then tear them off and line them up.')],
    split: [instruct('Draw a diagonal and watch the quadrilateral split into two triangles.')],
    build: [instruct('Slide to change the number of sides, then fan-triangulate the shape.')],
    sort:  [instruct('Drag each shape into the family it belongs to.')],
  };
  return intros[stationKey] ?? [];
}

export function playCorrectNarration() { return [celebrate('Exactly right! You just proved it yourself.')]; }
export function playWrongNarration()   { return [cheer('Not quite — let\u2019s look at the shape again.')]; }
```

The `seg()/say()/ask()/cheer()/emphasize()/think()/celebrate()/instruct()` helper API is ported **unmodified** from the reference `audio.js` — only the phrase content is new.

### 8.4 Audio Script Parity Rule

Unchanged from the reference build: every on-screen narrated string must match its `narration.js` counterpart exactly. Any UI copy edit requires updating `scripts/generate_audio.js`, re-running the pre-generation script, and updating `narration.js` in the same commit.

### 8.5 Note on the Companion Interactive Demo Artifact

The standalone HTML demo delivered alongside this TRD (a single self-contained file, built for instant preview without a build step or API keys) **cannot** call the ElevenLabs API directly, because a published static page's content-security policy does not permit requests to `api.elevenlabs.io`. That demo therefore substitutes the browser's built-in `speechSynthesis` API for narration and keeps the Web Audio API tone effects identical to production. The **production build specified in this TRD uses ElevenLabs exclusively**, per §8.1 — the substitution is a demo-only limitation, not a change to the spec.

---

## 9. Randomisation Engine

### 9.1 Fisher-Yates Shuffle
Identical implementation to the reference (§5.2 above) — used for world assignment and card ordering, never for the underlying question *values*, which are generated fresh (§5.6).

### 9.2 Distractor Generation
`generateDistractors()` (§5.2) uses offsets of ±5/±10/±15° for angle-valued answers (plausible near misses, e.g. a sign or off-by-one-step error) rather than the reference's ±1/±2/±3 (which suited small counting numbers, not degree measures).

### 9.3 Session Persistence
Identical 24-hour `localStorage` resume policy to the reference (§4.4 above).

---

## 10. Gamification Implementation

### 10.1 XP Calculation (unchanged formula from reference)

```js
export function calcXP(attemptNumber, hintsUsed, streak) {
  const base = attemptNumber === 1 ? 10 : hintsUsed > 0 ? 5 : 7;
  const streakBonus = streak >= 5 ? 5 : 0;
  return base + streakBonus;
}
```

### 10.2 Star Rating (unchanged thresholds from reference)

```js
export function calcStars(correct, total = 10) {
  if (correct >= 9) return 3;
  if (correct >= 7) return 2;
  if (correct >= 5) return 1;
  return 0;
}
export function canUnlockWorld(worldScore) { return worldScore !== null && worldScore >= 5; }
```

### 10.3 Badge Engine (`utils/badgeEngine.js`)

```js
export const BADGES = [
  { id: 'angle_sum_ace',    label: '🔺 Angle Sum Ace',
    condition: s => s.phaseComplete.wonder && s.phaseComplete.story },
  { id: 'shape_shifter',    label: '📐 Shape Shifter',
    condition: s => s.stationsComplete.every(Boolean) },
  { id: 'polygon_pro',      label: '🏆 Polygon Pro',
    condition: s => Object.values(s.worldScores).reduce((sum, w) => sum + (w || 0), 0) >= 80 },
  { id: 'perfect_vertex',   label: '💎 Perfect Vertex',
    condition: s => Object.values(s.worldScores).some(w => w === 10) },
  { id: 'diagonal_streak',  label: '🔥 Diagonal Streak',
    condition: s => s.maxStreak >= 10 },
  { id: 'world_geometer',   label: '🌍 World Geometer',
    condition: s => Object.values(s.phaseComplete).every(Boolean) },
  { id: 'eagle_eyed_sorter',label: '👁️ Eagle-Eyed Sorter',
    condition: s => s.stationDMisSorts === 0 && s.stationsComplete[3] },
  { id: 'globe_trotter',    label: '🗺️ Globe Trotter',
    condition: s => Object.keys(s.worldScores).length >= 10 && Object.values(s.worldScores).every(w => w >= 5) },
];

export function checkBadges(state) {
  return BADGES.filter(b => !state.badges.includes(b.id) && b.condition(state)).map(b => b.id);
}
```

---

## 11. CSS Design Tokens & Animation Keyframes

### 11.1 Inherited Verbatim from the Reference Build (`src/index.css`)

The full `:root` token block below is copied directly from `github.com/dsamyak/equal/src/index.css` — no values are altered, per the "strictly follow the UI" requirement:

```css
:root {
  --bg-dark: #0a0a2e;
  --bg-card: rgba(30, 30, 100, 0.7);
  --bg-card-solid: #1a1a5e;
  --purple-deep: #2d1b69;
  --purple-mid: #4a2c8a;
  --purple-light: #7c5cbf;
  --blue-deep: #1a237e;
  --blue-mid: #283593;
  --blue-bright: #3f51b5;
  --gold: #ffc107;
  --gold-light: #ffd54f;
  --gold-dark: #f9a825;
  --green: #4caf50;
  --green-light: #81c784;
  --red: #ef5350;
  --red-light: #ef9a9a;
  --coral: #ff7043;
  --white: #ffffff;
  --text-primary: #ffffff;
  --text-secondary: rgba(255,255,255,0.7);
  --text-muted: rgba(255,255,255,0.4);
  --font-display: 'Fredoka', sans-serif;
  --font-body: 'Nunito', sans-serif;
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-xl: 32px;
  --radius-full: 9999px;
  --shadow-glow: 0 0 30px rgba(124, 92, 191, 0.3);
  --shadow-card: 0 8px 32px rgba(0,0,0,0.3);
  --shadow-button: 0 4px 15px rgba(0,0,0,0.3);
  --transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

Every structural class the reference build defines — `.glass-card`, `.btn` / `.btn-primary` / `.btn-secondary` / `.btn-outline`, `.journey-bar` / `.journey-step`, `.question-card`, `.options-grid` / `.option-btn`, `.mascot` / `.speech-bubble`, `.feedback-overlay`, `.xp-popup`, `.score-circle`, `.world-map` / `.world-card`, `.hud`, and every `@keyframes` block (`bounceIn`, `shake`, `celebrate`, `wobble`, `floatUp`, `fadeIn`, `correctPulse`, `pulse`, `confettiFall`, etc.) — is reused **unmodified**. This lesson only adds new classes; it does not override any existing one.

### 11.2 New Tokens & Classes for Geometry (additions only)

```css
:root {
  /* new, additive tokens — do not replace anything above */
  --vertex-handle: var(--gold);
  --vertex-handle-active: var(--gold-light);
  --diagonal-line: var(--coral);
  --triangle-fill-a: rgba(124, 92, 191, 0.35);   /* purple-light, translucent */
  --triangle-fill-b: rgba(255, 193, 7, 0.30);    /* gold, translucent */
  --triangle-fill-c: rgba(76, 175, 80, 0.30);    /* green, translucent */
  --exterior-walker: var(--gold);
}

.polygon-shape { fill: rgba(255,255,255,0.06); stroke: rgba(255,255,255,0.4); stroke-width: 2; }
.vertex-handle { fill: var(--vertex-handle); stroke: var(--bg-dark); stroke-width: 2; cursor: grab; }
.vertex-handle:active, .vertex-handle.dragging { fill: var(--vertex-handle-active); cursor: grabbing; }
.vertex-hit-area { fill: transparent; r: 22; }   /* 44px-equivalent touch target, per §12.3 accessibility */
.angle-arc-label { font-family: var(--font-display); font-size: 0.85rem; fill: var(--gold-light); }
.diagonal-line { stroke: var(--diagonal-line); stroke-width: 2.5; stroke-dasharray: 6 4; }
.diagonal-line.drawing { animation: diagonalDraw 0.6s ease forwards; }
.triangle-fill-a { fill: var(--triangle-fill-a); animation: groupCirclePop 0.4s ease; }
.triangle-fill-b { fill: var(--triangle-fill-b); animation: groupCirclePop 0.4s ease 0.15s backwards; }
.exterior-walker { fill: var(--exterior-walker); filter: drop-shadow(0 0 6px var(--gold)); }
.family-zone { border: 2px dashed rgba(255,255,255,0.2); border-radius: var(--radius-lg); padding: 16px; }
.family-zone.nested { margin: 12px; border-color: var(--gold); }

@keyframes diagonalDraw {
  from { stroke-dashoffset: 100; opacity: 0; }
  to   { stroke-dashoffset: 0;   opacity: 1; }
}
```

### 11.3 Fonts (identical loading pattern to reference `index.html`)

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
```

---

## 12. Component Prop Contracts

| Component | Props | Returns |
|---|---|---|
| `PolygonCanvas` | `{ points, editable?, onChange?, showAngles?, highlightTriangles?, diagonals?, size? }` | Inline SVG, responsive |
| `VertexHandle` | `{ point, index, onDrag, active? }` | Draggable `<circle>` + invisible larger hit-area |
| `AngleArc` | `{ vertex, prevPoint, nextPoint, angleValue, showLabel? }` | Small SVG arc + degree text |
| `DiagonalLine` | `{ from, to, animate? }` | Dashed animatable `<line>` |
| `ExteriorAngleWalker` | `{ points, running, onLapComplete }` | RAF-driven marker + rotation readout |
| `QuestionRenderer` | `{ question: Question, onAnswer, hints }` | Type-specific quiz component |
| `WorldMap` | `{ worldScores, currentWorld, onSelectWorld }` | Scrollable world list, themed per PRD §9.2 |
| `BadgePanel` | `{ badges, newBadgeId? }` | Badge grid + unlock toast |

---

## 13. Performance Requirements

| Metric | Target |
|---|---|
| Initial load time | <2 seconds (Vite production build) |
| Time to first meaningful paint | <1 second |
| SVG/RAF animation frame rate | 60 fps, including the exterior-angle walker |
| Vertex-drag input latency | <16ms (one frame) between pointer move and visual update |
| Memory usage | <70 MB (slightly higher than the reference's 60 MB budget, to allow for live SVG geometry recalculation) |
| Bundle size (gzipped) | <650 KB |
| Lighthouse Performance score | ≥90 |
| Lighthouse Accessibility score | ≥90 |
| ElevenLabs pre-gen audio TTFB | 0ms (static assets) |
| ElevenLabs dynamic audio TTFB | <2 seconds |

---

## 14. Browser & Device Support

Identical support matrix to the reference build: full support on Chrome/Edge/Firefox 110+, Safari 15+ (iPad — primary classroom device), Android Chrome, iOS Safari 15+; no IE11 support. Pointer-event-based dragging (§7.1) is used specifically because it is uniformly supported across this entire matrix, unlike the HTML5 Drag-and-Drop API, which behaves inconsistently on iOS Safari.

---

## 15. Web Embedding (Intellia SG)

Identical two options to the reference build:

**Option A — CDN bundle (preferred):**
```html
<div id="quad-from-tri-app"></div>
<script src="https://cdn.intelliasg.com/lessons/quadrilaterals-from-triangles-and-polygons.js"></script>
```

**Option B — iframe embed:**
```html
<iframe
  src="https://lessons.intelliasg.com/grade7/quadrilaterals-from-triangles-and-polygons"
  width="100%" height="780px" frameborder="0"
  allow="autoplay; microphone"
  style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.12);">
</iframe>
```

---

## 16. Quality Assurance Checklist

| Category | Test Case | Status |
|---|---|---|
| Geometry | `interiorAngles()` sums to 180°±0.5 for any triangle, 360°±0.5 for any simple quadrilateral | TBD |
| Geometry | `isValidVertexMove()` blocks self-intersecting and near-degenerate (<8°) drags | TBD |
| Geometry | `fanTriangulation()` always returns exactly `n − 2` triangles for `n = 3..12` | TBD |
| Geometry | `ExteriorAngleWalker` completes exactly one 360° rotation per lap for every `n` 3–12 | TBD |
| Questions | All 10 generators produce a valid, in-range, uniquely-optioned question every call | TBD |
| Questions | Two consecutive calls to `generateSessionQuestions()` never produce an identical question set | TBD |
| Simulations | Station A tear-up animation triggers only when the live angle sum is within tolerance of 180° | TBD |
| Simulations | Station B "other diagonal" toggle always yields the same 360° total on the same shape | TBD |
| Simulations | Station D accepts a square in both the rectangle and rhombus nested zones | TBD |
| Phases | All 5 phases navigate end-to-end; phase-skip is blocked by gate logic | TBD |
| Gamification | XP/streak/star formulas match §10.1–10.2 exactly | TBD |
| Gamification | All 8 badges unlock at exactly their stated condition, no earlier/later | TBD |
| Audio | Pre-generated narration plays for all phase content; silent skip when key absent | TBD |
| Audio | On-screen text matches `narration.js` 1:1 for every narrated string | TBD |
| Accessibility | All vertex handles and buttons meet the 44×44px minimum hit area | TBD |
| Accessibility | Arrow-key vertex nudging works as a full drag alternative | TBD |
| Responsive | Correct layout at 375px, 768px, and 1280px+ | TBD |
| Performance | Lighthouse Performance & Accessibility both ≥90 | TBD |
| Curriculum | LO1–LO10 (PRD §5.3) each covered by at least one Simulate station or Play question type | TBD |

---

## 17. Audio File Management Workflow

Identical process to the reference build:

| Step | Action |
|---|---|
| 1 | Add the new phrase to `scripts/generate_audio.js`'s `phrases` array |
| 2 | Run `node scripts/generate_audio.js` (hits ElevenLabs API, saves `.mp3`) |
| 3 | Verify playback quality matches the intended speech style |
| 4 | Auto-generated `audioMap.js` updates to map text → file path |
| 5 | Update the matching text in the React UI component (exact match required) |
| 6 | Update the same text in `src/utils/narration.js` (1:1 parity rule, §8.4) |
| 7 | Optionally run `node scripts/clean_audio.js` to remove orphaned files |
| 8 | Commit `audioMap.js` + `.mp3` files + component changes together |

---

## 18. Deployment Pipeline

| Step | Action |
|---|---|
| 1 | `npm install` |
| 2 | `node scripts/generate_audio.js` (pre-generate all phase `.mp3` files) |
| 3 | `npm run build` (Vite production bundle) |
| 4 | Deploy `dist/` to CDN or Vercel preview |
| 5 | Full QA pass against §16 on the preview URL |
| 6 | Embed into the Intellia SG site via §15 Option A or B |
| 7 | Final QA at `intelliasg.com/courses/grade-7-math/lessons/quadrilaterals-from-triangles-and-polygons/` |
| 8 | Set lesson status to Live in the LMS |
| 9 | Verify `VITE_ELEVENLABS_API_KEY` is set in the production environment |

---

*Document Version: 1.0 · September 2026*
*Product: Intellia SG — Grade 7 Math, Lesson 5.3*
*Reference UI: https://equal-tau.vercel.app/ · Reference Repo: https://github.com/dsamyak/equal*
*Audio Pipeline: ElevenLabs — Voice: Alice (Xb7hH8MSUJpSbSDYk0k2), eleven_multilingual_v2*
*Curriculum Refs: see companion PRD §5.2*
*Parent Course Page: https://intelliasg.com/courses/grade-7-math/*
*Lesson URL: https://intelliasg.com/courses/grade-7-math/lessons/quadrilaterals-from-triangles-and-polygons/*
