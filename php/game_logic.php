<?php

$cartas = [
    'bemSolo',
    'chewie',
    'darthVader',
    'droids',
    'leiaOrgana',
    'luke',
    'obiWan',
    'yoda'
];


$todas_as_cartas = array_merge($cartas, $cartas);

shuffle($todas_as_cartas);

$cartas_jogo = [];
foreach ($todas_as_cartas as $index => $carta) {
    $cartas_jogo[] = [
        'id' => uniqid(),
        'nome' => $carta,
        'imagem' => "./img/{$carta}.png",
    ];
}

?>