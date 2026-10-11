# Product Requirements Document (PRD)
## Quadrilaterals from Triangles and Polygons — Grade 7 Math
**Intellia SG | Global Grade 7 Mathematics Curriculum**

---

| | |
|---|---|
| **Document Version** | 1.0 |
| **Date** | September 2026 |
| **Product** | Intellia SG — Grade 7 Math, Lesson 5.3 |
| **Parent Course Page** | https://intelliasg.com/courses/grade-7-math/ |
| **Lesson URL (planned)** | https://intelliasg.com/courses/grade-7-math/lessons/quadrilaterals-from-triangles-and-polygons/ |
| **Reference UI (mirror exactly)** | https://equal-tau.vercel.app/ |
| **Reference Repo** | https://github.com/dsamyak/equal |
| **Status** | Draft for engineering handoff |

---

## 1. Executive Summary

This document defines the product requirements for **"Quadrilaterals from Triangles and Polygons"** — an interactive, gamified, simulation-based lesson module for **Grade 7 students (ages 12–13) worldwide**, delivered as Lesson 5.3 within Intellia SG's Grade 7 Math program (Section 5: Shape, Space and Angles).

The big idea of the lesson — and the reason for its name — is that students do not memorize the 360° angle sum of a quadrilateral as an isolated fact. Instead, they **derive it themselves from what they already know about triangles** (angle sum = 180°) by slicing a quadrilateral along a diagonal into two triangles, and then **generalize the same trick to any polygon** by fan-triangulating it from one vertex, arriving at the universal formula `(n − 2) × 180°`. Triangles are the seed; quadrilaterals and polygons are what grow from them.

The product is a standalone interactive web lesson, built with **React 18 (Vite + JSX)**, designed to **strictly mirror the visual language, component structure, and UX rhythm** established at https://equal-tau.vercel.app/ and its repository https://github.com/dsamyak/equal (hereafter "the reference build"). The reference build was cloned and inspected directly (design tokens, component tree, state flow, question-generation logic, and audio pipeline) to ensure this new lesson is a faithful sibling, not a reinterpretation.

Audio narration follows the **same ElevenLabs pipeline already implemented in the reference build** (Voice: Alice, Voice ID `Xb7hH8MSUJpSbSDYk0k2`, model `eleven_multilingual_v2`), reusing its speech-style system and Web Audio API tone effects for full brand-voice continuity across the Intellia lesson library. See §2 for a note on this assumption.

The module follows Intellia's proven 5-phase learner journey — unchanged in shape from the reference, entirely new in content:

```
  INTRO   →  WONDER  →  STORY  →  SIMULATE  →  PLAY  →  REFLECT
 (welcome)  (hook)     (narrative) (4 hands-on  (10-world  (journal +
                                    simulations) gamified   certificate)
                                                 quiz)
```

Unlike the reference lesson (Equal Groups, Grade 1, Singapore-only), this module is built for a **global Grade 7 audience**: its curriculum alignment is mapped against six major international frameworks (§5), its practice questions draw on a **globally diverse cast of names and real-world contexts** (§9.4), and its gamified world map is themed around real geometric structures found around the world (§9), directly answering the requirement that this product serve "students of the global countries."

Every practice question is **procedurally generated at the moment it is shown** — numbers, shapes, angles, and names are freshly randomized by a generator function, not pulled from a fixed pre-written bank and shuffled. Two students, or the same student twice, will not see the same question with the same numbers. This is a deliberate, stronger interpretation of "every question should be random" than the reference build uses (see §8.5).

---

## 2. Key Assumptions & Reference Sources

Because part of this brief depends on materials this document cannot independently verify from inside a chat session, the following assumptions are stated explicitly so they can be corrected before engineering begins:

| # | Item | What was found | Assumption made |
|---|---|---|---|
| 1 | `intelliasg.com/courses/grade-7-math` | The page is not yet publicly indexed/live (search returned no matching site) | Treated as the **parent course listing page the user will populate**; this lesson is scoped as one lesson card/entry within it, at the URL in the header table. If the page already has a specific template, layout, or existing Lesson 5.1/5.2 naming, this PRD's §5 "unit context" table should be reconciled against it before build. |
| 2 | UI reference | https://equal-tau.vercel.app/ and https://github.com/dsamyak/equal were both retrieved and read directly (full component tree, `index.css`, state logic, audio engine, question generators) | All of §9 and the companion TRD's design-token section (TRD §11) are copied **verbatim** from the real repository, not guessed from the live site's rendered appearance. This is the strongest form of "strictly follow the UI" achievable here. |
| 3 | "Audio should be like the provided file" | No audio file was attached to this conversation | Interpreted as: **match the audio system already built in the reference repo** (`src/utils/audio.js`, `narration.js`) — ElevenLabs narration + Web Audio API sound effects — since that is the only concrete audio artifact available. If a specific voice sample or script file was intended, please share it and §10 will be revised to match it exactly. |
| 4 | Curriculum framing | User requested "global countries" + "global maths syllabus," topic given as "Quadrilaterals from Triangles and Polygons" | Rather than pinning the lesson to one country's syllabus (as the reference Grade 1 lesson did for Singapore only), this lesson is aligned against **six** global frameworks (§5), pulling only the content genuinely relevant to this topic from each, per the instruction to "choose only topic related data." |
| 5 | Company/brand facts (name "Intellia SG," tagline, mascot "LearnFlow") | Present in the reference repo's own PRD/TRD text files (`equal_groups_multiplication_division_prd.txt` / `_trd.txt`), which document the Grade 1 sibling lesson | Reused as-is for brand continuity across the lesson library. If Intellia SG's actual brand guidelines differ from what the sibling document states, this PRD inherits that discrepancy and should be corrected at the same time. |

---

## 3. Product Vision & Goals

### Vision
To make the leap from "triangles" to "quadrilaterals" to "any polygon" feel like a **discovery students make themselves**, not a rule they are told — using draggable, breakable, rebuildable shapes, a story grounded in real building and design, and a gamified practice arena that never repeats itself, for a global Grade 7 audience.

### Goals

| Goal | Metric |
|---|---|
| Learning Completion | ≥85% of students complete all 5 phases |
| Practice Engagement | ≥90% attempt at least 15 practice questions in a session |
| Score Achievement | Average challenge score ≥75% on first attempt |
| Session Duration | Average engagement ≥18 minutes per session |
| Curriculum Alignment | 100% of lesson content mapped to ≥5 global syllabus frameworks |
| Phase Progression | ≥80% reach the Play phase in a single session |
| Simulation Interaction Rate | ≥95% attempt all 4 simulation stations |
| **Concept Transfer** (new for this topic) | ≥70% of students who complete Simulate correctly answer a Play-phase question about a polygon shape (e.g. a 9-gon) **not** shown during Simulate — evidence the `(n−2)×180°` rule generalized, rather than being memorized per-shape |
| Question Uniqueness | 0% verbatim-repeated questions (numbers + names) within a single session across 100 questions |

---

## 4. Target Users

### Primary: Grade 7 Students (Ages 12–13), Global
- Transitioning from concrete/pictorial primary geometry into **formal reasoning and generalization** — the CPA (Concrete → Pictorial → Abstract) bridge is still essential, but now supports "why is this always true?" thinking, not just "what is the answer?"
- Comfortable with basic arithmetic and simple algebra (can handle `(n − 2) × 180`, one-step equations like `x + 95 = 360`)
- Culturally diverse: the product must not assume a single country's classroom objects, names, or currency/measurement conventions
- Shorter tolerance for being *told* a rule than younger learners — this age group responds well to "prove it to yourself" framing, which this lesson's story and simulations are built around
- Still benefits from narration, color, and game mechanics — this is not yet an unassisted-reading age group for dense math text

### Secondary: Parents & Teachers
- May assign as classwork, homework, or a flipped-classroom pre-read before a geometry unit test
- Expect the lesson to map cleanly onto **whichever national/international syllabus their school follows** — hence the multi-framework alignment table in §5, rather than a single-country claim
- Want visibility into mastery (phase completion, world map progress, badge/score summary) without needing a full LMS integration for v1.0

---

## 5. Curriculum Alignment — Global Grade 7 Mathematics

**Topic:** Quadrilaterals from Triangles and Polygons (Lesson 5.3)
**Programme:** Intellia SG Grade 7 Math — Section 5: Shape, Space and Angles
**Strand:** Geometry / Geometric Reasoning / Shape and Space

### 5.1 Unit Context (surrounding lessons)

| Lesson | Title | Relationship to 5.3 |
|---|---|---|
| 5.1 | Angles and Parallel Lines | Prerequisite — angles on a line/at a point, angles in parallel lines |
| 5.2 | Triangles and Their Properties | Prerequisite — median, altitude, exterior angle, **Triangle Angle Sum Property** |
| **5.3** | **Quadrilaterals from Triangles and Polygons** | **This document** — bridges 5.2 into quadrilaterals and general polygons |
| 5.4 | Circles and Constructions | Builds on the same "reasoning from a known shape" habit of mind |

### 5.2 Global Framework Mapping

Rather than anchoring this lesson to a single country's syllabus, the following table shows where this exact content sits in each major framework used by Intellia's global user base. Only the content directly relevant to triangle/quadrilateral/polygon angle properties is pulled from each — per the instruction to select only topic-related material from broader syllabus documents.

| Framework | Grade/Stage label | Relevant standard(s) | Content match |
|---|---|---|---|
| **CBSE / NCERT** (India) | Class 7 Ch. 6 + Class 8 Ch. 3 | *The Triangle and its Properties* (Cl. 7); *Understanding Quadrilaterals* (Cl. 8) | This lesson deliberately **bridges both chapters into one Grade 7 module**: triangle angle sum & exterior angle property (Cl. 7 content) used to derive quadrilateral angle sum and the general polygon formula (Cl. 8 content) |
| **Cambridge Lower Secondary Mathematics** | Stage 7 (framework 0862) | Geometry and Measure strand — "Angles" and "Shapes and Polygons" sub-strands | Direct match: Stage 7 is the first officially designated home for polygon/angle classification work in the Cambridge pathway |
| **Australian Curriculum (v8/v9)** | Year 7 | ACMMG163–ACMMG166 | ACMMG166 in particular reads *"demonstrate that the angle sum of a triangle is 180° and use this to find the angle sum of a quadrilateral"* — an almost word-for-word match to this lesson's core idea |
| **Singapore MOE** | Secondary 1 | Geometry and Measurement strand — *"Angles, Triangles and Quadrilaterals"* / *"Triangles, Quadrilaterals and other Polygons"* | Direct topical match at Sec 1 (Grade 7 equivalent) |
| **Common Core (USA)** | Grade 7 → Grade 8 bridge | 7.G.A.2, 7.G.B.5 (Gr. 7) → 8.G.A.5 (Gr. 8, formal Triangle Sum & Exterior Angle Theorem) | Presented honestly as a **readiness bridge**: US Common Core formalizes the triangle/polygon angle-sum theorems one year later (Grade 8) than most other systems; this lesson gives Grade 7 US students an early, informal-reasoning-based head start toward 8.G.A.5 |
| **IB MYP Mathematics** | Year 2 / Phase 2 (~Grade 7) | Key concept: *Form*; Related concepts: *Generalization, Space, System*; Criterion D (Applying mathematics in real-life contexts) | The lesson's "derive the rule, then apply it to a real object" arc is a direct fit for MYP's emphasis on generalization and real-world application over rote formula recall |

### 5.3 Learning Objectives

| # | Objective |
|---|---|
| LO1 | Recall and apply the **Angle Sum Property of a Triangle**: the three interior angles of any triangle sum to 180° |
| LO2 | Understand and apply the **Exterior Angle Property of a Triangle**: an exterior angle equals the sum of the two remote (non-adjacent) interior angles |
| LO3 | **Derive** the angle sum of a quadrilateral (360°) by splitting it into two triangles along a diagonal — the lesson's central "aha" |
| LO4 | **Generalize** to any simple polygon: splitting an *n*-sided polygon into `(n − 2)` triangles from one vertex gives an interior angle sum of `(n − 2) × 180°` |
| LO5 | Calculate each interior angle of a **regular** polygon: `[(n − 2) × 180°] ÷ n` |
| LO6 | Know that the exterior angles of any convex polygon always sum to 360°, regardless of the number of sides |
| LO7 | Classify quadrilaterals by their properties into the quadrilateral family (trapezium, kite, parallelogram, rhombus, rectangle, square) and recognize the **hierarchy** (e.g. a square is both a rectangle and a rhombus) |
| LO8 | Distinguish convex from concave polygons; calculate the number of diagonals in a polygon using `n(n − 3) ÷ 2` |
| LO9 | Solve multi-step word problems that combine triangle, quadrilateral, and polygon angle relationships in real-world contexts |
| LO10 | Reason and justify *why* the angle-sum results hold, using diagonal-splitting as the unifying explanation, rather than only computing answers (Thinking & Working Mathematically) |

### 5.4 Vocabulary Focus

`polygon` · `vertex / vertices` · `side` · `diagonal` · `interior angle` · `exterior angle` · `convex` · `concave` · `regular polygon` · `irregular polygon` · `triangle` · `quadrilateral` · `pentagon` · `hexagon` · `heptagon` · `octagon` · `trapezium (trapezoid)` · `kite` · `parallelogram` · `rhombus` · `rectangle` · `square` · `angle sum property` · `triangulation`

### 5.5 The Core Concept Map

```
        TRIANGLE                     Draw one diagonal
     (angle sum = 180°)  ───────────────────────────────────►  QUADRILATERAL
           │                     splits it into 2 triangles      (angle sum =
           │                                                     2 × 180° = 360°)
           │
           │  Draw (n − 2) diagonals
           │  from ONE vertex, splitting
           │  the shape into (n − 2) triangles
           ▼
        ANY POLYGON  (n sides)
     angle sum = (n − 2) × 180°
     each angle of a REGULAR polygon = [(n − 2) × 180°] ÷ n
     sum of exterior angles = 360°  (always, for any n)
```

This diagram *is* the lesson. Every phase — Story, Simulate, and Play — returns to this same picture from a different angle (concrete story, hands-on shape-splitting, then abstract question-answering).

---

## 6. The 5-Phase Learner Journey (Intellia Model)

```
┌────────────────────────────────────────────────────────────────────────────┐
│  INTRO SCREEN → Journey Bar (5-step tracker, top bar, same component as    │
│  the reference build)                                                      │
│  Welcome: "Ready to build shapes out of triangles?"                       │
│  Mascot: LearnFlow 🤖 wears a small protractor accessory for this lesson  │
└────────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  PHASE 1 — WONDER  (≈1–2 min)                                              │
│  Hook: "Sarah is building a kite frame with two wooden sticks. The fabric  │
│  needs to be cut so the four corners fit together perfectly. How does she  │
│  know the four corners will always add up to exactly the same total —     │
│  no matter what shape kite she designs?"                                  │
│  Visual: A kite silhouette rotates; its 4 corner angles glow one by one   │
│  Narration (ElevenLabs Alice): reads the hook warmly                      │
└────────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  PHASE 2 — STORY  (≈3–4 min, 6 panels)  — see §7 for full script          │
│  John, Mike and Sarah build a kite, discover the diagonal-split trick,    │
│  and use it on a hexagonal skate-ramp and a family of quadrilateral tiles │
└────────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  PHASE 3 — SIMULATE  (≈8–10 min)  — 4 interactive stations, all required  │
│  Station A — Corner Tear-Up: The Triangle Machine (concrete)              │
│  Station B — Diagonal Split: Quadrilaterals from Triangles (the core idea)│
│  Station C — Polygon Builder: From Triangles to Any Shape (abstract)      │
│  Station D — Quadrilateral Family Sorter (classification)                 │
└────────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  PHASE 4 — PLAY  (≈8–10 min)                                               │
│  IntelliPlay™ Level: procedurally-generated questions across 10 worlds,   │
│  themed on real polygon shapes found around the globe (§9.2)             │
│  10 questions per world; world unlocks at ≥6/10 correct                  │
└────────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  PHASE 5 — REFLECT  (≈1–2 min)                                            │
│  Journal prompt: "Explain to a friend, in your own words, why a           │
│  quadrilateral's angles always add up to 360°."                          │
│  Confidence check + completion certificate + XP/badge summary            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Phase 2 — Story Script (Detailed)

The story follows three recurring characters — **John, Mike, and Sarah** — through a single afternoon of building, chosen so that every math idea is discovered while making something real, not recited.

| Panel | Scene | Key line | Math idea introduced |
|---|---|---|---|
| 1 | Sarah is building a diamond-shaped kite frame in her backyard with friends John and Mike helping. Mike, holding the fabric, asks: *"How do you know the four corners of this fabric will fit the frame exactly?"* | *"Let's find out — starting with something we already know about triangles."* | Sets up the central question |
| 2 | Flashback/demo: John tears the three corners off a paper triangle and lines them up edge to edge along a ruler. They form a perfectly straight line. | *"See? However we draw the triangle, the three corners always make a straight line — 180°, every time."* | **LO1 — Triangle Angle Sum Property** |
| 3 | Back at the kite: Sarah folds the kite fabric along its diagonal, revealing two triangles. *"If each triangle is 180°, and the kite is just two triangles stuck together..."* | *"...then the whole kite's four corners add up to 180° + 180° = 360°!"* | **LO3 — Quadrilateral angle sum, derived from triangles** (title moment of the lesson) |
| 4 | Mike, now building a hexagonal (6-sided) skateboard ramp base, asks: *"Okay, but what about shapes with even MORE sides?"* Sarah draws diagonals from one corner of the hexagon, splitting it into 4 triangles. | *"Every polygon can be cut into triangles from one corner. A hexagon splits into 4 triangles: 4 × 180° = 720°."* | **LO4 — General polygon formula, (n − 2) × 180°** |
| 5 | The three friends lay out the finished pieces: John's rectangular ramp edge, Sarah's rhombus-tiled path, and the kite. Mike notices they're all "four-sided" but look different. | *"They're all quadrilaterals, but each one is special in its own way — some have all right angles, some have all equal sides..."* | **LO7 — Quadrilateral family & classification** |
| 6 | Recap panel, mascot LearnFlow appears. | *"Now it's your turn — go build and break some shapes yourself!"* | Transition into Simulate |

**Design note:** every panel pairs a *concrete, physical build* (kite, ramp, tiled path) with the *abstract rule* it reveals — directly supporting the "learning first" requirement before any scored practice begins, and matching the CPA progression used throughout the Intellia model.

---

## 8. Phase 3 — Simulation Design (Detailed)

All four stations are genuinely interactive geometry simulations — free-form draggable vertices and live-recalculated angles — rather than the drag-object-into-a-circle mechanic used in the reference (Grade 1) lesson, because this topic requires students to manipulate *shapes*, not *quantities*. Each station still follows the reference build's station wrapper pattern: header, short instruction, narrated prompt, round counter, and a "Next Station →" button gated on completion.

### 8.1 Station A — "Corner Tear-Up: The Triangle Machine" (Concrete)

- A single triangle is drawn as an SVG with 3 draggable vertices. Its starting shape (acute/obtuse/right/scalene/isosceles) is randomized each round.
- Live angle readout sits at each vertex as the student drags — it recalculates in real time.
- A **"Tear off the corners"** button plays an animation: the three corner wedges detach and rotate to sit edge-to-edge along a baseline, visually resolving into a straight line.
- A running sum ticks up as each wedge lands: `∠A + ∠B + ∠C = 180°`, with a checkmark celebration on completion.
- Students may freely drag vertices to build "extreme" triangles (very thin, very obtuse, right-angled) and repeat the tear-up to convince themselves the result never changes.
- 3 rounds; each round randomizes the starting shape so the pattern is tested, not memorized from one picture.

### 8.2 Station B — "Diagonal Split: Quadrilaterals from Triangles" (the lesson's signature station)

- A quadrilateral is drawn as an SVG with 4 draggable vertices; the starting shape is randomized among convex quadrilateral, parallelogram, kite, and trapezium each round.
- Student taps **"Draw a diagonal"**; an animation splits the shape into two triangles, each shaded a different color, with its own angle-sum readout of 180°.
- The two 180° totals animate into a combined running total: `180° + 180° = 360°`.
- A **"Try the other diagonal"** toggle re-splits the same quadrilateral along its other diagonal — producing two *different* triangles but the *same* 360° total, reinforcing that the result does not depend on which diagonal is chosen.
- A **"New shape"** button (or free vertex-dragging) randomizes/reshapes the quadrilateral so students see the rule hold across many different quadrilaterals, not just one.

### 8.3 Station C — "Polygon Builder: From Triangles to Any Shape" (Abstract generalization)

- A slider (labelled *"Number of sides"*, range 3–10) redraws a regular polygon live as it moves.
- A **"Fan triangulate"** animation draws `(n − 2)` diagonals from one vertex, splitting the polygon into `(n − 2)` colored triangles.
- A live formula line builds itself as the slider moves: `(n − 2) × 180° = ___`, with the blank filled either by the student (number pad) or auto-completed once they've had a fair attempt, per the hint-escalation rules in §11.4.
- A secondary readout shows each interior angle of the current **regular** polygon: `[(n − 2) × 180°] ÷ n`.
- A third element — unique to this station and not present in the reference build — is an **exterior-angle walk**: a small marker travels once around the polygon's perimeter, visibly turning through the exterior angle at each vertex, and completes exactly one full 360° rotation by the time it returns to its start, for any value of *n*. This makes LO6 (exterior angles always sum to 360°) something students *watch happen* rather than a fact they are told.

### 8.4 Station D — "Quadrilateral Family Sorter" (Classification)

- Six shape cards appear in randomized order and rotation each round: **trapezium, kite, parallelogram, rectangle, rhombus, square.**
- A live property checklist ("Has 2 pairs of parallel sides? All sides equal? All angles 90°?") appears alongside each card as the student inspects it.
- Students drag or tap each card into the correct nested "family" zone — built so that a square must be placed inside **both** the rectangle nest and the rhombus nest, visually teaching the hierarchy in LO7 rather than presenting six unrelated boxes.
- Perfect-round completion (zero mis-sorts) contributes toward the **"Eagle-Eyed Sorter"** badge (§9.3).

---

## 9. Phase 4 — Gamified Practice Design

### 9.1 Question Bank — 10 Procedurally-Generated Types

Mirroring the reference build's proven 10-type structure, but every value below is generated live by a randomizer function each time the question is shown — see the companion TRD §5 for the exact generator code. No two students, and no single student across two sessions, will see identical numbers.

| Type | Description | Example (values randomize every time) |
|---|---|---|
| Q1 | Triangle Angle Hunt — find the missing interior angle given the other two | A triangle has angles 52° and 71°. What is the third angle? |
| Q2 | Exterior Angle Explorer — find an exterior angle or a remote interior angle | The exterior angle of a triangle is 118°, and one remote interior angle is 64°. Find the other. |
| Q3 | Quadrilateral Angle Hunt — find the missing interior angle given the other three | A quadrilateral has angles 88°, 95°, and 102°. Find the fourth angle. |
| Q4 | Polygon Angle Sum — given *n*, find the interior angle sum | Find the sum of the interior angles of a 7-sided polygon. |
| Q5 | Sides from Sum — given the interior angle sum, find *n* | A polygon's interior angles sum to 1080°. How many sides does it have? |
| Q6 | Regular Polygon Angle — given *n*, find each interior angle of a regular polygon | Find one interior angle of a regular octagon. |
| Q7 | Diagonal Counter — given *n*, find the number of diagonals | How many diagonals does a decagon (10 sides) have? |
| Q8 | Shape Detective (word problem) — a global-named character builds/observes a triangle-based object | Yuki is building a roof truss shaped like a triangle. Two of the angles measure 48° and 79°. What is the third angle where the beams meet? |
| Q9 | Quad Family Sort (word problem/classification) — classify a quadrilateral from a described property set | Omar draws a shape with all four sides equal but no right angles. Which quadrilateral is it? |
| Q10 | True or False — a mixed, procedurally-generated statement about triangle/quadrilateral/polygon angle facts | *"The exterior angles of a hexagon add up to 360°."* — True or False? |

### 9.2 World Map — 10 Worlds, Themed on Real Global Geometry

Because this lesson explicitly serves "students of the global countries," the world map is themed around real polygon shapes found in architecture and design around the world — reinforcing the math contextually rather than through a generic fantasy skin.

| World | Name | Real-world shape link | Emphasis | Difficulty |
|---|---|---|---|---|
| 1 | Cairo Pyramid Plateau 🔺 | Triangular faces of the pyramids | Triangle angle basics (Q1) | Easy |
| 2 | Athens Column Court 🏛️ | Triangular pediments | Exterior angles (Q2) | Easy |
| 3 | Tokyo Origami Studio 🎏 | Folded paper quadrilaterals | Quadrilateral angle hunt (Q3) | Easy–Medium |
| 4 | Rio Kite Festival 🪁 | Kite-shaped quadrilaterals | Quad family sort (Q9) | Medium |
| 5 | Marrakech Mosaic Market 🕌 | Pentagon/hexagon zellige tiling | Polygon angle sum (Q4) | Medium |
| 6 | Mumbai Stepwell Steps 🏛️ | Repeating regular polygons | Regular polygon angle (Q6) | Medium–Hard |
| 7 | Reykjavik Ice Dome ❄️ | Geodesic polygon panels | Sides-from-sum & diagonals (Q5, Q7) | Hard |
| 8 | Sydney Harbour Sails ⛵ | Triangular sail panels | Mixed word problems (Q8) | Hard |
| 9 | New York Skyline Grid 🏙️ | Rectangular window grids | Classification + True/False (Q9, Q10) | Hard |
| 10 | Nairobi Star Compass 🌍 | All shapes, mixed | Final boss — all 10 types | Hardest |

World unlock gate: ≥6/10 correct required to advance. A 3-star world (≥9/10) unlocks a 3-question Bonus Challenge.

### 9.3 Gamification Mechanics

**Reward system**
- **XP:** 10 XP (first try) · 7 XP (second try) · 5 XP (used a hint) · +5 streak bonus at streak ≥5
- **Stars:** 3★ ≥90% · 2★ ≥70% · 1★ ≥50% (world-unlock threshold) · 0★ below
- **Streak 🔥:** consecutive-correct counter, resets on a wrong answer

**Badges**

| Badge | Unlock condition |
|---|---|
| 🔺 Angle Sum Ace | Complete Wonder + Story phases |
| 📐 Shape Shifter | Complete all 4 Simulation stations |
| 🏆 Polygon Pro | Score ≥80% across the full Play phase |
| 💎 Perfect Vertex | Score 10/10 in any single world |
| 🔥 Diagonal Streak | Reach a streak of 10 consecutive correct answers |
| 🌍 World Geometer | Complete all 5 phases (full-journey badge) |
| 👁️ Eagle-Eyed Sorter | Perfect (zero mis-sort) round in Station D |
| 🗺️ Globe Trotter | Reach ≥1★ in all 10 worlds |

**Feedback mechanics** (no negative scoring; encouragement-first, matching the reference build):
- ✅ Correct → bounce animation, mascot celebration, ElevenLabs celebration line, floating XP
- ❌ Attempt 1 → gentle shake, Hint 1 (points back at the relevant simulation concept, e.g. "try splitting it into triangles again")
- ❌ Attempt 2 → stronger shake, Hint 2 (shows the diagonal-split or triangulation visually, reusing the Simulate-phase diagram component)
- ❌ Attempt 3 → answer revealed with a short animated explanation, no score penalty

### 9.4 Global Names & Contexts for Word Problems

**Story protagonists (fixed, drive the narrative):** John, Mike, Sarah

**Word-problem name pool (randomized per question, intentionally global):** John, Mike, Sarah, Priya, Yuki, Omar, Carlos, Fatima, Wei, Liam, Aisha, Elena, Diego, Mei, Kwame, Sofia, Hassan, Ingrid, Noah, Olivia, Arjun, Lucas, Emma, Amara

**Real-world object pool:** kite frame · garden trellis · skateboard ramp · roof truss · stop sign · floor tile · picture frame · table top · solar panel · football (soccer ball) panel · drone wing · treehouse window · mosaic tile · bridge truss · umbrella panel · greenhouse pane · playground climbing frame · sailboat sail

Names and objects are drawn from these pools independently of the character's implied region — i.e. the generator does not force "matching" cultural pairings — so that representation stays broad and unforced rather than stereotyped.

---

## 10. Audio & Narration Design

### 10.1 Pipeline (inherited from the reference build for brand continuity)

| | |
|---|---|
| Voice Provider | ElevenLabs (primary) |
| Voice | Alice — same voice used across the Intellia lesson library |
| Voice ID | `Xb7hH8MSUJpSbSDYk0k2` |
| Model | `eleven_multilingual_v2` |
| Backend | `/api/elevenlabs` proxy first, with a direct-client fallback using `VITE_ELEVENLABS_API_KEY` if the proxy is unavailable (matches the reference `audio.js` exactly) |
| SFX | Web Audio API oscillator tones (correct / wrong / badge / click / streak) — no external files needed |

### 10.2 Speech Styles

Reused unmodified from the reference build's seven styles (`statement`, `question`, `encouragement`, `emphasis`, `thinking`, `celebration`, `instruction`), each with its own ElevenLabs voice-settings profile. Full settings table is in the companion TRD §8.

### 10.3 Narration Content for This Lesson (sample; full script in TRD §8.3)

- *Wonder:* "Sarah is building a kite frame. How does she know all four corners will always add up to the same total?" *(question style)*
- *Story panel 2:* "However we draw the triangle, the three corners always make a straight line." *(emphasis style)*
- *Station B instruction:* "Draw a diagonal and watch the quadrilateral split into two triangles." *(instruction style)*
- *Correct feedback:* "Exactly right! You just proved it yourself." *(celebration style)*

### 10.4 Audio Script Parity Rule

As in the reference build: every on-screen narrated string must match its corresponding text in `narration.js` **exactly** (same words, punctuation, capitalization), so a student reading along never sees text that doesn't match what they hear.

---

## 11. UX & Visual Design Requirements

### 11.1 Visual Theme — Strict Mirror of the Reference Build

No new visual language is introduced. Colors, type, spacing, radii, shadows, and motion are inherited **verbatim** from `github.com/dsamyak/equal`'s `src/index.css`, reproduced in full (with additions only for new geometry-specific elements) in the companion TRD §11.

| Token | Value |
|---|---|
| Background | Deep-space gradient: `#0a0a2e → #2d1b69 → #1a0a3e → #0d1b3e` |
| Primary accent | Gold `#ffc107` |
| Success | Green `#4caf50` |
| Error | Red `#ef5350` / Coral `#ff7043` |
| Cards | Glassmorphism: `rgba(30,30,100,0.7)` + `backdrop-filter: blur(20px)` |
| Display font | Fredoka (400–700) |
| Body font | Nunito (400–800) |
| Corner radius scale | 8 / 16 / 24 / 32px, plus a full-pill radius |

### 11.2 Layout Structure (identical component roles to the reference)

- **Top:** floating audio-toggle button (top-right), home button (top-left, once past Intro), Journey Bar (5-step dot tracker, top-center)
- **Main:** phase content, full height, smooth phase-to-phase transitions
- **Background:** low-opacity floating numbers/shapes drifting upward (reused `FloatingNumbers` pattern, with the floating glyphs changed from digits to small polygon outlines for this lesson, since digits made sense for a multiplication lesson but shapes make more sense here)

### 11.3 New Visual Component — Interactive Geometry Canvas

The one genuinely new visual primitive this lesson requires (absent from the reference, which never needed free-form shape manipulation) is a reusable **draggable-vertex SVG polygon** component: renders any *n*-vertex simple polygon, exposes each vertex as a drag handle, live-computes and displays each interior angle, and can animate a diagonal-split or fan-triangulation on command. Full spec in the companion TRD §6–7.

### 11.4 Accessibility

- Minimum 44×44px tap targets on every interactive element, including vertex-drag handles (hit area larger than the visible handle)
- WCAG AA color contrast on all text
- Keyboard-operable alternative to dragging: arrow keys nudge a selected vertex; Tab cycles focus between vertices
- No mandatory time pressure anywhere in Play phase
- All narration via ElevenLabs; no reliance on audio alone to convey any required information (every spoken line is also shown as on-screen text)

### 11.5 Responsive Design

Primary target iPad/tablet (768px+, classroom use), secondary desktop (1024px+), tertiary mobile (375px+, stacked layout) — identical breakpoint priorities to the reference build.

---

## 12. Content Requirements

### 12.1 Simulation Visuals
All four station shapes are rendered as scalable inline SVG (not raster images), so vertex-dragging and angle recalculation remain crisp and accurate at any screen size.

### 12.2 Question Bank Coverage
All 10 question types must be represented in every 100-question session (10 per world, per §9.2), with values generated live per §9.1 — not selected from a static pool. Distractor/option generation must always include the correct answer and never a duplicate.

### 12.3 Word Problem Format
`[Name] is [building/observing] a [object] shaped like a [triangle/quadrilateral/polygon]. [Given angle information]. Find [the missing value].` — see §9.4 for name/object pools.

### 12.4 Audio Script Parity
As stated in §10.4 — a hard requirement carried over from the reference build.

---

## 13. Success Criteria (v1.0)

| Criterion | Target |
|---|---|
| All 4 simulation stations functional (drag, split, triangulate, sort) | ✅ Required |
| All 10 question types generate correctly and infinitely (no repeats within a session) | ✅ Required |
| All 5 phases navigable end-to-end without a dead end | ✅ Required |
| Gamification (XP, stars, 8 badges, 10-world map) fully working | ✅ Required |
| ElevenLabs audio plays for all phase narration; silent, non-blocking skip if key absent | ✅ Required |
| Global framework alignment table (§5.2) verified against current published syllabus documents | ✅ Required |
| UI visually indistinguishable in structure/tokens from the reference build, aside from content | ✅ Required |
| Mobile/tablet responsive layout | ✅ Required |
| Loads in <3 seconds (Vite production build) | ✅ Required |
| WCAG AA accessible | ✅ Required |
| Hosted correctly at the intelliasg.com lesson URL | ✅ Required |

---

## 14. Out of Scope (v1.0)

- Teacher dashboard / backend analytics
- Student login or cross-device account persistence
- Multiplayer or class-vs-class competition features
- Parent progress-report emails
- Print worksheet generation
- Lessons 5.1, 5.2, 5.4 (separate modules, referenced only for unit context in §5.1)
- Formal geometric proof-writing (this lesson builds informal, visual justification per LO10; two-column proofs are a later-grade extension)
- 3D polyhedra / solid geometry (explicitly out of scope; this lesson is 2D only)

---

## 15. Risks & Open Questions

| Risk / Question | Mitigation / Next step |
|---|---|
| `intelliasg.com/courses/grade-7-math` could not be retrieved to confirm exact page template/branding | Confirm with the team before final visual QA; §2 documents this as an explicit assumption |
| No audio sample file was provided in this conversation | Confirmed the closest available concrete reference (the reference repo's own audio pipeline) was used; please share an actual audio file/spec if a different voice or style was intended |
| Free-form vertex dragging on touch devices can be fiddly for 12–13-year-olds | TRD specifies a minimum-angle/self-intersection guard so a dragged shape can never become degenerate or invalid mid-lesson |
| Six-framework curriculum claim needs periodic revalidation | Syllabus documents change; recommend an annual alignment review, same cadence as other Intellia lessons |

---

*Document Version: 1.0 · September 2026*
*Product: Intellia SG — Grade 7 Math, Lesson 5.3*
*Reference UI: https://equal-tau.vercel.app/ · Reference Repo: https://github.com/dsamyak/equal*
*Audio Pipeline: ElevenLabs (Alice, Xb7hH8MSUJpSbSDYk0k2, eleven_multilingual_v2)*
*Curriculum Refs: CBSE/NCERT · Cambridge Lower Secondary (0862) · Australian Curriculum (ACMMG163–166) · Singapore MOE Sec 1 · Common Core (US) · IB MYP*
*Parent Course Page: https://intelliasg.com/courses/grade-7-math/*
*Lesson URL: https://intelliasg.com/courses/grade-7-math/lessons/quadrilaterals-from-triangles-and-polygons/*
