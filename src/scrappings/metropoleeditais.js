const cheerio = require("cheerio");
const axios = require("axios");

function itemToText(item) {
  return item.text().trim();
}

const SCRAP_CONFIG = {
  URL: "https://www.metropoledigital.ufrn.br/portal/editais",
  MAIN_CLASS: ".card-body a",
  IGNORE_CLASS: "bg-encerrado",
  LINK: "www.metropoledigital.ufrn.br",
  ELEMENTS: {
    PROCESS: ".box-card-badge",
    VALUE: ".card-text span:nth-child(2)",
    TITLE: ".card-title",
    REGISTRATION: ".card-text span:first-child",
    TYPE: ".card-footer .badge",
  },
};

async function fetchEditais() {
  const array = [];

  try {
    const { data } = await axios.get(SCRAP_CONFIG.URL);

    const $ = cheerio.load(data);

    $(".card-body a").each((_, element) => {
      const h5Element = $(element).find("h5");
      if (h5Element.hasClass(SCRAP_CONFIG.IGNORE_CLASS)) {
        return;
      }

      array.push({
        link: `${SCRAP_CONFIG.LINK}${$(element).attr("href")}`,
        processo: itemToText($(element).find(SCRAP_CONFIG.ELEMENTS.PROCESS)),
        valor: itemToText($(element).find(SCRAP_CONFIG.ELEMENTS.VALUE)),
        titulo: itemToText($(element).find(SCRAP_CONFIG.ELEMENTS.TITLE)),
        inscricao: itemToText(
          $(element).find(SCRAP_CONFIG.ELEMENTS.REGISTRATION)
        ),
        tipo: itemToText($(element).find(SCRAP_CONFIG.ELEMENTS.TYPE)),
      });
    });

    return array;
  } catch (error) {
    if (error.response) {
      console.error("Erro ao buscar editais", error.response.status);
    } else {
      console.error("Erro ao buscar editais", error.message);
    }
  }
}

module.exports = fetchEditais;
