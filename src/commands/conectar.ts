import { AnyMessageContent, WAMessage, WASocket } from "baileys";
import { BaseCommand } from "../types/command";
import { gerarLink, temSessao } from "../utils/sigaa";

export default class ConectarCommand extends BaseCommand {
  name = "conectar";
  description = "Conecta sua conta do SIGAA para consultar turmas e notas.";
  aliases = ["login", "sigaa"];
  privateRestricted = true;
  loggable = false;
  acesso: "tester" = "tester";

  async execute(
    _sock: WASocket,
    msg: WAMessage,
    _args: string[]
  ): Promise<AnyMessageContent | string | null | undefined> {
    const jid = msg.key.participant || msg.key.remoteJid!;
    try {
      if (await temSessao(jid)) {
        return "Você já está conectado. Use *!turmas* ou *!desconectar* se quiser sair.";
      }
      const link = await gerarLink(jid);
      return (
        `Abra este link e entre com seu login do SIGAA:\n${link}\n\n` +
        `_O login acontece no servidor do bot, que vê a senha só na hora de abrir a sessão e não a guarda. ` +
        `O link vale por 10 minutos. Projeto não oficial da UFRN._`
      );
    } catch (e) {
      return "Não consegui gerar o link agora. Tenta de novo em instantes.";
    }
  }
}
