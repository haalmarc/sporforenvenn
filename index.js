require('dotenv').config()
const express = require('express')
const app = express()
const port = 3000
const { google }  = require('googleapis');


app.get('/', async (req, res) => {
    /* Setup */
    const auth = await google.auth.getClient({ scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
    const sheets = google.sheets({ version: 'v4', auth });

    /* Hent alle rader */
    // Kolonner: A: Tidsstempel | B: Spørsmål | C: Er publisert
    const allRowsExcludingTitle = "Skjemasvar 1!A2:C"

    const request = {
        spreadsheetId: process.env.SHEET_ID,
        range: allRowsExcludingTitle,
    }

    const allRows = (await sheets.spreadsheets.values.get(request)).data.values;

    /* Hent ikke-publisert spørsmål */
    const rowToPublishIndex = allRows.findIndex(x => x[2] !== "ja");
    const updatedRow = [...allRows[rowToPublishIndex], "ja"]

    /* Oppdater ikke-publisert spørsmål */
    const skipTitleAndOneIndex = 2;
    const rowToPublishSheetIndex = skipTitleAndOneIndex + rowToPublishIndex;
    const updateRange = `Skjemasvar 1!A${rowToPublishSheetIndex}:C${rowToPublishSheetIndex}`
    const updateRequest = {
        spreadsheetId: process.env.SHEET_ID,
        range: updateRange,
        valueInputOption: "USER_ENTERED",
        resource: {
            // Kan sende inn en liste av rader
            values: [
                // Hver rad har en liste av kolonner
                [
                    ...updatedRow,
                ]
            ]
        }
    }

    await sheets.spreadsheets.values.update(updateRequest);

    res.send({question: updatedRow[1]})
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})