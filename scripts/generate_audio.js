const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.ELEVENLABS_API_KEY || ;
const VOICE_ID = 'Xb7hH8MSUJpSbSDYk0k2'; // Alice

const audios = {
    'welcome_intro': "Welcome to the Quadrilaterals module! Today we are going to explore the amazing world of four-sided shapes.",
    'wonder_1': "Sarah is building a kite frame in her backyard. John and Mike are helping hold the fabric.",
    'wonder_2': "Mike looks at the four corners and asks: 'How do you know all four corners will fit the frame exactly — no matter what shape we make it?'",
    'story_1': "Sarah is building a diamond-shaped kite frame in her backyard. John and Mike are helping hold the fabric. Mike looks at the four corners and asks: 'How do you know all four corners will fit the frame exactly — no matter what shape we make it?' Sarah smiles: 'Let's find out — starting with something we already know about triangles.' Key Question: Do the four angles of ANY quadrilateral always add up to the same total?",
    'story_2': "John grabs a piece of paper and draws a triangle. He tears off all three corners and lines them up, edge to edge, along a ruler. They form a perfectly straight line! 'See?' says John. 'However we draw the triangle — big or small, wide or thin — the three corners ALWAYS make a straight line. That's 180 degrees every time!' Triangle Angle Sum: Angle A plus Angle B plus Angle C equals 180 degrees — always, for any triangle!",
    'story_3': "Back at the kite, Sarah folds the fabric along its diagonal — the line joining two opposite corners. The kite splits into TWO perfect triangles! Sarah exclaims: 'If each triangle gives 180 degrees, and the kite is just two triangles stuck together… 180 plus 180 equals 360 degrees! That's why the four corners always total the same!' Mike's jaw drops. Quadrilateral: 180 degrees plus 180 degrees equals 360 degrees — every time, for any quadrilateral!",
    'story_4': "Mike is now building a hexagonal, 6-sided skateboard ramp base. He asks: 'What about shapes with even MORE sides?' Sarah draws diagonals from just one corner of the hexagon, splitting it into 4 triangles: 'A hexagon makes 4 triangles, which means 4 times 180 degrees equals 720 degrees. For any n-sided polygon: n minus 2 times 180 degrees!' General Formula: Angle Sum of any polygon equals n minus 2 times 180 degrees.",
    'story_5': "The three friends lay out all their pieces: John's rectangle, Sarah's rhombus-tiled path, Mike's kite, and a trapezoid they found. Mike notices they all have four sides but look so different. Sarah explains: 'A square has all equal sides AND all right angles — it's a rectangle AND a rhombus. A kite has two pairs of adjacent equal sides. A trapezoid has exactly one pair of parallel sides.' Quad Family: Trapezoid to Parallelogram to Rectangle or Rhombus to Square.",
    'sim_0': "Corner Tear-Up. Tear off the corners of any triangle and line them up. What do you notice about the angles?",
    'sim_1': "Diagonal Split. Tap 'Draw Diagonal' to split the quadrilateral into two triangles, proving 180 plus 180 equals 360 degrees!",
    'sim_2': "Polygon Builder. Drag the slider to change the number of sides, then tap 'Fan Triangulate' to see the formula!",
    'sim_3': "Shape Sorter. Select a shape card below, then tap the correct zone in the family tree to place it!",
    'sim_4': "Exterior Angles. The exterior angles of any convex polygon always total 360 degrees. Adjust the sides and watch the walker turn!",
    'feedback_good': "Very good!",
    'feedback_wrong': "Incorrect!",
    'practice_intro': "Welcome to the Practice Phase! Let's test your knowledge.",
    'reflect_intro': "Great job! You've successfully completed the module. Let's reflect on what we've learned today."
};

const OUT_DIR = path.join(__dirname, '../audio');

function generateAudio(filename, text) {
    return new Promise((resolve, reject) => {
        const filepath = path.join(OUT_DIR, `${filename}.mp3`);
        if (fs.existsSync(filepath)) {
            console.log(`[SKIP] ${filename}.mp3 already exists.`);
            return resolve();
        }

        const data = JSON.stringify({
            text: text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75
            }
        });

        const options = {
            hostname: 'api.elevenlabs.io',
            path: `/v1/text-to-speech/${VOICE_ID}`,
            method: 'POST',
            headers: {
                'xi-api-key': API_KEY,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = https.request(options, (res) => {
            if (res.statusCode !== 200) {
                console.error(`[ERROR] ${filename}: HTTP ${res.statusCode}`);
                res.on('data', (d) => console.error(d.toString()));
                return reject(new Error(`HTTP ${res.statusCode}`));
            }

            const fileStream = fs.createWriteStream(filepath);
            res.pipe(fileStream);

            fileStream.on('finish', () => {
                console.log(`[DONE] ${filename}.mp3`);
                resolve();
            });
        });

        req.on('error', (e) => {
            console.error(`[ERROR] ${filename}: ${e.message}`);
            reject(e);
        });

        req.write(data);
        req.end();
    });
}

async function run() {
    console.log('Starting audio generation...');
    for (const [filename, text] of Object.entries(audios)) {
        await generateAudio(filename, text);
        // Wait a bit to avoid rate limits
        await new Promise(r => setTimeout(r, 1000));
    }
    console.log('Finished generating all audio files.');
}

run();
