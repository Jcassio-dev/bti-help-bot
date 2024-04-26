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
*Recomendo fortemente o uso de dev quando estiver rodando localmente para evitar ser banido por spam*
4. Logue com o whatsapp web

## Wiki dos Comandos

Os comandos disponíveis são:

| Comando | Descrição |
|---------|-----------|
| `!ru`   | Mostra o cardápio do RU |
| `!fim`  | Mostra quantos dias restam até o fim do semestre |
| `!grade <cc or es or i or n>` | Mostra a grade referente ao ciclo  |
| `!calendário` | Mostra o calendário acadêmico  |
| `!circular` | Mostra a tabela com os horários dos circulares |
| `!editais` | Mostra os editais do metrópole que estão abertos |
| `!faltas` | Mostra quantas faltas você pode tomar em cada carga horária |
| `!horarios <matutino or vespertino or noturno>` | Mostra os horários de cada turno |
| `!jobs` | Mostra as vagas abertas no JerimumJobs |
| `!ping` | Se o código estiver funcionando, será respondido um pong |

## Estrutura do Projeto

O projeto está organizado da seguinte maneira:

- `src/`: Esta é a pasta principal que contém todo o código fonte do bot.
  - `handlers/`: Esta pasta contém os manipuladores de eventos para diferentes tipos de mensagens.
  - `commands/`: Esta pasta contém os comandos que o bot pode executar.
  - `scrappings/`: Esta pasta contém os comandos de scrapping quando o bot é iniciado.
  - `util/`: Esta pasta contém funções utilitárias que são usadas em todo o projeto.
- `tests/`: Esta pasta contém todos os testes do projeto.
- `content/`: Esta pasta contém os arquivos de mídia utilizados no projeto.
- `package.json`: Este arquivo contém a lista de dependências do projeto e scripts npm.
- `README.md`: Este arquivo (o que você está lendo agora) contém a documentação do projeto.

Cada pasta contém um arquivo `index.js` que exporta todas as funções daquela pasta. Isso facilita a importação de funções de diferentes partes do projeto.

## Como Contribuir

Contribuições são bem-vindas! Aqui estão algumas maneiras de contribuir:

- Reportar bugs
- Propor novas funcionalidades
- Adicionar novos comandos
- Melhorar a documentação

Para contribuir, faça um fork do repositório, faça suas alterações e envie um pull request.

## :star: Deixe uma Estrela!

Se você usa e gosta do BTI Help Bot, por favor, considere dar uma estrela ao projeto no GitHub! Isso ajuda a tornar o projeto mais visível para outros usuários e mostra seu apoio. :smile:

_powered by @danluan & @Jcassio-dev_ 
