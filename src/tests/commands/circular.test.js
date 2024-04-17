const { MessageMedia } = require("whatsapp-web.js");
const circular = require("../../handlers/commands/circular");

describe("Teste horarios circular", () => {
    it("Bot retorna a imagem dos horários", async () => {
        const msg = {
            reply: jest.fn(),
            body: "!circular",
            from: "chatId",
        };

        const client = {
            sendMessage: jest.fn(),
        };

        await circular(msg, client);

        const image = MessageMedia.fromFilePath("./src/content/imgs/horarios-ufrn.jpeg");

        expect(client.sendMessage).toHaveBeenCalledWith("chatId", image, { caption: "Esses são os horários do circular."});
    });
});