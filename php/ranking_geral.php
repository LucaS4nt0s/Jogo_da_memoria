<?php

session_start();
require_once 'conexao_bd.php'; 

header('Content-Type: application/json');

try {

    // Consulta SQL aprimorada para ser autossuficiente
    $stmt = $pdo->prepare("
        SELECT
            u.nome AS jogador,
            (
                SELECT COUNT(p.id)
                FROM partidas p
                WHERE p.usuario_id = u.id OR p.jogador2_id = u.id
            ) AS total_partidas,
            (
                SELECT COUNT(p.id)
                FROM partidas p
                WHERE p.vencedor_id = u.id
            ) AS partidas_vencidas,
            (
                SELECT MIN(p.tempo)
                FROM partidas p
                WHERE p.vencedor_id = u.id AND p.tempo > 0
            ) AS melhor_tempo_segundos,
            (
                SELECT SUM(CASE
                    WHEN p.usuario_id = u.id THEN p.pontos_jogador1
                    WHEN p.jogador2_id = u.id THEN p.pontos_jogador2
                    ELSE 0
                END)
                FROM partidas p
                WHERE p.usuario_id = u.id OR p.jogador2_id = u.id
            ) AS pontos_totais
        FROM usuarios u
        ORDER BY pontos_totais DESC, partidas_vencidas DESC, total_partidas DESC
        LIMIT 10
    ");
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $data = [];
    $position = 1;
    foreach ($results as $row) {
        
        $melhorTempoFormatado = ($row['melhor_tempo_segundos'] !== null) ? gmdate("i:s", $row['melhor_tempo_segundos']) : 'N/A';
        $data[] = [
            $position++,
            htmlspecialchars($row['jogador']), 
            $row['pontos_totais'] ?? 0, 
            $row['total_partidas'],
            $row['partidas_vencidas'],
            $melhorTempoFormatado
        ];
    }

    echo json_encode(['success' => true, 'headers' => ['Posição', 'Jogador', 'Pontos Totais', 'Partidas', 'Vitórias', 'Melhor Tempo'], 'rows' => $data]);

} catch (PDOException $e) {
    
    error_log('Erro ao buscar ranking geral: ' . $e->getMessage()); 
    echo json_encode(['success' => false, 'message' => 'Erro ao buscar ranking geral. Por favor, tente novamente mais tarde.']);
}

?>