<header>
    <span class="titulo-header"><h1>Jogo da Memória</h1></span>
    <div class="botoes-header">
        <span>Bem-vindo, <?php echo htmlspecialchars($usuario['nome']); ?>!</span>
        <form method="POST">
            <button type="submit" name="logout" class="Botao-Logout">Sair</button>
        </form>
    </div>
</header>