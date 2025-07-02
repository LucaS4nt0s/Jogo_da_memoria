create database JogoDaMemoria;

use JogoDaMemoria;

create table usuarios(
    id int auto_increment primary key,
    nome varchar(100) not null,
    email varchar(100) not null unique,
    senha varchar(255) not null
);

create table partidas(
    id int auto_increment primary key,
    usuario_id int not null,
    jogador2_id int,
    data datetime not null default current_timestamp,
    tempo int default 0,
    modo ENUM('solo', 'duo') not null,
    vencedor_id int default null,
    pontos_jogador1 int default 0,  
    pontos_jogador2 int default 0,
    foreign key (usuario_id) references usuarios(id) on delete cascade
);

create table ranking(
    usuario_id int primary key,
    total_partidas int default 0,
    partidas_vencidas int default 0,
    tempo_medio int default 0,
    foreign key (usuario_id) references usuarios(id) on delete cascade
);
