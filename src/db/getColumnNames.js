import db from './database.js';

const getColumnNames = (tableName) => {
  const query = `PRAGMA table_info(${tableName})`;

  return new Promise((resolve, reject) => {
    db.all(query, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const columnNames = rows.map(row => row.name);
        resolve(columnNames);
      }
    });
  });
};

export { getColumnNames };