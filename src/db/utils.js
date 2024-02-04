import db from './database.js';

const getColumnNamesAndCount = (tableName) => {
  const query = `PRAGMA table_info(${tableName})`;

  return new Promise((resolve, reject) => {
    db.all(query, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const columnNames = rows.map(row => row.name);
        const columnCount = rows.length;
        resolve({ columnNames, columnCount });
      }
    });
  });
};

// Example usage
// getColumnNamesAndCount('your_table_name')
//   .then(({ columnNames, columnCount }) => {
//     console.log('Column Names:', columnNames);
//     console.log('Column Count:', columnCount);
//   })
//   .catch(error => console.error('Error retrieving column names and count:', error));

export const doesTableExist = (tableName) => {
  console.log("Checking table existence for:", tableName); // Log the table name

  const query = `PRAGMA table_info(${tableName})`;

  return new Promise((resolve, reject) => {
    db.all(query, [], (err, rows) => {
      console.log("Rows value:", rows); // Log the value of 'rows'

      if (err) {
        console.error("Error in doesTableExist:", err.message);
        reject(err);
      } else {
        // Check if there are rows returned to determine if the table exists
        resolve(rows.length > 0);
      }
    });
  });
};
