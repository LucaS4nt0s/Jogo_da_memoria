<?php

session_start();
require_once './php/auth.php';
require_once './php/conexao_bd.php';
require_once './php/criar_partidas.php';

if (!isset($_SESSION['usuario_id'])) {
    header('Location: index.php');
    exit();
}

if (isset($_POST['logout'])) {
    session_destroy();
    header('Location: index.php');
    exit();
}

$usuario_id = $_SESSION['usuario_id'];
$stmt = $pdo->prepare("SELECT * FROM usuarios WHERE id = ?");
$stmt->execute([$usuario_id]);
$usuario = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$usuario) {
    echo "Usuário não encontrado.";
    exit();
}

if (isset($_POST['modo'])) {
    $id_partida = criarPartida($_POST['modo'], $usuario_id);
    $_SESSION['modo'] = $_POST['modo'];
    $_SESSION['id_partida'] = $id_partida;
    
    if ($id_partida) {
        header("Location: game.php?id_partida=$id_partida");
        exit();
    } else {
        echo "<script>alert('Erro ao criar partida. Tente novamente.');</script>";
    }

}

if(isset($_POST['entrar_partida'])) {
    $codigo_partida = $_POST['codigo_partida'];
    $stmt = $pdo->prepare("SELECT * FROM partidas WHERE id = ?");
    $stmt->execute([$codigo_partida]);
    $partida = $stmt->fetch(PDO::FETCH_ASSOC);

    if($partida['modo'] === 'duo' && $partida['jogador2_id'] === null && $partida['usuario_id'] !== $usuario_id) {
        $stmt = $pdo->prepare("UPDATE partidas SET jogador2_id = ? WHERE id = ?");
        $stmt->execute([$usuario_id, $codigo_partida]);
        $_SESSION['modo'] = 'duo';
        $_SESSION['id_partida'] = $codigo_partida;
        header("Location: game.php?id_partida=$codigo_partida");
        exit();
    } else if($partida['modo'] === 'solo' || $partida['usuario_id'] === $usuario_id) {
        echo "<script>alert('Não é possível entrar nessa partida.');</script>";
    }else {
        echo "<script>alert('Partida não encontrada ou já está cheia.');</script>";
    }
}
?>

<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="./css/header.css">
  
    <link rel="stylesheet" href="./css/home.css">
    <title>Jogo da Memória</title>

</head>

<body>

    <?php include_once './php/header.php'; ?>

    <main>
        <div class="game-container">
            <div class="criar-partida">
                <p>Criar uma partida</p>
                <form method="POST">
                    <h3 class="titulo-escolha">Escolha o modo de jogo:</h3>
                    <div class="modo-jogo">
                        <div class="modos">
                            <button type="submit" name="modo" value="solo" class="Botao-Solo">Solo</button>
                        </div>
                        <div class="modos">
                            <button type="submit" name="modo" value="duo" class="Botao-Multiplayer">Multiplayer</button>
                        </div>
                    </div>
                </form>
            </div>
            <div class="entrar-partida">
                <p>Entrar em uma partida</p>
                <form method="POST">
                    <input type="text" name="codigo_partida" placeholder="Código da partida" required>
                    <button type="submit" name="entrar_partida" class="Botao-Iniciar">Entrar</button>
                </form>
            </div>
        </div>

        <span class="instrucoes">
        <h2>Instruções do Jogo</h2>
        <p>O objetivo do jogo é encontrar todos os pares de cartas. Clique em duas cartas para virá-las. Se forem iguais, elas permanecerão viradas. Se não forem, elas serão viradas novamente após um breve período.</p>
        <p>Boa sorte!</p>
        </span>


    </main>
</body>
</html>