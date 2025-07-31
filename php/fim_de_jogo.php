<?php

session_start();
require_once './php/conexao_bd.php';

header('Content-Type: application/json');

$response = ['sucesso' => false, 'mensagem' => ''];

$data = json_decode(file_get_contents('php://input'), true);

$partida_id = filter_var($data['id_partida'] ?? null, FILTER_VALIDATE_INT);
$tempoFinal = filter_var($data['tempoFinal'] ?? null, FILTER_VALIDATE_INT);
$vencedor = filter_var($data['vencedor'], FILTER_VALIDATE_INT);

if ($partida_id === false || $tempoFinal === false) {
    $response['mensagem'] = 'Dados inválidos.';
    echo json_encode($response);
    exit();
}

try{
    $stmt = $pdo->prepare("UPDATE partidas SET tempo = ?, vencedor_id = ? WHERE id = ?");
    $stmt->execute([$tempoFinal, $vencedor, $partida_id]);

    if ($stmt->rowCount() > 0) {
        $response['sucesso'] = true;
        $response['mensagem'] = 'Partida finalizada com sucesso.';
    } else {
        $response['mensagem'] = 'Nenhuma alteração feita. Verifique os dados.';
    }
} catch (PDOException $e) {
    error_log("Erro ao finalizar partida: " . $e->getMessage());
    $response['mensagem'] = 'Erro ao finalizar partida: ' . $e->getMessage();
}

echo json_encode($response);
exit();
?>