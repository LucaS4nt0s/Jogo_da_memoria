<?php
header('Content-Type: application/json'); 
require_once 'conexao.php'; 

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    $id_partida = $data['id_partida'] ?? null;
    $proximo_jogador_id = $data['proximo_jogador'] ?? null;

    if ($id_partida === null || $proximo_jogador_id === null) {
        $response['message'] = 'Dados incompletos fornecidos.';
    } else {
        try {
            $stmt = $pdo->prepare("UPDATE partidas SET vez_jogador_id = ? WHERE id = ?");
            $stmt->execute([$proximo_jogador_id, $id_partida]);

            if ($stmt->rowCount() > 0) {
                $response['success'] = true;
                $response['message'] = 'Vez do jogador atualizada com sucesso.';
            } else {
                $response['message'] = 'Nenhuma partida encontrada com o ID fornecido ou nenhum dado foi alterado.';
            }

        } catch (PDOException $e) {
            $response['message'] = 'Erro no banco de dados: ' . $e->getMessage();
        } catch (Exception $e) {
            $response['message'] = 'Erro inesperado: ' . $e->getMessage();
        }
    }
} else {
    $response['message'] = 'Método de requisição inválido. Apenas POST é permitido.';
}

echo json_encode($response);
?>