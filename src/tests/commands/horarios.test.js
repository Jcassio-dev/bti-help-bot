const horarios = require("../../handlers/commands/horarios");

describe("horarios", () => {
  it("responde com os horários dos turnos quando o turno matutino é especificado", async () => {
    const msg = {
      reply: jest.fn(),
      body: "!horarios matutino",
    };

    await horarios(msg);

    expect(client.sendText(msg.from, ).toHaveBeenCalledWith(
      expect.stringContaining("*matutino*")
    );
    expect(client.sendText(msg.from, ).toHaveBeenCalledWith(
      expect.stringContaining("(M1) 07h00 às 07h50")
    );
    expect(client.sendText(msg.from, ).toHaveBeenCalledWith(
      expect.stringContaining("(M2) 07h50 às 08h40")
    );
    expect(client.sendText(msg.from, ).toHaveBeenCalledWith(
      expect.stringContaining("(M3) 08h50 às 09h40")
    );
    expect(client.sendText(msg.from, ).toHaveBeenCalledWith(
      expect.stringContaining("(M4) 09h40 às 10h30")
    );
    expect(client.sendText(msg.from, ).toHaveBeenCalledWith(
      expect.stringContaining("(M5) 10h40 às 11h30")
    );
    expect(client.sendText(msg.from, ).toHaveBeenCalledWith(
      expect.stringContaining("(M6) 11h30 às 12h20")
    );
  });

  it("responde com os horários dos turnos quando o turno vespertino é especificado", async () => {
    const msg = {
      reply: jest.fn(),
      body: "!horarios vespertino",
    };

    await horarios(msg);

    expect(client.sendText(msg.from, ).toHaveBeenCalledWith(
      expect.stringContaining("*vespertino*")
    );
    expect(client.sendText(msg.from, ).toHaveBeenCalledWith(
      expect.stringContaining("(V1) 13h00 às 13h50")
    );
    expect(client.sendText(msg.from, ).toHaveBeenCalledWith(
      expect.stringContaining("(V2) 13h50 às 14h40")
    );
    expect(client.sendText(msg.from, ).toHaveBeenCalledWith(
      expect.stringContaining("(V3) 14h50 às 15h40")
    );
    expect(client.sendText(msg.from, ).toHaveBeenCalledWith(
      expect.stringContaining("(V4) 15h40 às 16h30")
    );
    expect(client.sendText(msg.from, ).toHaveBeenCalledWith(
      expect.stringContaining("(V5) 16h40 às 17h30")
    );
    expect(client.sendText(msg.from, ).toHaveBeenCalledWith(
      expect.stringContaining("(V6) 17h30 às 18h20")
    );
  });

  it("responde com os horários dos turnos quando o turno noturno é especificado", async () => {
    const msg = {
      reply: jest.fn(),
      body: "!horarios noturno",
    };

    await horarios(msg);

    expect(client.sendText(msg.from, ).toHaveBeenCalledWith(
      expect.stringContaining("*noturno*")
    );
    expect(client.sendText(msg.from, ).toHaveBeenCalledWith(
      expect.stringContaining("(N1) 18h40 às 19h30")
    );
    expect(client.sendText(msg.from, ).toHaveBeenCalledWith(
      expect.stringContaining("(N2) 19h30 às 20h20")
    );
    expect(client.sendText(msg.from, ).toHaveBeenCalledWith(
      expect.stringContaining("(N3) 20h30 às 21h20")
    );
    expect(client.sendText(msg.from, ).toHaveBeenCalledWith(
      expect.stringContaining("(N4) 21h20 às 22h10")
    );
  });

  it("responde com a lista de turnos disponíveis quando o turno não é especificado", async () => {
    const msg = {
      reply: jest.fn(),
      body: "!horarios",
    };

    await horarios(msg);

    expect(client.sendText(msg.from, ).toHaveBeenCalledWith(
      expect.stringContaining(
        "Tente: !horarios <nome-do-turno>\nDisponíveis:\nmatutino\nvespertino\nnoturno"
      )
    );
  });

  it("responde com a lista de turnos disponíveis quando o turno especificado não existe", async () => {
    const msg = {
      reply: jest.fn(),
      body: "!horarios inexistente",
    };

    await horarios(msg);

    expect(client.sendText(msg.from, ).toHaveBeenCalledWith(
      expect.stringContaining(
        "Tente: !horarios <nome-do-turno>\nDisponíveis:\nmatutino\nvespertino\nnoturno"
      )
    );
  });
});
