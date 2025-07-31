<?php

session_start();
require_once 'conexao_bd.php'; 

header('Content-Type: application/json');

try {

    $stmt = $pdo->prepare("
        SELECT
            u.nome AS jogador,
            MAX(CASE
                WHEN p.usuario_id = u.id THEN p.pontos_jogador1
                WHEN p.jogador2_id = u.id THEN p.pontos_jogador2
                ELSE 0
            END) AS maior_pontuacao,
            MAX(p.data) AS data_da_ultima_partida_com_pontos -- Data da última partida onde ele participou e obteve pontos
        FROM usuarios u
        JOIN partidas p ON u.id = p.usuario_id OR u.id = p.jogador2_id
        GROUP BY u.id, u.nome
        ORDER BY maior_pontuacao DESC
        LIMIT 10
    ");
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $data = [];
    $position = 1;
    foreach ($results as $row) {
        $data[] = [
            $position++,
            htmlspecialchars($row['jogador']), 
            $row['maior_pontuacao'],
            date('d/m/Y', strtotime($row['data_da_ultima_partida_com_pontos'])) 
        ];
    }

    echo json_encode(['success' => true, 'headers' => ['Posição', 'Jogador', 'Maior Pontuação', 'Data da Partida'], 'rows' => $data]);

} catch (PDOException $e) {
    
    error_log('Erro ao buscar ranking por pontos: ' . $e->getMessage()); 
    echo json_encode(['success' => false, 'message' => 'Erro ao buscar ranking por pontos. Por favor, tente novamente mais tarde.']);
}
?>