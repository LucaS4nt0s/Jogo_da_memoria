document.addEventListener('DOMContentLoaded', () => {  
    const tabuleiro = document.querySelector('.tabuleiro');

    let cartasViradas = [];
    let bloqueioJogo = false;
    let pontosJogador1 = 0;
    let pontosJogador2 = 0;
    let jogadorAtual = 1; 
    let tempo = 0;
    let intervaloCronometro;
    let vencedor = null;
    let cartas;

    const placarJogador1 = document.querySelector('.pontuacao-1 p');
    const placarJogador2 = document.querySelector('.pontuacao-2 p');
    const vezJogador = document.querySelector('.vez p');
    const botaoIniciar = document.querySelector('.Botao-Iniciar');
    const cronometroDisplay = document.querySelector('#cronometro');


    function formatarTempo(segundos) {
        const minutos = Math.floor(segundos / 60);
        const segundosRestantes = segundos % 60;
        return `${minutos.toString().padStart(2, '0')}:${segundosRestantes.toString().padStart(2, '0')}`;
    }

    function atualizarCronometro() {
        if(cronometroDisplay) {
            cronometroDisplay.textContent = formatarTempo(tempo);
        }
    }

    function iniciarCronometro() {
        if(!intervaloCronometro) {
            intervaloCronometro = setInterval(() => {
                tempo++;
                atualizarCronometro();
            }, 1000);
        }
    }

    function pararCronometro() {
        if(intervaloCronometro) {
            clearInterval(intervaloCronometro);
            intervaloCronometro = null;
        }
    }

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
        carta.classList.add('cartas');
        carta.dataset.idUnico = dadosCarta.id;
        carta.dataset.nome = dadosCarta.nome;
        
        const frenteCarta = document.createElement('div');
        frenteCarta.classList.add('faces-das-cartas', 'frente');
        const imagemFrente = document.createElement('img');
        imagemFrente.src = dadosCarta.imagem;
        imagemFrente.alt = dadosCarta.nome;
        frenteCarta.appendChild(imagemFrente);

        const versoCarta = document.createElement('div');
        versoCarta.classList.add('faces-das-cartas', 'verso');
        const imagemVerso = document.createElement('img');
        imagemVerso.src = './img/starWars.png';
        imagemVerso.alt = 'Verso da carta';
        versoCarta.appendChild(imagemVerso);

        carta.appendChild(frenteCarta);
        carta.appendChild(versoCarta);

        carta.addEventListener('click', virarCarta);

        return carta;
    }

    atualizarPlacar();

    function virarCarta(){
        if (bloqueioJogo) return;
        if (this.classList.contains('virada')) return;
        if (this === cartasViradas[0]) return;

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
            carta2.classList.remove('virada');

            resetarTabuleiro();
        }, 1000);
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
        if (modo === 'solo') return;
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
                vencedor = id_jogador1;
            } else if (pontosJogador2 > pontosJogador1) {
                alert(`Jogador 2 venceu com ${pontosJogador2} pontos!`);
                vencedor = id_jogador2;
            } else {
                alert('Empate!');
                vencedor = 'Empate';
            }
            pararCronometro();
            mandarDadosDeFimDeJogoParaPHP(tempo, vencedor)
            .then(() => {
                botaoIniciar.textContent = 'Reiniciar Jogo';
                botaoIniciar.disabled = false;
                tabuleiro.classList.add('pausado');

                pontosJogador1 = 0;
                pontosJogador2 = 0;
                jogadorAtual = 1;
                tempo = 0;
                vencedor = null;
                atualizarPlacar(); 
                atualizarCronometro(); 

            })
            .catch(error => {
                console.error('Falha ao enviar dados de fim de jogo, o jogo não foi resetado automaticamente:', error);
            });
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
            if (data.sucesso) { 
                console.log(`Pontuação do jogador ${numeroDoJogador} atualizada com sucesso: ${data.mensagem}`); 
            } else {
                console.error('Erro ao atualizar a pontuação:', data.mensagem); 
            }
        })
        .catch(error => {
            console.error('Erro ao atualizar pontuação:', error);
        });
    }

    function mandarDadosDeFimDeJogoParaPHP(tempoFinal, vencedor) {
    if(!id_partida) {
        console.error('ID da partida não definido.');
        return Promise.reject(new Error('ID da partida não definido.'));
    }

    console.log(`Enviando dados de fim de jogo para o PHP: ID da partida ${id_partida}, Tempo final ${tempoFinal}, Vencedor ${vencedor}`);

    return fetch('./php/fim_de_jogo.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id_partida: id_partida,
            tempo_final: tempoFinal,
            vencedor: vencedor
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().catch(() => {
                throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
            }).then(errorData => {
                throw new Error(`Erro do servidor: ${errorData.mensagem || 'Desconhecido'}`);
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.sucesso) {
            console.log('Dados de fim de jogo enviados com sucesso', data.mensagem);
            return data; 
        } else {
            throw new Error(data.mensagem);
        }
    })
    .catch(error => {
        console.error('Erro ao enviar dados de fim de jogo:', error);
        throw error; 
    });
}
    function inicializarJogo() {
        tabuleiro.innerHTML = '';

        const cartasEmbaralhadas = [...cartasIniciais].sort(() => Math.random() - 0.5);
        cartasEmbaralhadas.forEach(dadosCarta => {
            const cartaElemento = criarCartaElemento(dadosCarta);
            tabuleiro.appendChild(cartaElemento);
        });
        cartas = document.querySelectorAll('.cartas');
        
        atualizarPlacar();
        atualizarCronometro();
        
    }

    botaoIniciar.addEventListener('click', () => {
        tabuleiro.classList.remove('pausado');
        botaoIniciar.disabled = true;
        iniciarCronometro();
        console.log('Jogo iniciado');

        if(botaoIniciar.textContent === 'Reiniciar Jogo') {
            inicializarJogo();
        }
    });

    inicializarJogo();
});