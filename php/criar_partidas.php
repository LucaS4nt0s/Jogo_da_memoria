<?php
include_once 'conexao_bd.php';

function criarPartida($modo, $usuario_id) {
    global $pdo;

    try {
        $stmt = $pdo->prepare("INSERT INTO partidas (modo, usuario_id) VALUES (?, ?)");
        $stmt->execute([$modo, $usuario_id]);
        return $pdo->lastInsertId();
    } catch (PDOException $e) {
        die("Erro ao criar partida: " . $e->getMessage());
    }

    return false;
}