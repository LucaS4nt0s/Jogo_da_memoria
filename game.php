    <?php
    session_start();
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

    $id_partida = $_SESSION['id_partida'] ?? null;
    $modo = $_SESSION['modo'] ?? '';
    $id_jogador1 = null;
    $id_jogador2 = null; 

    $usuario_id = $_SESSION['usuario_id'];
    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE id = ?");
    $stmt->execute([$usuario_id]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$usuario) {
        echo "Usuário não encontrado.";
        exit();
    }

    if ($id_partida) {
        $stmt = $pdo->prepare("SELECT * FROM partidas WHERE id = ?");
        $stmt->execute([$id_partida]);
        $partida = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$partida) {
            echo "<script>alert('Partida não encontrada para o ID: " . htmlspecialchars($id_partida) . ". Redirecionando para o início.'); window.location.href='index.php';</script>";
            unset($_SESSION['id_partida']);
            unset($_SESSION['modo']);
            exit();
        }

        if ($partida['usuario_id'] !== $usuario_id && $partida['jogador2_id'] !== $usuario_id) {
            echo "<script>alert('Você não está participando desta partida. Redirecionando para o início.'); window.location.href='index.php';</script>";
            unset($_SESSION['id_partida']);
            unset($_SESSION['modo']);
            exit();
        }

        $modo = $partida['modo'];
        $id_jogador1 = $partida['usuario_id'];
        $id_jogador2 = $partida['jogador2_id'];

        $_SESSION['pontuacao_1'] = $partida['pontos_jogador1'] ?? 0;
        $_SESSION['pontuacao_2'] = $partida['pontos_jogador2'] ?? 0;

        $estado_cartas_json_para_js = $partida['estado_cartas_json'] ?? '[]';
    } else {
        echo "<script>alert('Nenhuma partida ativa. Por favor, inicie ou entre em uma partida.'); window.location.href='index.php';</script>";
        exit();
    }


    $estado_botao = 'disabled';
    if(isset($_SESSION['modo']) && isset($_SESSION['id_partida'])) {
        $modo = $_SESSION['modo'];
        $id_partida = $_SESSION['id_partida'];

        if ($modo === 'duo') {
            $stmt = $pdo->prepare("SELECT jogador2_id, usuario_id FROM partidas WHERE id = ?");
            $stmt->execute([$id_partida]);
            $partida = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($partida && $partida['jogador2_id'] !== null) {
                $estado_botao = '';
                $id_jogador2 = $partida['jogador2_id'];
                $id_jogador1 = $partida['usuario_id'];
            }
        } else if ($modo === 'solo') {
            $estado_botao = '';
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
        <script>
            const cartasIniciais = <?php echo $estado_cartas_json_para_js; ?>;
            const id_partida = <?php echo json_encode($_SESSION['id_partida'] ?? null); ?>;
            const modo = <?php echo json_encode($_SESSION['modo'] ?? ''); ?>;
            let id_jogador1 = <?php echo json_encode($id_jogador1); ?>;
            let id_jogador2 = <?php echo json_encode($id_jogador2); ?>;
            const usuario_sessao_id = <?php echo json_encode($_SESSION['usuario_id'] ?? null); ?>;
            const estado_botao_inicial = <?php echo json_encode($estado_botao); ?>;
        </script>
    </head>
    <body>
        <?php include_once './php/header.php'; ?>
        <main>
            <div class="game-container">
                <div class="partida-info">
                    <?php if ($_SESSION['modo'] === 'duo'): ?>
                        <p>Você está jogando no modo <span class="modo">Multiplayer</span>.</p>
                        <p><span class="id_partida">ID da Partida:</span> <?php echo htmlspecialchars($_GET['id_partida']); ?></p>

                        <div class="status-jogadores">
                            <h3>Status dos Jogadores</h3>
                            <p>
                                <span class="label-do-jogador">Jogador 1:</span>
                                <span id="status-jogador1" class="status-offline">Aguardando...</span>
                                <span id="player1-e-voce" class="e-voce-label" style="display: none;"> (Você)</span>
                            </p>
                            <p>
                                <span class="label-do-jogador">Jogador 2:</span>
                                <span id="status-jogador2" class="status-offline">Aguardando...</span>
                                <span id="player2-e-voce" class="e-voce-label" style="display: none;"> (Você)</span>
                            </p>
                        </div>

                    <?php endif; ?>
                    <?php if ($_SESSION['modo'] === 'solo'): ?>
                        <p>Você está jogando no modo <span class="modo">Solo</span>.</p>
                    <?php endif; ?>
                    <p><span class="cronometro">Cronômetro:</span> <span id="cronometro">00:00</span></p>
                    <div class="controles">
                        <?php if ($id_jogador2 === $_SESSION['usuario_id']): ?>
                            <button class="Botao-Iniciar" style="display: none;">Iniciar Jogo</button>
                        <?php else: ?>
                            <button class="Botao-Iniciar" <?php echo $estado_botao; ?>>Iniciar Jogo</button>
                        <?php endif; ?>
                    </div>
                </div>
                <div class="tabuleiro pausado">
                
                </div>
            </div>

           <?php if (isset($_SESSION['modo']) && $_SESSION['modo'] === 'duo'): ?>

            <div class="pontuacao" style="<?php echo ($_SESSION['modo'] !== 'duo') ? 'display: none;' : ''; ?>">
            <h2>Pontuação</h2>
            <span class="pontuacao-1"><p></p></span>
           
                <span class="pontuacao-2"><p></p></span>
                
                <span class="vez"><p></p></span>
            
            <p id="timer-turno"></p>
            </div>

            <?php endif; ?>
        
             
        </main>
        <script src="./js/jogo.js"></script>
    </body>
    </html>