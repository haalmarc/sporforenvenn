require("dotenv").config();
const { App, ExpressReceiver } = require("@slack/bolt");
const { getQuestionAndMarkAsPublished, submitQuestion } = require("./utils");
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
  console.info(`Bolt-app kjører på port ${PORT}`);
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
    const question = await getQuestionAndMarkAsPublished();
    const result = await app.client.chat.postMessage({
      channel: testingChannelId,
      text: question,
    });

    res.send({ message: result.message.text });
  } catch (error) {
    console.error(error);
    res.send({ error });
  }
});

// Lytt til slash-kommando
app.command("/sendinn", async ({ ack, body, client }) => {
  await ack();

  try {
    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: "modal",
        // Id som brukes til å kunne lytte til resultat av modal
        callback_id: "send_inn_modal",
        title: {
          type: "plain_text",
          text: "Send inn spørsmål",
        },
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Send inn spørsmålet ditt anonymt, så poster vi det ved neste anledning",
            },
          },
          {
            type: "input",
            block_id: "question",
            label: {
              type: "plain_text",
              text: "Ditt spørsmål",
            },
            element: {
              type: "plain_text_input",
              action_id: "question_input",
              multiline: true,
            },
          },
        ],
        submit: {
          type: "plain_text",
          text: "Send inn",
        },
        close: {
          type: "plain_text",
          text: "Lukk",
        },
      },
    });
  } catch (error) {
    console.error(error);
  }
});

// Lytt til resultat fra modalen ved bruk av viewets `callback_id`
app.view("send_inn_modal", async ({ ack, body, view, client }) => {
  await ack();

  // Blokk med block_id `input_question` og inputfelt med action_id `question_input`
  const val = view["state"]["values"]["question"]["question_input"].value;
  const user = body["user"]["id"];

  const results = await submitQuestion(val);

  let msg = "";
  if (results) {
    msg = "Takk for innsendt spørsmål!";
  } else {
    msg = "Det skjedde en feil ved innsending av spørsmål.";
  }

  // Send melding til bruker
  try {
    await client.chat.postMessage({
      channel: user,
      text: msg,
    });
  } catch (error) {
    console.error(error);
  }
});
