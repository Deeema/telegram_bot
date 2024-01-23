// test/app.test.js

import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import {
//   insertEventRecord,
    getColumnNamesAndFilter,
//   sendAlertMessage,
//   sendColumnValuesToTelegram,
//   sendLastNormalMessage,
//   watchForNewCensorRecords,
//   updateEventMessageSentFlag,
    getDeviceInfo
} from '../app.js';
import sqlite3 from 'sqlite3';
import 'dotenv/config';

// const db = new sqlite3.Database(process.env.DB);
const tableName = process.env.TABLE_NAME;
const excludedColumns = process.env.EXCLUDED_COLUMNS.split(",");

// Use an in-memory SQLite database for testing
const testDbPath = ':memory:';
let db;

beforeEach((done) => {
  db = new sqlite3.Database(process.env.DB, (err) => {
    if (err) {
      console.error(err.message);
      done(err);
    } else {
      done();
    }
  });
});

afterEach((done) => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    done();
  });
});

describe('App.js Mocha Tests', () => {
//   it('insertEventRecord should insert a record', async () => {
//     // Mock database interaction or set up test database

//     // Call the function
//     const result = await insertEventRecord(/* provide necessary parameters */);

//     // Assert the result or check the database state
//     expect(result).to.be.greaterThan(0);
//     // Add more assertions based on your specific requirements
//   });

  it('getDeviceInfo should retrieve device information', async () => {
    // Mock database interaction or set up test database

    // Call the function
    const result = await getDeviceInfo('353358016961133');
    // Assert the result or check the database state
    expect(result).to.be.an('object');
    // Add more assertions based on your specific requirements
  });

  it('getColumnNamesAndFilter should retrieve column names and apply filter', async () => {
    // Mock database interaction or set up test database

    // Call the function
    const result = await getColumnNamesAndFilter(tableName, excludedColumns/* provide necessary parameters */);
    console.log('result', result);
    // Assert the result or check the database state
    // Add more assertions based on your specific requirements
    expect(result).to.not.include( excludedColumns /* expected column names */);
  });

//   it('sendAlertMessage should send an alert message', async () => {
//     // Mock the necessary dependencies or set up mocks for external services

//     // Call the function
//     const result = await sendAlertMessage(/* provide necessary parameters */);

//     // Assert the result or check the external service interactions
//     // Add more assertions based on your specific requirements
//     expect(result).to.be(/* expected result */);
//   });

//   it('sendColumnValuesToTelegram should send column values to Telegram', async () => {
//     // Mock the necessary dependencies or set up mocks for external services

//     // Call the function
//     const result = await sendColumnValuesToTelegram(/* provide necessary parameters */);

//     // Assert the result or check the external service interactions
//     // Add more assertions based on your specific requirements
//     expect(result).to.be(/* expected result */);
//   });

//   it('sendLastNormalMessage should send the last normal message', async () => {
//     // Mock the necessary dependencies or set up mocks for external services

//     // Call the function
//     const result = await sendLastNormalMessage();

//     // Assert the result or check the external service interactions
//     // Add more assertions based on your specific requirements
//     expect(result).to.be(/* expected result */);
//   });

  // Additional tests for watchForNewCensorRecords and updateEventMessageSentFlag can be added based on your application's requirements.
});
