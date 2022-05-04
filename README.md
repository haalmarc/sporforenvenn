# Spør for en venn

Applikasjon som poster spørsmål på Slack.

# Oppsett

## Sett miljøvariabler

Lag `.env`-fil.

```
SHEET_ID=<spreadsheetId>
GOOGLE_APPLICATION_CREDENTIALS=./secrets.json
SLACK_BOT_TOKEN=<xoxb-> // Hent fra Slack App under fanen "OAuth & Permissions".
SLACK_SIGNING_SECRET= <signing-secret> // Hent fra Slack App under fanen "Basic information" med undertittel "App Credentials".
PUBLISH_SECRET=<din-hemmelige-query-parameter> // For å unngå spam-posting
```

`spreadsheetId` (ikke sheetId) hentes fra Google-spreadsheet-dokumentet du oppretter, e.g. `https://docs.google.com/spreadsheets/d/<spreadsheetId>/edit#gid=<sheetId>`. Husk også å endre tilgang så alle som har lenken kan redigere dokumentet.

`GOOGLE_APPLICATION_CREDENTIALS`-verdien hentes fra Google Servicekonto. Lag google-servicekonto, se https://console.cloud.google.com/iam-admin/serviceaccounts. Lag nøkler for kontoen, last ned json-filen som `secrets.json` og putt filen i mappestrukturen. Husk også å legge til filen i `.gitignore`.

Før servicekontoen kan samhandle med google sheet, må API-et aktiveres. Enable `Google sheet API` for servicekonto https://console.cloud.google.com/apis/api/sheets.googleapis.com/ .

## Start prosjekt

```
npm install
npm start
```
