const {google} = require('googleapis');
const path = require('path');
const fs = require('fs');

const base64Credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const jsonCredentials = Buffer.from(base64Credentials, 'base64').toString('utf8');

const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(jsonCredentials),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const { contactSource, contactType, dealerType, contactHowType, contactDetail } = req.body;

        const values = [
            [contactSource, contactType, dealerType, contactHowType, contactDetail]
        ];

        const resource = {
            values,
        };

        try {
            const result = await sheets.spreadsheets.values.append({
                spreadsheetId: 'your-spreadsheet-id',
                range: 'Sheet1!A2',
                valueInputOption: 'RAW',
                resource,
            });
            res.status(200).send(result.data);
        } catch (error) {
            res.status(500).send(error);
        }
    } else {
        res.status(405).end();
        }
};