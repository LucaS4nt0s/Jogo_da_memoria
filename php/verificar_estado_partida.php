<?php
header('Content-Type: application/json');
session_start();
require_once 'conexao_bd.php'; 

$response = [
    'jogador1_id' => null,
    'jogador2_id' => null,
    'jogador2_conectado' => false 
];
$data = json_decode(file_get_contents('php://input'), true);

$partida_id = filter_var($data['id_partida'] ?? null, FILTER_VALIDATE_INT);

if ($partida_id) {
    $stmt = $pdo->prepare("SELECT usuario_id, jogador2_id FROM partidas WHERE id = ?");
    $stmt->execute([$partida_id]);
    $partida = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($partida) {
        $response['jogador1_id'] = $partida['usuario_id'];
        $response['jogador2_id'] = $partida['jogador2_id'];

        if ($partida['jogador2_id'] !== null) {
            $response['jogador2_conectado'] = true;
        }
    }
}

echo json_encode($response);
exit();
?>