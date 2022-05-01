# Spør for en venn

Applikasjon som bruker slackbot til å trigge funksjon som henter ut verdi fra google spreadsheet.

# Oppsett

## Sett miljøvariabler

Lag `.env`-fil. 
Lag google-servicekonto. Lag nøkler for kontoen og putt relevante nøkler i `.env`-fil. Se https://console.cloud.google.com/iam-admin/serviceaccounts . 
Enable `Google sheet API` for servicekonto https://console.cloud.google.com/apis/api/sheets.googleapis.com/ .


## Start prosjekt

```
npm install
npm start
```