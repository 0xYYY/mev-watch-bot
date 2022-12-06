import { Context, EventFunction } from "@google-cloud/functions-framework/build/src/functions";
import { PubsubMessage } from "@google-cloud/pubsub/build/src/publisher";
import { TwitterApi, EUploadMimeType } from "twitter-api-v2";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { chromium: playwright } = require("playwright-core");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const chromium = require("@sparticuz/chromium");

const axios = require("axios"); // eslint-disable-line @typescript-eslint/no-var-requires

const MEVWATCH_URL = "https://www.mevwatch.info";

// Log util.
function log(severity: string, message: string) {
    const entry = Object.assign({
        severity: severity.toUpperCase(),
        message: message,
    });
    console.log(JSON.stringify(entry));
}

interface Snapshot {
    screenshot: Buffer;
    currentRate: number;
}

// Obtain website screenshot and current rate.
async function getSnapshot(): Promise<Snapshot> {
    // Construct headless browser.
    const browser = await playwright.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
    });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Obtain screenshot.
    await page.setViewportSize({ width: 900, height: 600 });
    await page.goto(MEVWATCH_URL);
    // Scroll to the "Trend" section.
    await page.mouse.wheel(0, 1850);
    // NOTE: Wait for canvas animation to complete. Should have more reliable way, e.g. other
    // `waitForXXX` methods.
    await page.waitForTimeout(3000);
    const screenshot = await page.screenshot();

    // Obtain current rate.
    const text = await page.locator('p:has-text("OFAC compliance")').nth(0).innerText();
    const currentRate = Number(text.replace(/(\d+)%.*/, "$1"));
    await browser.close();

    return { screenshot: screenshot, currentRate: currentRate };
}

// Get historical rates.
async function getHistoricalRates(): Promise<Record<string, number>> {
    const stats: Record<number, { total: number; ofac: number }> = {};
    const response = await axios.get(`${MEVWATCH_URL}/api/blockStatsAggregated`);
    const data = response.data.relayStats;

    // Aggregate data based on record date.
    for (const d of data) {
        const date = new Date(d.date).toDateString();
        if (date in stats) {
            stats[date].total += d.totalBlocks;
            stats[date].ofac += d.censoringBlocks;
        } else {
            stats[date] = {
                total: d.totalBlocks,
                ofac: d.censoringBlocks,
            };
        }
    }

    // Calculate rate for each day.
    const rates: Record<string, number> = {};
    for (const k in stats) {
        rates[k] = Math.round((stats[k].ofac / stats[k].total) * 100);
    }

    return rates;
}

// Calculate rate change.
function calChange(
    currentRate: number,
    historicalRates: Record<string, number>,
    days: number
): string {
    const now = new Date();
    const past = new Date(now.getTime() - days * 86400 * 1000).toDateString();
    if (!(past in historicalRates)) {
        log("warn", `Historical stats for ${past} not available.`);
        return "N/A";
    }
    const change = Math.round(currentRate - historicalRates[past]);
    const changeStr = change >= 0 ? `+${change}% 😩` : `${change}% 😄`;

    return changeStr;
}

// Upload screenshot and post tweet.
async function postTweet(text: string, screenshot: Buffer) {
    const client = new TwitterApi({
        appKey: process.env.APP_KEY,
        appSecret: process.env.APP_SECRET,
        accessToken: process.env.BOT_TOKEN,
        accessSecret: process.env.BOT_SECRET,
    });

    const mediaId = await client.v1.uploadMedia(screenshot, {
        mimeType: EUploadMimeType.Png,
        target: "tweet",
    });

    await client.v1.tweet(text, {
        media_ids: mediaId,
    });
}

export const handlePubSub: EventFunction = async (message: PubsubMessage, _context: Context) => {
    // Only trigger when message contains certain attribute.
    const data = message.attributes || {};
    if (!("mevwatch" in data)) {
        return;
    }

    // Get screenshot and current rate.
    let snapshot: Snapshot;
    try {
        snapshot = await getSnapshot();
    } catch (e) {
        log("error", `Failed to get snapshot from mevwatch.info: ${e}`);
        return;
    }
    const { screenshot, currentRate } = snapshot;
    log("info", `Successfully get snapshot from ${MEVWATCH_URL}.`);

    // Calculate rate change in past 7d/30d.
    let historicalRates: Record<string, number>;
    try {
        historicalRates = await getHistoricalRates();
    } catch (e) {
        log("error", `Failed to get historical rates from mevwatch.info: ${e}`);
        return;
    }
    const weekChange = calChange(currentRate, historicalRates, 7);
    const monthChange = calChange(currentRate, historicalRates, 30);
    log(
        "info",
        `Current rate: ${currentRate}, 7d change: ${weekChange}, 30d change: ${monthChange}.`
    );

    // Tweet out.
    const text = `🫥 Ethereum OFAC-Compliant Block Rate

Current: ${currentRate}%\n

7d change: ${weekChange}
30d change: ${monthChange}

See more stats on ${MEVWATCH_URL}`;
    try {
        await postTweet(text, screenshot);
    } catch (e) {
        log("error", `Failed to tweet: ${e}`);
        return;
    }
    log("info", "Successfully sent out tweet.");
};
