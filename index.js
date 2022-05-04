require("dotenv").config();
const { App, ExpressReceiver } = require("@slack/bolt");
const { publishQuestion } = require("./utils");
const PORT = process.env.PORT || 3000;

// Receiver gir adgang til den underliggende express-appen i bolt
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});
const { router } = receiver;

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver,
});

(async () => {
  await app.start(PORT);
  console.log(`Bolt-app kjører på port ${PORT}`);
})();

// Brukes for å verifisere URL i Slackapps for første gang
router.post("/slack/events", (req, res) => {
  if (req?.body?.challenge) res.send({ challenge });
});

// Poster ikke-publisert spørsmål i slack-kanal
router.get("/publish", async (req, res) => {
  if (process.env.PUBLISH_SECRET !== req?.query?.secret) {
    res.send({ error: "Feil kode" });
  }
  // Hent channelId ved å gå i kanal via browser, e.g. <slacknavn>.slack.com/<teamId>/<channelId>
  const testingChannelId = "C03AHS06XAR";
  try {
    const question = await publishQuestion();
    const result = await app.client.chat.postMessage({
      channel: testingChannelId,
      text: question,
    });

    console.log(result);
    res.send({ message: result.message.text });
  } catch (error) {
    console.error(error);
    res.send({ error });
  }
});
