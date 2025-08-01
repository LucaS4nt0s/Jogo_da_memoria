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

    function inicializarStatusJogadores() {
        if (modo === 'duo') {
            if (id_jogador1) {
                statusJogador1Element.textContent = 'Online';
                statusJogador1Element.classList.remove('status-offline');
                statusJogador1Element.classList.add('status-online');
                if(id_jogador1 === usuario_sessao_id) {
                    jogador1EVoceElement.style.display = 'inline';
                }
            } else {
                statusJogador1Element.textContent = 'Aguardando...';
                statusJogador1Element.classList.remove('status-online');
                statusJogador1Element.classList.add('status-offline');
            }

            if (id_jogador2) {
                statusJogador2Element.textContent = 'Online';
                statusJogador2Element.classList.remove('status-offline');
                statusJogador2Element.classList.add('status-online');
                if (id_jogador2 === usuario_sessao_id) {
                    jogador2EVoceElement.style.display = 'inline';
                }
            } else {
                statusJogador2Element.textContent = 'Aguardando...';
                statusJogador2Element.classList.remove('status-online');
                statusJogador2Element.classList.add('status-offline');
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
                        statusJogador1Element.textContent = 'Online';
                        statusJogador1Element.classList.remove('status-offline');
                        statusJogador1Element.classList.add('status-online');
                        if (data.jogador1_id === usuario_sessao_id) {
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

                    if (data.jogador2_id) {
                        statusJogador2Element.textContent = 'Online';
                        statusJogador2Element.classList.remove('status-offline');
                        statusJogador2Element.classList.add('status-online');
                        if (data.jogador2_id === usuario_sessao_id) {
                            jogador2EVoceElement.style.display = 'inline';
                        } else {
                            jogador2EVoceElement.style.display = 'none';
                        }

                        if (usuario_sessao_id == id_jogador1 && botaoIniciar.hasAttribute('disabled')) {    
                            botaoIniciar.removeAttribute('disabled');
                            botaoIniciar.textContent = 'Iniciar Jogo';
                            console.log('Jogador 2 conectado! Botão iniciar habilitado.');
                        } else if (usuario_sessao_id == id_jogador2) {
                            botaoIniciar.style.display = 'none';
                        }
                        
                        id_jogador2 = data.jogador2_id;
                        clearInterval(checkPlayerStatusInterval);
                        console.log('Jogador 2 detectado. Parando verificação de jogador.');

                        iniciarPollingEstadoJogo();
                    } else {
                        statusJogador2Element.textContent = 'Aguardando...';
                        statusJogador2Element.classList.remove('status-online');
                        statusJogador2Element.classList.add('status-offline');
                        jogador2EVoceElement.style.display = 'none';

                        if (usuario_sessao_id == id_jogador1) {
                            botaoIniciar.disabled = true;
                            botaoIniciar.textContent = 'Aguardando Jogador 2...';
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

    function iniciarTimerTurno() {
        if (modo === 'solo'){
            pararTimerTurno();
            return;
        }

        let meu_numero_de_jogador;
        if (usuario_sessao_id == id_jogador1) {
            meu_numero_de_jogador = 1;
        } else if (usuario_sessao_id == id_jogador2) {
            meu_numero_de_jogador = 2;
        } else {
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

    function pararTimerTurno(){
        if (intervaloTempoJogada) {
                clearInterval(intervaloTempoJogada);
                intervaloTempoJogada = null;
                if (timerTurnoDisplay) {
                    timerTurnoDisplay.textContent = ''; 
                }
            }
    }

    function atualizarTimerTurnoDisplay(){
        if(timerTurnoDisplay){
            timerTurnoDisplay.textContent = `Tempo restante: ${tempoRestanteJogada} segundos`;
        }
    }

    function criarCartaElemento(dadosCarta){
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

    function virarCarta(){
        if (bloqueioJogo) return;
        if (this.classList.contains('virada')) return;
        if (this === cartasViradas[0]) return;

        if (!jogoAtivo || vencedor !== null) return;

        let meu_numero_de_jogador;
        if (usuario_sessao_id == id_jogador1) {
            meu_numero_de_jogador = 1;
        } else if (usuario_sessao_id == id_jogador2) {
            meu_numero_de_jogador = 2;
        }else {
            console.warn('Usuário da sessão não é jogador 1 nem jogador 2 desta partida.');
            return; 
        }

        if (modo === 'duo' && jogadorAtual !== meu_numero_de_jogador) {
             console.log('Não é a sua vez de jogar.');
             return; 
        }

        this.classList.add('virada');

        cartasViradas.push(this);

        if (cartasViradas.length === 2) {
            bloqueioJogo = true;
            pararTimerTurno();
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
        }
    }

    function virarCartasDeVolta(carta1, carta2) {
        setTimeout(() => {
            carta1.classList.remove('virada');
            carta2.classList.remove('virada');

            mandarEstadoCartasParaPHP().then(() => {
                resetarTabuleiro();
                trocarJogador(); 
            });
        }, 1000);
    }

    function desabilitarCartas(carta1, carta2) {
      carta1.removeEventListener('click', virarCarta);
      carta2.removeEventListener('click', virarCarta);


      carta1.classList.add('par');
      carta2.classList.add('par');
        
      setTimeout(() => {
          mandarEstadoCartasParaPHP().then(() => {
              resetarTabuleiro();
              if (jogoAtivo) {
                  verificarFimDeJogo(); 
              }
              if (!vencedor && jogoAtivo) {
                  iniciarTimerTurno();
              }
          });
      }, 100);
    }

    function resetarTabuleiro() {
        cartasViradas = [];
        bloqueioJogo = false;
    }

     async function trocarJogador() {
        if (modo === 'solo') return; 

        const proximoJogador = jogadorAtual === 1 ? 2 : 1;

        try {
            const response = await fetch('./php/trocar_jogador_db.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_partida: id_partida,
                    proximo_jogador: proximoJogador
                })
            });

            if (!response.ok) {
                let errorData = await response.text();
                console.error('Erro HTTP ao trocar jogador:', response.status, response.statusText, errorData);
                throw new Error(`Erro HTTP! Status: ${response.status}`);
            }

            const data = await response.json();
            if (data.sucesso) {
                console.log(data.mensagem);
            } else {
                console.error('Falha ao trocar jogador no servidor:', data.mensagem);
            }
        } catch (error) {
            console.error('Erro na requisição para trocar jogador:', error);
        }
    }

    function aplicarBloqueioDeTurno() {
        if (modo === 'solo') {
            tabuleiro.classList.remove('oponente-jogando'); 
            pararTimerTurno();
            return;
        }

        if (vencedor !== null || !jogoAtivo) {
            tabuleiro.classList.add('oponente-jogando');
            pararTimerTurno();
            return;
        }

        if (tabuleiro.classList.contains('pausado') && !jogoAtivo) {
            tabuleiro.classList.add('oponente-jogando'); 
            pararTimerTurno();
            return;
        }

        let meu_numero_de_jogador;
        if (usuario_sessao_id == id_jogador1) {
            meu_numero_de_jogador = 1;
        } else if (usuario_sessao_id == id_jogador2) {
            meu_numero_de_jogador = 2;
        } else {
            console.warn('Usuário da sessão não é jogador 1 nem jogador 2 desta partida.');
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
            alert(mensagemFimJogo);

            pararCronometro();
            pararTimerTurno(); 
            pararPollingEstadoJogo();

            vencedor = vencedorCalculado; 
            tabuleiro.classList.add('pausado'); 
            tabuleiro.classList.add('oponente-jogando'); 


            botaoIniciar.disabled = true;
            mandarDadosDeFimDeJogoParaPHP(tempo, vencedor)
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

        if (vencedor !== null || !jogoAtivo) return;

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

    async function mandarDadosDeFimDeJogoParaPHP(tempoFinal, vencedor) {
        if (!id_partida) {
            console.error('ID da partida não definido.');
            throw new Error('ID da partida não definido.');
        }

        console.log(`Enviando dados de fim de jogo para o PHP: ID da partida ${id_partida}, Tempo final ${tempoFinal}, Vencedor ${vencedor}`);

        try {
            const response = await fetch('./php/fim_de_jogo.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_partida: id_partida,
                    tempo_final: tempoFinal,
                    vencedor: vencedor
                })
            });

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json(); 
                } catch (jsonError) {
                    throw new Error(`Erro HTTP: ${response.status} ${response.statusText}. Resposta não é JSON.`);
                }
                throw new Error(`Erro do servidor: ${errorData.mensagem || 'Desconhecido'}`);
            }

            const data = await response.json();

            if (data.sucesso) {
                console.log('Dados de fim de jogo enviados com sucesso', data.mensagem);
                return data; 
            } else {
                throw new Error(data.mensagem);
            }

        } catch (error) {
            console.error('Erro ao enviar dados de fim de jogo:', error);
            throw error;
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
            console.error("Erro: 'cartasIniciais' está vazio ou inválido. Não foi possível renderizar as cartas.");
        }

        cartas = document.querySelectorAll('.cartas');

        mandarEstadoCartasParaPHP(); 

        atualizarPlacar();
        atualizarCronometro();
        tabuleiro.classList.add('pausado');

        if (modo === 'duo') {
            if (usuario_sessao_id == id_jogador1) { 
                if (!id_jogador2) {
                    botaoIniciar.disabled = true;
                    botaoIniciar.textContent = 'Aguardando Jogador 2...';
                } else {
                    botaoIniciar.disabled = false;
                    botaoIniciar.textContent = 'Iniciar Jogo';
                    iniciarPollingEstadoJogo();
                }
            } else if (usuario_sessao_id == id_jogador2) { 
                botaoIniciar.style.display = 'none'; 
                iniciarPollingEstadoJogo();
            } else { 
                 botaoIniciar.style.display = 'none';
                 iniciarPollingEstadoJogo();
            }
        } else { 
            botaoIniciar.disabled = false;
            botaoIniciar.textContent = 'Iniciar Jogo';
            aplicarBloqueioDeTurno(); 
        }

        aplicarBloqueioDeTurno();
    }

    async function mandarEstadoCartasParaPHP() {
        if (!id_partida) {
            console.error('ID da partida não definido. Não é possível salvar o estado das cartas.');
            return;
        }

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
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_partida: id_partida,
                    estado_cartas_json: estadoAtualCartas
                })
            });

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (jsonError) {
                    throw new Error(`Erro HTTP: ${response.status} ${response.statusText}. Resposta não é JSON.`);
                }
                throw new Error(`Erro do servidor ao salvar estado das cartas: ${errorData.mensagem || 'Desconhecido'}`);
            }

            const data = await response.json();

            if (data.sucesso) {
                console.log('Estado das cartas salvo com sucesso:', data.mensagem);
            } else {
                console.error('Falha ao salvar estado das cartas:', data.mensagem);
            }

        } catch (error) {
            console.error('Erro ao enviar estado das cartas para o servidor:', error);
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
                    let errorData = await response.text();
                    console.error('Erro HTTP no polling:', response.status, response.statusText, errorData);
                    if (response.status === 500) {
                        pararPollingEstadoJogo();
                        alert('Erro de conexão com o servidor. O jogo foi interrompido.');
                    }
                    throw new Error(`Erro HTTP! Status: ${response.status}`);
                }

                const data = await response.json();

                if (data.sucesso && data.estado_jogo) {
                    const estadoRemoto = data.estado_jogo;
                    
                    if (estadoRemoto.vencedor_id !== null || (estadoRemoto.vencedor_id === null && estadoRemoto.pontos_jogador1 === estadoRemoto.pontos_jogador2 && estadoRemoto.tempo > 0 && estadoRemoto.estado_cartas_json && estadoRemoto.estado_cartas_json.every(c => c.em_par))) {
                        if (vencedor === null) { 
                            vencedor = estadoRemoto.vencedor_id;
                            jogoAtivo = false; 

                            pararCronometro();
                            pararPollingEstadoJogo(); 
                            pararTimerTurno();
                            
                            tabuleiro.classList.add('pausado'); 
                            tabuleiro.classList.add('oponente-jogando'); 
                            botaoIniciar.style.display = 'none';

                            let mensagemFimJogo = 'Fim de Jogo!';
                            if (vencedor === null) {
                                mensagemFimJogo += '\nEmpate!';
                            } else if (vencedor == id_jogador1) {
                                mensagemFimJogo += `\nJogador 1 venceu com ${estadoRemoto.pontos_jogador1} pontos!`;
                            } else if (vencedor == id_jogador2) {
                                mensagemFimJogo += `\nJogador 2 venceu com ${estadoRemoto.pontos_jogador2} pontos!`;
                            }
                            alert(mensagemFimJogo);
                        }
                        return; 
                    }
                    
                    
                    if (vencedor !== null || !jogoAtivo && tabuleiro.classList.contains('oponente-jogando')) {
                        tabuleiro.classList.add('pausado');
                        tabuleiro.classList.add('oponente-jogando');
                        botaoIniciar.style.display = 'none';
                        pararCronometro();
                        pararTimerTurno();
                        return; 
                    }

                    const jogoComecouNoServidor = (estadoRemoto.vez_jogador_id !== null && estadoRemoto.vez_jogador_id !== 0); 
                    if (jogoComecouNoServidor && !jogoAtivo) {
                        jogoAtivo = true;
                        tabuleiro.classList.remove('pausado'); 
                        console.log('Jogo iniciado no servidor. Ativando jogo localmente.');
                        iniciarCronometro();
                        if (usuario_sessao_id == id_jogador1 || usuario_sessao_id == id_jogador2) {
                            botaoIniciar.style.display = 'none';
                        }
                    }

                    if (jogoAtivo && estadoRemoto.tempo !== tempo) {
                        tempo = estadoRemoto.tempo;
                        atualizarCronometro();
                    }

                    if (pontosJogador1 !== estadoRemoto.pontos_jogador1) {
                        pontosJogador1 = estadoRemoto.pontos_jogador1;
                        atualizarPlacar(); 
                    }
                    if (pontosJogador2 !== estadoRemoto.pontos_jogador2) {
                        pontosJogador2 = estadoRemoto.pontos_jogador2;
                        atualizarPlacar(); 
                    }
                    
                    if (jogoAtivo) {
                        const jogadorAtualRemoto = estadoRemoto.vez_jogador_id;
                        let numJogadorAtualRemoto = 0; 
                        if (jogadorAtualRemoto === id_jogador1) {
                            numJogadorAtualRemoto = 1;
                        } else if (jogadorAtualRemoto === id_jogador2) {
                            numJogadorAtualRemoto = 2;
                        }

                        if (jogadorAtual !== numJogadorAtualRemoto) {
                            jogadorAtual = numJogadorAtualRemoto;
                            atualizarPlacar();
                            aplicarBloqueioDeTurno();
                        } else if (!tabuleiro.classList.contains('oponente-jogando') || tabuleiro.classList.contains('pausado')) {
                            aplicarBloqueioDeTurno();
                        }
                    }

                    if (cartas && cartas.length > 0) { 
                        const cartasRemotas = estadoRemoto.estado_cartas_json;
                        if (cartasRemotas) {
                            cartasRemotas.forEach(cartaRemota => {
                                const cartaLocal = document.querySelector(`.cartas[data-id-unico="${cartaRemota.id_unico}"]`);
                                if (cartaLocal) {
                                    if (cartaRemota.virada && !cartaLocal.classList.contains('virada')) {
                                        cartaLocal.classList.add('virada');
                                    } else if (!cartaRemota.virada && cartaLocal.classList.contains('virada') && !cartaLocal.classList.contains('par')) {
                                        cartaLocal.classList.remove('virada');
                                    }

                                    if (cartaRemota.em_par && !cartaLocal.classList.contains('par')) {
                                        cartaLocal.classList.add('par');
                                        cartaLocal.removeEventListener('click', virarCarta);
                                    } else if (!cartaRemota.em_par && cartaLocal.classList.contains('par')) {
                                        cartaLocal.classList.remove('par');
                                        if(!cartaLocal.classList.contains('virada') && !cartaLocal.classList.contains('par')) { 
                                            cartaLocal.addEventListener('click', virarCarta);
                                        }
                                    }
                                }
                            });
                            
                            const numCartasViradasRemotasNaoEmPar = cartasRemotas.filter(c => c.virada && !c.em_par).length;
                            if (cartasViradas.length > 0 && numCartasViradasRemotasNaoEmPar === 0) {
                                resetarTabuleiro();
                            }
                        }
                    }

                } else {
                    console.error('Falha na sincronização do estado do jogo:', data.mensagem);
                }
            } catch (error) {
                console.error('Erro no polling do estado do jogo:', error);
            }
        }, 1500);
    }

    function pararPollingEstadoJogo() {
        if (pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null;
            console.log('Polling do estado do jogo parado.');
        }
    }

    botaoIniciar.addEventListener('click', async () => {
        if (botaoIniciar.textContent === 'Iniciar Jogo' && !jogoAtivo) {
            if (modo === 'duo' && usuario_sessao_id == id_jogador1) {
                try {
                    const response = await fetch('./php/iniciar_jogo_db.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id_partida: id_partida })
                    });
                    const data = await response.json();
                    if (data.sucesso) {
                        console.log('Server reported game started successfully.');
                        jogoAtivo = true;
                        botaoIniciar.disabled = true;
                        botaoIniciar.textContent = 'Em Jogo...';
                        tabuleiro.classList.remove('pausado');
                        iniciarCronometro();
                        aplicarBloqueioDeTurno();
                        if (checkPlayerStatusInterval) {
                            clearInterval(checkPlayerStatusInterval);
                            console.log('Jogo iniciado. Polling de status de jogador parado.');
                        }
                        iniciarPollingEstadoJogo();

                    } else {
                        console.error('Failed to signal game start to server:', data.mensagem);
                        alert('Erro ao iniciar o jogo: ' + data.mensagem);
                    }
                } catch (error) {
                    console.error('Error starting game via server:', error);
                    alert('Erro de conexão ao iniciar o jogo.');
                }
            } else if (modo === 'solo') {
                jogoAtivo = true;
                tabuleiro.classList.remove('pausado');
                botaoIniciar.disabled = true;
                botaoIniciar.textContent = 'Em Jogo...';
                iniciarCronometro(); 
                iniciarTimerTurno(); 
                aplicarBloqueioDeTurno(); 
                console.log('Jogo solo iniciado.');
            }
        }
    });

    inicializarJogo();
    inicializarStatusJogadores();

    if (modo === 'duo' && id_jogador2) {
        iniciarPollingEstadoJogo();
    }
});