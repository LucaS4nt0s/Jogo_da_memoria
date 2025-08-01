<?php

include_once 'conexao_bd.php'; 

function registrarUsuario($nome, $email, $senha) {
    global $pdo; 

    
    if (empty($nome)) {
        return ['success' => false, 'message' => 'O campo Nome é obrigatório.'];
    }
    if (empty($email)) {
        return ['success' => false, 'message' => 'O campo E-mail é obrigatório.'];
    }
    if (empty($senha)) {
        return ['success' => false, 'message' => 'O campo Senha é obrigatório.'];
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return ['success' => false, 'message' => 'Formato de e-mail inválido.'];
    }

    if (strlen($senha) < 6) { 
        return ['success' => false, 'message' => 'A senha deve ter pelo menos 6 caracteres.'];
    }
   

    
    $senha_hash = password_hash($senha, PASSWORD_DEFAULT);

    try {
       
        $stmt = $pdo->prepare("INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)");
        $stmt->execute([$nome, $email, $senha_hash]);

        $usuario_id = $pdo->lastInsertId();

        $stmt_ranking = $pdo->prepare("INSERT INTO ranking (usuario_id, total_partidas, partidas_vencidas, tempo_medio) VALUES (?, 0, 0, 0)");
        $stmt_ranking->execute([$usuario_id]);

        return ['success' => true, 'message' => 'Usuário registrado com sucesso!'];

    } catch (PDOException $e) {
        
        if ($e->getCode() == '23000' && strpos($e->getMessage(), '1062 Duplicate entry') !== false) {
            return ['success' => false, 'message' => 'Este e-mail já está em uso. Por favor, tente outro.'];
        } else {
           
            error_log("Erro PDO ao registrar usuário: " . $e->getMessage());
            return ['success' => false, 'message' => 'Erro interno ao registrar usuário. Tente novamente mais tarde.'];
        }
    }
}


function loginUsuario($email, $senha) {
    global $pdo;

   
    if (empty($email) || empty($senha)) {
        return ['success' => false, 'message' => 'Por favor, insira e-mail e senha.'];
    }

    try {
        // Busca o usuário pelo e-mail
        $stmt = $pdo->prepare("SELECT id, nome, senha FROM usuarios WHERE email = ?");
        $stmt->execute([$email]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($usuario) {
           
            if (password_verify($senha, $usuario['senha'])) {
                session_start(); 
                $_SESSION['usuario_id'] = $usuario['id'];
                $_SESSION['usuario_nome'] = $usuario['nome'];
                return ['success' => true, 'message' => 'Login bem-sucedido!'];
            } else {
               
                return ['success' => false, 'message' => 'E-mail ou senha incorretos.'];
            }
        } else {
           
            return ['success' => false, 'message' => 'E-mail ou senha incorretos.'];
        }
    } catch (PDOException $e) {
       
        error_log("Erro PDO ao fazer login: " . $e->getMessage());
        return ['success' => false, 'message' => 'Erro interno ao tentar fazer login.'];
    }
}
?>