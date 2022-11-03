"use strict";
var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                      resolve(value);
                  });
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator["throw"](value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
            }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
var __generator =
    (this && this.__generator) ||
    function (thisArg, body) {
        var _ = {
                label: 0,
                sent: function () {
                    if (t[0] & 1) throw t[1];
                    return t[1];
                },
                trys: [],
                ops: [],
            },
            f,
            y,
            t,
            g;
        return (
            (g = { next: verb(0), throw: verb(1), return: verb(2) }),
            typeof Symbol === "function" &&
                (g[Symbol.iterator] = function () {
                    return this;
                }),
            g
        );
        function verb(n) {
            return function (v) {
                return step([n, v]);
            };
        }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_)
                try {
                    if (
                        ((f = 1),
                        y &&
                            (t =
                                op[0] & 2
                                    ? y["return"]
                                    : op[0]
                                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                                    : y.next) &&
                            !(t = t.call(y, op[1])).done)
                    )
                        return t;
                    if (((y = 0), t)) op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return { value: op[1], done: false };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (
                                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                                (op[0] === 6 || op[0] === 2)
                            ) {
                                _ = 0;
                                continue;
                            }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2]) _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                } catch (e) {
                    op = [6, e];
                    y = 0;
                } finally {
                    f = t = 0;
                }
            if (op[0] & 5) throw op[1];
            return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
exports.__esModule = true;
var twitter_api_v2_1 = require("twitter-api-v2");
var playwright_1 = require("playwright");
var axios = require("axios");
// TODO: get 7d and 1m change
// TODO: add logs
(function () {
    return __awaiter(void 0, void 0, void 0, function () {
        var browser,
            page,
            buffer,
            text,
            current,
            stats,
            response,
            data,
            _i,
            data_1,
            d,
            date,
            error_1,
            now,
            week,
            week_change,
            week_change_str,
            month,
            month_change,
            month_change_str,
            client,
            mediaId,
            message;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    return [4 /*yield*/, playwright_1.chromium.launch()];
                case 1:
                    browser = _a.sent();
                    return [4 /*yield*/, browser.newPage()];
                case 2:
                    page = _a.sent();
                    return [4 /*yield*/, page.setViewportSize({ width: 900, height: 700 })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, page.goto("https://www.mevwatch.info")];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, page.waitForTimeout(2000)];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, page.screenshot()];
                case 6:
                    buffer = _a.sent();
                    return [
                        4 /*yield*/,
                        page.locator('p:has-text("OFAC compliance")').nth(0).innerText(),
                    ];
                case 7:
                    text = _a.sent();
                    current = Number(text.replace(/(\d+)\%.*/, "$1"));
                    return [4 /*yield*/, browser.close()];
                case 8:
                    _a.sent();
                    stats = {};
                    _a.label = 9;
                case 9:
                    _a.trys.push([9, 11, , 12]);
                    return [
                        4 /*yield*/,
                        axios.get("https://www.mevwatch.info/api/blockStatsAggregated"),
                    ];
                case 10:
                    response = _a.sent();
                    data = response.data.relayStats;
                    for (_i = 0, data_1 = data; _i < data_1.length; _i++) {
                        d = data_1[_i];
                        date = new Date(d.date).toDateString();
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
                    return [3 /*break*/, 12];
                case 11:
                    error_1 = _a.sent();
                    console.error(error_1);
                    return [3 /*break*/, 12];
                case 12:
                    now = new Date();
                    week = new Date(now.getTime() - 7 * 86400 * 1000).toDateString();
                    week_change = Math.round(
                        current - (stats[week].ofac / stats[week].total) * 100
                    );
                    week_change_str =
                        week_change >= 0
                            ? "+".concat(week_change, "% \uD83D\uDE29")
                            : "".concat(week_change, "% \uD83D\uDE04");
                    month = new Date(now.getTime() - 30 * 86400 * 1000).toDateString();
                    month_change = Math.round(
                        current - (stats[month].ofac / stats[month].total) * 100
                    );
                    month_change_str =
                        month_change >= 0
                            ? "+".concat(month_change, "% \uD83D\uDE29")
                            : "".concat(month_change, "% \uD83D\uDE04");
                    client = new twitter_api_v2_1.TwitterApi({
                        appKey: process.env.APP_KEY,
                        appSecret: process.env.APP_SECRET,
                        accessToken: process.env.BOT_TOKEN,
                        accessSecret: process.env.BOT_SECRET,
                    });
                    return [
                        4 /*yield*/,
                        client.v1.uploadMedia(buffer, {
                            mimeType: twitter_api_v2_1.EUploadMimeType.Png,
                            target: "tweet",
                        }),
                    ];
                case 13:
                    mediaId = _a.sent();
                    message = "\uD83E\uDEE5 Ethereum OFAC-Compliant Block Rate\n\nCurrent: "
                        .concat(current, "%\n\n7d change: ")
                        .concat(week_change_str, "\n30d change: ")
                        .concat(month_change_str, "\n\nSee more stats on www.mevwatch.info");
                    return [
                        4 /*yield*/,
                        client.v1.tweet(message, {
                            media_ids: mediaId,
                        }),
                    ];
                case 14:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
})();
