<?php

define("HOST", "");
define("USER", "");
define("PASSWORD", "");
define("DATABASE", "");

try{
    $pdo = new PDO("mysql:host=" . HOST . ";dbname=" . DATABASE, USER, PASSWORD);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
}catch (PDOException $e) {
    die("ERRO: Não foi possível se conectar ao banco de dados." . $e->getMessage());
}

?>