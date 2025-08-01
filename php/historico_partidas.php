<?php

session_start();
require_once 'conexao_bd.php'; 

header('Content-Type: application/json');


if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['success' => false, 'message' => 'Usuário não logado.']);
    exit();
}

$usuario_id = $_SESSION['usuario_id'];

try {
    $stmt = $pdo->prepare("
        SELECT
            p.id AS partida_id,
            p.modo,
            u1.nome AS jogador1_nome,
            u2.nome AS jogador2_nome,
            p.pontos_jogador1,
            p.pontos_jogador2,
            p.tempo,
            CASE
                WHEN p.vencedor_id = ? THEN 'Vitória'
                WHEN p.vencedor_id IS NULL AND p.modo = 'duo' AND p.pontos_jogador1 = p.pontos_jogador2 AND (p.pontos_jogador1 > 0 OR p.tempo > 0) THEN 'Empate' -- Empate em Duo com pontos/tempo
                WHEN p.vencedor_id IS NULL AND p.modo = 'solo' AND p.tempo > 0 THEN 'Concluída' -- Partida Solo concluída por tempo
                ELSE 'Derrota'
            END AS resultado,
            p.data AS data_partida
        FROM partidas p
        JOIN usuarios u1 ON p.usuario_id = u1.id
        LEFT JOIN usuarios u2 ON p.jogador2_id = u2.id -- LEFT JOIN para partidas solo
        WHERE (p.usuario_id = ? OR p.jogador2_id = ?)
          AND (
                (p.pontos_jogador1 > 0 OR p.pontos_jogador2 > 0) OR -- Pelo menos um jogador fez pontos
                (p.tempo > 0 AND p.modo = 'solo') OR                -- Partida solo com tempo registrado
                (p.vencedor_id IS NOT NULL)                         -- Ou teve um vencedor (exclui partidas incompletas)
              )
        ORDER BY p.data DESC
        LIMIT 20 -- Limite para não carregar muitas partidas de uma vez
    ");
   
    $stmt->execute([$usuario_id, $usuario_id, $usuario_id]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $data = [];
    foreach ($results as $row) {
        
        $tempo_formatado = $row['tempo'] ? gmdate("i:s", $row['tempo']) : 'N/A';

       
        $pontuacao_jogador = ($row['jogador1_nome'] == $_SESSION['usuario_nome']) ? $row['pontos_jogador1'] : $row['pontos_jogador2'];
        $pontuacao_oponente = ($row['jogador1_nome'] == $_SESSION['usuario_nome']) ? $row['pontos_jogador2'] : $row['pontos_jogador1'];

       
        $nome_oponente = ($row['modo'] === 'duo' && $row['jogador2_nome']) ? htmlspecialchars($row['jogador1_nome'] == $_SESSION['usuario_nome'] ? $row['jogador2_nome'] : $row['jogador1_nome']) : 'N/A (Solo)';

        $data[] = [
            $row['partida_id'],
            htmlspecialchars(ucfirst($row['modo'])),
            $nome_oponente,
            $pontuacao_jogador ?? '0', 
            $pontuacao_oponente ?? '0',
            $tempo_formatado,
            htmlspecialchars($row['resultado']),
            date('d/m/Y H:i', strtotime($row['data_partida']))
        ];
    }

    echo json_encode([
        'success' => true,
        'headers' => ['ID Partida', 'Modo', 'Oponente', 'Meus Pontos', 'Pontos Oponente', 'Tempo', 'Resultado', 'Data'],
        'rows' => $data
    ]);

} catch (PDOException $e) {
    error_log('Erro ao buscar histórico de partidas: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Erro ao buscar histórico de partidas.']);
}
?>