import { GoogleApis, google } from 'googleapis';

// Load environment variables from .env file
const sheetsFileId = process.env.GOOGLE_SHEETS_FILE_ID;
const base64Credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const jsonCredentials = Buffer.from(base64Credentials, 'base64').toString('utf8');

// Function to get data from a specific cell
export const getCellData = async (range) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://office.minitrencher.com'); // Update with your frontend's URL
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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
    const { range } = req.query;

    if (!range) {
        return res.status(400).send('Range parameter is required');
    }

    const data = await getCellData(range);
    console.log(data);

    if (data) {
        res.status(200).json({data});
    } else {
        res.status(500).send('Failed to fetch data');
    }
}
