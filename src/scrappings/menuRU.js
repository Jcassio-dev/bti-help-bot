const cheerio = require("cheerio");
const axios = require("axios");

const SCRAP_CONFIG = {
  URL: "https://ru.ufrn.br/",
  MAIN_CLASS: ".box-ingredientes",
};

async function fetchMenuRU() {
  const menu = {
    cafe: {},
    almoco: {},
    jantar: {},
  };
  try {
    const { data } = await axios.get(SCRAP_CONFIG.URL);

    const $ = cheerio.load(data);

    $(SCRAP_CONFIG.MAIN_CLASS).each((i, element) => {
      const type = $(element).attr("class").split(" ")[1];
      $(element)
        .find("ul")
        .each((i, ul) => {
          const meal = $(ul).attr("class").split(" ")[2];
          const items = [];

          $(ul)
            .children()
            .each((i, li) => {
              items.push($(li).text().trim());
            });

          menu[meal][type] = items.join(", ");
        });
    });

    return JSON.stringify(menu, null, 2);
  } catch (error) {
    if (error.response) {
      console.error("Erro ao buscar menu do RU", error.response.status);
    } else {
      console.error("Erro ao buscar menu do RU", error.message);
    }
  }
}

module.exports = fetchMenuRU;
