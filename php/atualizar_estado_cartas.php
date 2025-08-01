<?php
session_start();
require_once 'conexao_bd.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Método de requisição inválido.']);
    exit();
}

$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

if (!isset($data['id_partida']) || !isset($data['estado_cartas_json'])) {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Dados incompletos fornecidos.']);
    exit();
}

$id_partida = $data['id_partida'];
$estado_cartas_array = $data['estado_cartas_json'];

$estado_cartas_json_para_db = json_encode($estado_cartas_array);

$usuario_sessao_id = $_SESSION['usuario_id'] ?? null;
if (!$usuario_sessao_id) {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Sessão de usuário não encontrada.']);
    exit();
}

try {
    $stmt = $pdo->prepare("SELECT usuario_id, jogador2_id FROM partidas WHERE id = ?");
    $stmt->execute([$id_partida]);
    $partida = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$partida) {
        echo json_encode(['sucesso' => false, 'mensagem' => 'Partida não encontrada.']);
        exit();
    }

    if ($partida['usuario_id'] != $usuario_sessao_id && $partida['jogador2_id'] != $usuario_sessao_id) {
        echo json_encode(['sucesso' => false, 'mensagem' => 'Você não tem permissão para atualizar esta partida.']);
        exit();
    }

    $stmt = $pdo->prepare("UPDATE partidas SET estado_cartas_json = ? WHERE id = ?");
    $stmt->execute([$estado_cartas_json_para_db, $id_partida]);

    echo json_encode(['sucesso' => true, 'mensagem' => 'Estado das cartas atualizado com sucesso.']);

} catch (PDOException $e) {
    error_log("Erro ao atualizar estado das cartas: " . $e->getMessage());
    echo json_encode(['sucesso' => false, 'mensagem' => 'Erro interno do servidor ao atualizar estado das cartas.']);
}
?>