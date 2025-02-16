const ping = require("../../handlers/commands/ping");

describe("Ping test", () => {
  it("Usuário enviou o comando !ping", async () => {
    const msg = {
      reply: jest.fn(),
      body: "!ping",
    };

    await ping(msg);

    expect(client.sendText(msg.from, ).toHaveBeenCalledWith(
      expect.stringContaining("Pong!")
    );
  });
});
