const fetchEditais = require("./metropoleeditais");
const fetchMenuRU = require("./menuRU");
const fetchJobs = require("./jerimumjobs");

async function makeScrapping() {
  console.log("Iniciando scrapping...");

  await fetchEditais().then((editais) => (global.appContext.editais = editais));
  await fetchMenuRU().then((menu) => (global.appContext.ruCardapio = menu));
  await fetchJobs().then((jobs) => (global.appContext.jobs = jobs));

  console.log("Scrapping finalizado!");
}

module.exports = makeScrapping;
