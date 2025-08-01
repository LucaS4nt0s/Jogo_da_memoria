<?php
header('Content-Type: application/json'); 
require_once 'conexao_bd.php'; 

$response = ['sucesso' => false, 'mensagem' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    $id_partida = $data['id_partida'] ?? null;
    $proximo_jogador_id = $data['proximo_jogador'] ?? null;

    if ($id_partida === null || $proximo_jogador_id === null) {
        $response['mensagem'] = 'Dados incompletos fornecidos.';
    } else {
        try {
            $stmt = $pdo->prepare("UPDATE partidas SET vez_jogador_id = ? WHERE id = ?");
            $stmt->execute([$proximo_jogador_id, $id_partida]);

            if ($stmt->rowCount() > 0) {
                $response['sucesso'] = true;
                $response['mensagem'] = 'Vez do jogador atualizada com sucesso.';
            } else {
                $response['mensagem'] = 'Nenhuma partida encontrada com o ID fornecido ou nenhum dado foi alterado.';
            }

        } catch (PDOException $e) {
            $response['mensagem'] = 'Erro no banco de dados: ' . $e->getMessage();
        } catch (Exception $e) {
            $response['mensagem'] = 'Erro inesperado: ' . $e->getMessage();
        }
    }
} else {
    $response['mensagem'] = 'Método de requisição inválido. Apenas POST é permitido.';
}

echo json_encode($response);
?>