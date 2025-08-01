<?php
session_start();
header('Content-Type: application/json');
require_once 'conexao_bd.php'; 

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0); 
}

$response = [
    'sucesso' => false,
    'mensagem' => 'Erro desconhecido.'
];

try {
    $json_data = file_get_contents('php://input');
    $data = json_decode($json_data, true);

    if (!isset($data['id_partida'])) {
        throw new Exception('ID da partida não fornecido.');
    }

    $id_partida = $data['id_partida'];

    $stmt = $pdo->prepare("
        SELECT 
            pontos_jogador1, 
            pontos_jogador2, 
            vez_jogador_id, 
            tempo, 
            vencedor_id, 
            estado_cartas_json,
            usuario_id AS id_jogador1,
            jogador2_id
        FROM partidas 
        WHERE id = ?
    ");
    $stmt->execute([$id_partida]);
    $partida = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($partida) {
        $response['sucesso'] = true;
        $response['estado_jogo'] = [
            'pontos_jogador1' => (int)$partida['pontos_jogador1'],
            'pontos_jogador2' => (int)$partida['pontos_jogador2'],
            'vez_jogador_id' => $partida['vez_jogador_id'], 
            'tempo' => (int)$partida['tempo'],
            'vencedor_id' => $partida['vencedor_id'], 
            'estado_cartas_json' => json_decode($partida['estado_cartas_json'], true),
            'id_jogador1' => $partida['id_jogador1'], 
            'id_jogador2' => $partida['jogador2_id'] 
        ];
    } else {
        $response['mensagem'] = 'Partida não encontrada.';
    }

} catch (PDOException $e) {
    $response['mensagem'] = 'Erro no banco de dados: ' . $e->getMessage();
    error_log('PDOException in get_game_state.php: ' . $e->getMessage());
} catch (Exception $e) {
    $response['mensagem'] = 'Erro: ' . $e->getMessage();
    error_log('Exception in get_game_state.php: ' . $e->getMessage());
}

echo json_encode($response);
exit;
?>