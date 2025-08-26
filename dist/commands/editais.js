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
var axios_1 = require("axios");
var cheerio = require("cheerio");
var SCRAP_CONFIG_EDITAIS = {
    URL: "https://www.metropoledigital.ufrn.br/portal/editais",
    MAIN_CLASS: ".card-body a",
    IGNORE_CLASS: "bg-encerrado",
    LINK_PREFIX: "https://www.metropoledigital.ufrn.br", // Corrigido para ter https://
    ELEMENTS: {
        PROCESS: ".box-card-badge",
        VALUE: ".card-text span:nth-child(2)",
        TITLE: ".card-title",
        REGISTRATION: ".card-text span:first-child",
        TYPE: ".card-footer .badge",
    },
};
var cachedEditais = null;
var lastEditaisUpdate = null;
var CACHE_DURATION_EDITAIS_MS = 4 * 60 * 60 * 1000; // 4 horas
function itemToText(element) {
    return element.text().trim();
}
function fetchAllEditais() {
    return __awaiter(this, void 0, void 0, function () {
        var editaisArray, data, $_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Buscando editais no Metrópole Digital...");
                    editaisArray = [];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.get(SCRAP_CONFIG_EDITAIS.URL)];
                case 2:
                    data = (_a.sent()).data;
                    $_1 = cheerio.load(data);
                    $_1(SCRAP_CONFIG_EDITAIS.MAIN_CLASS).each(function (_, element) {
                        var h5Element = $_1(element).find("h5");
                        if (h5Element.hasClass(SCRAP_CONFIG_EDITAIS.IGNORE_CLASS)) {
                            return;
                        }
                        editaisArray.push({
                            link: "".concat(SCRAP_CONFIG_EDITAIS.LINK_PREFIX).concat($_1(element).attr("href")),
                            processo: itemToText($_1(element).find(SCRAP_CONFIG_EDITAIS.ELEMENTS.PROCESS)),
                            valor: itemToText($_1(element).find(SCRAP_CONFIG_EDITAIS.ELEMENTS.VALUE)),
                            titulo: itemToText($_1(element).find(SCRAP_CONFIG_EDITAIS.ELEMENTS.TITLE)),
                            inscricao: itemToText($_1(element).find(SCRAP_CONFIG_EDITAIS.ELEMENTS.REGISTRATION)),
                            tipo: itemToText($_1(element).find(SCRAP_CONFIG_EDITAIS.ELEMENTS.TYPE)),
                        });
                    });
                    console.log("Total de ".concat(editaisArray.length, " editais encontrados no Metr\u00F3pole Digital."));
                    return [2 /*return*/, editaisArray.length > 0 ? editaisArray : null];
                case 3:
                    error_1 = _a.sent();
                    if (axios_1.default.isAxiosError(error_1) && error_1.response) {
                        console.error("Erro ao buscar editais (Metrópole):", error_1.response.status, error_1.message);
                    }
                    else {
                        if (error_1 instanceof Error) {
                            console.error("Erro ao buscar editais (Metrópole):", error_1.message);
                        }
                        else {
                            console.error("Erro ao buscar editais (Metrópole):", error_1);
                        }
                    }
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
var editaisCommand = {
    name: "editais",
    description: "Lista editais do portal Metrópole Digital.",
    aliases: ["bolsas", "metropole"],
    privateRestricted: true,
    execute: function (sock, msg, args) { return __awaiter(void 0, void 0, void 0, function () {
        var now, fetchedEditais, editaisToDisplay, responseText;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    now = Date.now();
                    if (!(cachedEditais &&
                        lastEditaisUpdate &&
                        now - lastEditaisUpdate < CACHE_DURATION_EDITAIS_MS)) return [3 /*break*/, 1];
                    console.log("Servindo editais do Metrópole Digital do cache.");
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, fetchAllEditais()];
                case 2:
                    fetchedEditais = _a.sent();
                    if (fetchedEditais) {
                        cachedEditais = fetchedEditais;
                        lastEditaisUpdate = now;
                        console.log("Cache de editais do Metrópole Digital atualizado.");
                    }
                    else if (!cachedEditais) {
                        return [2 /*return*/, "Desculpe, não foi possível buscar os editais do Metrópole Digital no momento e não há dados em cache."];
                    }
                    _a.label = 3;
                case 3:
                    if (!cachedEditais || cachedEditais.length === 0) {
                        return [2 /*return*/, "Nenhum edital encontrado no Metrópole Digital ou o cache está vazio."];
                    }
                    editaisToDisplay = cachedEditais.slice(0, 5);
                    responseText = "📢 *Editais Recentes do Metrópole Digital:*\n\n";
                    editaisToDisplay.forEach(function (edital) {
                        responseText += "*".concat(edital.titulo, "*\n");
                        responseText += "  Tipo: ".concat(edital.tipo, "\n");
                        responseText += "  Processo: ".concat(edital.processo, "\n");
                        responseText += "  Inscri\u00E7\u00E3o: ".concat(edital.inscricao, "\n");
                        responseText += "  Valor: ".concat(edital.valor, "\n");
                        responseText += "  Link: ".concat(edital.link, "\n\n");
                    });
                    if (cachedEditais.length > editaisToDisplay.length) {
                        responseText += "\nE mais ".concat(cachedEditais.length - editaisToDisplay.length, " editais. Visite o site para ver todos.");
                    }
                    return [2 /*return*/, responseText];
            }
        });
    }); },
    loggable: true,
};
exports.default = editaisCommand;
