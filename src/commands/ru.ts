import { WAMessage, WASocket, AnyMessageContent } from "baileys";
import { BaseCommand } from "../types/command";
import puppeteer from "puppeteer-core";

const RU_URL = "https://cardapiosemanalruufrn.my.canva.site/card-pio-semanal-ru-ufrn/";
const CACHE_DURATION_MS = 6 * 60 * 60 * 1000;

const DAY_ABBR: Record<number, string> = {
  0: "DOM",
  1: "SEG",
  2: "TER",
  3: "QUA",
  4: "QUI",
  5: "SEX",
  6: "SAB",
};

const DAY_FULL: Record<string, string> = {
  SEG: "Segunda-feira",
  TER: "Terca-feira",
  QUA: "Quarta-feira",
  QUI: "Quinta-feira",
  SEX: "Sexta-feira",
  SAB: "Sabado",
  DOM: "Domingo",
};

const PAGE_MAP: Record<string, { almoco: string; jantar: string }> = {
  SEG: { almoco: "a-seg-c", jantar: "j-seg-c" },
  TER: { almoco: "a-ter-c", jantar: "j-ter-c" },
  QUA: { almoco: "a-qua-c", jantar: "j-qua-c" },
  QUI: { almoco: "a-qui-c", jantar: "j-qui-c" },
  SEX: { almoco: "a-sex-c", jantar: "j-sex-c" },
  SAB: { almoco: "a-sab-c", jantar: "j-sab-c" },
  DOM: { almoco: "a-dom-c", jantar: "j-dom-c" },
};

const MEAL_TIMES = {
  almoco: "10:30 - 13:30",
  jantar: "17:00 - 19:00",
};

const SECTION_MAP: Record<string, keyof MealItems> = {
  "Prato Convencional": "convencional",
  "Prato Vegetariano": "vegetariano",
  "Acompanhamentos": "acompanhamentos",
  "Bebidas": "bebidas",
  "Sobremesas": "sobremesas",
};

const NOISE = new Set([
  "Voltar", "Almoço", "Jantar", "Obs:", "Fechado", "FECHADO",
  "Escolha o dia", "Central", "Biomedica", "Tecnologica",
  "Gluten", "Leite", "Ovo", "Acucar", "Suino",
  "Glúten", "Açúcar", "Suíno", "Biomédica",
]);

interface MealItems {
  convencional: string[];
  vegetariano: string[];
  acompanhamentos: string[];
  bebidas: string[];
  sobremesas: string[];
}

interface DayMenu {
  almoco: MealItems | null;
  jantar: MealItems | null;
}

type WeekCache = Partial<Record<string, { menu: DayMenu; timestamp: number }>>;

const cache: WeekCache = {};

interface RichElement {
  text: string;
  y: number;
  bold: boolean;
}

function isNoise(text: string): boolean {
  if (NOISE.has(text)) return true;
  if (/^[aj]\s+(seg|ter|qua|qui|sex|sab|dom)\s+[cbt]$/i.test(text)) return true;
  if (/^[\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Component}\s]+$/u.test(text)) return true;
  if (/terms|privacy|canva|close|report|acceptable use/i.test(text)) return true;
  if (/restaurante universitário/i.test(text)) return true;
  if (/cardápio semanal|cardápio sujeito/i.test(text)) return true;
  if (/semana de/i.test(text)) return true;
  if (/if you see anything|personal data|privacy practices/i.test(text)) return true;
  if (/designed with/i.test(text)) return true;
  return false;
}

async function extractPageContent(page: any): Promise<RichElement[]> {
  return page.evaluate(() => {
    return Array.from(document.querySelectorAll("span"))
      .filter((el) => {
        if (el.children.length > 0) return false;
        const text = el.textContent?.trim() ?? "";
        if (text.length < 2) return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.top > 80 && rect.top < 1450;
      })
      .map((el) => {
        const rect = el.getBoundingClientRect();
        const weight = parseInt((window.getComputedStyle(el) as any).fontWeight) || 400;
        return {
          text: el.textContent?.trim() ?? "",
          y: Math.round(rect.top),
          bold: weight >= 700,
        };
      })
      .sort((a: any, b: any) => a.y - b.y);
  });
}

function parseMealItems(elements: RichElement[]): MealItems | null {
  const items: MealItems = {
    convencional: [],
    vegetariano: [],
    acompanhamentos: [],
    bebidas: [],
    sobremesas: [],
  };

  let section: keyof MealItems = "convencional";

  for (const el of elements) {
    if (isNoise(el.text)) continue;

    const mapped = SECTION_MAP[el.text];
    if (mapped) {
      section = mapped;
      continue;
    }

    if (/segunda|terça|quarta|quinta|sexta|sábado|domingo|feira/i.test(el.text)) continue;

    items[section].push(el.text);
  }

  const hasContent = Object.values(items).some((arr) => arr.length > 0);
  return hasContent ? items : null;
}

async function scrapeMeal(page: any, hash: string): Promise<MealItems | null> {
  await page.goto(RU_URL + hash, { waitUntil: "networkidle2", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2500));
  const elements = await extractPageContent(page);
  return parseMealItems(elements);
}

async function scrapeDay(dayAbbr: string): Promise<DayMenu> {
  const pages = PAGE_MAP[dayAbbr];
  if (!pages) return { almoco: null, jantar: null };

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: "/usr/bin/chromium",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
      ],
      headless: true,
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    const almoco = await scrapeMeal(page, pages.almoco);
    const jantar = await scrapeMeal(page, pages.jantar);

    console.log(`[RU] ${dayAbbr} - almoco: ${almoco ? "ok" : "fechado"}, jantar: ${jantar ? "ok" : "fechado"}`);
    return { almoco, jantar };
  } catch (err) {
    console.error("[RU] Erro ao buscar cardapio:", err);
    return { almoco: null, jantar: null };
  } finally {
    await browser?.close();
  }
}

function formatSection(label: string, items: string[]): string {
  if (items.length === 0) return "";
  return `*${label}:*\n${items.map((i) => `• ${i}`).join("\n")}\n`;
}

function formatMeal(meal: MealItems | null, label: string, time: string): string {
  let text = `*${label} (${time}):*\n`;
  if (!meal) {
    text += "_não disponível_\n";
    return text;
  }
  text += formatSection("Prato Convencional", meal.convencional);
  text += formatSection("Prato Vegetariano", meal.vegetariano);
  text += formatSection("Acompanhamentos", meal.acompanhamentos);
  text += formatSection("Bebidas", meal.bebidas);
  text += formatSection("Sobremesas", meal.sobremesas);
  if (text === `*${label} (${time}):*\n`) {
    text += "_Cardapio nao disponivel_\n";
  }
  return text;
}

function formatDayMenu(dayAbbr: string, menu: DayMenu): string {
  const dayName = DAY_FULL[dayAbbr] ?? dayAbbr;
  if (!menu.almoco && !menu.jantar) {
    return `*Cardapio RU UFRN - ${dayName}*\n\n_Sem cardapio cadastrado para hoje._`;
  }
  let text = `*Cardapio RU UFRN - ${dayName}*\n\n`;
  text += formatMeal(menu.almoco, "Almoco", MEAL_TIMES.almoco);
  text += "\n";
  text += formatMeal(menu.jantar, "Jantar", MEAL_TIMES.jantar);
  return text.trim();
}

export default class RuCommand extends BaseCommand {
  name = "ru";
  description = "Mostra o cardapio do RU UFRN para hoje.";
  aliases = ["cardapio", "rurefeicao"];
  privateRestricted = false;
  loggable = true;

  async execute(
    _sock: WASocket,
    _msg: WAMessage,
    _args: string[],
    _allCommands?: Map<string, BaseCommand>
  ): Promise<AnyMessageContent | string | null | undefined> {
    const now = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const targetDay = DAY_ABBR[now.getUTCDay()];

    const ts = Date.now();
    const cached = cache[targetDay];

    if (cached && ts - cached.timestamp < CACHE_DURATION_MS) {
      return formatDayMenu(targetDay, cached.menu);
    }

    const menu = await scrapeDay(targetDay);

    if (menu.almoco || menu.jantar) {
      cache[targetDay] = { menu, timestamp: ts };
    }

    return formatDayMenu(targetDay, menu);
  }
}
