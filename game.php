<?php
session_start();
require_once './php/auth.php';
require_once './php/conexao_bd.php';
require_once './php/criar_partidas.php';
require_once './php/game_logic.php';

if (!isset($_SESSION['usuario_id'])) {
    header('Location: index.php');
    exit();
}

if (isset($_POST['logout'])) {
    session_destroy();
    header('Location: index.php');
    exit();
}

$id_partida = $_SESSION['id_partida'] ?? null;
$modo = $_SESSION['modo'] ?? '';
$id_jogador1 = $_SESSION['usuario_id'] ?? null;
$id_jogador2 = null; 

$usuario_id = $_SESSION['usuario_id'];
$stmt = $pdo->prepare("SELECT * FROM usuarios WHERE id = ?");
$stmt->execute([$usuario_id]);
$usuario = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$usuario) {
    echo "Usuário não encontrado.";
    exit();
}

if (isset($_SESSION['id_partida'])) {
    $id_partida = $_SESSION['id_partida'];
    $stmt = $pdo->prepare("SELECT * FROM partidas WHERE id = ?");
    $stmt->execute([$id_partida]);
    $partida = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$partida) {
        echo "Partida não encontrada.";
        exit();
    }
    if ($partida['usuario_id'] !== $usuario_id && $partida['jogador2_id'] !== $usuario_id) {
        echo "Você não está participando desta partida.";
        exit();
    }

    $_SESSION['pontuacao_1'] = $partida['pontos_jogador1'] ?? 0;
    $_SESSION['pontuacao_2'] = $partida['pontos_jogador2'] ?? 0;

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
            $id_jogador2 = $partida['jogador2_id'];
            $id_jogador1 = $usuario_id;
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

<script>
    const cartasIniciais = <?php echo json_encode($cartas_jogo); ?>;
    const id_partida = <?php echo json_encode($_SESSION['id_partida'] ?? null); ?>;
    const modo = <?php echo json_encode($_SESSION['modo'] ?? ''); ?>;
    const id_jogador1 = <?php echo json_encode($id_jogador1); ?>;
    const id_jogador2 = <?php echo json_encode($id_jogador2); ?>;
</script>


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
                    <button class="Botao-Iniciar" <?php echo $estado_botao; ?>>Iniciar Jogo</button>
                </div>
            </div>
            <div class="tabuleiro pausado">
            
            </div>
        </div>
        <div class="pontuacao">
            <h2>Pontuação</h2>
            <span class="pontuacao-1"><p></p></span>
            <?php if ($_SESSION['modo'] === 'duo'): ?>
                <span class="pontuacao-2"><p></p></span>
            <?php endif; ?>
            <span class="vez"><p></p></span>
        </div>
    </main>
    <script src="./js/jogo.js"></script>
</body>
</html>