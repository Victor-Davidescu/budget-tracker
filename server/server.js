import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;
const DATA_DIR = '/app/data';

// Middleware
app.use(cors());
app.use(express.json());

// Ensure data directory and files exist
async function initializeDataFiles() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    const files = ['expenses.json', 'income.json', 'savings.json', 'loans.json', 'investments.json'];
    for (const file of files) {
      const filePath = path.join(DATA_DIR, file);
      try {
        await fs.access(filePath);
      } catch {
        // File doesn't exist, create it with default data
        const defaultData = file === 'savings.json' 
          ? { emergency_funds: 0, monthly_savings: 0, goals: [] }
          : file === 'investments.json'
          ? { investments: [], pensions: [] }
          : [];
        await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
        console.log(`Created ${file} with default data`);
      }
    }
  } catch (error) {
    console.error('Error initializing data files:', error);
  }
}

// Helper function to read JSON file
async function readJSONFile(filename) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return filename === 'savings.json' ? { emergency_funds: 0, monthly_savings: 0 } : [];
  }
}

// Helper function to write JSON file
async function writeJSONFile(filename, data) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    return false;
  }
}

// API Routes

// Get all expenses
app.get('/api/expenses', async (req, res) => {
  const expenses = await readJSONFile('expenses.json');
  res.json(expenses);
});

// Save expenses
app.post('/api/expenses', async (req, res) => {
  const success = await writeJSONFile('expenses.json', req.body);
  res.json({ success });
});

// Get all income
app.get('/api/income', async (req, res) => {
  const income = await readJSONFile('income.json');
  res.json(income);
});

// Save income
app.post('/api/income', async (req, res) => {
  const success = await writeJSONFile('income.json', req.body);
  res.json({ success });
});

// Get savings data
app.get('/api/savings', async (req, res) => {
  const savings = await readJSONFile('savings.json');
  res.json(savings);
});

// Update savings data
app.post('/api/savings', async (req, res) => {
  const success = await writeJSONFile('savings.json', req.body);
  res.json({ success });
});

// Get all loans
app.get('/api/loans', async (req, res) => {
  const loans = await readJSONFile('loans.json');
  res.json(loans);
});

// Save loans
app.post('/api/loans', async (req, res) => {
  const success = await writeJSONFile('loans.json', req.body);
  res.json({ success });
});

// Get all investments
app.get('/api/investments', async (req, res) => {
  const investments = await readJSONFile('investments.json');
  res.json(investments);
});

// Save investments
app.post('/api/investments', async (req, res) => {
  const success = await writeJSONFile('investments.json', req.body);
  res.json({ success });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Initialize and start server
initializeDataFiles().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Budget Tracker API running on port ${PORT}`);
    console.log(`Data directory: ${DATA_DIR}`);
  });
});
