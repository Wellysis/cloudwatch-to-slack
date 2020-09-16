const http = require("https");

const host = "hooks.slack.com";
const hookUrl = "HOOK_URL";

const postToSlack = (data) => {
  return new Promise((resolve, reject) => {
    const options = {
      host,
      path: hookUrl,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    };
    const req = http.request(options, (res) => {
      res.on("end", () => {
        res.statusCode === 200 ? resolve() : reject();
      });
    });
    req.write(data);
    req.end();
  });
};

exports.handler = async (event, context, callback) => {
  // get the message passed to the subscription from the SNS topic
  const message = JSON.parse(event.Records[0].Sns.Message);
  const slackMsg = JSON.stringify({
    text: `Update on ${message.Trigger.Dimensions[0].value}`,
    attachments: [
      {
        text: message.NewStateReason,
        fields: [
          {
            title: "Lambda Function",
            value: message.Trigger.Dimensions[0].value,
            short: true,
          },
          {
            title: "Time",
            value: message.StateChangeTime,
            short: true,
          },
          {
            title: "Alarm",
            value: message.AlarmName,
            short: true,
          },
          {
            title: "Region",
            value: message.Region,
            short: true,
          },
        ],
      },
    ],
  });

  try {
    await postToSlack(slackMsg);
    callback();
  } catch (error) {
    callback(error);
  }
};
