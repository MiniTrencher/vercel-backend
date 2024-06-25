const { google } = require('googleapis');

const base64Credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const jsonCredentials = Buffer.from(base64Credentials, 'base64').toString('utf8');

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(jsonCredentials),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://office.minitrencher.com'); // Update with your frontend's URL
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { contactDate, contactSource, contactType, dealerType, contactHowType, contactDetail } = req.body;
      
      // Extact IP Address from the request headers
      const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

      // Log the received data
      console.log('Received data:', {
        contactDate,
        contactSource,
        contactType,
        dealerType,
        contactHowType,
        contactDetail,
        ipAddress
      });

      const values = [
        [contactDate, contactSource, contactType, dealerType, contactHowType, contactDetail, ipAddresss]
      ];

      const resource = {
        values,
      };

      const result = await sheets.spreadsheets.values.append({
        spreadsheetId: '1XBi4ymH603oToPmEMFf2GFIY_pKKsLbYXf2_mk_vvj4', // Replace with your Google Sheets ID
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
