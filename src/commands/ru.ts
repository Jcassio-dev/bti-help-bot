import { WAMessage, WASocket, AnyMessageContent } from "baileys";
import { BaseCommand } from "../types/command";
import puppeteer from "puppeteer-core";

const RU_URL = "https://cardapiosemanalruufrn.my.canva.site/rudaufrn/";
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
  TER: "Terça-feira",
  QUA: "Quarta-feira",
  QUI: "Quinta-feira",
  SEX: "Sexta-feira",
  SAB: "Sábado",
  DOM: "Domingo",
};

const DAY_BUTTON_TEXT: Record<string, string> = {
  SEG: "Segunda",
  TER: "Terça",
  QUA: "Quarta",
  QUI: "Quinta",
  SEX: "Sexta",
  SAB: "Sábado",
  DOM: "Domingo",
};

const SECTION_LABELS = new Set([
  "Prato Convencional",
  "Prato Vegetariano",
  "Acompanhamentos",
  "Bebidas",
  "Sobremesas",
]);

const ALLERGENS = new Set(["Glúten", "Leite", "Ovo", "Açúcar", "Suíno"]);

const UI_NOISE = new Set([
  "Voltar",
  "Almoço",
  "Jantar",
  "Obs:",
  "Fechado",
  "FECHADO",
  "Escolha o dia",
  "Central",
  "Biomédica",
  "Tecnológica",
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

interface TextElement {
  text: string;
  x: number;
  y: number;
}

function isNoiseElement(el: TextElement): boolean {
  if (ALLERGENS.has(el.text)) return true;
  if (UI_NOISE.has(el.text)) return true;
  if (isEmojiOnly(el.text)) return true;
  if (/^[AJ]\s+(SEG|TER|QUA|QUI|SEX|SAB|DOM)/i.test(el.text)) return true;
  if (/cardápio semanal|cardápio sujeito/i.test(el.text)) return true;
  if (/terms|privacy|canva|close|report|acceptable use/i.test(el.text)) return true;
  if (/restaurante universitário/i.test(el.text)) return true;
  if (/semana de/i.test(el.text)) return true;
  if (/if you see anything|personal data|privacy practices/i.test(el.text)) return true;
  if (el.text === "S" || el.text === "ábado") return true;
  if (el.x > 1100) return true;
  return false;
}

async function getPageTextElements(page: any): Promise<TextElement[]> {
  const raw: TextElement[] = await page.evaluate(() => {
    const result: { text: string; x: number; y: number }[] = [];
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null
    );
    let node;
    while ((node = walker.nextNode())) {
      const text = node.textContent?.trim() ?? "";
      if (!text) continue;
      const parent = node.parentElement;
      if (!parent) continue;
      const rect = parent.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      result.push({
        text,
        x: Math.round(rect.left),
        y: Math.round(rect.top),
      });
    }
    return result;
  });

  const preFiltered = raw.filter((el) => !isNoiseElement(el));

  const merged: TextElement[] = [];
  const byY: Map<number, TextElement[]> = new Map();
  for (const el of preFiltered) {
    const bucket = Math.round(el.y / 8) * 8;
    if (!byY.has(bucket)) byY.set(bucket, []);
    byY.get(bucket)!.push(el);
  }
  for (const [, group] of byY) {
    group.sort((a, b) => a.x - b.x);
    let i = 0;
    while (i < group.length) {
      const cur = group[i];
      if (
        i + 1 < group.length &&
        group[i + 1].x - (cur.x + 10) < 60 &&
        !SECTION_LABELS.has(cur.text) &&
        !SECTION_LABELS.has(group[i + 1].text)
      ) {
        merged.push({
          text: cur.text + " " + group[i + 1].text,
          x: cur.x,
          y: cur.y,
        });
        i += 2;
      } else {
        merged.push(cur);
        i++;
      }
    }
  }
  return merged;
}

function isEmojiOnly(text: string): boolean {
  return text.replace(/[\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Component}\s]/gu, "").length === 0;
}

function parseMealItems(elements: TextElement[]): MealItems | null {
  const cleaned = elements
    .filter((el) => !/segunda|terça|quarta|quinta|sexta|sábado|domingo/i.test(el.text) || el.y > 200)
    .sort((a, b) => a.y - b.y);

  const items: MealItems = {
    convencional: [],
    vegetariano: [],
    acompanhamentos: [],
    bebidas: [],
    sobremesas: [],
  };

  let section: keyof MealItems = "convencional";

  for (const el of cleaned) {
    if (el.text === "Prato Convencional") { section = "convencional"; continue; }
    if (el.text === "Prato Vegetariano") { section = "vegetariano"; continue; }
    if (el.text === "Acompanhamentos") { section = "acompanhamentos"; continue; }
    if (el.text === "Bebidas") { section = "bebidas"; continue; }
    if (el.text === "Sobremesas") { section = "sobremesas"; continue; }

    items[section].push(el.text);
  }

  const hasContent =
    items.convencional.length > 0 ||
    items.vegetariano.length > 0 ||
    items.acompanhamentos.length > 0;

  return hasContent ? items : null;
}

async function scrapeDay(dayAbbr: string): Promise<DayMenu> {
  console.log(`[RU] Buscando cardápio de ${dayAbbr}...`);
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: "/usr/bin/chromium",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(RU_URL, { waitUntil: "networkidle2", timeout: 30000 });
    await new Promise((r) => setTimeout(r, 2500));

    const dayLinks: { text: string; href: string }[] = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("a"))
        .map((a) => ({ text: a.textContent?.trim().replace(/\s+/g, " ") ?? "", href: a.href }))
        .filter((l) => l.href.includes("#page-"));
    });

    const buttonText = DAY_BUTTON_TEXT[dayAbbr];
    const norm = (s: string) =>
      s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "");
    const dayLink = dayLinks.find((l) => norm(l.text) === norm(buttonText));

    if (!dayLink) {
      console.warn(`[RU] Link não encontrado para ${dayAbbr} (texto: ${buttonText})`);
      return { almoco: null, jantar: null };
    }

    await page.goto(dayLink.href, { waitUntil: "networkidle2", timeout: 30000 });
    await new Promise((r) => setTimeout(r, 2500));

    const almocoElements = await getPageTextElements(page);
    const almoco = parseMealItems(almocoElements);

    let jantar: MealItems | null = null;
    try {
      await page.click('text/Jantar');
      await new Promise((r) => setTimeout(r, 1500));
      const jantarElements = await getPageTextElements(page);
      jantar = parseMealItems(jantarElements);
    } catch {
      console.warn(`[RU] Seção de jantar não encontrada para ${dayAbbr}`);
    }
    console.log(
      `[RU] ${dayAbbr} — almoço: ${almoco ? "ok" : "fechado"}, jantar: ${jantar ? "ok" : "fechado"}`
    );
    return { almoco, jantar };
  } catch (err) {
    console.error("[RU] Erro ao buscar cardápio:", err);
    return { almoco: null, jantar: null };
  } finally {
    await browser?.close();
  }
}

function formatSection(label: string, items: string[]): string {
  if (items.length === 0) return "";
  return `*${label}:*\n${items.map((i) => `• ${i}`).join("\n")}\n`;
}

function formatMeal(meal: MealItems | null): string {
  if (!meal) return "_Fechado_\n";
  let text = "";
  text += formatSection("Prato Convencional", meal.convencional);
  text += formatSection("Prato Vegetariano", meal.vegetariano);
  text += formatSection("Acompanhamentos", meal.acompanhamentos);
  text += formatSection("Bebidas", meal.bebidas);
  text += formatSection("Sobremesas", meal.sobremesas);
  return text || "_Cardapio nao disponivel_\n";
}

function formatDayMenu(dayAbbr: string, menu: DayMenu): string {
  const dayName = DAY_FULL[dayAbbr] ?? dayAbbr;
  let text = `*Cardapio RU UFRN - ${dayName}*\n\n`;

  text += `*Almoco:*\n`;
  text += formatMeal(menu.almoco);
  text += "\n";
  text += `*Jantar:*\n`;
  text += formatMeal(menu.jantar);

  return text.trim();
}

export default class RuCommand extends BaseCommand {
  name = "ru";
  description = "Mostra o cardápio do RU UFRN para hoje.";
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
      console.log(`[RU] Servindo ${targetDay} do cache.`);
      return formatDayMenu(targetDay, cached.menu);
    }

    const menu = await scrapeDay(targetDay);
    cache[targetDay] = { menu, timestamp: ts };

    return formatDayMenu(targetDay, menu);
  }
}
