<?php
header('Content-Type: application/json');
session_start();
require_once 'conexao_bd.php'; 

$resposta = ['sucesso' => false, 'mensagem' => ''];
$data = json_decode(file_get_contents('php://input'), true);

$partida_id = filter_var($data['id_partida'] ?? null, FILTER_VALIDATE_INT);
$numero_jogador = filter_var($data['numero_jogador'] ?? null, FILTER_VALIDATE_INT);
$pontos = filter_var($data['pontos'] ?? null, FILTER_VALIDATE_INT);

if ($partida_id === false || $numero_jogador === false || $pontos === false || !in_array($numero_jogador, [1, 2]) || $pontos < 0) {
    $resposta['mensagem'] = 'Dados inválidos.';
    echo json_encode($resposta);
    exit(); 
}

if (!isset($_SESSION['usuario_id'])) {
    $resposta['mensagem'] = 'Sessão de usuário não encontrada.';
    echo json_encode($resposta);
    exit();
}

$stmt = $pdo->prepare("SELECT usuario_id, jogador2_id FROM partidas WHERE id = ?");
$stmt->execute([$partida_id]);
$partida = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$partida || ($_SESSION['usuario_id'] !== $partida['usuario_id'] && $_SESSION['usuario_id'] !== $partida['jogador2_id'])) {
    $resposta['mensagem'] = 'Partida não encontrada ou jogador não está na partida.';
    echo json_encode($resposta);
    exit();
}

$coluna_pontos = $numero_jogador === 1 ? 'pontos_jogador1' : 'pontos_jogador2';

try {
    $stmt = $pdo->prepare("UPDATE partidas SET {$coluna_pontos} = ? WHERE id = ?");
    $stmt->execute([$pontos, $partida_id]);

    if ($stmt->rowCount() > 0) {
        $resposta['sucesso'] = true;
        $resposta['mensagem'] = 'Pontuação atualizada com sucesso.';
    } else {
        $resposta['mensagem'] = 'Nenhuma alteração feita. Verifique os dados ou o jogador não está autorizado.';
    }
} catch (PDOException $e) {
    error_log("Erro ao atualizar pontuação: " . $e->getMessage());
    $resposta['mensagem'] = 'Erro interno ao atualizar pontuação.';
    
}

echo json_encode($resposta);
exit();
?>