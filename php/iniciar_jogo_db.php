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

    $usuario_sessao_id = $_SESSION['usuario_id'] ?? null;

    if (!$usuario_sessao_id) {
        throw new Exception('Usuário não autenticado. Por favor, faça login.');
    }

    $stmt = $pdo->prepare("SELECT usuario_id, jogador2_id, vez_jogador_id FROM partidas WHERE id = ?");
    $stmt->execute([$id_partida]);
    $partida = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$partida) {
        throw new Exception('Partida não encontrada.');
    }

    if ($partida['usuario_id'] != $usuario_sessao_id) {
        throw new Exception('Apenas o Jogador 1 (criador da partida) pode iniciar o jogo.');
    }

    if ($partida['vez_jogador_id'] !== null && $partida['vez_jogador_id'] !== 0) { 
        $response['sucesso'] = true;
        $response['mensagem'] = 'O jogo já foi iniciado.';
        echo json_encode($response);
        exit;
    }
    
    $stmt_update = $pdo->prepare("
        UPDATE partidas
        SET vez_jogador_id = usuario_id
        WHERE id = ?
    ");
    $stmt_update->execute([$id_partida]);

    if ($stmt_update->rowCount() > 0) {
        $response['sucesso'] = true;
        $response['mensagem'] = 'Jogo iniciado com sucesso.';
    } else {
        $response['mensagem'] = 'Falha ao atualizar o estado de início do jogo. Nenhuma linha afetada.';
    }

} catch (PDOException $e) {
    $response['mensagem'] = 'Erro no banco de dados: ' . $e->getMessage();
    error_log('PDOException in iniciar_jogo_db.php: ' . $e->getMessage());
} catch (Exception $e) {
    $response['mensagem'] = 'Erro: ' . $e->getMessage();
    error_log('Exception in iniciar_jogo_db.php: ' . $e->getMessage());
}

echo json_encode($response);
exit;
?>