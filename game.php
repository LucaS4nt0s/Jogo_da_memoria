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

$estado_botao = 'disabled';
if(isset($_SESSION['modo']) && isset($_SESSION['id_partida'])) {
    $modo = $_SESSION['modo'];
    $id_partida = $_SESSION['id_partida'];

    if ($modo === 'duo') {
        $stmt = $pdo->prepare("SELECT jogador2_id FROM partidas WHERE id = ?");
        $stmt->execute([$id_partida]);
        $partida = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($partida && $partida['jogador2_id'] !== null) {
            $estado_botao = '';
        }
    } else if ($modo === 'solo') {
        $estado_botao = '';
    }
} 

if (isset($_POST['iniciar_jogo'])) {
    $stmt = $pdo->prepare("SELECT * FROM partidas WHERE id_partida = ?");
    $stmt->execute([$_SESSION['id_partida']]);
    $partida = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$partida) {
        echo "Partida não encontrada.";
        exit();
    }
    if($_SESSION['modo'] === 'duo' && $partida['jogador2_id'] === null) {
        echo "<script>alert('Jogador 2 não conectado');</script>";
        exit();
    }
}

?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jogo da Memória</title>
    <link rel="stylesheet" href="./css/header.css">
    <link rel="stylesheet" href="./css/game.css">
</head>
<body>
    <?php include_once './php/header.php'; ?>
    <main>
        <div class="game-container">
            <div class="partida-info">
                <?php if ($_SESSION['modo'] === 'duo'): ?>
                    <p>Você está jogando no modo <span class="modo">Multiplayer</span>.</p>
                    <p><span class="id_partida">ID da Partida:</span> <?php echo htmlspecialchars($_GET['id_partida']); ?></p>
                <?php endif; ?>
                <?php if ($_SESSION['modo'] === 'solo'): ?>
                    <p>Você está jogando no modo <span class="modo">Solo</span>.</p>
                <?php endif; ?>
                <p><span class="cronometro">Cronômetro:</span> <span id="cronometro">00:00</span></p>
                <div class="controles">
                    <form method="POST">
                        <button type="submit" name="iniciar_jogo" class="Botao-Iniciar" <?php echo $estado_botao; ?>>Iniciar Jogo</button>
                    </form>
                </div>
            </div>
            <div class="tabuleiro">
                <ul>
                    <li class="cartas"><img src="./img/starWars.png" alt="Carta 1"></li>
                    <li class="cartas"><img src="./img/starWars.png" alt="Carta 2"></li>
                    <li class="cartas"><img src="./img/starWars.png" alt="Carta 3"></li>
                    <li class="cartas"><img src="./img/starWars.png" alt="Carta 4"></li>
                    <li class="cartas"><img src="./img/starWars.png" alt="Carta 5"></li>
                    <li class="cartas"><img src="./img/starWars.png" alt="Carta 6"></li>
                    <li class="cartas"><img src="./img/starWars.png" alt="Carta 7"></li>
                    <li class="cartas"><img src="./img/starWars.png" alt="Carta 8"></li>
                    <li class="cartas"><img src="./img/starWars.png" alt="Carta 9"></li>
                    <li class="cartas"><img src="./img/starWars.png" alt="Carta 10"></li>
                    <li class="cartas"><img src="./img/starWars.png" alt="Carta 11"></li>
                    <li class="cartas"><img src="./img/starWars.png" alt="Carta 12"></li>
                    <li class="cartas"><img src="./img/starWars.png" alt="Carta 13"></li>
                    <li class="cartas"><img src="./img/starWars.png" alt="Carta 14"></li>
                    <li class="cartas"><img src="./img/starWars.png" alt="Carta 15"></li>
                    <li class="cartas"><img src="./img/starWars.png" alt="Carta 16"></li>
            </div>
        </div>
    </main>
</body>
</html>