# 🤖 BTI HELP BOT

[![WhatsApp](https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://wa.me/558486735862?text=!menu)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

## 📖 Sobre

Bot de WhatsApp desenvolvido para auxiliar estudantes do **Bacharelado em Tecnologia da Informação (BTI)** do **Instituto Metrópole Digital (IMD/UFRN)** com informações acadêmicas, horários, vagas de emprego e muito mais.

[📱 Clique aqui para conversar com o bot](https://wa.me/558486735862?text=!menu)

---

## ✨ Comandos

Lista gerada a partir de `src/commands/`. Todo comando aceita o prefixo `!`.

### Aprovação de professores e disciplinas

| Comando | Apelidos | Descrição |
| --- | --- | --- |
| `!professor` | `!prof` | Taxa de aprovação de um professor por disciplina. Uso: !professor &lt;nome&gt; |
| `!turma` | `!disciplina`, `!aprovacao`, `!aprovação`, `!taxa` | Taxa de aprovação por professor numa disciplina. Uso: !turma calculo 1 |

### Informações acadêmicas

| Comando | Apelidos | Descrição |
| --- | --- | --- |
| `!grade` | `!grades`, `!curricular` | Envia a imagem da grade curricular especificada. |
| `!calendario` | `!cal`, `!acad` | Envia o arquivo do calendário acadêmico. |
| `!horarios` | `!turno`, `!horario`, `!h`, `!turnos` | Exibe os horários dos turnos disponíveis. |
| `!faltas` | `!faltas`, `!faltaspermitidas`, `!faltaslimite`, `!f` | responde com o número limite de faltas permitidas |
| `!pes` | — | Informa a grade necessária para conseguir o certificado de cada PES. _(só no privado)_ |
| `!calculadora` | `!calc`, `!calcular`, `!media`, `!previsao`, `!reposicao` | Calcula média, previsão de nota para N3 ou nota necessária na reposição. |
| `!feriados` | `!feriado`, `!holidays` | Lista feriados restantes de 2026 |

### Dia a dia no campus

| Comando | Apelidos | Descrição |
| --- | --- | --- |
| `!ru` | `!cardapio`, `!rurefeicao` | Mostra o cardapio do RU UFRN para hoje. |
| `!circular` | `!circ`, `!onibus`, `!horariocircular` | Envia a imagem dos horários do circular. |
| `!secretaria` | — | Envia o contato da secretaria. |
| `!links` | `!link`, `!comunidade`, `!grupo` | Retorna links relacionados à comunidade do BTI |

### Oportunidades

| Comando | Apelidos | Descrição |
| --- | --- | --- |
| `!jobs` | `!jerimum`, `!vagas`, `!jerimumjobs` | Lista vagas de emprego do Jerimum Jobs. _(só no privado)_ |
| `!editais` | `!bolsas`, `!metropole` | Lista editais do portal Metrópole Digital. _(só no privado)_ |

### Sobre o bot

| Comando | Apelidos | Descrição |
| --- | --- | --- |
| `!menu` | `!ajuda`, `!comandos`, `!help` | Mostra a lista de comandos disponíveis. |
| `!uso` | `!eu`, `!chamadas` | Faz uma requisição no servidor e vê quantos comandos você já usou. _(só no privado)_ |
| `!dashboard` | `!painel`, `!dash` | Retorna o link para o painel geral do bot. |
| `!ping` | `!p` | Responde com Pong! |
| `!repositorio` | `!repo`, `!github`, `!source`, `!sourcecode`, `!code`, `!codigo`, `!star` | Manda o link do repositório do bot |
| `!sugestao` | `!sgt`, `!sugestão`, `!feedback`, `!ideia` | Envie uma sugestão ou ideia pro bot. Uso: !sgt &lt;sua ideia&gt; _(só no privado)_ |

### Moderação

| Comando | Apelidos | Descrição |
| --- | --- | --- |
| `!aviso` | — | Envia um aviso (restrito a moderadores). |
| `!sugestoes` | `!sugestões`, `!backlog` | Lista as sugestões (moderadores). |

Os comandos `aviso`, `dashboard`, `ping`, `sugestoes`, `uso` não entram nas métricas de uso, porque têm `loggable = false`.
---

## 🚀 Como Rodar Localmente

### Pré-requisitos

- Node.js (versão 20 ou superior)
- npm ou yarn
- Conta do WhatsApp para conectar o bot

### Instalação

1. **Clone o repositório**

   ```bash
   git clone https://github.com/Jcassio-dev/bti-help-bot.git
   cd bti-help-bot
   ```

2. **Instale as dependências**

   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**

   Crie um arquivo `.env` na raiz do projeto:

   ```env
   API_BASE_URL=https://sua-api.com
   API_SECRET_KEY=sua-chave-secreta
   ```

4. **Inicie o bot em modo de desenvolvimento**

   ```bash
   npm run dev
   ```

5. **Escaneie o QR Code**

   Um QR Code será exibido no console. Escaneie-o com o WhatsApp Web para conectar o bot.

### Scripts Disponíveis

```bash
npm run dev          # Inicia em modo desenvolvimento
npm run build        # Compila o TypeScript para JavaScript
npm start            # Inicia o bot em produção
npm run pm2:start    # Inicia com PM2 (produção)
npm run pm2:stop     # Para o bot rodando no PM2
npm run pm2:restart  # Reinicia o bot no PM2
npm run pm2:logs     # Visualiza logs do PM2
```

---

## 🐳 Docker

### Usando Docker Compose

1. **Configure o ambiente**

   ```bash
   cp .env.example .env
   # Edite o .env com suas configurações
   ```

2. **Inicie o bot**

   ```bash
   docker-compose up -d --build
   ```

3. **Visualize os logs**

   ```bash
   docker-compose logs -f bot
   ```

4. **Escaneie o QR Code**

   Copie a string do QR Code dos logs e use um gerador online para criar o QR Code escaneável.

### Comandos Docker Úteis

```bash
docker-compose down              # Para e remove os containers
docker-compose restart           # Reinicia o bot
docker-compose logs -f bot       # Acompanha os logs em tempo real
docker volume rm <volume-name>   # Remove o volume de sessão (força novo login)
```

---

## 📁 Estrutura do Projeto

```
bti-help-bot/
├── src/
│   ├── commands/              # Comandos do bot
│   │   ├── calendario.ts
│   │   ├── circular.ts
│   │   ├── dashboard.ts
│   │   ├── editais.ts
│   │   ├── faltas.ts
│   │   ├── feriados.ts
│   │   ├── grade.ts
│   │   ├── horarios.ts
│   │   ├── jobs.ts
│   │   ├── links.ts
│   │   ├── menu.ts
│   │   ├── pes.ts
│   │   ├── ping.ts
│   │   ├── repositorio.ts
│   │   ├── secretaria.ts
│   │   └── uso.ts
│   ├── core/                  # Lógica principal
│   │   ├── api.ts             # Cliente da API
│   │   ├── bot.ts             # Configuração do Baileys
│   │   └── handlers.ts        # Manipulador de mensagens
│   ├── resources/             # Recursos estáticos
│   │   ├── constants/         # Constantes (PES, etc)
│   │   ├── docs/              # PDFs e documentos
│   │   ├── imgs/              # Imagens das grades
│   │   └── feriados2026.json
│   ├── types/                 # Definições TypeScript
│   │   ├── api.ts
│   │   └── command.ts
│   └── index.ts               # Ponto de entrada
├── auth_info_baileys/         # Sessão do WhatsApp (não versionado)
├── dist/                      # Código compilado
├── .env                       # Variáveis de ambiente
├── docker-compose.yml         # Configuração Docker
├── Dockerfile                 # Imagem Docker
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🛠️ Tecnologias Utilizadas

- **[Node.js](https://nodejs.org/)** - Runtime JavaScript
- **[TypeScript](https://www.typescriptlang.org/)** - Superset tipado do JavaScript
- **[Baileys](https://github.com/WhiskeySockets/Baileys)** - Biblioteca para WhatsApp Web
- **[Axios](https://axios-http.com/)** - Cliente HTTP
- **[Cheerio](https://cheerio.js.org/)** - Web scraping
- **[Docker](https://www.docker.com/)** - Containerização
- **[PM2](https://pm2.keymetrics.io/)** - Process manager para Node.js

---

## 🤝 Como Contribuir

Contribuições são muito bem-vindas! Aqui estão algumas formas de ajudar:

1. **Reportar bugs** - Abra uma [issue](https://github.com/Jcassio-dev/bti-help-bot/issues) descrevendo o problema
2. **Sugerir funcionalidades** - Compartilhe suas ideias de novos comandos
3. **Adicionar comandos** - Crie novos comandos úteis para os estudantes
4. **Melhorar a documentação** - Ajude a tornar este README ainda melhor
5. **Corrigir bugs** - Envie um Pull Request com correções

### Passos para Contribuir

1. Fork este repositório
2. Crie uma branch para sua feature (`git checkout -b feature/NovoComando`)
3. Faça commit das suas mudanças (`git commit -m 'Adiciona novo comando'`)
4. Push para a branch (`git push origin feature/NovoComando`)
5. Abra um Pull Request

---

## 📝 Adicionar Novos Comandos

Para criar um novo comando, siga este template:

```typescript
import { Command } from "../types/command";
import { WASocket, WAMessage, AnyMessageContent } from "baileys";

const meuComando: Command = {
  name: "meucomando",
  description: "Descrição do comando",
  aliases: ["alias1", "alias2"],
  privateRestricted: false, // true = só privado, false = privado e grupos
  loggable: true, // Registra uso na API
  execute: async (
    sock: WASocket,
    msg: WAMessage,
    args: string[]
  ): Promise<AnyMessageContent | string | null | undefined> => {
    return "Resposta do comando";
  },
};

export default meuComando;
```

Salve o arquivo em `src/commands/meucomando.ts` e o bot carregará automaticamente!

---

## 📊 Dashboard

Acesse o dashboard público para ver estatísticas de uso do bot:

**[https://bti-hp-dashboard.vercel.app/](https://bti-hp-dashboard.vercel.app/)**

---

## ⚠️ Troubleshooting

### Bot não conecta no WhatsApp

- Limpe a pasta `auth_info_baileys` e tente novamente
- Verifique se não há múltiplas sessões ativas no WhatsApp Web
- Atualize o Baileys: `npm install baileys@latest`

### Comandos não funcionam

- Verifique se o bot está online com `!ping`
- Confirme que o comando começa com `!`
- Use `!menu` para ver todos os comandos disponíveis

### Sessão perdida após restart (Docker)

- Certifique-se de que o volume está montado corretamente no `docker-compose.yml`
- Não use `docker-compose down -v` (isso remove os volumes)

---

## ⭐ Deixe uma Estrela!

Se este bot te ajudou, considere dar uma ⭐ no repositório! Isso ajuda a tornar o projeto mais visível para outros estudantes e mostra seu apoio.

---

## 📬 Contato

- **Bot no WhatsApp**: [558486735862](https://wa.me/558486735862?text=!menu)
- **Repositório**: [github.com/Jcassio-dev/bti-help-bot](https://github.com/Jcassio-dev/bti-help-bot)
- **Email**: josecassio2013@gmail.com
- **LinkedIn**: [linkedin.com/in/jcassio-dev](https://www.linkedin.com/in/jcassio-dev)

---
