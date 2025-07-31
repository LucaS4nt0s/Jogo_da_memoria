<?php
header('Content-Type: application/json');

session_start();
require_once 'conexao_bd.php'; 

$resposta = ['sucesso' => false, 'mensagem' => ''];
$data = json_decode(file_get_contents('php://input'), true);

$id_partida = filter_var($data['id_partida'] ?? null, FILTER_VALIDATE_INT);
$tempo_final = filter_var($data['tempo_final'] ?? null, FILTER_VALIDATE_INT);
$vencedor = $data['vencedor'] ?? null;

if ($id_partida === false || $tempo_final === false || $tempo_final < 0) {
    $resposta['mensagem'] = 'Dados de fim de jogo inválidos.';
    echo json_encode($resposta);
    exit();
}

$stmt = $pdo->prepare("SELECT usuario_id, jogador2_id FROM partidas WHERE id = ?");
$stmt->execute([$id_partida]);
$partida = $stmt->fetch(PDO::FETCH_ASSOC); 

if (!$partida) {
    $resposta['mensagem'] = 'Partida não encontrada para finalizar.';
    echo json_encode($resposta);
    exit();
}

if (!isset($_SESSION['usuario_id']) || ($_SESSION['usuario_id'] !== $partida['usuario_id'] && $_SESSION['usuario_id'] !== $partida['jogador2_id'])) {
    $resposta['mensagem'] = 'Você não está autorizado a finalizar esta partida.';
    echo json_encode($resposta);
    exit();
}

try {
    $sql = "UPDATE partidas SET  tempo = ?";
    $params = [$tempo_final, $id_partida];

    if ($vencedor === 'Empate') {
        $sql .= " WHERE id = ?";
    } else {
        $sql .= ", vencedor_id = ? WHERE id = ?";
        $params = [$tempo_final, $vencedor, $id_partida]; 
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    if ($stmt->rowCount() > 0) {
        $resposta['sucesso'] = true;
        $resposta['mensagem'] = 'Partida finalizada com sucesso.';
    } else {
        $resposta['mensagem'] = 'Partida já estava finalizada ou nenhum dado alterado.';
    }

} catch (PDOException $e) {
    error_log("Erro no PDO ao finalizar partida: " . $e->getMessage());
    $resposta['mensagem'] = 'Erro interno do servidor ao finalizar partida.';
}

echo json_encode($resposta);
exit();
?>