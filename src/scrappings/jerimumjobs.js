const axios = require("axios");

const SCRAP_CONFIG = {
  URL: "https://jerimumjobs.imd.ufrn.br/jerimumjobs/oportunidade/listarJSON",
  PAGE: 1,
};

async function getJobs(jobs, page = 1) {
  try {
    const { data } = await axios.get(`${SCRAP_CONFIG.URL}/${page}`);
    if (data.length === 0) {
      return jobs;
    }
    data.map(
      ({ titulo, empresa, areaAtuacao, regime, salario, dataValidade, id }) => {
        jobs.push({
          title: titulo,
          company: empresa.nome,
          area: areaAtuacao.map((area) => area.descricao),
          regime: regime.descricao,
          salary: salario,
          deadline: new Date(dataValidade).toISOString().split("T")[0],
          link: `https://jerimumjobs.imd.ufrn.br/jerimumjobs/oportunidade/${id}`,
        });
      }
    );
    return getJobs(jobs, page + 1);
  } catch (error) {
    console.error(
      `Erro ao buscar vagas no Jerimum Jobs na página ${page}: `,
      error.message
    );
  }
}

async function fetchJobs() {
  let page = SCRAP_CONFIG.PAGE;
  let jobs = [];

  jobs = await getJobs(jobs, page);

  return jobs;
}

module.exports = fetchJobs;
