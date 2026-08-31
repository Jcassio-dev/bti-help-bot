import { AnyMessageContent, WAMessage, WASocket } from "baileys";
import { BaseCommand } from "../types/command";
import { buscarDados, desde, precisaConectar } from "../utils/sigaa";

export default class IndicesCommand extends BaseCommand {
  name = "indices";
  description = "Seu IRA, média e progresso no curso.";
  aliases = ["ira", "indice", "índices"];
  privateRestricted = true;
  loggable = false;

  async execute(
    _sock: WASocket,
    msg: WAMessage
  ): Promise<AnyMessageContent | string | null | undefined> {
    const jid = msg.key.participant || msg.key.remoteJid!;
    try {
      const dados = await buscarDados(jid);
      const val = (sigla: string) =>
        dados.indices.find((i) => i.sigla === sigla)?.valor ?? "—";

      const linhas: string[] = [];
      linhas.push(`*IRA:* ${val("IRA")}`);
      if (val("MC") !== "—") linhas.push(`Média do curso: ${val("MC")}`);
      if (dados.integralizado != null) {
        linhas.push(`Curso integralizado: ${dados.integralizado}%`);
      }
      const orientador = dados.institucional["Orientador Acadêmico"];
      if (orientador) linhas.push(`Orientador: ${orientador}`);

      return (
        `*Índices acadêmicos*\n\n${linhas.join("\n")}\n\n` +
        `_Último registro ${desde(dados.atualizadoEm)}. Atualize com !conectar._`
      );
    } catch (e) {
      if (precisaConectar(e)) {
        return "Você não está conectado ao SIGAA. Use *!conectar* pra começar.";
      }
      return "Não consegui buscar seus dados agora. Tenta de novo em instantes.";
    }
  }
}
