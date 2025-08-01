<?php

session_start();
require_once 'conexao_bd.php'; 

header('Content-Type: application/json');

try {
   
    $stmt = $pdo->prepare("
        SELECT
            u.nome AS jogador,
            MIN(p.tempo) AS melhor_tempo_segundos,
            p.modo AS modo_da_partida
        FROM usuarios u
        JOIN partidas p ON u.id = p.vencedor_id
        WHERE p.tempo > 0 -- Ignora partidas com tempo zero ou não definido
        GROUP BY u.id, u.nome
        ORDER BY melhor_tempo_segundos ASC
        LIMIT 10
    ");
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $data = [];
    $position = 1;
    foreach ($results as $row) {
        
        $melhorTempoFormatado = $row['melhor_tempo_segundos'] ? gmdate("i:s", $row['melhor_tempo_segundos']) : 'N/A';
        $data[] = [
            $position++,
            htmlspecialchars($row['jogador']), 
            $melhorTempoFormatado,
            ucfirst($row['modo_da_partida']) 
        ];
    }

    echo json_encode(['success' => true, 'headers' => ['Posição', 'Jogador', 'Melhor Tempo', 'Modo'], 'rows' => $data]);

} catch (PDOException $e) {
  
    error_log('Erro ao buscar ranking por tempo: ' . $e->getMessage()); 
    echo json_encode(['success' => false, 'message' => 'Erro ao buscar ranking por tempo. Por favor, tente novamente mais tarde.']);
}
?>