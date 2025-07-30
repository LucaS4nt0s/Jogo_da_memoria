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