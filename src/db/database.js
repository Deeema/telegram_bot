import sqlite3 from 'sqlite3';
import 'dotenv/config';

const db = new sqlite3.Database(process.env.DB);

export default db;