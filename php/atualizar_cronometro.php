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

    if (!isset($data['id_partida']) || !isset($data['tempo'])) {
        throw new Exception('Dados incompletos fornecidos.');
    }

    $id_partida = (int)$data['id_partida'];
    $tempo = (int)$data['tempo'];

    if ($tempo < 0) {
        throw new Exception('Tempo não pode ser negativo.');
    }

    // Verificar se o usuário tem permissão para atualizar esta partida
    $usuario_sessao_id = $_SESSION['usuario_id'] ?? null;
    if (!$usuario_sessao_id) {
        throw new Exception('Usuário não autenticado.');
    }

    // Verificar se o usuário é participante da partida
    $stmt = $pdo->prepare("SELECT usuario_id, jogador2_id FROM partidas WHERE id = ?");
    $stmt->execute([$id_partida]);
    $partida = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$partida) {
        throw new Exception('Partida não encontrada.');
    }

    // Verificar se o usuário é um dos jogadores da partida
    if ($partida['usuario_id'] != $usuario_sessao_id && $partida['jogador2_id'] != $usuario_sessao_id) {
        throw new Exception('Usuário não é participante desta partida.');
    }

    $stmt = $pdo->prepare("UPDATE partidas SET tempo = ? WHERE id = ?");
    $stmt->execute([$tempo, $id_partida]);

    if ($stmt->rowCount() > 0) {
        $response['sucesso'] = true;
        $response['mensagem'] = 'Cronômetro atualizado com sucesso.';
        $response['tempo_atualizado'] = $tempo;
    } else {
        $response['mensagem'] = 'Nenhuma partida encontrada com o ID fornecido ou nenhum dado foi alterado.';
    }

} catch (PDOException $e) {
    $response['mensagem'] = 'Erro no banco de dados: ' . $e->getMessage();
    error_log('PDOException in atualizar_cronometro.php: ' . $e->getMessage());
} catch (Exception $e) {
    $response['mensagem'] = 'Erro: ' . $e->getMessage();
    error_log('Exception in atualizar_cronometro.php: ' . $e->getMessage());
}

echo json_encode($response);
exit;
?>

