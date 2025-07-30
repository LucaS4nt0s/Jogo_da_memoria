<?php

session_start();

require_once './php/auth.php';
require_once './php/conexao_bd.php';

$error = '';

if (isset($_SESSION['usuario_id'])) {
    header('Location: home.php');
    exit();
}

if (isset($_POST['login'])) {
    $email = trim($_POST['email']);
    $senha = $_POST['senha'];

    if(loginUsuario($email, $senha)) {
        header('Location: home.php'); 
        exit();
    } else {
        $error = "E-mail ou senha incorretos.";
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
    <title>Login</title>
</head>
<body>
    <h1>Jogo da memória</h1>
    <form method="POST">
        <h2>Login</h2>
        <?php if (!empty($error)): ?>
            <p class="error-message"><?php echo $error; ?></p>
        <?php endif; ?>
        <div class="container-input">
            <div>
                <label for="email">E-mail:</label>
                <input type="email" id="email" name="email" required>
            </div>
            <div>
                <label for="senha">Senha:</label>
                <input type="password" id="senha" name="senha" required>
            </div>
        </div>
        <div class="bottom-form">
            <button type="submit" class="Botao-Login" name="login">Entrar</button>
            <span>Não possui uma conta? <a href="./cadastro.php">Cadastre-se</a></span>
        </div>
    </form>
</body>
</html>