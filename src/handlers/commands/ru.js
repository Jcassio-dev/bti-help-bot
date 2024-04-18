const foods =  require('../../util/foods');

function getRandomFood() {
  const {proteins, sideDishes, sauces, desserts} = foods;

  const protein = proteins[Math.floor(Math.random() * proteins.length)];
  const sauce = sauces[Math.floor(Math.random() * sauces.length)]
  const sideDish = sideDishes[Math.floor(Math.random() * sideDishes.length)];
  const dessert = desserts[Math.floor(Math.random() * desserts.length)];

  return {
    protein,
    sauce,
    sideDish,
    dessert,
  };
}

module.exports = async (msg) => {
  // const { ruCardapio } = global.appContext;

  // if (!ruCardapio || !ruCardapio.length || !ruCardapio.almoco && !ruCardapio.jantar) {
  //   const { protein: proteinAlmoco, sideDish: sideDishAlmoco, sauce: sauceAlmoco, dessert: dessertAlmoco } = getRandomFood();
  //   const { protein: proteinJantar, sideDish: sideDishJantar, sauce: sauceJantar, dessert: dessertJantar } = getRandomFood();

  //   await msg.reply(
  //     `Não foi possível buscar o cardápio do RU. Tente novamente mais tarde.\nMas com base em cálculos sofisticados, *SUPONHO* que será:\n\n*ALMOÇO*\n_Proteína_: ${proteinAlmoco}\n_molho_: ${sauceAlmoco}\n_Acompanhamento_: ${sideDishAlmoco}\n_Sobremesa_: ${dessertAlmoco}\n\n*JANTAR*\n_Proteína_: ${proteinJantar}\n_molho_: ${sauceJantar}\n_Acompanhamento_: ${sideDishJantar}\n_Sobremesa_: ${dessertJantar}`
  //   );
  //   return;
  // }
  const menu = JSON.parse(ruCardapio);

  menu[almoco] = {
    "proteinas": "Frango assado",
    "acompanhamentos": "Arroz refogado/Arroz integral, Feijão Carioca, Farofa de alho / Cuscuz com ovo cozido",
    "suco": "goiaba",
    "vegetariano": "Soja refogada com legumes",
  }


  let message = `*Cardápio do RU*\n*Com base no Stories do Instagram\n`;

  Object.entries(menu).forEach(([meal, types]) => {
    if (meal === "cafe") return;
    message += `*${meal.toUpperCase()}*\n`;
    Object.entries(types).forEach(([type, items]) => {
      message += `_${type}_: ${items}\n`;
    });
    message += "\n\n";
  });

  await msg.reply(message);
};
