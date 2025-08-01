<?php
include_once 'conexao_bd.php';

function criarPartida($modo, $usuario_id) {
    global $pdo; 

    try {
        $cartas_base_tipos = [
            'bemSolo',
            'chewie',
            'darthVader',
            'droids',
            'leiaOrgana',
            'luke',
            'obiWan',
            'yoda'
        ];

        $todas_as_cartas_para_jogo = [];
        $posicao_inicial = 0;

        foreach ($cartas_base_tipos as $tipo_carta) {
            $todas_as_cartas_para_jogo[] = [
                'id_unico' => uniqid(), 
                'tipo' => $tipo_carta,
                'imagem' => "./img/{$tipo_carta}.png",
                'virada' => false, 
                'em_par' => false,
                'pos' => $posicao_inicial++ 
            ];
            $todas_as_cartas_para_jogo[] = [
                'id_unico' => uniqid(),
                'tipo' => $tipo_carta,
                'imagem' => "./img/{$tipo_carta}.png",
                'virada' => false,
                'em_par' => false,
                'pos' => $posicao_inicial++
            ];
        }

        shuffle($todas_as_cartas_para_jogo);

        $estado_cartas_json_para_db = json_encode($todas_as_cartas_para_jogo);

        $pontos_iniciais_j1 = 0;
        $pontos_iniciais_j2 = 0;
        $vez_inicial_jogador_id = $usuario_id; 

        $stmt = $pdo->prepare("INSERT INTO partidas (modo, usuario_id, pontos_jogador1, pontos_jogador2, vez_jogador_id, estado_cartas_json) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $modo,
            $usuario_id,
            $pontos_iniciais_j1,
            $pontos_iniciais_j2,
            $vez_inicial_jogador_id,
            $estado_cartas_json_para_db 
        ]);

        $_SESSION['id_partida'] = $pdo->lastInsertId();
        return $pdo->lastInsertId(); 

    } catch (PDOException $e) {
        error_log("Erro ao criar partida: " . $e->getMessage()); 
        return false;
    }
}