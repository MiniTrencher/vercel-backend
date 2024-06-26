const { google } = require('googleapis');

const sheetsFileId = process.env.GOOGLE_SHEETS_FILE_ID;
const base64Credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const jsonCredentials = Buffer.from(base64Credentials, 'base64').toString('utf8');

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(jsonCredentials),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Update with your frontend's URL
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { contactDate, contactSource, contactType, dealerType, contactHowType, contactDetail, userId } = req.body;

      // Log the received data
      console.log('Received data:', {
        contactDate,
        contactSource,
        contactType,
        dealerType,
        contactHowType,
        contactDetail,
        userId
      });

      const values = [
        [contactDate, contactSource, contactType, dealerType, contactHowType, contactDetail, userId]
      ];

      const resource = {
        values,
      };

      const result = await sheets.spreadsheets.values.append({
        spreadsheetId: sheetsFileId, // Replace with your Google Sheets ID
        range: 'Sheet1!A2', // Adjust the range if necessary
        valueInputOption: 'RAW',
        resource,
      });

      // Log the result
      console.log('Append result:', result.data);

      res.status(200).json(result.data);
    } catch (error) {
      // Log the error
      console.error('Error appending to Google Sheets:', error);

      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
};
