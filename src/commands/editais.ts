import { WAMessage, WASocket, AnyMessageContent } from "baileys";
import { Command } from "../types/command";
import axios from "axios";
import cheerio from "cheerio";

const SCRAP_CONFIG_EDITAIS = {
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

interface Edital {
  link: string;
  processo: string;
  valor: string;
  titulo: string;
  inscricao: string;
  tipo: string;
}

let cachedEditais: Edital[] | null = null;
let lastEditaisUpdate: number | null = null;
const CACHE_DURATION_EDITAIS_MS = 4 * 60 * 60 * 1000; // 4 horas

function itemToText(element: cheerio.Cheerio<any>): string {
  return element.text().trim();
}

async function fetchAllEditais(): Promise<Edital[] | null> {
  console.log("Buscando editais no Metrópole Digital...");
  const editaisArray: Edital[] = [];
  try {
    const { data } = await axios.get(SCRAP_CONFIG_EDITAIS.URL);
    const $ = cheerio.load(data);

    $(SCRAP_CONFIG_EDITAIS.MAIN_CLASS).each((_, element) => {
      const h5Element = $(element).find("h5");
      if (h5Element.hasClass(SCRAP_CONFIG_EDITAIS.IGNORE_CLASS)) {
        return;
      }

      editaisArray.push({
        link: `${SCRAP_CONFIG_EDITAIS.LINK_PREFIX}${$(element).attr("href")}`,
        processo: itemToText(
          $(element).find(SCRAP_CONFIG_EDITAIS.ELEMENTS.PROCESS)
        ),
        valor: itemToText($(element).find(SCRAP_CONFIG_EDITAIS.ELEMENTS.VALUE)),
        titulo: itemToText(
          $(element).find(SCRAP_CONFIG_EDITAIS.ELEMENTS.TITLE)
        ),
        inscricao: itemToText(
          $(element).find(SCRAP_CONFIG_EDITAIS.ELEMENTS.REGISTRATION)
        ),
        tipo: itemToText($(element).find(SCRAP_CONFIG_EDITAIS.ELEMENTS.TYPE)),
      });
    });
    console.log(
      `Total de ${editaisArray.length} editais encontrados no Metrópole Digital.`
    );
    return editaisArray.length > 0 ? editaisArray : null;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error(
        "Erro ao buscar editais (Metrópole):",
        error.response.status,
        error.message
      );
    } else {
      if (error instanceof Error) {
        console.error("Erro ao buscar editais (Metrópole):", error.message);
      } else {
        console.error("Erro ao buscar editais (Metrópole):", error);
      }
    }
    return null;
  }
}

const editaisCommand: Command = {
  name: "editais",
  description: "Lista editais do portal Metrópole Digital.",
  aliases: ["bolsas", "metropole"],
  privateRestricted: false,
  execute: async (
    sock: WASocket,
    msg: WAMessage,
    args: string[]
  ): Promise<AnyMessageContent | string | null | undefined> => {
    const now = Date.now();

    if (
      cachedEditais &&
      lastEditaisUpdate &&
      now - lastEditaisUpdate < CACHE_DURATION_EDITAIS_MS
    ) {
      console.log("Servindo editais do Metrópole Digital do cache.");
    } else {
      const fetchedEditais = await fetchAllEditais();
      if (fetchedEditais) {
        cachedEditais = fetchedEditais;
        lastEditaisUpdate = now;
        console.log("Cache de editais do Metrópole Digital atualizado.");
      } else if (!cachedEditais) {
        return "Desculpe, não foi possível buscar os editais do Metrópole Digital no momento e não há dados em cache.";
      }
    }

    if (!cachedEditais || cachedEditais.length === 0) {
      return "Nenhum edital encontrado no Metrópole Digital ou o cache está vazio.";
    }

    const editaisToDisplay = cachedEditais.slice(0, 5);

    let responseText = "📢 *Editais Recentes do Metrópole Digital:*\n\n";
    editaisToDisplay.forEach((edital) => {
      responseText += `*${edital.titulo}*\n`;
      responseText += `  Tipo: ${edital.tipo}\n`;
      responseText += `  Processo: ${edital.processo}\n`;
      responseText += `  Inscrição: ${edital.inscricao}\n`;
      responseText += `  Valor: ${edital.valor}\n`;
      responseText += `  Link: ${edital.link}\n\n`;
    });

    if (cachedEditais.length > editaisToDisplay.length) {
      responseText += `\nE mais ${
        cachedEditais.length - editaisToDisplay.length
      } editais. Visite o site para ver todos.`;
    }

    return responseText;
  },
};

export default editaisCommand;
