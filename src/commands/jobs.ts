import { WAMessage, WASocket, AnyMessageContent } from "baileys";
import { Command } from "../types/command";
import axios from "axios";

const SCRAP_CONFIG = {
  URL: "https://jerimumjobs.imd.ufrn.br/jerimumjobs/oportunidade/listarJSON",
  PAGE: 1,
};

interface Job {
  title: string;
  company: string;
  area: string[];
  regime: string;
  salary: string | number | null;
  deadline: string;
  link: string;
}

let cachedJobs: Job[] | null = null;
let lastJobsUpdate: number | null = null;
const CACHE_DURATION_MS = 4 * 60 * 60 * 1000;

async function scrapeJobsRecursive(jobsList: Job[], page = 1): Promise<Job[]> {
  try {
    const { data } = await axios.get<
      {
        titulo: string;
        empresa: { nome: string };
        areaAtuacao: { descricao: string }[];
        regime: { descricao: string };
        salario: string | number | null;
        dataValidade: string;
        id: number;
      }[]
    >(`${SCRAP_CONFIG.URL}/${page}`);

    if (data.length === 0) {
      return jobsList;
    }

    data.forEach(
      ({ titulo, empresa, areaAtuacao, regime, salario, dataValidade, id }) => {
        jobsList.push({
          title: titulo,
          company: empresa.nome,
          area: areaAtuacao.map((area) => area.descricao),
          regime: regime.descricao,
          salary: salario,
          deadline: new Date(dataValidade).toLocaleDateString("pt-BR"), // Formatar data
          link: `https://jerimumjobs.imd.ufrn.br/jerimumjobs/oportunidade/${id}`,
        });
      }
    );
    return scrapeJobsRecursive(jobsList, page + 1);
  } catch (error) {
    console.error(
      `Erro ao buscar vagas no Jerimum Jobs na página ${page}: `,
      error instanceof Error ? error.message : error
    );
    return jobsList;
  }
}

async function fetchAllJobs(): Promise<Job[] | null> {
  console.log("Buscando vagas no Jerimum Jobs...");
  const jobs: Job[] = [];
  try {
    const allJobs = await scrapeJobsRecursive(jobs, SCRAP_CONFIG.PAGE);
    console.log(
      `Total de ${allJobs.length} vagas encontradas no Jerimum Jobs.`
    );
    return allJobs.length > 0 ? allJobs : null;
  } catch (error) {
    console.error(
      "Erro geral ao buscar vagas no Jerimum Jobs:",
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
}

const jerimumCommand: Command = {
  name: "jobs",
  description: "Lista vagas de emprego do Jerimum Jobs.",
  aliases: ["jerimum", "vagas", "jerimumjobs"],
  privateRestricted: false,
  execute: async (
    sock: WASocket,
    msg: WAMessage,
    args: string[]
  ): Promise<AnyMessageContent | string | null | undefined> => {
    const now = Date.now();

    if (
      cachedJobs &&
      lastJobsUpdate &&
      now - lastJobsUpdate < CACHE_DURATION_MS
    ) {
      console.log("Servindo vagas do Jerimum Jobs do cache.");
    } else {
      const fetchedJobs = await fetchAllJobs();
      if (fetchedJobs) {
        cachedJobs = fetchedJobs;
        lastJobsUpdate = now;
        console.log("Cache de vagas do Jerimum Jobs atualizado.");
      } else if (!cachedJobs) {
        return "Desculpe, não foi possível buscar as vagas do Jerimum Jobs no momento e não há dados em cache.";
      }
    }

    if (!cachedJobs || cachedJobs.length === 0) {
      return "Nenhuma vaga encontrada no Jerimum Jobs ou o cache está vazio.";
    }

    const jobsToDisplay = cachedJobs.slice(0, 10);

    let responseText = "💼 *Vagas Recentes no Jerimum Jobs:*\n\n";
    jobsToDisplay.forEach((job) => {
      responseText += `*${job.title}* (${job.company})\n`;
      responseText += `  Área: ${job.area.join(", ") || "Não especificada"}\n`;
      responseText += `  Regime: ${job.regime}\n`;
      responseText += `  Salário: ${job.salary || "Não informado"}\n`;
      responseText += `  Validade: ${job.deadline}\n`;
      responseText += `  Link: ${job.link}\n\n`;
    });

    if (cachedJobs.length > jobsToDisplay.length) {
      responseText += `\nE mais ${
        cachedJobs.length - jobsToDisplay.length
      } vagas. Visite o site para ver todas.`;
    }

    return responseText;
  },
};

export default jerimumCommand;
