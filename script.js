class SalesChatbot {
  constructor() {
    this.state = "start";
    this.data = {
      prioridade: null,
      valor: null,
      formado: null,
      prazoTrabalho: null,
      flexibilidade: null,
      microCompromisso: null,
      microCommitCount: 0,
      commitsFeitos: {
        preco: false,
        trabalho: false,
        flexibilidade: false
      },
      ofertaAceita: null,

      // NOVO BLOCO — terceiros
      isThirdParty: null,
      terceiroNome: null,
      terceiroLocalizacao: null,
      terceiroProcesso: null,
      terceiroFamilia: null,
      terceiroFormado: null,
      terceiroPrioridade: null
    };
  }

  normalize(text) {
    return text.toLowerCase().trim();
  }

  getResponse(input) {
    const msg = this.normalize(input);

    switch (this.state) {
      case "start":
        this.state = "ask_self_or_third";
        return `As informações são para você ou para outra pessoa? 😊`;

      case "ask_self_or_third":
        return this.handleSelfOrThird(msg, input);

      // NOVOS ESTADOS — TERCEIROS
      case "thirdparty_name":
        return this.handleThirdPartyName(input);

      case "thirdparty_location":
        return this.handleThirdPartyLocation(msg);

      case "thirdparty_process":
        return this.handleThirdPartyProcess(msg);

      case "thirdparty_family":
        return this.handleThirdPartyFamily(input);

      case "thirdparty_formed":
        return this.handleThirdPartyFormed(msg);

      case "thirdparty_priority":
        return this.handleThirdPartyPriority(msg);

      case "thirdparty_contact_or_link":
        return this.handleThirdPartyContactOrLink(msg);

      case "thirdparty_closed":
        return `Perfeito 👍 se precisar, fico por aqui.`;

      // FLUXO ORIGINAL
      case "ask_prioridade":
        return this.handlePrioridade(msg);

      case "ask_preco":
        return this.handlePreco(msg);

      case "ask_preco_commit":
        return this.handlePrecoCommit(msg);

      case "ask_formado":
        return this.handleFormado(msg);

      case "ask_trabalho_prazo_formado":
        return this.handlePrazoFormado(msg);

      case "ask_trabalho_prazo_nao_formado":
        return this.handlePrazoNaoFormado(msg);

      case "ask_trabalho_commit":
        return this.handleTrabalhoCommit(msg);

      case "ask_flexibilidade":
        return this.handleFlexibilidade(msg);

      case "ask_flexibilidade_commit":
        return this.handleFlexibilidadeCommit(msg);

      case "offer":
        return this.handleOfertaResposta(msg);

      case "hesitation":
        return this.handleHesitation(msg);

      case "closed":
        return `Perfeito! Parabéns pela conquista dessa bolsa 🎉\n\nAgora vou te encaminhar um link do processo seletivo para coletar algumas informações e te direcionar com mais precisão nas próximas etapas.\n\nÉ rápido e vai me ajudar a te apresentar as melhores opções de acordo com o seu perfil 👇\n\nDeixe seu contato/telefone. Qualquer esclarecimento entraremos em contato com você para quitar as suas dúvidas.`;

      default:
        return `Desculpe, não entendi. Vamos recomeçar?\nDigite qualquer coisa para iniciar.`;
    }
  }

  // =========================
  // NOVO BLOCO — TERCEIROS
  // =========================

  handleSelfOrThird(msg, originalInput) {
    if (this.isThirdPartyReference(msg)) {
      this.data.isThirdParty = true;
      this.state = "thirdparty_name";
      return `Entendi 😊 você está buscando essas informações para outra pessoa, certo?\n\nQual é o nome dela(e)?`;
    }

    if (
      msg.includes("pra mim") ||
      msg.includes("para mim") ||
      msg.includes("sou eu") ||
      msg.includes("é para mim") ||
      msg.includes("pra eu") ||
      msg.includes("para eu") ||
      this.isPositive(msg)
    ) {
      this.data.isThirdParty = false;
      this.state = "ask_prioridade";
      return `Perfeito 👍 Hoje, o que é mais importante para você?\n1. Preço\n2. Trabalho\n3. Flexibilidade`;
    }

    return `Só para eu te direcionar certo 😊\nAs informações são para você ou para outra pessoa?`;
  }

  handleThirdPartyName(input) {
    const cleaned = input.trim();
    if (!cleaned) {
      return `Qual é o nome dela(e)?`;
    }

    this.data.terceiroNome = this.capitalizeName(cleaned);
    this.state = "thirdparty_location";
    return `Ela(e) já está nos EUA ou ainda está no Brasil?`;
  }

  handleThirdPartyLocation(msg) {
    if (this.isUsLocation(msg)) {
      this.data.terceiroLocalizacao = "EUA";
      this.state = "thirdparty_process";
      return `Ela(e) já possui visto de estudante ou está pensando em fazer troca de status?`;
    }

    if (this.isBrazilOrOutsideUs(msg)) {
      this.data.terceiroLocalizacao = "Brasil";
      this.state = "thirdparty_process";
      return `Ela(e) pretende ir já com visto de estudante ou ainda está avaliando?`;
    }

    return `Só para eu entender certinho 😊 ela(e) já está nos EUA ou ainda está no Brasil?`;
  }

  handleThirdPartyProcess(msg) {
    if (
      msg.includes("visto de estudante") ||
      msg.includes("f1") ||
      msg.includes("já tem visto") ||
      msg.includes("ja tem visto") ||
      msg.includes("já possui visto") ||
      msg.includes("ja possui visto")
    ) {
      this.data.terceiroProcesso = "TRANSFER";
    } else if (
      msg.includes("troca de status") ||
      msg.includes("mudar de status") ||
      msg.includes("mudança de status") ||
      msg.includes("mudanca de status") ||
      msg.includes("avaliando") ||
      msg.includes("ainda está avaliando") ||
      msg.includes("ainda esta avaliando") ||
      msg.includes("não tem visto") ||
      msg.includes("nao tem visto") ||
      msg.includes("turista") ||
      msg.includes("b1") ||
      msg.includes("b2")
    ) {
      this.data.terceiroProcesso = "COS";
    } else {
      this.data.terceiroProcesso = "A DEFINIR";
    }

    this.state = "thirdparty_family";
    return `Ela(e) iria sozinha ou com família?`;
  }

  handleThirdPartyFamily(input) {
    const msg = this.normalize(input);

    if (
      msg.includes("família") ||
      msg.includes("familia") ||
      msg.includes("com família") ||
      msg.includes("com familia") ||
      msg.includes("marido") ||
      msg.includes("esposa") ||
      msg.includes("filho") ||
      msg.includes("filha")
    ) {
      this.data.terceiroFamilia = "com família";
    } else if (
      msg.includes("sozinha") ||
      msg.includes("sozinho") ||
      msg.includes("sozinho(a)") ||
      msg.includes("só") ||
      msg.includes("so")
    ) {
      this.data.terceiroFamilia = "sozinha";
    } else {
      this.data.terceiroFamilia = input.trim();
    }

    this.state = "thirdparty_formed";
    return `Ela(e) já é formada?`;
  }

  handleThirdPartyFormed(msg) {
    if (
      this.isNegative(msg) ||
      msg.includes("cursando") ||
      msg.includes("estudando") ||
      msg.includes("ainda não") ||
      msg.includes("ainda nao") ||
      msg.includes("faculdade") ||
      msg.includes("em andamento")
    ) {
      this.data.terceiroFormado = "não";
      this.state = "thirdparty_priority";
      return `E hoje, o que pesa mais para ela(e)?\n1. Trabalho\n2. Custo\n3. Flexibilidade`;
    }

    if (
      this.isPositive(msg) ||
      msg.includes("formada") ||
      msg.includes("formado") ||
      msg.includes("já é") ||
      msg.includes("ja e")
    ) {
      this.data.terceiroFormado = "sim";
      this.state = "thirdparty_priority";
      return `E hoje, o que pesa mais para ela(e)?\n1. Trabalho\n2. Custo\n3. Flexibilidade`;
    }

    return `Ela(e) já é formada? Responda com sim ou não.`;
  }

  handleThirdPartyPriority(msg) {
    if (msg.includes("1") || msg.includes("trabalho")) {
      this.data.terceiroPrioridade = "trabalho";
    } else if (msg.includes("2") || msg.includes("custo") || msg.includes("preço") || msg.includes("preco")) {
      this.data.terceiroPrioridade = "custo";
    } else if (msg.includes("3") || msg.includes("flexibilidade") || msg.includes("flex")) {
      this.data.terceiroPrioridade = "flexibilidade";
    } else {
      return `Me responde com uma dessas opções:\n1. Trabalho\n2. Custo\n3. Flexibilidade`;
    }

    this.state = "thirdparty_contact_or_link";
    return `Perfeito 😊 como algumas opções dependem bastante do perfil da pessoa, o ideal é falar direto com ela(e) para orientar da forma certa.\n\nVocê prefere me passar o contato dela(e) ou encaminhar o link para ela(e)?`;
  }

  handleThirdPartyContactOrLink(msg) {
    if (
      msg.includes("contato") ||
      msg.includes("número") ||
      msg.includes("numero") ||
      msg.includes("whatsapp") ||
      msg.includes("vou passar") ||
      msg.includes("te passo")
    ) {
      this.state = "thirdparty_closed";
      return `Perfeito 👍 me envie o contato dela(e) e seguimos por aqui.`;
    }

    if (
      msg.includes("link") ||
      msg.includes("encaminhar") ||
      msg.includes("manda") ||
      msg.includes("pode enviar")
    ) {
      this.state = "thirdparty_closed";
      return `Perfeito 👍 então você pode encaminhar o link para ela(e), e assim seguimos com as informações corretas de acordo com o perfil.`;
    }

    return `Você prefere me passar o contato dela(e) ou encaminhar o link para ela(e)?`;
  }

  isThirdPartyReference(msg) {
    const thirdPartyWords = [
      "irmã", "irma", "irmão", "irmao",
      "amigo", "amiga",
      "filho", "filha",
      "prima", "primo",
      "sobrinha", "sobrinho",
      "marido", "esposa",
      "namorado", "namorada",
      "outra pessoa",
      "terceiro",
      "para ela",
      "pra ela",
      "para ele",
      "pra ele"
    ];

    return thirdPartyWords.some(word => msg.includes(word));
  }

  isUsLocation(msg) {
    const usTerms = [
      "eua", "usa", "estados unidos",
      "miami", "orlando", "florida", "califórnia", "california",
      "texas", "new york", "nova york", "boston", "new jersey", "jersey"
    ];

    return usTerms.some(term => msg.includes(term));
  }

  isBrazilOrOutsideUs(msg) {
    const nonUsTerms = [
      "brasil", "brazil", "ainda não", "ainda nao", "não está", "nao esta",
      "fora dos eua", "aqui no brasil"
    ];

    return nonUsTerms.some(term => msg.includes(term)) || !this.isUsLocation(msg);
  }

  capitalizeName(name) {
    return name
      .toLowerCase()
      .split(" ")
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  // =========================
  // FLUXO ORIGINAL
  // =========================

  handlePrioridade(msg) {
    if (msg.includes("1") || msg.includes("preço") || msg.includes("preco")) {
      this.data.prioridade = "preço";
      this.state = "ask_preco";
      return `Hoje essas escolas variam entre $500 e $2000 por mês.\nQual valor você se sente mais confortável investindo?`;
    }

    if (msg.includes("2") || msg.includes("trabalho")) {
      this.data.prioridade = "trabalho";
      this.state = "ask_formado";
      return `Você já é formado(a)?`;
    }

    if (msg.includes("3") || msg.includes("flexibilidade")) {
      this.data.prioridade = "flexibilidade";
      this.state = "ask_flexibilidade";
      return `Hoje você prefere aulas:\n\n1. Uma vez por semana\n\n2. Uma vez por mês\n\n3. Quanto menos presencial melhor`;
    }

    return `Me responde com uma dessas opções:\n1. Preço\n2. Trabalho\n3. Flexibilidade`;
  }

  handlePreco(msg) {
    const number = this.extractNumber(msg);

    if (!number) {
      return `Me diga um valor aproximado dentro dessa faixa, por exemplo: 500, 800, 1000...`;
    }

    this.data.valor = number;
    this.state = "ask_preco_commit";
    return `Perfeito 👍 então se eu encontrar uma opção dentro desse valor, faz sentido para você seguir?`;
  }

  handlePrecoCommit(msg) {
    if (this.isPositive(msg)) {
      this.data.microCompromisso = "sim";
      this.registerCommit("preco");
      return this.nextStepAfterCommit();
    }

    if (this.isNegative(msg)) {
      this.data.microCompromisso = "não";
      this.state = "hesitation";
      return `Sem problema 😊 O que você gostaria de ajustar melhor: valor, flexibilidade ou prazo para trabalho?`;
    }

    return `Só para eu te direcionar certo: se eu encontrar uma opção dentro desse valor, faz sentido para você seguir?`;
  }

  handleFormado(msg) {
    if (
      this.isNegative(msg) ||
      msg.includes("cursando") ||
      msg.includes("estudando") ||
      msg.includes("ainda não") ||
      msg.includes("não ainda") ||
      msg.includes("nao ainda") ||
      msg.includes("faculdade") ||
      msg.includes("terminando") ||
      msg.includes("em andamento")
    ) {
      this.data.formado = "não";
      this.state = "ask_trabalho_prazo_nao_formado";
      return `Boa 👍 você gostaria de começar a trabalhar em 9 meses ou em 1 ano?`;
    }

    if (this.isPositive(msg) || msg.includes("já sou") || msg.includes("formado")) {
      this.data.formado = "sim";
      this.state = "ask_trabalho_prazo_formado";
      return `Perfeito 👀 você gostaria de começar a trabalhar a partir do primeiro dia de aula ou depois de 9 meses?`;
    }

    return `Você já é formado(a)? Responda com sim ou não.`;
  }

  handlePrazoFormado(msg) {
    if (
      msg.includes("primeiro") ||
      msg.includes("imediato") ||
      msg.includes("dia") ||
      msg.includes("antes")
    ) {
      this.data.prazoTrabalho = "autorização de trabalho desde o primeiro dia";
      this.state = "ask_trabalho_commit";
      return `Perfeito 👀 você busca algo com autorização de trabalho desde o primeiro dia.\nSe eu conseguir uma opção assim, faz sentido para você seguir?`;
    }

    if (msg.includes("9")) {
      this.data.prazoTrabalho = "9 meses";
      this.state = "ask_trabalho_commit";
      return `Se eu conseguir uma faculdade onde você pode começar a trabalhar nesse prazo, faz sentido para você seguir?`;
    }

    return `Você prefere começar a trabalhar desde o primeiro dia ou depois de 9 meses?`;
  }

  handlePrazoNaoFormado(msg) {
    if (
      msg.includes("antes") ||
      msg.includes("rápido") ||
      msg.includes("rapido") ||
      msg.includes("quanto antes") ||
      msg.includes("o quanto antes")
    ) {
      this.data.prazoTrabalho = "o quanto antes";
      this.state = "ask_trabalho_commit";
      return `Perfeito 👀 então você quer acelerar ao máximo o início.\nSe eu conseguir uma opção que permita isso, faz sentido para você seguir?`;
    }

    if (
      msg.includes("não precisa ser agora") ||
      msg.includes("nao precisa ser agora") ||
      msg.includes("pode ser depois") ||
      msg.includes("sem pressa")
    ) {
      this.data.prazoTrabalho = "1 ano";
      this.state = "ask_trabalho_commit";
      return `Perfeito 👍 então você está confortável com um prazo mais tranquilo.\nSe eu encontrar uma opção assim, faz sentido para você seguir?`;
    }

    if (msg.includes("9")) {
      this.data.prazoTrabalho = "9 meses";
      this.state = "ask_trabalho_commit";
      return `Se eu conseguir uma faculdade onde você pode começar a trabalhar nesse prazo, faz sentido para você seguir?`;
    }

    if (msg.includes("1 ano") || msg.includes("um ano") || msg === "1") {
      this.data.prazoTrabalho = "1 ano";
      this.state = "ask_trabalho_commit";
      return `Se eu conseguir uma faculdade onde você pode começar a trabalhar nesse prazo, faz sentido para você seguir?`;
    }

    return `Só para eu entender melhor 👇\nvocê prefere começar em 9 meses ou em 1 ano?`;
  }

  handleTrabalhoCommit(msg) {
    if (this.isPositive(msg)) {
      this.data.microCompromisso = "sim";
      this.registerCommit("trabalho");
      return this.nextStepAfterCommit();
    }

    if (this.isNegative(msg)) {
      this.data.microCompromisso = "não";
      this.state = "hesitation";
      return `Sem problema 😊 O que você gostaria de entender melhor sobre essa possibilidade?`;
    }

    return `Só para confirmar: se eu conseguir uma faculdade com esse prazo, faz sentido para você seguir?`;
  }

  handleFlexibilidade(msg) {
    if (
      msg.includes("3") ||
      msg.includes("quanto menos") ||
      msg.includes("menos presencial") ||
      msg.includes("mais flex") ||
      msg.includes("mais flexível") ||
      msg.includes("mais flexivel") ||
      msg.includes("flexível") ||
      msg.includes("flexivel") ||
      msg.includes("quase nada presencial") ||
      msg.includes("não ir muito") ||
      msg.includes("nao ir muito") ||
      msg.includes("o quanto antes") ||
      msg.includes("quanto antes") ||
      msg.includes("melhor") ||
      msg.includes("menos melhor")
    ) {
      this.data.flexibilidade = "mínima presencial";
      this.state = "ask_flexibilidade_commit";
      return `Perfeito 👍 então se eu encontrar uma opção com o mínimo possível de presencial, faz sentido para você?`;
    }

    if (
      msg.includes("2") ||
      msg.includes("mês") ||
      msg.includes("mes") ||
      msg.includes("uma vez por mês") ||
      msg.includes("1 vez por mês") ||
      msg.includes("1x por mês") ||
      msg.includes("1x por mes") ||
      msg.includes("mensal") ||
      msg.includes("não precisa ser agora") ||
      msg.includes("nao precisa ser agora") ||
      msg.includes("pode ser depois") ||
      msg.includes("sem pressa") ||
      msg.includes("mais tranquilo")
    ) {
      this.data.flexibilidade = "1x por mês";
      this.state = "ask_flexibilidade_commit";
      return `Perfeito 👍 então se eu encontrar uma opção com esse nível de flexibilidade, faz sentido para você?`;
    }

    if (
      msg.includes("1") ||
      msg.includes("semana") ||
      msg.includes("semanal") ||
      msg.includes("uma vez por semana") ||
      msg.includes("1 vez por semana") ||
      msg.includes("1x por semana")
    ) {
      this.data.flexibilidade = "1x por semana";
      this.state = "ask_flexibilidade_commit";
      return `Perfeito 👍 então se eu encontrar uma opção com esse nível de flexibilidade, faz sentido para você?`;
    }

    if (
      msg.includes("tanto faz") ||
      msg.includes("qualquer um") ||
      msg.includes("não me importo") ||
      msg.includes("nao me importo") ||
      msg.includes("indiferente")
    ) {
      this.data.flexibilidade = "1x por mês";
      this.state = "ask_flexibilidade_commit";
      return `Perfeito 👍 então vou considerar uma opção equilibrada e flexível. Faz sentido para você?`;
    }

    return `Só para eu te direcionar melhor 👇\nvocê prefere:\n1. Uma vez por semana\n2. Uma vez por mês\n3. Quanto menos presencial melhor`;
  }

  handleFlexibilidadeCommit(msg) {
    if (this.isPositive(msg)) {
      this.data.microCompromisso = "sim";
      this.registerCommit("flexibilidade");
      return this.nextStepAfterCommit();
    }

    if (this.isNegative(msg)) {
      this.data.microCompromisso = "não";
      this.state = "hesitation";
      return `Sem problema 😊 Qual nível de flexibilidade faria mais sentido para você?`;
    }

    return `Só para confirmar: se eu encontrar uma opção com esse nível de flexibilidade, faz sentido para você?`;
  }

  registerCommit(area) {
    if (!this.data.commitsFeitos[area]) {
      this.data.commitsFeitos[area] = true;
      this.data.microCommitCount += 1;
    }
  }

  nextStepAfterCommit() {
    if (!this.data.commitsFeitos.preco) {
      this.state = "ask_preco";
      return `Perfeito 👀 agora quero alinhar investimento para te mostrar algo que realmente faça sentido.\nHoje essas escolas variam entre $500 e $2000 por mês.\nQual valor você se sente mais confortável investindo?`;
    }

    if (!this.data.commitsFeitos.trabalho) {
      this.state = "ask_formado";
      return `Perfeito 👍 agora me conta sobre a parte de trabalho.\nVocê já é formado(a)?`;
    }

    if (!this.data.commitsFeitos.flexibilidade) {
      this.state = "ask_flexibilidade";
      return `Ótimo 👌 agora só preciso alinhar a flexibilidade ideal para você.\nHoje você prefere aulas:\n1. Uma vez por semana\n2. Uma vez por mês\n3. Quanto menos presencial melhor`;
    }

    this.state = "offer";
    return this.buildOffer();
  }

  buildOffer() {
    const prazo = this.data.prazoTrabalho || "9 meses";
    const flex = this.data.flexibilidade || "mínima presencial";
    const valor = this.data.valor || 500;

    return (
      `Perfeito 👀 agora sim encontrei uma oportunidade alinhada com tudo o que você me falou.\n\n` +
      `Resumo do que faz sentido para você:\n` +
      `✔ Investimento próximo de $${valor}/mês\n` +
      `✔ Possibilidade de trabalho em ${prazo}\n` +
      `✔ Formato de aula com ${flex}\n\n` +
      `Deixa eu te explicar rapidinho como funciona 👇\n\n` +
      `Hoje, no processo seletivo, você pode ter acesso a até 4 opções de bolsas diferentes.\n` +
      `A gente faz essa filtragem com base no seu perfil para encontrar as melhores oportunidades disponíveis no momento.\n\n` +
      `Por exemplo: já tivemos alunos que entraram com uma opção inicial e acabaram escolhendo entre 3 ou 4 bolsas diferentes, inclusive com valores mais baixos do que esperavam.\n\n` +
      `O processo é simples:\n` +
      `1. Você faz uma pré-candidatura (leva menos de 5 minutos)\n` +
      `2. A gente analisa seu perfil\n` +
      `3. Te apresenta as melhores opções de bolsa, curso e unidade\n\n` +
      `Isso evita que você escolha errado ou pague mais caro do que deveria.\n\n` +
      `Agora me diz 👇\nFaz sentido para você seguir com essa opção?`
    );
  }

  handleOfertaResposta(msg) {
    if (this.isPositive(msg)) {
      this.data.ofertaAceita = "sim";
      this.state = "closed";
      return `Perfeito! Parabéns pela conquista dessa bolsa 🎉\n\nAgora vou te encaminhar um link do processo seletivo para coletar algumas informações e te direcionar com mais precisão nas próximas etapas.\n\nÉ rápido e vai me ajudar a te apresentar as melhores opções de acordo com o seu perfil 👇\n\nDeixe seu contato/telefone. Qualquer esclarecimento entraremos em contato com você para quitar as suas dúvidas.`;
    }

    if (this.isNegative(msg) || msg.includes("dúvida") || msg.includes("duvida")) {
      this.state = "hesitation";
      return `Sem problema 😊 me fala sua principal dúvida que eu te explico de forma rápida e objetiva.`;
    }

    return `Faz sentido para você seguir com essa opção?`;
  }

  handleHesitation(msg) {
    if (msg.includes("valor") || msg.includes("preço") || msg.includes("preco")) {
      this.state = "ask_preco";
      return `Claro 👍 vamos ajustar essa parte.\nQual valor mensal faria mais sentido para você dentro da faixa de $500 a $2000?`;
    }

    if (msg.includes("trabalho")) {
      this.state = "ask_formado";
      return `Perfeito, vamos por essa parte.\nVocê já é formado(a)?`;
    }

    if (msg.includes("flex")) {
      this.state = "ask_flexibilidade";
      return `Sem problema.\nHoje você prefere aulas:\n1. Uma vez por semana\n2. Uma vez por mês\n3. Quanto menos presencial melhor`;
    }

    this.state = "offer";
    return `Entendi 😊 me diz o que você gostaria de entender melhor: valor, trabalho ou flexibilidade?`;
  }

  isPositive(msg) {
    const positives = [
      "sim",
      "isso",
      "perfeito",
      "ok",
      "okay",
      "claro",
      "quero",
      "gostei",
      "pode ser",
      "faz sentido",
      "top",
      "fechado",
      "bora",
      "vamos",
      "com certeza",
      "yes",
      "yep",
      "sure",
      "faria"
    ];

    return positives.some(word => msg.includes(word));
  }

  isNegative(msg) {
    const negatives = [
      "não",
      "nao",
      "talvez",
      "acho que não",
      "acho que nao",
      "não sei",
      "nao sei",
      "not",
      "no"
    ];

    return negatives.some(word => msg.includes(word));
  }

  extractNumber(msg) {
    const match = msg.match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
  }
}

function getFollowUp(minutesWithoutResponse) {
  if (minutesWithoutResponse >= 1440) {
    return "Ainda quer seguir com essa oportunidade ou prefere ver outras opções?";
  }

  if (minutesWithoutResponse >= 60) {
    return "Essa oportunidade costuma ter bastante procura. Quer que eu te mostre o próximo passo?";
  }

  if (minutesWithoutResponse >= 5) {
    return "Faz sentido para você seguir por aqui?";
  }

  return null;
}

let bot = new SalesChatbot();
let dateInserted = false;

const chat = document.getElementById("chat");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const resetBtn = document.getElementById("resetBtn");
const followBtn = document.getElementById("followBtn");

function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function addDateDivider() {
  if (dateInserted) return;

  const div = document.createElement("div");
  div.className = "date-divider";
  div.textContent = "Hoje";
  chat.appendChild(div);
  dateInserted = true;
}

function addMessage(text, sender) {
  addDateDivider();

  const row = document.createElement("div");
  row.className = `message-row ${sender === "user" ? "user-row" : "bot-row"}`;

  const group = document.createElement("div");
  group.className = `message-group ${sender === "user" ? "user-group" : ""}`;

  const avatar = document.createElement("div");
  avatar.className = `bubble-avatar ${sender}`;
  avatar.textContent = sender === "user" ? "VC" : "TF";

  const contentWrap = document.createElement("div");

  const bubble = document.createElement("div");
  bubble.className = `message ${sender}`;
  bubble.textContent = text;

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.textContent = sender === "user" ? `${getCurrentTime()} • Visto` : getCurrentTime();

  contentWrap.appendChild(bubble);
  contentWrap.appendChild(meta);

  group.appendChild(avatar);
  group.appendChild(contentWrap);
  row.appendChild(group);

  chat.appendChild(row);
  chat.scrollTop = chat.scrollHeight;
}

function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";

  const response = bot.getResponse(text);

  setTimeout(() => {
    addMessage(response, "bot");
  }, 250);
}

function startBot() {
  chat.innerHTML = "";
  dateInserted = false;
  bot = new SalesChatbot();

  const firstMessage = bot.getResponse("iniciar");
  addMessage(firstMessage, "bot");
}

sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});

resetBtn.addEventListener("click", startBot);

followBtn.addEventListener("click", () => {
  const msg = getFollowUp(60);
  if (msg) addMessage(msg, "bot");
});

window.addEventListener("load", startBot);
