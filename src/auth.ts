import * as fs from "fs";
import { TwitterApi } from "twitter-api-v2";

const prompt = require("prompt"); // eslint-disable-line @typescript-eslint/no-var-requires

(async () => {
    // Create client with App credentials.
    const appClient = new TwitterApi({
        appKey: process.env.APP_KEY,
        appSecret: process.env.APP_SECRET,
    });

    // Generate auth link.
    const authLink = await appClient.generateAuthLink();
    console.log(`Log in as the bot account and then open ${authLink.url} in browser.`);

    // Obtain auth PIN.
    prompt.message = "";
    const { pin } = await prompt.get({
        properties: {
            pin: {
                description: `Enter the PIN`,
                pattern: /^[\d]+$/,
                message: "PIN must only be numbers",
                required: true,
                hidden: true,
                replace: "*",
            },
        },
    });

    // Obtain persistent auth tokens.
    const authClient = new TwitterApi({
        appKey: process.env.APP_KEY,
        appSecret: process.env.APP_SECRET,
        accessToken: authLink.oauth_token,
        accessSecret: authLink.oauth_token_secret,
    });
    const { client: botClient, accessToken, accessSecret } = await authClient.login(pin);

    // Save persistent auth tokens to file.
    fs.appendFileSync("./.env", `BOT_TOKEN=${accessToken}\n`);
    fs.appendFileSync("./.env", `BOT_SECRET=${accessSecret}\n`);

    // Test tweeting on behalf of the bot.
    await botClient.v1.tweet("🤖 bot activated");
})();
