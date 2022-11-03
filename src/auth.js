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
var fs = require("fs");
var prompt = require("prompt");
(function () {
    return __awaiter(void 0, void 0, void 0, function () {
        var appClient, authLink, pin, authClient, _a, botClient, accessToken, accessSecret;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    appClient = new twitter_api_v2_1.TwitterApi({
                        appKey: process.env.APP_KEY,
                        appSecret: process.env.APP_SECRET,
                    });
                    return [4 /*yield*/, appClient.generateAuthLink()];
                case 1:
                    authLink = _b.sent();
                    console.log(
                        "Log in as the bot account and then open ".concat(
                            authLink.url,
                            " in browser."
                        )
                    );
                    // Obtain auth PIN.
                    prompt.message = "";
                    return [
                        4 /*yield*/,
                        prompt.get({
                            properties: {
                                pin: {
                                    description: "Enter the PIN",
                                    pattern: /^[\d]+$/,
                                    message: "PIN must only be numbers",
                                    required: true,
                                    hidden: true,
                                    replace: "*",
                                },
                            },
                        }),
                    ];
                case 2:
                    pin = _b.sent().pin;
                    authClient = new twitter_api_v2_1.TwitterApi({
                        appKey: process.env.APP_KEY,
                        appSecret: process.env.APP_SECRET,
                        accessToken: authLink.oauth_token,
                        accessSecret: authLink.oauth_token_secret,
                    });
                    return [4 /*yield*/, authClient.login(pin)];
                case 3:
                    (_a = _b.sent()),
                        (botClient = _a.client),
                        (accessToken = _a.accessToken),
                        (accessSecret = _a.accessSecret);
                    // Save persistent auth tokens to file.
                    fs.appendFileSync("./.env", "BOT_TOKEN=".concat(accessToken, "\n"));
                    fs.appendFileSync("./.env", "BOT_SECRET=".concat(accessSecret, "\n"));
                    // Test tweeting on behalf of the bot.
                    return [4 /*yield*/, botClient.v1.tweet("🤖 bot activated")];
                case 4:
                    // Test tweeting on behalf of the bot.
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
})();
