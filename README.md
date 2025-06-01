# BTI HELP BOT

## Sobre

BTI Help Bot é um bot criado para ajudar os estudantes do BTI com várias tarefas.

[Clique aqui para enviar uma mensagem](https://wa.me/558486735862?text=!help)

## Descrição do Bot

O bot é construído usando Node.js e é projetado para ser fácil de usar e extensível. Ele usa uma arquitetura baseada em comandos, o que significa que você pode facilmente adicionar novos comandos ao bot.

## Como Rodar

1. Clone o repositório
2. Instale as dependências com `npm install`
3. Inicie o bot com `npm run dev`
   _Recomendo fortemente o uso de dev quando estiver rodando localmente para evitar ser banido por spam_
4. Logue com o whatsapp web

## Wiki dos Comandos

Os comandos disponíveis são:

| Comando                                         | Descrição                                                   |
| ----------------------------------------------- | ----------------------------------------------------------- |
| `!ru`                                           | Mostra o cardápio do RU                                     |
| `!grade <cc or es or i or n>`                   | Mostra a grade referente ao ciclo                           |
| `!calendário`                                   | Mostra o calendário acadêmico                               |
| `!circular`                                     | Mostra a tabela com os horários dos circulares              |
| `!editais`                                      | Mostra os editais do metrópole que estão abertos            |
| `!faltas`                                       | Mostra quantas faltas você pode tomar em cada carga horária |
| `!horarios <matutino or vespertino or noturno>` | Mostra os horários de cada turno                            |
| `!jobs`                                         | Mostra as vagas abertas no JerimumJobs                      |
| `!ping`                                         | Se o código estiver funcionando, será respondido um pong    |
| `!repo`                                         | Retorna o repositório que o usuário está utilizando         |

## Estrutura do Projeto

O projeto está organizado da seguinte maneira:

```
bti-help-bot/
├── src/
│   ├── commands/
│   │   ├── calendario.ts
│   │   ├── circular.ts
│   │   ├── editais.ts
│   │   ├── faltas.ts
│   │   ├── grade.ts
│   │   ├── horarios.ts
│   │   ├── jobs.ts
│   │   ├── menu.ts
│   │   ├── ping.ts
│   │   └── repositorio.ts
│   ├── core/
│   │   ├── bot.ts
│   │   └── handlers.ts
│   ├── resources/
│   │   ├── docs/
│   │   │   └── calendario2025.pdf
│   │   └── imgs/
│   │       ├── grade-cc.jpeg
│   │       ├── grade-es.jpeg
│   │       ├── grade-geral-i.jpeg
│   │       ├── grade-geral.jpeg
│   │       └── horarios-ufrn.jpeg
│   ├── types/
│   │   └── command.ts
│   └── index.ts
├── content/      <-- (Se você moveu 'resources' para 'content' como nos comandos recentes)
│   ├── docs/
│   │   └── calendario2025.pdf
│   └── imgs/
│       ├── grade-cc.jpeg
│       ├── grade-es.jpeg
│       ├── grade-geral-i.jpeg
│       ├── grade-geral.jpeg
│       └── horarios-ufrn.jpeg
├── node_modules/
├── .env            (Exemplo, se você usar)
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Como Contribuir

Contribuições são bem-vindas! Aqui estão algumas maneiras de contribuir:

- Reportar bugs
- Propor novas funcionalidades
- Adicionar novos comandos
- Melhorar a documentação

Para contribuir, faça um fork do repositório, faça suas alterações e envie um pull request.

## :star: Deixe uma Estrela!

Se você usa e gosta do BTI Help Bot, por favor, considere dar uma estrela ao projeto no GitHub! Isso ajuda a tornar o projeto mais visível para outros usuários e mostra seu apoio. :smile:
