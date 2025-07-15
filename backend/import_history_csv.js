const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const axios = require('axios');

const CSV_PATH = path.join(__dirname, 'sat_world_and_us_history.csv');
const TEMP_JSON_PATH = path.join(__dirname, 'history_questions_temp.json');
const IMPORT_ENDPOINT = 'https://aistudylab.onrender.com/api/data/import-json';

function shuffleArray(array) {
  // Fisher-Yates shuffle
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function preprocessAndImport() {
  const questions = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on('data', (row) => {
        // Collect options (A-E, some may be empty)
        const optionLabels = ['A', 'B', 'C', 'D', 'E'];
        const optionsRaw = optionLabels.map(label => row[label] && row[label].trim() ? row[label].trim() : null).filter(opt => opt);
        const correctLetter = row.answer && row.answer.trim();
        const correctIndex = optionLabels.indexOf(correctLetter);
        // SKIP if prompt is missing or empty
        if (!row.prompt || !row.prompt.trim()) return;
        if (correctIndex === -1 || !optionsRaw[correctIndex]) return; // skip malformed
        const correctText = optionsRaw[correctIndex];

        // Prepare options for shuffling
        const optionsArr = optionsRaw.map((text, idx) => ({
          label: optionLabels[idx],
          text
        }));
        // Shuffle
        const shuffled = shuffleArray([...optionsArr]);
        // Find new correct index
        const newCorrectIndex = shuffled.findIndex(opt => opt.text === correctText);
        const displayOptions = shuffled.map((opt, idx) => `${['a','b','c','d','e'][idx]}) ${opt.text}`);
        const correctLetterNew = ['a','b','c','d','e'][newCorrectIndex];

        questions.push({
          Problem: row.prompt,
          options: displayOptions.join(', '),
          correct: correctLetterNew,
          Rationale: '',
          annotated_formula: '',
          linear_formula: '',
          category: 'history'
        });
      })
      .on('end', async () => {
        fs.writeFileSync(TEMP_JSON_PATH, JSON.stringify(questions, null, 2));
        console.log(`Processed ${questions.length} questions. Importing to backend...`);
        try {
          const res = await axios.post(IMPORT_ENDPOINT, {
            filePath: TEMP_JSON_PATH,
            category: 'history'
          });
          console.log('Import response:', res.data);
          resolve();
        } catch (err) {
          console.error('Import failed:', err.response?.data || err.message);
          reject(err);
        }
      })
      .on('error', (err) => {
        console.error('CSV read error:', err);
        reject(err);
      });
  });
}

preprocessAndImport();
