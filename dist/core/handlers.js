"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMessages = handleMessages;
var fs = require("fs");
var path = require("path");
var api_1 = require("./api");
var commands = new Map();
var commandPrefix = "!";
function loadCommands() {
    return __awaiter(this, void 0, void 0, function () {
        var commandsPath, commandFiles, _loop_1, _i, commandFiles_1, file;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    commandsPath = path.join(__dirname, "..", "commands");
                    commandFiles = fs
                        .readdirSync(commandsPath)
                        .filter(function (file) { return file.endsWith(".ts") || file.endsWith(".js"); });
                    _loop_1 = function (file) {
                        var filePath, commandModule, command_1, error_1;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 2, , 3]);
                                    filePath = path.join(commandsPath, file);
                                    return [4 /*yield*/, Promise.resolve("".concat(filePath)).then(function (s) { return require(s); })];
                                case 1:
                                    commandModule = _b.sent();
                                    command_1 = commandModule.default;
                                    if (command_1 && command_1.name && typeof command_1.execute === "function") {
                                        commands.set(command_1.name, command_1);
                                        if (command_1.aliases) {
                                            command_1.aliases.forEach(function (alias) {
                                                return commands.set(alias, command_1);
                                            });
                                        }
                                        console.log("Comando carregado: ".concat(command_1.name));
                                    }
                                    else {
                                        console.warn("Arquivo de comando inv\u00E1lido: ".concat(file));
                                    }
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_1 = _b.sent();
                                    console.error("Erro ao carregar comando ".concat(file, ":"), error_1);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, commandFiles_1 = commandFiles;
                    _a.label = 1;
                case 1:
                    if (!(_i < commandFiles_1.length)) return [3 /*break*/, 4];
                    file = commandFiles_1[_i];
                    return [5 /*yield**/, _loop_1(file)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function handleMessages(sock) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadCommands()];
                case 1:
                    _a.sent();
                    sock.ev.on("messages.upsert", function (m) { return __awaiter(_this, void 0, void 0, function () {
                        var msg, messageContent, args, commandName, command, defaultReplyToJid, finalReplyToJid, isGroupMessage, responseContent, messageToSend, error_2;
                        var _a, _b, _c, _d;
                        return __generator(this, function (_e) {
                            switch (_e.label) {
                                case 0:
                                    msg = m.messages[0];
                                    if (!msg.message || msg.key.fromMe)
                                        return [2 /*return*/];
                                    if (msg.message.ephemeralMessage) {
                                        msg.message = msg.message.ephemeralMessage.message;
                                    }
                                    if (!msg.message.conversation &&
                                        !((_a = msg.message.extendedTextMessage) === null || _a === void 0 ? void 0 : _a.text) &&
                                        !msg.message.imageMessage &&
                                        !msg.message.videoMessage &&
                                        !msg.message.documentMessage) {
                                        console.warn("Mensagem ignorada: tipo não suportado ou vazio.", msg);
                                        return [2 /*return*/];
                                    }
                                    messageContent = msg.message.conversation || ((_b = msg.message.extendedTextMessage) === null || _b === void 0 ? void 0 : _b.text);
                                    if (!messageContent || !messageContent.startsWith(commandPrefix))
                                        return [2 /*return*/];
                                    args = messageContent.slice(commandPrefix.length).trim().split(/ +/);
                                    commandName = (_c = args.shift()) === null || _c === void 0 ? void 0 : _c.toLowerCase();
                                    if (!commandName)
                                        return [2 /*return*/];
                                    command = commands.get(commandName);
                                    if (!!command) return [3 /*break*/, 4];
                                    defaultReplyToJid = msg.key.participant || msg.key.remoteJid;
                                    if (!defaultReplyToJid) return [3 /*break*/, 2];
                                    return [4 /*yield*/, sock.sendMessage(defaultReplyToJid, { text: "Comando não encontrado." }, { quoted: msg })];
                                case 1:
                                    _e.sent();
                                    return [3 /*break*/, 3];
                                case 2:
                                    console.error("Comando não encontrado e não foi possível determinar JID para resposta.", msg.key);
                                    _e.label = 3;
                                case 3: return [2 /*return*/];
                                case 4:
                                    isGroupMessage = !!msg.key.participant && ((_d = msg.key.remoteJid) === null || _d === void 0 ? void 0 : _d.endsWith("@g.us"));
                                    if (command.loggable) {
                                        (0, api_1.registerLog)({
                                            command: commandName,
                                            userId: msg.key.participant || msg.key.remoteJid,
                                            groupId: isGroupMessage ? msg.key.remoteJid : null,
                                        });
                                    }
                                    if (isGroupMessage) {
                                        if (command.privateRestricted === false) {
                                            finalReplyToJid = msg.key.remoteJid;
                                        }
                                        else {
                                            finalReplyToJid = msg.key.participant;
                                        }
                                    }
                                    else {
                                        finalReplyToJid = msg.key.remoteJid;
                                    }
                                    if (!finalReplyToJid) {
                                        console.error("Não foi possível determinar o JID para resposta para o comando.", msg.key);
                                        return [2 /*return*/];
                                    }
                                    _e.label = 5;
                                case 5:
                                    _e.trys.push([5, 9, , 11]);
                                    return [4 /*yield*/, command.execute(sock, msg, args, commands)];
                                case 6:
                                    responseContent = _e.sent();
                                    if (!responseContent) return [3 /*break*/, 8];
                                    messageToSend = void 0;
                                    if (typeof responseContent === "string") {
                                        messageToSend = { text: responseContent };
                                    }
                                    else {
                                        messageToSend = responseContent;
                                    }
                                    return [4 /*yield*/, sock.sendMessage(finalReplyToJid, messageToSend, { quoted: msg })];
                                case 7:
                                    _e.sent();
                                    _e.label = 8;
                                case 8: return [3 /*break*/, 11];
                                case 9:
                                    error_2 = _e.sent();
                                    console.error("Erro ao executar comando ".concat(commandName, ":"), error_2);
                                    return [4 /*yield*/, sock.sendMessage(finalReplyToJid, { text: "Ocorreu um erro ao tentar executar esse comando." }, { quoted: msg })];
                                case 10:
                                    _e.sent();
                                    return [3 /*break*/, 11];
                                case 11: return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
            }
        });
    });
}
