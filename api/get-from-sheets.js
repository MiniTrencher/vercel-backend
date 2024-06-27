import { GoogleApis, google } from 'googleapis';
import Cors from 'cors';

// Load environment variables from .env file
const sheetsFileId = process.env.GOOGLE_SHEETS_FILE_ID;
const base64Credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const jsonCredentials = Buffer.from(base64Credentials, 'base64').toString('utf8');

const cors = Cors({
    methods: ['GET', 'HEAD'],
    origin: "https://office.minitrencher.com"
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

// Function to get data from a specific cell
export const getCellData = async (range) => {
    const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(jsonCredentials),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      
      const sheets = google.sheets({ version: 'v4', auth });

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetsFileId,
      range,
    });

    const rows = response.data.values;
    if (rows && rows.length) {
      return rows[0][0]; // Return the first cell's data
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

    const { range } = req.query;

    if (!range) {
        return res.status(400).send('Range parameter is required');
    }

    console.log('Received request for range:', range);

    const data = await getCellData(range);

    if (data) {
        res.status(200).json({data});
    } else {
        res.status(500).send('Failed to fetch data');
    }
}
