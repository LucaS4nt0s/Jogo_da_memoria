<?php
require_once 'conexao_bd.php';

function registrarUsuario($nome, $email, $senha){
    global $pdo;

    $senha_hash = password_hash($senha, PASSWORD_DEFAULT);
    
    try{
        $stmt = $pdo->prepare("INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)");
        
        return $stmt->execute([$nome, $email, $senha_hash]);

    }catch (PDOException $e) {
        die("ERRO: Não foi possível registrar o usuário. " . $e->getMessage());
    }
};

function loginUsuario($email, $senha){
    global $pdo;

    try{
        $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = ?");
        $stmt->execute([$email]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if($usuario){
            if (password_verify($senha, $usuario['senha'])) {
                session_start();
                $_SESSION['usuario_id'] = $usuario['id'];
                $_SESSION['usuario_nome'] = $usuario['nome'];
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }catch (PDOException $e) {
        die("ERRO: Não foi possível fazer login. " . $e->getMessage());
    }
}

?>