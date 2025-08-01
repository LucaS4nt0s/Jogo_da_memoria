<?php
require_once './php/auth.php';
require_once './php/conexao_bd.php';

$erro = ''; 

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nome = $_POST['nome'] ?? '';
    $email = $_POST['email'] ?? '';
    $senha = $_POST['senha'] ?? '';

    $registro_resultado = registrarUsuario($nome, $email, $senha);

    if ($registro_resultado['success']) {
        header('Location: index.php');
        exit();
    } else {
        $erro = $registro_resultado['message'];
    }
}
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@200..700&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="./css/style.css">
    <title>Cadastro</title>
</head>
<body>
    <h1>Jogo da memória</h1>
    <form method="POST" class="form-cadastro">
        <h2 class="cadastro-h2">Cadastrar</h2>

        <?php if (!empty($erro)): ?>
            <p style="color: red; text-align: center; margin-bottom: 15px;">
                <?php echo htmlspecialchars($erro); ?>
            </p>
        <?php endif; ?>

        <div class="container-input">
            <div>
                <label for="nome">Nome:</label>
                <input type="text" id="nome" name="nome" required value="<?php echo htmlspecialchars($nome); ?>">
            </div>
            <div>
                <label for="email">E-mail:</label>
                <input type="email" id="email" name="email" required value="<?php echo htmlspecialchars($email); ?>">
            </div>
            <div>
                <label for="senha">Senha:</label>
                <input type="password" id="senha" name="senha" required>
            </div>
        </div>
        <div class="bottom-form">
            <button type="submit" class="Botao-Login">Cadastrar</button>
            <span>Ja possui uma conta? <a href="./index.php">Faça Login</a></span>
        </div>
    </form>
</body>
</html>