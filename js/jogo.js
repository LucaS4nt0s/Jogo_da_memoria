document.addEventListener('DOMContentLoaded', () => {  
    const tabuleiro = document.querySelector('.tabuleiro');

    let cartasViradas = [];
    let bloqueioJogo = false;
    let transicaoEmAndamento = false;
    let pontosJogador1 = 0;
    let pontosJogador2 = 0;
    let jogadorAtual = 1; 
    let tempo = 0;
    let intervaloCronometro;
    let vencedor = null;
    let cartas;

    let tempoRestanteJogada; 
    let intervaloTempoJogada; 
    const TEMPO_LIMITE_JOGADA = 20; 

    const placarJogador1 = document.querySelector('.pontuacao-1 p');
    const placarJogador2 = document.querySelector('.pontuacao-2 p');
    const vezJogador = document.querySelector('.vez p');
    const botaoIniciar = document.querySelector('.Botao-Iniciar');
    const cronometroDisplay = document.querySelector('#cronometro');
    const statusJogador1Element = document.querySelector('#status-jogador1');   
    const statusJogador2Element = document.querySelector('#status-jogador2');
    const jogador1EVoceElement = document.querySelector('#player1-e-voce');
    const jogador2EVoceElement = document.querySelector('#player2-e-voce');
    const timerTurnoDisplay = document.querySelector('#timer-turno');

    let pollingInterval;
    let checkPlayerStatusInterval;
    let jogoAtivo = false;
    let meu_numero_de_jogador;

    let somCartaVirar;
    
    function inicializarSom() {
        
        somCartaVirar = new Audio();
        somCartaVirar.preload = 'auto';
        somCartaVirar.volume = 0.5; 
        
        
        criarSomSintetico();
    }
    
    function criarSomSintetico() {
       
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            
            window.tocarSomCarta = function() {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                // Som de "flip" - frequência que sobe rapidamente
                oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
                
                // Volume que diminui
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                
                oscillator.type = 'sine';
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.2);
            };
        } catch (error) {
            console.log('Web Audio API não suportada, som desabilitado');
            window.tocarSomCarta = function() {}; // Função vazia se não suportar áudio
        }
    }
    
    function tocarSomCartaVirar() {
        try {
            if (window.tocarSomCarta) {
                window.tocarSomCarta();
            }
        } catch (error) {
            console.log('Erro ao tocar som:', error);
        }
    }

    function inicializarStatusJogadores() {
        if (modo === 'duo') {
            if (id_jogador1) {
                statusJogador1Element.textContent = 'Online';
                statusJogador1Element.classList.remove('status-offline');
                statusJogador1Element.classList.add('status-online');
                if (id_jogador1 === usuario_sessao_id) {
                    jogador1EVoceElement.style.display = 'inline';
                } else {
                    jogador1EVoceElement.style.display = 'none';
                }
            } else {
                statusJogador1Element.textContent = 'Aguardando...';
                statusJogador1Element.classList.remove('status-online');
                statusJogador1Element.classList.add('status-offline');
                jogador1EVoceElement.style.display = 'none';
            }

            if (id_jogador2) {
                statusJogador2Element.textContent = 'Online';
                statusJogador2Element.classList.remove('status-offline');
                statusJogador2Element.classList.add('status-online');
                if (id_jogador2 === usuario_sessao_id) {
                    jogador2EVoceElement.style.display = 'inline';
                } else {
                    jogador2EVoceElement.style.display = 'none';
                }
            } else {
                statusJogador2Element.textContent = 'Aguardando...';
                statusJogador2Element.classList.remove('status-online');
                statusJogador2Element.classList.add('status-offline');
                jogador2EVoceElement.style.display = 'none';
            }

            if (!id_jogador2) {
                iniciarVerificacaoJogador2();
            }
        }
    }

    function iniciarVerificacaoJogador2() {
        if (modo === 'duo' && !id_jogador2) {
            if (checkPlayerStatusInterval) {
                clearInterval(checkPlayerStatusInterval);
            }

            checkPlayerStatusInterval = setInterval(async () => {
                console.log('Verificando status da partida...');
                try {
                    const response = await fetch('./php/verificar_estado_partida.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id_partida: id_partida })
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    if (data.jogador1_id) {
                        id_jogador1 = data.jogador1_id; 
                    }
                    id_jogador2 = data.jogador2_id;

                    if (id_jogador1) { 
                        statusJogador1Element.textContent = 'Online';
                        statusJogador1Element.classList.remove('status-offline');
                        statusJogador1Element.classList.add('status-online');
                        if (id_jogador1 === usuario_sessao_id) { 
                            jogador1EVoceElement.style.display = 'inline';
                        } else {
                            jogador1EVoceElement.style.display = 'none';
                        }
                    } else {
                        statusJogador1Element.textContent = 'Aguardando...';
                        statusJogador1Element.classList.remove('status-online');
                        statusJogador1Element.classList.add('status-offline');
                        jogador1EVoceElement.style.display = 'none';
                    }

                    if (id_jogador2 !== null) {
                        statusJogador2Element.textContent = 'Online';
                        statusJogador2Element.classList.remove('status-offline');
                        statusJogador2Element.classList.add('status-online');
                        if (id_jogador2 === usuario_sessao_id) {
                            jogador2EVoceElement.style.display = 'inline';
                        } else {
                            jogador2EVoceElement.style.display = 'none';
                        }

                        if (usuario_sessao_id === id_jogador1) { 
                            botaoIniciar.style.display = 'block'; 
                            botaoIniciar.removeAttribute('disabled');
                            botaoIniciar.textContent = 'Iniciar Jogo';
                            console.log('Botão "Iniciar Jogo" habilitado para Jogador 1.');
                        } else if (usuario_sessao_id === id_jogador2) { 
                            botaoIniciar.style.display = 'none'; 
                        } else { 
                            botaoIniciar.style.display = 'none';
                        }

                        clearInterval(checkPlayerStatusInterval);
                        console.log('Jogador 2 detectado. Parando verificação de jogador.');

                        iniciarPollingEstadoJogo();
                    } else { 
                        statusJogador2Element.textContent = 'Aguardando...';
                        statusJogador2Element.classList.remove('status-online');
                        statusJogador2Element.classList.add('status-offline');
                        jogador2EVoceElement.style.display = 'none';

                        if (usuario_sessao_id === id_jogador1) {
                            botaoIniciar.disabled = true;
                            botaoIniciar.textContent = 'Aguardando Jogador 2...';
                            botaoIniciar.style.display = 'block'; 
                        }
                    }
                } catch (error) {
                    console.error('Erro na verificação de status da partida:', error);
                }
            }, 3000);
        }
    }

    function formatarTempo(segundos) {
        const minutos = Math.floor(segundos / 60);
        const segundosRestantes = segundos % 60;
        return `${minutos.toString().padStart(2, '0')}:${segundosRestantes.toString().padStart(2, '0')}`;
    }

    function atualizarCronometro() {
        if (cronometroDisplay) {
            cronometroDisplay.textContent = formatarTempo(tempo);
        }
    }

    function iniciarCronometro() {
        if (intervaloCronometro) clearInterval(intervaloCronometro);

        if (jogoAtivo && vencedor === null) {
            // Apenas o jogador 1 controla o cronômetro no multiplayer
            if (modo === 'solo' || (modo === 'duo' && usuario_sessao_id == id_jogador1)) {
                intervaloCronometro = setInterval(() => {
                    tempo++;
                    atualizarCronometro();
                    
                    // Sincronizar com servidor no multiplayer a cada 5 segundos
                    if (modo === 'duo' && tempo % 5 === 0) {
                        sincronizarCronometroComServidor();
                    }
                }, 1000);
                console.log("Cronômetro iniciado.");
            }
        }
    }

    function pararCronometro() {
        if (intervaloCronometro) {
            clearInterval(intervaloCronometro);
            intervaloCronometro = null;
        }
    }

    async function sincronizarCronometroComServidor() {
        if (!id_partida || modo === 'solo') return;
        
        try {
            const response = await fetch('./php/atualizar_cronometro.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_partida: id_partida,
                    tempo: tempo
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.sucesso) {
                    console.log('Cronômetro sincronizado:', tempo);
                }
            }
        } catch (error) {
            console.error('Erro ao sincronizar cronômetro:', error);
        }
    }

    function atualizarPlacar() {
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

    function iniciarTimerTurno() {
        if (modo === 'solo') {
            pararTimerTurno();
            return;
        }
        
        if (!meu_numero_de_jogador) {
            console.warn('Número do jogador local não definido.');
            return;
        }

        if (jogadorAtual !== meu_numero_de_jogador) {
            pararTimerTurno();
            return;
        }

        if (intervaloTempoJogada) {
            clearInterval(intervaloTempoJogada);
        }

        tempoRestanteJogada = TEMPO_LIMITE_JOGADA;
        atualizarTimerTurnoDisplay();

        intervaloTempoJogada = setInterval(() => {
            tempoRestanteJogada--;
            atualizarTimerTurnoDisplay();

            if (tempoRestanteJogada <= 0) { 
                clearInterval(intervaloTempoJogada);
                console.log('Tempo esgotado! A vez será passada.');
                alert('Tempo esgotado! Sua vez foi passada.');
                trocarJogador(); 
                resetarTabuleiro();
            }
        }, 1000);
    }

    function pararTimerTurno() {
        if (intervaloTempoJogada) {
            clearInterval(intervaloTempoJogada);
            intervaloTempoJogada = null;
            if (timerTurnoDisplay) {
                timerTurnoDisplay.textContent = '';
            }
        }
    }

    function atualizarTimerTurnoDisplay() {
        if (timerTurnoDisplay) {
            timerTurnoDisplay.textContent = `Tempo restante: ${tempoRestanteJogada} segundos`;
        }
    }

    function criarCartaElemento(dadosCarta) {
        const carta = document.createElement('div');
        carta.classList.add('cartas');
        carta.dataset.idUnico = dadosCarta.id_unico;
        carta.dataset.nome = dadosCarta.tipo;
        
        const frenteCarta = document.createElement('div');
        frenteCarta.classList.add('faces-das-cartas', 'frente');
        const imagemFrente = document.createElement('img');
        imagemFrente.src = dadosCarta.imagem;
        imagemFrente.alt = dadosCarta.tipo;
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

    function virarCarta() {
        // Verificações básicas de bloqueio
        if (bloqueioJogo) return;
        if (transicaoEmAndamento) return;
        if (!jogoAtivo || vencedor !== null) return;

        // Verificar se é a vez do jogador no multiplayer
        if (modo === 'duo' && jogadorAtual !== meu_numero_de_jogador) {
            console.log('Não é a sua vez de jogar.');
            return;
        }
        tocarSomCartaVirar();

        // Verificar se a carta já está virada ou é a mesma carta
        if (this.classList.contains('virada')) return;
        if (this.classList.contains('par')) return;
        if (cartasViradas.includes(this)) return;

        // LIMITE: Máximo 2 cartas por turno
        if (cartasViradas.length >= 2) {
            console.log('Máximo de 2 cartas por turno.');
            return;
        }

        // Virar a carta
        this.classList.add('virada');
        cartasViradas.push(this);

        console.log(`Carta virada. Total: ${cartasViradas.length}/2`);

        // Sincronizar estado das cartas no multiplayer
        if (modo === 'duo') {
            mandarEstadoCartasParaPHP();
        }

        // Quando atingir exatamente 2 cartas, bloquear e verificar
        if (cartasViradas.length === 2) {
            bloqueioJogo = true;
            transicaoEmAndamento = true;
            pararTimerTurno();
            
            console.log('2 cartas viradas. Iniciando verificação...');
            
            // Pequeno delay para garantir que a carta seja visualmente virada
            setTimeout(() => {
                verificarPares();
            }, 100);
        }
    }

    function verificarPares() {
        const [carta1, carta2] = cartasViradas;
        const ePar = carta1.dataset.nome === carta2.dataset.nome;

        if (ePar) {
            // ACERTOU: jogador continua jogando
            desabilitarCartas(carta1, carta2);
            if (jogadorAtual === 1) {
                pontosJogador1++;
            } else {
                pontosJogador2++;
            }
            atualizarPlacar();
            if (modo === 'duo') {
                mandarPontuacaoParaPHP(jogadorAtual, jogadorAtual === 1 ? pontosJogador1 : pontosJogador2);
            }
            // NÃO TROCA DE JOGADOR - continua o mesmo jogador
        } else {
            // ERROU: passa a vez para o outro jogador
            virarCartasDeVolta(carta1, carta2);
        }
    }

    function virarCartasDeVolta(carta1, carta2) {
        setTimeout(() => {
            carta1.classList.remove('virada');
            carta2.classList.remove('virada');

            resetarTabuleiro();
            
            // Sincronizar estado das cartas após desvirar
            if (modo === 'duo') {
                mandarEstadoCartasParaPHP().then(() => {
                    // ERROU: troca de jogador após sincronizar
                    trocarJogador().finally(() => {
                        transicaoEmAndamento = false; // Finaliza transição
                        aplicarBloqueioDeTurno();
                    });
                });
            } else {
                // Modo solo: troca local
                jogadorAtual = jogadorAtual === 1 ? 2 : 1;
                atualizarPlacar();
                transicaoEmAndamento = false; // Finaliza transição
                aplicarBloqueioDeTurno();
            }
        }, 1000);
    }

    function desabilitarCartas(carta1, carta2) {
        carta1.removeEventListener('click', virarCarta);
        carta2.removeEventListener('click', virarCarta);

        carta1.classList.add('par');
        carta2.classList.add('par');
            
        setTimeout(() => {
            resetarTabuleiro();
            
            if (jogoAtivo) {
                verificarFimDeJogo();
            }
            
            // ACERTOU: continua o mesmo jogador
            if (!vencedor && jogoAtivo) {
                transicaoEmAndamento = false; // Finaliza transição
                aplicarBloqueioDeTurno();
                if (modo === 'duo') {
                    mandarEstadoCartasParaPHP();
                }
            }
        }, 100);
    }

    function resetarTabuleiro() {
        cartasViradas = [];
        bloqueioJogo = false;
    }

    async function trocarJogador() {
        if (modo === 'solo') return;
        if (!id_partida || !jogoAtivo) return;

        let proximoJogadorId;
        if (jogadorAtual === 1) {
            proximoJogadorId = id_jogador2;
        } else if (jogadorAtual === 2) {
            proximoJogadorId = id_jogador1;
        }

        if (proximoJogadorId === null || proximoJogadorId === undefined) {
            console.error('ID do próximo jogador não definido.');
            return;
        }

        try {
            console.log(`Trocando jogador para: ${proximoJogadorId}`);
            const response = await fetch('./php/trocar_jogador_db.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_partida: id_partida,
                    proximo_jogador: proximoJogadorId
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.sucesso) {
                    console.log('Jogador trocado com sucesso');
                } else {
                    console.error('Falha ao trocar jogador:', data.mensagem);
                }
            }
        } catch (error) {
            console.error('Erro ao trocar jogador:', error);
        }
    }

    function aplicarBloqueioDeTurno() {
        if (modo === 'solo') {
            tabuleiro.classList.remove('oponente-jogando'); 
            pararTimerTurno();
            return;
        }
        
        if (!meu_numero_de_jogador) {
            if (usuario_sessao_id == id_jogador1) {
                meu_numero_de_jogador = 1;
            } else if (usuario_sessao_id == id_jogador2) {
                meu_numero_de_jogador = 2;
            } else {
                console.warn('Usuário não é jogador desta partida.');
                tabuleiro.classList.add('oponente-jogando');
                pararTimerTurno();
                return;
            }
        }

        if (vencedor !== null || !jogoAtivo) {
            tabuleiro.classList.add('oponente-jogando');
            pararTimerTurno();
            return;
        }

        if (jogadorAtual === meu_numero_de_jogador) {
            tabuleiro.classList.remove('oponente-jogando');
            iniciarTimerTurno();
        } else {
            tabuleiro.classList.add('oponente-jogando');
            pararTimerTurno();
        }
    }

    function verificarFimDeJogo() {
        const cartasCombinadas = document.querySelectorAll('.par').length;
        const totalCartas = cartas.length;

        if (cartasCombinadas === totalCartas && totalCartas > 0) {
            jogoAtivo = false;

            let vencedorCalculado = null;
            let mensagemFimJogo = 'Fim de jogo!';

            if (pontosJogador1 > pontosJogador2) {
                mensagemFimJogo += `\nJogador 1 venceu com ${pontosJogador1} pontos!`;
                vencedorCalculado = id_jogador1; 
            } else if (pontosJogador2 > pontosJogador1) {
                mensagemFimJogo += `\nJogador 2 venceu com ${pontosJogador2} pontos!`;
                vencedorCalculado = id_jogador2;
            } else {
                mensagemFimJogo += '\nEmpate!';
                vencedorCalculado = null;
            }
            
            if(modo === 'solo') {
            alert("pontuação final foi 8 pontos");
            }
            else {
            alert(mensagemFimJogo);
            };

            pararCronometro();
            pararTimerTurno(); 
            pararPollingEstadoJogo();

            vencedor = vencedorCalculado; 
            tabuleiro.classList.add('pausado'); 
            tabuleiro.classList.add('oponente-jogando'); 

            botaoIniciar.disabled = true;
            
            if (modo === 'duo') {
                mandarDadosDeFimDeJogoParaPHP(tempo, vencedor)
                .catch(error => {
                    console.error('Falha ao enviar dados de fim de jogo:', error);
                });
            }
        }
    }

    function mandarPontuacaoParaPHP(numeroDoJogador, pontos) {
        if (!id_partida || modo === 'solo') return;
        if (vencedor !== null || !jogoAtivo) return;

        console.log(`Enviando pontuação do Jogador ${numeroDoJogador}: ${pontos} pontos`);
        fetch('./php/atualizar_pontuacao.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_partida: id_partida,
                numero_jogador: numeroDoJogador,
                pontos: pontos
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) { 
                console.log(`Pontuação atualizada: ${data.mensagem}`); 
            } else {
                console.error('Erro ao atualizar pontuação:', data.mensagem); 
            }
        })
        .catch(error => {
            console.error('Erro ao atualizar pontuação:', error);
        });
    }

    async function mandarDadosDeFimDeJogoParaPHP(tempoFinal, vencedor) {
        if (!id_partida) return;

        try {
            const response = await fetch('./php/fim_de_jogo.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_partida: id_partida,
                    tempo_final: tempoFinal,
                    vencedor: vencedor
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.sucesso) {
                    console.log('Dados de fim de jogo enviados com sucesso');
                }
            }
        } catch (error) {
            console.error('Erro ao enviar dados de fim de jogo:', error);
        }
    }

    function inicializarJogo() {
        tabuleiro.innerHTML = ''; 
        
        let cartasParaRenderizar = cartasIniciais;

        pontosJogador1 = 0;
        pontosJogador2 = 0;
        jogadorAtual = 1; 
        tempo = 0;
        vencedor = null;
        jogoAtivo = false;
        bloqueioJogo = false;
        pararCronometro();
        pararTimerTurno();

        if (cartasParaRenderizar && cartasParaRenderizar.length > 0) {
            cartasParaRenderizar.forEach(dadosCarta => {
                const cartaElemento = criarCartaElemento(dadosCarta);
                tabuleiro.appendChild(cartaElemento);
            });
        } else {
            console.error("Erro: 'cartasIniciais' está vazio ou inválido.");
        }

        cartas = document.querySelectorAll('.cartas');

        atualizarPlacar();
        atualizarCronometro();
        tabuleiro.classList.add('pausado');

        if (usuario_sessao_id == id_jogador1) { 
            meu_numero_de_jogador = 1;
        } else if (usuario_sessao_id == id_jogador2) { 
            meu_numero_de_jogador = 2;
        } else {
            meu_numero_de_jogador = 0;
        }

        if (modo === 'duo') {
            if (meu_numero_de_jogador === 1) {
                if (!id_jogador2) {
                    botaoIniciar.disabled = true;
                    botaoIniciar.textContent = 'Aguardando Jogador 2...';
                } else {
                    botaoIniciar.disabled = false;
                    botaoIniciar.textContent = 'Iniciar Jogo';
                    iniciarPollingEstadoJogo();
                }
            } else { 
                botaoIniciar.style.display = 'none'; 
                iniciarPollingEstadoJogo();
            }
        } else { 
            botaoIniciar.disabled = false;
            botaoIniciar.textContent = 'Iniciar Jogo';
        }

        aplicarBloqueioDeTurno();
    }

    async function mandarEstadoCartasParaPHP() {
        if (!id_partida || modo === 'solo') return;
        if (vencedor !== null) return;

        const estadoAtualCartas = [];
        cartas.forEach(cartaElemento => {
            estadoAtualCartas.push({
                id_unico: cartaElemento.dataset.idUnico,
                tipo: cartaElemento.dataset.nome,
                imagem: cartaElemento.querySelector('.frente img').src,
                virada: cartaElemento.classList.contains('virada'),
                em_par: cartaElemento.classList.contains('par')
            });
        });

        try {
            const response = await fetch('./php/atualizar_estado_cartas.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_partida: id_partida,
                    estado_cartas_json: estadoAtualCartas
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.sucesso) {
                    console.log('Estado das cartas salvo com sucesso');
                }
            }
        } catch (error) {
            console.error('Erro ao enviar estado das cartas:', error);
        }
    }

    function iniciarPollingEstadoJogo() {
        if (pollingInterval) clearInterval(pollingInterval);
        if (modo === 'solo') return; 

        pollingInterval = setInterval(async () => {
            try {
                const response = await fetch('./php/get_game_state.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_partida: id_partida })
                });

                if (!response.ok) {
                    console.error('Erro HTTP no polling:', response.status);
                    return;
                }

                const data = await response.json();

                if (data.sucesso && data.estado_jogo) {
                    const estadoRemoto = data.estado_jogo;
                    
                    // Verificar fim de jogo
                    if (estadoRemoto.vencedor_id !== null) {
                        if (vencedor === null) {
                            vencedor = estadoRemoto.vencedor_id;
                            jogoAtivo = false;
                            pararCronometro();
                            pararPollingEstadoJogo(); 
                            pararTimerTurno();
                            
                            let mensagemFimJogo = 'Fim de Jogo!';
                            if (vencedor === null) {
                                mensagemFimJogo += '\nEmpate!';
                            } else if (vencedor == id_jogador1) {
                                mensagemFimJogo += `\nJogador 1 venceu!`;
                            } else if (vencedor == id_jogador2) {
                                mensagemFimJogo += `\nJogador 2 venceu!`;
                            }
                            alert(mensagemFimJogo);
                        }
                        return;
                    }

                    // Verificar se jogo começou
                    const jogoComecouNoServidor = (estadoRemoto.vez_jogador_id !== null && estadoRemoto.vez_jogador_id !== '0');
                    if (jogoComecouNoServidor && !jogoAtivo) {
                        jogoAtivo = true;
                        tabuleiro.classList.remove('pausado'); 
                        console.log('Jogo iniciado no servidor');
                        iniciarCronometro();
                        if (usuario_sessao_id == id_jogador2) {
                            botaoIniciar.style.display = 'none';
                        }
                    }

                    // Sincronizar cronômetro - apenas jogador 2 sincroniza, jogador 1 controla
                    if (jogoAtivo) {
                        // Apenas o jogador 2 sincroniza o cronômetro do servidor
                        if (usuario_sessao_id != id_jogador1 && estadoRemoto.tempo !== tempo) {
                            tempo = estadoRemoto.tempo;
                            atualizarCronometro();
                            console.log('Cronômetro sincronizado (Jogador 2):', tempo);
                        }
                        // Jogador 1 não sincroniza para evitar conflitos - ele controla o cronômetro
                    }

                    // Sincronizar pontuação
                    if (pontosJogador1 !== estadoRemoto.pontos_jogador1) {
                        pontosJogador1 = estadoRemoto.pontos_jogador1;
                        atualizarPlacar(); 
                    }
                    if (pontosJogador2 !== estadoRemoto.pontos_jogador2) {
                        pontosJogador2 = estadoRemoto.pontos_jogador2;
                        atualizarPlacar(); 
                    }
                    
                    // Sincronizar vez do jogador
                    if (jogoAtivo) {
                        const jogadorAtualRemoto = estadoRemoto.vez_jogador_id;
                        let numJogadorAtualRemoto = 0; 
                        if (jogadorAtualRemoto == id_jogador1) {
                            numJogadorAtualRemoto = 1;
                        } else if (jogadorAtualRemoto == id_jogador2) {
                            numJogadorAtualRemoto = 2;
                        }
                        
                        if (numJogadorAtualRemoto > 0 && jogadorAtual !== numJogadorAtualRemoto) {
                            console.log(`Vez do jogador mudou: ${numJogadorAtualRemoto}`);
                            jogadorAtual = numJogadorAtualRemoto;
                            atualizarPlacar();
                            aplicarBloqueioDeTurno();
                        }
                    }

                    // Sincronizar estado das cartas - APENAS se não há transição em andamento
                    if (cartas && cartas.length > 0 && !transicaoEmAndamento) { 
                        const cartasRemotas = estadoRemoto.estado_cartas_json;
                        if (cartasRemotas) {
                            cartasRemotas.forEach(cartaRemota => {
                                const cartaLocal = document.querySelector(`.cartas[data-id-unico="${cartaRemota.id_unico}"]`);
                                if (cartaLocal) {
                                    // Sincronizar pares primeiro (mais importante)
                                    if (cartaRemota.em_par && !cartaLocal.classList.contains('par')) {
                                        cartaLocal.classList.add('par');
                                        cartaLocal.classList.add('virada'); // Par sempre fica virado
                                        cartaLocal.removeEventListener('click', virarCarta);
                                    }
                                    
                                    // Sincronizar cartas viradas apenas se não for par
                                    if (!cartaLocal.classList.contains('par')) {
                                        if (cartaRemota.virada && !cartaLocal.classList.contains('virada')) {
                                            cartaLocal.classList.add('virada');
                                        } else if (!cartaRemota.virada && cartaLocal.classList.contains('virada')) {
                                            cartaLocal.classList.remove('virada');
                                        }
                                    }
                                }
                            });
                        }
                    }
                }
            } catch (error) {
                console.error('Erro no polling:', error);
            }
        }, 2000); // Aumentado para 2 segundos para reduzir conflitos de sincronização
    }
    
    function pararPollingEstadoJogo() {
         if (pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null;
        }
    }

    if (botaoIniciar) {
        botaoIniciar.addEventListener('click', () => {
            if (modo === 'solo') {
                if (!jogoAtivo) {
                    jogoAtivo = true;
                    iniciarCronometro();
                    tabuleiro.classList.remove('pausado');
                    botaoIniciar.textContent = 'Reiniciar Jogo';
                    aplicarBloqueioDeTurno(); 
                } else {
                    inicializarJogo();
                    botaoIniciar.textContent = 'Iniciar Jogo'; 
                }
            } else if (modo === 'duo') {
                if (usuario_sessao_id == id_jogador1 && id_jogador2) { 
                     console.log('Iniciando jogo multiplayer...');
                    fetch('./php/iniciar_jogo_db.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id_partida: id_partida })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.sucesso) {
                            console.log('Jogo iniciado com sucesso');
                            botaoIniciar.style.display = 'none';
                            jogoAtivo = true;
                            iniciarCronometro();
                            tabuleiro.classList.remove('pausado');
                            aplicarBloqueioDeTurno();
                        } else {
                            alert('Falha ao iniciar o jogo: ' + data.mensagem);
                        }
                    })
                    .catch(error => {
                        console.error('Erro ao iniciar jogo:', error);
                        alert('Erro ao iniciar o jogo.');
                    });
                }
            }
        });
    }

    inicializarSom();
    inicializarStatusJogadores();
    inicializarJogo();
});
