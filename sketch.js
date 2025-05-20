let gotas = [];
let solo;
let tipoSolo = "vegetacao"; // valor inicial
let arvores = [];
let capivaras = [];
let passarinhos = [];
let construcoes = [];
let particulas = [];
let nivelAgua = 0; // Nível da água inicial
let alagamentoAtivo = false; // Controle de ativação do alagamento

function setup() {
  let canvas = createCanvas(600, 400);
  canvas.parent("canvas-holder");
  solo = new Solo(tipoSolo);

  if (tipoSolo === "vegetacao") {
    for (let i = 0; i < 3; i++) {
      let x = random(50, width - 50);
      arvores.push(new Araucaria(x, solo));
    }
    for (let i = 0; i < 2; i++) {
      let x = random(50, width - 50);
      let y = solo.altura - 10;
      capivaras.push(new Capivara(x, y, solo));
    }
  }
  for (let i = 0; i < 5; i++) {
    passarinhos.push(new Passarinho(tipoSolo));
  }
}

function draw() {
  background(200, 220, 255);

  for (let i = gotas.length - 1; i >= 0; i--) {
    gotas[i].cair();
    gotas[i].mostrar();

    if (gotas[i].atingeSolo(solo.altura)) {
      solo.aumentarErosao(arvores);
      gotas.splice(i, 1);
    }
  }

  solo.mostrar();

  for (let arvore of arvores) {
    arvore.mostrar();
  }
  for (let capivara of capivaras) {
    capivara.mostrar();
  }

  if (solo.tipo === "exposto") {
    for (let passarinho of passarinhos) {
      passarinho.voar();
      passarinho.mostrar();
    }
  }

  if (solo.tipo === "urbanizado") {
    for (let construcao of construcoes) {
      construcao.mostrar();
      if (construcao.tipo === 2) {
        for (let i = 0; i < 2; i++) {
          particulas.push(new ParticulaFumaca(construcao.x + construcao.largura / 3, construcao.y - 10));
        }
      }
    }
  }

  for (let i = particulas.length - 1; i >= 0; i--) {
    particulas[i].atualizar();
    particulas[i].mostrar();
    if (particulas[i].alpha <= 0) {
      particulas.splice(i, 1);
    }
  }

  if (frameCount % 5 === 0) {
    gotas.push(new Gota());
  }

  // Alagamento: aumenta o nível da água gradualmente se ativado
  if (alagamentoAtivo) {
    nivelAgua += 0.5; // Aumenta a velocidade do alagamento
    if (nivelAgua > height - 80) {
      nivelAgua = height - 80; // Nível máximo da água
    }
  }

  // Desenha a água do alagamento
  if (nivelAgua > 0) {
    fill(0, 0, 255, 150); // Cor da água com transparência
    rect(0, nivelAgua, width, height - nivelAgua);
  }
}

function setSoilType(tipo) {
  tipoSolo = tipo;
  solo = new Solo(tipoSolo);
  arvores = [];
  capivaras = [];
  passarinhos = [];
  construcoes = [];
  particulas = [];
  nivelAgua = 0; // Reseta o nível da água ao mudar o tipo de solo
  alagamentoAtivo = false; // Desativa o alagamento ao mudar o tipo de solo

  if (tipoSolo === "vegetacao") {
    for (let i = 0; i < 3; i++) {
      let x = random(50, width - 50);
      arvores.push(new Araucaria(x, solo));
    }
    for (let i = 0; i < 2; i++) {
      let x = random(50, width - 50);
      let y = solo.altura - 10;
      capivaras.push(new Capivara(x, y, solo));
    }
  } else if (tipoSolo === "exposto") {
    for (let i = 0; i < 5; i++) {
      passarinhos.push(new Passarinho(tipoSolo));
    }
  } else if (tipoSolo === "urbanizado") {
    for (let i = 0; i < 5; i++) {
      let x = random(50, width - 50);
      let y = solo.altura - 10;
      let tipo = floor(random(3));
      construcoes.push(new Construcao(x, y, solo, tipo));
    }
  }
}

function toggleAlagamento() {
  alagamentoAtivo = !alagamentoAtivo; // Ativa ou desativa o alagamento
  if (!alagamentoAtivo) {
    nivelAgua = 0; // Reseta o nível da água quando desativado
  }
}

class Gota {
  constructor() {
    this.x = random(width);
    this.y = 0;
    this.vel = random(4, 6);
  }

  cair() {
    this.y += this.vel;
  }

  mostrar() {
    stroke(0, 0, 200);
    line(this.x, this.y, this.x, this.y + 10);
  }

  atingeSolo(ySolo) {
    return this.y > ySolo;
  }
}

class Solo {
  constructor(tipo) {
    this.tipo = tipo;
    this.altura = height - 80;
    this.erosao = 0;
    this.corSolo = color(60, 150, 60);
  }

  aumentarErosao(arvores) {
    let taxa = 0;
    if (this.tipo === "vegetacao") {
      if (arvores.length > 0) {
        taxa = 0.05;
      } else {
        taxa = 0.1;
      }
    } else if (this.tipo === "exposto") {
      taxa = 0.5;
    } else if (this.tipo === "urbanizado") {
      taxa = 0.2;
    }

    this.erosao += taxa;
    this.altura += taxa;

    if (this.tipo === "exposto") {
      this.corSolo = lerpColor(color(139, 69, 19), color(100, 50, 0), Math.min(1, this.erosao / 50));
    } else if (this.tipo === "vegetacao") {
      this.corSolo = color(60, 150, 60);
    } else if (this.tipo === "urbanizado") {
      this.corSolo = color(120);
    }
  }

  mostrar() {
    noStroke();
    fill(this.corSolo);
    rect(0, this.altura, width, height - this.altura);

    if (this.tipo === "exposto") {
      fill(100, 50, 0, 100 + this.erosao * 2);
      rect(0, this.altura, width, height - this.altura);
    }

    fill(0);
    textSize(14);
    textAlign(LEFT);
    text(`Erosão: ${this.erosao.toFixed(1)}`, 10, 20);
    text(`Tipo de solo: ${this.tipo}`, 10, 40);
  }
}

class Araucaria {
  constructor(x, solo) {
    this.x = x;
    this.solo = solo;
    this.alturaTroncoInicial = 40;
    this.larguraTronco = 10;
    this.alturaCopaInicial = 60;
    this.larguraCopa = 50;
    this.saudavel = true;
    this.corTronco = color(139, 69, 19);
    this.corCopa = color(0, 100, 0);
    this.murchando = 0;
  }

  mostrar() {
    let alturaSoloAtual = this.solo.altura;
    let alturaBaseSoloInicial = height - 80;
    let proporcao = alturaSoloAtual / alturaBaseSoloInicial;

    this.alturaTronco = this.alturaTroncoInicial * proporcao;
    this.alturaCopa = this.alturaCopaInicial * proporcao;
    this.y = alturaSoloAtual;

    if (this.alturaTronco < 0) this.alturaTronco = 0;
    if (this.alturaCopa < 0) this.alturaCopa = 0;

    if (this.solo.tipo === "exposto") {
      this.murchando += 0.02;
      this.saudavel = this.murchando < 1;

      this.corTronco = lerpColor(color(139, 69, 19), color(100, 50, 0), Math.min(1, this.murchando));
      this.corCopa = lerpColor(color(0, 100, 0), color(200, 200, 0), Math.min(1, this.murchando));
    }

    fill(this.corTronco);
    rect(this.x - this.larguraTronco / 2, this.y - this.alturaTronco, this.larguraTronco, this.alturaTronco);

    fill(this.corCopa);
    triangle(
      this.x - this.larguraCopa / 2, this.y - this.alturaTronco,
      this.x + this.larguraCopa / 2, this.y - this.alturaTronco,
      this.x, this.y - this.alturaTronco - this.alturaCopa
    );
  }
}

class Capivara {
  constructor(x, y, solo) {
    this.x = x;
    this.yInicial = y;
    this.solo = solo;
    this.tamanhoInicial = 20;
    this.corPrincipal = color(200, 180, 140);
    this.corDetalhe = color(150, 130, 90);
    this.fugindo = false;
  }

  mostrar() {
    let alturaSoloAtual = this.solo.altura;
    let alturaBaseSoloInicial = height - 80;
    let proporcao = alturaSoloAtual / alturaBaseSoloInicial;
    this.tamanho = this.tamanhoInicial * proporcao;
    if (this.tamanho < 5) this.tamanho = 5;

    let yAtual = this.yInicial;

    if (this.solo.tipo === "exposto") {
      this.fugindo = true;
    }

    if (this.fugindo) {
      this.x += 2;
      yAtual = this.yInicial - 20 * proporcao;
    } else {
      yAtual = alturaSoloAtual - 10 * proporcao;
    }

    fill(this.corPrincipal);
    ellipse(this.x, yAtual, this.tamanho, this.tamanho * 0.7);
    fill(this.corPrincipal);
    ellipse(this.x + this.tamanho * 0.3, yAtual - this.tamanho * 0.2, this.tamanho * 0.5, this.tamanho * 0.5);
    fill(this.corDetalhe);
    ellipse(this.x + this.tamanho * 0.5, yAtual - this.tamanho * 0.4, this.tamanho * 0.2, this.tamanho * 0.2);
    ellipse(this.x + this.tamanho * 0.1, yAtual - this.tamanho * 0.4, this.tamanho * 0.2, this.tamanho * 0.2);
    fill(0);
    ellipse(this.x + this.tamanho * 0.4, yAtual - this.tamanho * 0.1, 3, 3);
  }
}

class Passarinho {
  constructor(tipoSolo) {
    this.x = random(width);
    this.y = random(height / 2);
    this.tamanho = random(10, 20);
    this.velocidadeX = random(1, 3);
    this.velocidadeY = random(-1, 1);
    this.cor = color(random(200, 255), random(200, 255), random(200, 255));
    this.soloPreferido = tipoSolo;
  }

  voar() {
    this.x += this.velocidadeX;
    this.y += this.velocidadeY;

    if (this.x > width + this.tamanho) {
      this.x = -this.tamanho;
    }
    if (this.x < -this.tamanho) {
      this.x = width + this.tamanho;
    }
    if (this.y > height) {
      this.y = 0;
    }
    if (this.y < 0) {
      this.y = height;
    }

    this.velocidadeX += random(-0.5, 0.5);
    this.velocidadeY += random(-0.5, 0.5);
  }

  mostrar() {
    if (this.soloPreferido === solo.tipo) {
      fill(this.cor);
      ellipse(this.x, this.y, this.tamanho, this.tamanho * 0.6);
      line(this.x, this.y, this.x - this.tamanho * 0.8, this.y - this.tamanho * 0.3);
      line(this.x, this.y, this.x + this.tamanho * 0.8, this.y - this.tamanho * 0.3);
    }
  }
}

class Construcao {
  constructor(x, y, solo, tipo) {
    this.x = x;
    this.yInicial = y;
    this.solo = solo;
    this.tipo = tipo;
    this.largura = random(30, 50);
    this.alturaInicial = random(50, 100);
    this.cor = [color(200), color(150), color(100)][this.tipo];
    this.detalheCor = [color(180), color(130), color(80)][this.tipo];
  }

  mostrar() {
    let alturaSoloAtual = this.solo.altura;
    let alturaBaseSoloInicial = height - 80;
    let proporcao = alturaSoloAtual / alturaBaseSoloInicial;
    this.altura = this.alturaInicial * proporcao;
    this.y = alturaSoloAtual - this.altura;

    if (this.altura < 20) this.altura = 20;

    fill(this.cor);
    rect(this.x, this.y, this.largura, this.altura);

    fill(this.detalheCor);
    if (this.tipo === 0) {
      triangle(this.x, this.y, this.x + this.largura / 2, this.y - 10 * proporcao, this.x + this.largura, this.y);
      rect(this.x + this.largura / 4, this.y + this.altura / 2, this.largura / 2, this.altura / 3);
    } else if (this.tipo === 1) {
      for (let i = 0; i < 3; i++) {
        rect(this.x + this.largura / 6, this.y + this.altura / 4 * i + this.altura / 8, this.largura / 3 * 2, this.altura / 8);
      }
    } else {
      rect(this.x + this.largura / 3, this.y - 10 * proporcao, this.largura / 3, 10 * proporcao);
    }
  }
}

class ParticulaFumaca {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.tamanho = random(5, 15);
    this.velocidadeX = random(-0.5, 0.5);
    this.velocidadeY = random(-1, -0.5);
    this.alpha = 255;
    this.cor = color(50, 50, 50);
  }

  atualizar() {
    this.x += this.velocidadeX;
    this.y += this.velocidadeY;
    this.alpha -= 3;
    this.tamanho += 0.1;
  }

  mostrar() {
    noStroke();
    fill(this.cor, this.alpha);
    ellipse(this.x, this.y, this.tamanho, this.tamanho);
  }
}

