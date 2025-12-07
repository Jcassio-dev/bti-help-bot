import { BaseCommand } from "../types/command";

const AVERAGES = {
  CUT: 6,
  RECOVERY: 5,
  MINIMUM: 3,
};

export default class CalcCommand extends BaseCommand {
  name = "calculadora";
  description =
    "Calcula média, previsão de nota para N3 ou nota necessária na reposição.";
  aliases = ["calc", "calcular", "media", "previsao", "reposicao"];
  privateRestricted = false;
  loggable = true;

  async execute(
    _sock: any,
    _msg: any,
    args: string[],
    _allCommands?: Map<string, BaseCommand>
  ): Promise<string> {

    if(args[0] === "info"){
        return `*Envie !calc <n1> <n2>* ou *!calc <n1> <n2> <n3>*\nAPR*: Média >= 6.0\n*APRN*: 5 <= Média <=6 e nenhuma nota < 4.0\n*REPOSIÇÃO*: alguma nota < 4.0 e média >= 3.0\n*+1 SEMESTRE*: média < 3.0 ou alguma nota < 4 na reposição.`;
    }

    const notes = args
      .map((arg) => parseFloat(arg.replace(",", ".")))
      .filter((note) => !isNaN(note))
      .map((note) => Math.min(Math.max(note, 0), 10)); 

      
    if (notes.length < 2 || notes.length > 3) {
      return "Por favor, Use: *!calc <n1> <n2>* ou *!calc <n1> <n2> <n3>* onde n1, n2 e n3 são as notas das avaliações.";
    }

    const result =
      notes.length === 2
        ? this.calculatePreview(notes)
        : this.calculateFinal(notes);

    return `${result}`;
  }

  private calculatePreview(notes: number[]): string {
    const [n1, n2] = notes;

    const sum = n1 + n2;
    const average = sum / 2;

    if (Math.min(n1, n2) < 4) {
      return `Média atual: *${average.toFixed(2)}*. Como uma das notas é menor que 4, você vai para a *reposição*.\n\nSe for de 30h, você precisa tirar pelo menos *${Math.max(4,10 - Math.max(n1, n2))}* para passar.`;
    }

    if (sum/3 >= AVERAGES.CUT) {
      return `Média atual: *${average.toFixed(2)}*. Parabéns! Você só precisa garantir o 4 na N3.\n\nSe for de 30h, já passou!`;
    }

    return `Média atual: *${average.toFixed(2)}*`;
  }

  private calculateFinal(notes: number[]): string {
    const [n1, n2, n3] = notes;
    const sum = n1 + n2 + n3;
    const average = sum / 3;

    if (average < AVERAGES.MINIMUM) {
      return `+1 semeste :(`;
    }

    const hasNoteLessThanFour = notes.some((note) => note < 4);

    if (average >= AVERAGES.CUT && !hasNoteLessThanFour) {
      return `Parabéns! Você já passou com *média ${average.toFixed(2)}* `;
    }

    const minorNote = Math.min(n1, n2, n3);
    const notesWithoutMinor = sum - minorNote;
    const needed = Math.max(4, 15 - notesWithoutMinor);

    return `Você precisa tirar no mínimo *${needed.toFixed(2)}*  na reposição para passar.`;
  }
}
