import { google } from 'googleapis';
import dotenv from 'dotenv';
import Cors from 'cors';

dotenv.config();

const sheetsFileId = process.env.GOOGLE_SHEETS_FILE_ID;
const base64Credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const jsonCredentials = Buffer.from(base64Credentials, 'base64').toString('utf8');

// Initialize the cors middleware
const cors = Cors({
  methods: ['GET', 'HEAD'],
  origin: '*' // Allow all origins. You can specify your frontend domain if you want to restrict it.
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

const getFilteredData = async (startDate, endDate) => {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(jsonCredentials),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    console.log('Fetching data from range:', startDate, endDate);
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetsFileId,
      range: 'Sheet1!A1:D1000', // Adjust the range to your needs
      // Here you should implement the logic to filter data based on date range
      // Assuming the date is in the first column and formatted as yyyy-mm-dd
    });

    const rows = response.data.values;
    if (rows && rows.length) {
      // Filter rows based on the date range
      const filteredRows = rows.filter(row => {
        const date = new Date(row[0]);
        return date >= new Date(startDate) && date <= new Date(endDate);
      });
      return filteredRows;
    } else {
      console.log('No data found.');
      return null;
    }
  } catch (error) {
    console.error('Error retrieving data from Google Sheets:', error);
    return null;
  }
};

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).send('Start date and end date parameters are required');
  }

  console.log('Received request for date range:', startDate, endDate);

  const data = await getFilteredData(startDate, endDate);

  if (data) {
    res.status(200).json({ data });
  } else {
    res.status(500).send('Failed to fetch data');
  }
}
