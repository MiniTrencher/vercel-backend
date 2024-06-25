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
    res.setHeader('Access-Control-Allow-Origin', 'https://office.minitrencher.com');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
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
                spreadsheetId: '1XBi4ymH603oToPmEMFf2GFIY_pKKsLbYXf2_mk_vvj4',
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