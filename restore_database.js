// Database restore script
import fs from 'fs';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

// Extract Pool from pg (CommonJS module)
const { Pool } = pg;

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the SQL file
const sqlFile = path.join(__dirname, 'database_backup.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');

// Connect to the database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function restoreDatabase() {
  try {
    console.log('Starting database restore...');
    
    // Execute the SQL file
    await pool.query(sql);
    
    console.log('Database restore completed successfully.');
  } catch (error) {
    console.error('Database restore failed:', error);
  } finally {
    await pool.end();
  }
}

// Run the restore
restoreDatabase();