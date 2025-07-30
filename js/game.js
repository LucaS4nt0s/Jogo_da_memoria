document.addEventListener('DOMContentLoaded', () => {  
    const tabuleiro = document.querySelector('.tabuleiro');
    const cartas = document.querySelectorAll('.cartas');

    let cartasViradas = [];
    let bloqueioJogo = false;
    let pontosJogador1 = 0;
    let pontosJogador2 = 0;
    let jogadorAtual = 1; 

    const placarJogador1 = document.querySelector('.pontuacao-1 p');
    const placarJogador2 = document.querySelector('.pontuacao-2 p');
    const vezJogador = document.querySelector('.vez p');

    function atualizarPlacar(){
        if (placarJogador1) {
            placarJogador1.textContent = `Jogador 1: ${pontosJogador1}`;
        }
        if (placarJogador2) {
            placarJogador2.textContent = `Jogador 2: ${pontosJogador2}`;
        }
        if (vezJogador) {
            vezJogador.textContent = `Vez do jogador ${jogadorAtual}`;
        }
    }

    function criarCartaElemento(dadosCarta){
        const carta = document.createElement('div');
        carta.addEventListener('click', virarCarta);
        carta.classList.add('cartas');
        carta.dataset.idUnico = dadosCarta.id;
        carta.dataset.nome = dadosCarta.nome;
        
        const frenteCarta = document.createElement('div');
        frenteCarta.classList.add('frente', 'escondida');
        const imagemFrente = document.createElement('img');
        imagemFrente.src = dadosCarta.imagem;
        imagemFrente.alt = dadosCarta.nome;
        frenteCarta.appendChild(imagemFrente);

        const versoCarta = document.createElement('div');
        versoCarta.classList.add('verso');
        const imagemVerso = document.createElement('img');
        imagemVerso.src = './img/starWars.png';
        imagemVerso.alt = 'Verso da carta';
        versoCarta.appendChild(imagemVerso);

        carta.appendChild(frenteCarta);
        carta.appendChild(versoCarta);

        return carta;
    }

    cartasIniciais.forEach(dadosCarta => {
        const cartaElemento = criarCartaElemento(dadosCarta);
        tabuleiro.appendChild(cartaElemento);
    });

    atualizarPlacar();

    function virarCarta(){
        if (bloqueioJogo) return;
        if (this.classList.contains('virada')) return;
        if (this === cartasViradas[0]) return;

        this.classList.remove('escondida');
        this.classList.add('virada');

        cartasViradas.push(this);

        if (cartasViradas.length === 2) {
            bloqueioJogo = true;
            verificarPares();
        }
    }

    function verificarPares() {
        const [carta1, carta2] = cartasViradas;

        const ePar = carta1.dataset.nome === carta2.dataset.nome;

        if (ePar) {

            desabilitarCartas(carta1, carta2);

            if (jogadorAtual === 1) {
                pontosJogador1++;
            }
            else {
                pontosJogador2++;
            }
            atualizarPlacar();
            mandarPontuacaoParaPHP(jogadorAtual, jogadorAtual === 1 ? pontosJogador1 : pontosJogador2);
        }else{
            virarCartasDeVolta(carta1, carta2);
            trocarJogador();
        }
    }

    function virarCartasDeVolta(carta1, carta2) {
        setTimeout(() => {
            carta1.classList.remove('virada');
            carta1.classList.add('escondida');
            carta2.classList.remove('virada');
            carta2.classList.add('escondida');
        }, 1500);
    }

    function desabilitarCartas(carta1, carta2) {
        carta1.removeEventListener('click', virarCarta);
        carta2.removeEventListener('click', virarCarta);

        carta1.classList.add('par');
        carta2.classList.add('par');

        resetarTabuleiro();
        verificarFimDeJogo();
    }

    function resetarTabuleiro() {
        cartasViradas = [];
        bloqueioJogo = false;
    }

    function trocarJogador() {
        jogadorAtual = jogadorAtual === 1 ? 2 : 1;
        atualizarPlacar();
    }

    function verificarFimDeJogo() {
        const cartasCombinadas = document.querySelectorAll('.par').length;
        const totalCartas = cartas.length;

        if (cartasCombinadas === totalCartas) {
            alert('Fim de jogo!');

            if (pontosJogador1 > pontosJogador2) {
                alert(`Jogador 1 venceu com ${pontosJogador1} pontos!`);
            } else if (pontosJogador2 > pontosJogador1) {
                alert(`Jogador 2 venceu com ${pontosJogador2} pontos!`);
            } else {
                alert('Empate!');
            }
        }
    }

    function mandarPontuacaoParaPHP(numeroDoJogador, pontos){
        if(!id_partida) {
            console.error('ID da partida não definido.');
            return;
        }

        console.log(`Enviando pontuação do Jogador ${numeroDoJogador}: ${pontos} pontos`);
        fetch('./php/atualizar_pontuacao.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_partida: id_partida,
                numero_jogador: numeroDoJogador,
                pontos: pontos
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao enviar pontuação para o PHP');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                console.log(`Pontuação do jogador ${numeroDoJogador} atualizada com sucesso: novo total de pontos é ${pontos}`);
            } else {
                console.error('Erro ao atualizar pontuação:', data.message);
            }
        })
        .catch(error => {
            console.error('Erro ao atualizar pontuação:', error);
        });
    }
});