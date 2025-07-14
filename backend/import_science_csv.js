const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const axios = require('axios');

const CSV_PATH = path.join(__dirname, 'train.csv', 'train.csv');
const TEMP_JSON_PATH = path.join(__dirname, 'science_questions_temp.json');
const IMPORT_ENDPOINT = 'http://localhost:3000/api/data/import-json';

async function preprocessAndImport() {
  const questions = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on('data', (row) => {
        // Compose options in fixed order: a) distractor1, b) distractor2, c) distractor3, d) correct_answer
        const optionsArr = [
          `a) ${row.distractor1}`,
          `b) ${row.distractor2}`,
          `c) ${row.distractor3}`,
          `d) ${row.correct_answer}`
        ];
        questions.push({
          Problem: row.question,
          options: optionsArr.join(', '),
          correct: 'd',
          Rationale: row.support,
          annotated_formula: '',
          linear_formula: '',
          category: 'science'
        });
      })
      .on('end', async () => {
        // Write to temp JSON file (optional, for debugging)
        fs.writeFileSync(TEMP_JSON_PATH, JSON.stringify(questions, null, 2));
        console.log(`Processed ${questions.length} questions. Importing to backend...`);
        try {
          const res = await axios.post(IMPORT_ENDPOINT, {
            filePath: TEMP_JSON_PATH,
            category: 'science'
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