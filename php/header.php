<header>
    <span class="titulo-header"><h1><a href="home.php">Jogo da Memória</a></h1></span>
    <span class = "navbar">
        <ul>
            <li><a href="ranking.php">Ranking</a></li>
            <li><a href="historico.php">Histórico</a></li>
        
        </ul>
    </span>
    <div class="botoes-header">
        <span>Bem-vindo, <?php echo htmlspecialchars($usuario['nome']); ?>!</span>
        <form method="POST">
            <button type="submit" name="logout" class="Botao-Logout">Sair</button>
        </form>
    </div>
</header>