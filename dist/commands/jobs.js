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
var SCRAP_CONFIG = {
    URL: "https://jerimumjobs.imd.ufrn.br/jerimumjobs/oportunidade/listarJSON",
    PAGE: 1,
};
var cachedJobs = null;
var lastJobsUpdate = null;
var CACHE_DURATION_MS = 4 * 60 * 60 * 1000;
function scrapeJobsRecursive(jobsList_1) {
    return __awaiter(this, arguments, void 0, function (jobsList, page) {
        var data, error_1;
        if (page === void 0) { page = 1; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get("".concat(SCRAP_CONFIG.URL, "/").concat(page))];
                case 1:
                    data = (_a.sent()).data;
                    if (data.length === 0) {
                        return [2 /*return*/, jobsList];
                    }
                    data.forEach(function (_a) {
                        var titulo = _a.titulo, empresa = _a.empresa, areaAtuacao = _a.areaAtuacao, regime = _a.regime, salario = _a.salario, dataValidade = _a.dataValidade, id = _a.id;
                        jobsList.push({
                            title: titulo,
                            company: empresa.nome,
                            area: areaAtuacao.map(function (area) { return area.descricao; }),
                            regime: regime.descricao,
                            salary: salario,
                            deadline: new Date(dataValidade).toLocaleDateString("pt-BR"), // Formatar data
                            link: "https://jerimumjobs.imd.ufrn.br/jerimumjobs/oportunidade/".concat(id),
                        });
                    });
                    return [2 /*return*/, scrapeJobsRecursive(jobsList, page + 1)];
                case 2:
                    error_1 = _a.sent();
                    console.error("Erro ao buscar vagas no Jerimum Jobs na p\u00E1gina ".concat(page, ": "), error_1 instanceof Error ? error_1.message : error_1);
                    return [2 /*return*/, jobsList];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function fetchAllJobs() {
    return __awaiter(this, void 0, void 0, function () {
        var jobs, allJobs, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Buscando vagas no Jerimum Jobs...");
                    jobs = [];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, scrapeJobsRecursive(jobs, SCRAP_CONFIG.PAGE)];
                case 2:
                    allJobs = _a.sent();
                    console.log("Total de ".concat(allJobs.length, " vagas encontradas no Jerimum Jobs."));
                    return [2 /*return*/, allJobs.length > 0 ? allJobs : null];
                case 3:
                    error_2 = _a.sent();
                    console.error("Erro geral ao buscar vagas no Jerimum Jobs:", error_2 instanceof Error ? error_2.message : String(error_2));
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
var jerimumCommand = {
    name: "jobs",
    description: "Lista vagas de emprego do Jerimum Jobs.",
    aliases: ["jerimum", "vagas", "jerimumjobs"],
    privateRestricted: true,
    execute: function (sock, msg, args) { return __awaiter(void 0, void 0, void 0, function () {
        var now, fetchedJobs, jobsToDisplay, responseText;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    now = Date.now();
                    if (!(cachedJobs &&
                        lastJobsUpdate &&
                        now - lastJobsUpdate < CACHE_DURATION_MS)) return [3 /*break*/, 1];
                    console.log("Servindo vagas do Jerimum Jobs do cache.");
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, fetchAllJobs()];
                case 2:
                    fetchedJobs = _a.sent();
                    if (fetchedJobs) {
                        cachedJobs = fetchedJobs;
                        lastJobsUpdate = now;
                        console.log("Cache de vagas do Jerimum Jobs atualizado.");
                    }
                    else if (!cachedJobs) {
                        return [2 /*return*/, "Desculpe, não foi possível buscar as vagas do Jerimum Jobs no momento e não há dados em cache."];
                    }
                    _a.label = 3;
                case 3:
                    if (!cachedJobs || cachedJobs.length === 0) {
                        return [2 /*return*/, "Nenhuma vaga encontrada no Jerimum Jobs ou o cache está vazio."];
                    }
                    jobsToDisplay = cachedJobs.slice(0, 10);
                    responseText = "💼 *Vagas Recentes no Jerimum Jobs:*\n\n";
                    jobsToDisplay.forEach(function (job) {
                        responseText += "*".concat(job.title, "* (").concat(job.company, ")\n");
                        responseText += "  \u00C1rea: ".concat(job.area.join(", ") || "Não especificada", "\n");
                        responseText += "  Regime: ".concat(job.regime, "\n");
                        responseText += "  Sal\u00E1rio: ".concat(job.salary || "Não informado", "\n");
                        responseText += "  Validade: ".concat(job.deadline, "\n");
                        responseText += "  Link: ".concat(job.link, "\n\n");
                    });
                    if (cachedJobs.length > jobsToDisplay.length) {
                        responseText += "\nE mais ".concat(cachedJobs.length - jobsToDisplay.length, " vagas. Visite o site para ver todas.");
                    }
                    return [2 /*return*/, responseText];
            }
        });
    }); },
    loggable: true,
};
exports.default = jerimumCommand;
