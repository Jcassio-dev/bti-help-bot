const fetchEditais = require("./metropoleeditais");
const fetchMenuRU = require("./menuRU");
const fetchJobs = require("./jerimumjobs");

async function makeScrapping() {
  console.log("Iniciando scrapping...");

  const scrapingPromises = [fetchEditais(), fetchMenuRU(), fetchJobs()];

  const results = await Promise.allSettled(scrapingPromises);

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      global.appContext[index === 0 ? "editais" : index === 1 ? "ruCardapio" : "jobs"] = result.value;
    } else {
      console.error(`Error fetching data for ${index === 0 ? "editais" : index === 1 ? "menuRU" : "jobs"}:`, result.reason);
    }
  });

  console.log("Scrapping finalizado!");
}

module.exports = makeScrapping;