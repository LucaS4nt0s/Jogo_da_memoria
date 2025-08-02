LUCA SAMUEL DOS SANTOS
E
MARIA EDUARDA BATISTA HENRIQUE

Documentação do Projeto: Jogo da Memória (Temática Star Wars)

Este projeto implementa um jogo da memória interativo com temática Star Wars, oferecendo modos de jogo solo e multiplayer. A aplicação é desenvolvida em PHP para o backend, JavaScript para a lógica do jogo no frontend, e CSS para estilização, com integração a um banco de dados MySQL para gerenciamento de usuários, partidas e rankings.

1. Estrutura de Pastas e Arquivos

A estrutura do projeto é organizada da seguinte forma:

`/Jogo_da_memoria-main/`
    `.gitattributes`
    `.gitignore`
    `cadastro.php`
    `game.php`
    `historico.php`
    `home.php`
    `index.php`
    `README.md`
    `css/`
        `game.css`
        `header.css`
        `historico.css`
        `home.css`
        `ranking.css`
        `style.css`
    `font/`
        `StarJedi.ttf`
    `img/`
        `bemSolo.png`
        `chewie.png`
        `darthVader.png`
        `droids.png`
        `leiaOrgana.png`
        `luke.png`
        `obiWan.png`
        `sabres-de-luz.png`
        `starWars.png`
        `star_wars_background.jpg`
        `yoda.png`
    `js/`
        `jogo.js`
    `php/`
        `api.php`
        `atualizar_cronometro.php`
        `atualizar_estado_cartas.php`
        `atualizar_pontuacao.php`
        `auth.php`
        `conexao_bd_exemplar.php`
        `config.php`
        `criar_partidas.php`
        `fim_de_jogo.php`
        `get_game_state.php`
        `header.php`
        `historico_partidas.php`
        `iniciar_jogo_db.php`
        `ranking_geral.php`
        `ranking_pontos.php`
        `ranking_tempo.php`
        `trocar_jogador_db.php`
        `verificar_estado_partida.php`
    `sql/`
        `Jogo_da_memoria.sql`


2. Visão Geral dos Componentes

2.1. Frontend (HTML, CSS, JavaScript)

`index.php`: Página inicial de login para os usuários.
`cadastro.php`: Página de registro de novos usuários.
`home.php`: Página principal após o login, onde o usuário pode escolher entre criar uma partida (solo ou multiplayer) ou entrar em uma partida existente. Também exibe instruções do jogo.
`game.php`: A interface principal do jogo da memória, onde o tabuleiro é exibido, o cronômetro funciona e as pontuações são atualizadas.
`historico.php`: Exibe o histórico de partidas do usuário logado, incluindo detalhes como ID da partida, modo, oponente, pontuações, tempo e resultado.
`ranking.php`: Apresenta diferentes rankings (geral, por pontos, por tempo) dos jogadores.
`css/`: Contém todos os arquivos CSS para estilização da aplicação, divididos por seções (`game.css`, `header.css`, `historico.css`, `home.css`, `ranking.css`, `style.css`).
`font/StarJedi.ttf`: Fonte personalizada "Star Jedi" para a temática Star Wars.
`img/`: Armazena as imagens utilizadas no jogo, incluindo as imagens das cartas (personagens de Star Wars), o verso das cartas e o background temático.
`js/jogo.js`: Contém toda a lógica JavaScript do jogo, incluindo a manipulação do tabuleiro, virar cartas, verificar pares, cronômetro, placar, lógica de multiplayer (sincronização de estado, vez do jogador) e efeitos sonoros.

2.2. Backend (PHP)

`php/auth.php`: Funções para autenticação de usuários, incluindo `registrarUsuario` (para cadastro) e `loginUsuario` (para login). Lida com validação de entrada, hash de senhas e interação com o banco de dados para criar/verificar usuários.
`php/conexao_bd.php` (conexao_bd_exemplar.php` é um modelo) Arquivo responsável por estabelecer a conexão com o banco de dados MySQL usando PDO.
`php/conexao_bd_exemplar.php`: Um arquivo de exemplo para configuração da conexão com o banco de dados, contendo placeholders para `HOST`, `USER`, `PASSWORD` e `DATABASE`.
`php/criar_partidas.php`: Função `criarPartida` que inicializa uma nova partida no banco de dados. Isso inclui a geração e embaralhamento das cartas, definição dos pontos iniciais e da vez do primeiro jogador.
`php/header.php`: Um snippet PHP que inclui o cabeçalho comum a várias páginas, exibindo o título do jogo, links de navegação (Ranking, Histórico) e informações do usuário logado com um botão de logout.
`php/atualizar_cronometro.php`: API endpoint que recebe o tempo atual de uma partida e o atualiza no banco de dados. Utilizado para sincronizar o cronômetro em partidas multiplayer.
`php/atualizar_estado_cartas.php`: API endpoint que recebe o estado atual das cartas (viradas, em par) e o salva no banco de dados. Essencial para a sincronização do tabuleiro em tempo real no modo multiplayer.
`php/atualizar_pontuacao.php`: API endpoint para atualizar a pontuação de um jogador específico em uma partida no banco de dados.
`php/fim_de_jogo.php`: API endpoint que é chamado ao final de uma partida para registrar o tempo final e o vencedor (se houver) no banco de dados.
`php/get_game_state.php`: API endpoint que retorna o estado completo de uma partida (pontuações, vez do jogador, tempo, vencedor, estado das cartas) do banco de dados. Utilizado para o polling no modo multiplayer.
`php/historico_partidas.php`: API endpoint que busca e retorna o histórico de partidas de um usuário específico do banco de dados, formatando os dados para exibição na tabela.
`php/iniciar_jogo_db.php`: API endpoint que marca uma partida como iniciada no banco de dados, definindo qual jogador começa.
`php/ranking_geral.php`: API endpoint que busca e retorna os dados para o ranking geral (pontos totais, partidas, vitórias, melhor tempo) dos jogadores.
`php/ranking_pontos.php`: API endpoint que busca e retorna os dados para o ranking de maior pontuação em uma única partida.
`php/ranking_tempo.php`: API endpoint que busca e retorna os dados para o ranking de melhor tempo de conclusão de partida.
`php/trocar_jogador_db.php`: API endpoint que atualiza a vez do jogador no banco de dados em partidas multiplayer.
`php/verificar_estado_partida.php`: API endpoint que verifica o estado de uma partida, principalmente para saber se o segundo jogador se conectou em um jogo multiplayer.
`php/api.php` e `php/config.php`: Arquivos vazios, possivelmente placeholders para futuras implementações de API genérica ou configurações específicas.

2.3. Banco de Dados (SQL)

`sql/Jogo_da_memoria.sql`: Contém o script SQL para a criação do esquema do banco de dados, incluindo tabelas para `usuarios`, `partidas` e `ranking`.

3. Funcionalidades Principais

Autenticação de Usuários:
    Registro de novos usuários com validação de nome, e-mail e senha (mínimo de 6 caracteres).
    Login de usuários existentes com verificação de credenciais.
    Gerenciamento de sessão para manter o usuário logado.
Criação e Entrada em Partidas:
    Modo Solo: Permite ao usuário jogar sozinho, com controle total do jogo.
    Modo Multiplayer: Permite ao usuário criar uma partida e aguardar um segundo jogador, ou entrar em uma partida existente usando um código.
Lógica do Jogo da Memória:
    Tabuleiro de cartas dinâmico com imagens temáticas de Star Wars.
    Mecanismo de virar cartas e verificar pares.
    Controle de pontuação para cada jogador.
    Cronômetro para registrar o tempo da partida.
    Efeitos sonoros para a ação de virar cartas.
Funcionalidades Multiplayer:
    Sincronização em tempo real do estado do tabuleiro, pontuações, cronômetro e vez do jogador entre os participantes via polling para o backend.
    Status dos jogadores (Online/Aguardando) na tela de jogo.
    Controle de turno com tempo limite para cada jogada.
Histórico de Partidas:
    Visualização das partidas anteriores do usuário, com detalhes como ID, modo, oponente, pontuações, tempo e resultado (Vitória, Derrota, Empate, Concluída).
Ranking Global:
    Três tipos de ranking:
        Geral: Classifica jogadores por pontos totais, vitórias e total de partidas.
        Top Pontos: Exibe as maiores pontuações alcançadas em uma única partida.
        Melhor Tempo: Lista os jogadores com os melhores tempos de conclusão de partidas.

4. Tecnologias Utilizadas

Frontend:
    HTML5
    CSS3 (com variáveis CSS para temas Star Wars)
    JavaScript (ES6+)
    Web Audio API (para efeitos sonoros)
Backend:
    PHP 7.x+
    PDO (PHP Data Objects) para interação com o banco de dados
    Sessões PHP para gerenciamento de estado do usuário
Banco de Dados:
    MySQL

5. Configuração e Instalação (Assumida)

1.  Servidor Web: É necessário um servidor web (Apache, Nginx) com suporte a PHP.
2.  Banco de Dados:
    Crie um banco de dados MySQL.
    Importe o script `sql/Jogo_da_memoria.sql` para criar as tabelas necessárias.
    Configure o arquivo `php/conexao_bd.php` (ou renomeie e configure `conexao_bd_exemplar.php`) com as credenciais corretas do seu banco de dados (HOST, USER, PASSWORD, DATABASE).
3.  Dependências PHP: Certifique-se de que as extensões PDO para MySQL estejam habilitadas no seu `php.ini`.
4.  Acesso: A aplicação deve ser acessível via navegador web.

6. Fluxo de Usuário

1.  Acesso Inicial: O usuário acessa `index.php` para fazer login ou `cadastro.php` para se registrar.
2.  Login/Cadastro: Após o sucesso, o usuário é redirecionado para `home.php`.
3.  Home:
    O usuário pode criar uma partida solo ou multiplayer.
    Para multiplayer, um ID de partida é gerado.
    O usuário pode entrar em uma partida multiplayer existente usando um ID.
4.  Game:
    O jogo é carregado com o tabuleiro.
    No multiplayer, o jogo aguarda o segundo jogador se conectar (se aplicável).
    O jogador 1 inicia o jogo.
    Os jogadores viram cartas para encontrar pares.
    Pontuações e cronômetro são atualizados.
    No multiplayer, a vez do jogador é controlada pelo backend e sincronizada.
    Ao final do jogo, o vencedor é determinado e os dados são salvos.
5.  Histórico: O usuário pode visualizar suas partidas anteriores.
6.  Ranking: O usuário pode ver os rankings globais.
7.  Logout: O usuário pode sair da sessão a qualquer momento.

7. Considerações de Desenvolvimento

Segurança:
    Senhas são armazenadas com hash (`password_hash`).
    Uso de Prepared Statements (PDO) para prevenir SQL Injection.
    Validação de entrada básica no frontend e backend.
Sincronização Multiplayer: O jogo utiliza um modelo de polling para sincronizar o estado do jogo entre os clientes e o servidor. Para um jogo em tempo real de maior escala, WebSockets seriam uma alternativa mais eficiente.
Usabilidade: A interface é projetada para ser intuitiva, com feedback visual e sonoro.
Temática: A temática Star Wars é aplicada através de fontes, imagens e cores, criando uma experiência imersiva.


