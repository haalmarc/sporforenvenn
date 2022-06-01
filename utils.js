const { google } = require("googleapis");
const sheetName = "Skjemasvar 1";

/*
  Henter ut ikke-publisert spørsmål fra Excel spreadsheet
  og markerer tilhørende rad med spørsmålet som publisert
*/
async function getQuestionAndMarkAsPublished() {
  /* Setup */
  const auth = await google.auth.getClient({
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  /* Hent alle rader */
  // Kolonner: A: Tidsstempel | B: Spørsmål | C: Er publisert
  const allRowsExcludingTitle = `${sheetName}!A2:C`;

  const request = {
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: allRowsExcludingTitle,
  };

  const allRows = (await sheets.spreadsheets.values.get(request)).data.values;

  /* Hent ikke-publisert spørsmål */
  const rowToPublishIndex = allRows.findIndex((x) => x[2] !== "ja");
  const updatedRow = [...allRows[rowToPublishIndex], "ja"];
  const [timestamp, question, isPublished] = updatedRow;

  /* Oppdater ikke-publisert spørsmål */
  const skipTitleAndOneIndex = 2;
  const rowToPublishSheetIndex = skipTitleAndOneIndex + rowToPublishIndex;
  const updateRange = `${sheetName}!A${rowToPublishSheetIndex}:C${rowToPublishSheetIndex}`;
  const updateRequest = {
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: updateRange,
    valueInputOption: "USER_ENTERED",
    resource: {
      // Kan sende inn en liste av rader
      values: [
        // Hver rad har en liste av kolonner
        updatedRow,
      ],
    },
  };

  await sheets.spreadsheets.values.update(updateRequest);

  return question;
}

/*
  Lagre ny rad i spreadsheet
*/
async function submitQuestion(question) {
  const auth = await google.auth.getClient({
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  // Kolonner: A: Tidsstempel | B: Spørsmål | C: Er publisert
  const newRow = [new Date(), question];

  const appendRequest = {
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: `${sheetName}!A:B`,
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [newRow],
    },
  };

  await sheets.spreadsheets.values.append(appendRequest);

  return question;
}

module.exports.getQuestionAndMarkAsPublished = getQuestionAndMarkAsPublished;
module.exports.submitQuestion = submitQuestion;
