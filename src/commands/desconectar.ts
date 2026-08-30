import { AnyMessageContent, WAMessage, WASocket } from "baileys";
import { BaseCommand } from "../types/command";
import { desconectar } from "../utils/sigaa";

export default class DesconectarCommand extends BaseCommand {
  name = "desconectar";
  description = "Encerra sua sessão do SIGAA e apaga os dados guardados.";
  aliases = ["sair", "esquecer"];
  privateRestricted = true;
  loggable = false;
  acesso: "tester" = "tester";

  async execute(
    _sock: WASocket,
    msg: WAMessage
  ): Promise<AnyMessageContent | string | null | undefined> {
    const jid = msg.key.participant || msg.key.remoteJid!;
    try {
      await desconectar(jid);
      return "Desconectei sua conta e apaguei a sessão guardada. Use *!conectar* quando quiser voltar.";
    } catch (e) {
      return "Não consegui agora. Tenta de novo em instantes.";
    }
  }
}
