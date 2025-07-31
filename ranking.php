<?php

session_start();
require_once './php/auth.php';
require_once './php/conexao_bd.php';


if (!isset($_SESSION['usuario_id'])) {
    header('Location: index.php');
    exit();
}

if (isset($_POST['logout'])) {
    session_destroy();
    header('Location: index.php');
    exit();
}

$usuario_id = $_SESSION['usuario_id'];
$stmt = $pdo->prepare("SELECT * FROM usuarios WHERE id = ?");
$stmt->execute([$usuario_id]);
$usuario = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$usuario) {
    echo "Usuário não encontrado.";
    exit();
}

if (isset($_POST['modo'])) {
    $id_partida = criarPartida($_POST['modo'], $usuario_id);
    $_SESSION['modo'] = $_POST['modo'];
    $_SESSION['id_partida'] = $id_partida;
    $_SESSION['vez_jogador'] = 1; 
    
    if ($id_partida) {
        header("Location: game.php?id_partida=$id_partida");
        exit();
    } else {
        echo "<script>alert('Erro ao criar partida. Tente novamente.');</script>";
    }

}

if(isset($_POST['entrar_partida'])) {
    $codigo_partida = $_POST['codigo_partida'];
    $stmt = $pdo->prepare("SELECT * FROM partidas WHERE id = ?");
    $stmt->execute([$codigo_partida]);
    $partida = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($partida) {
        if($partida['modo'] === 'duo' && $partida['jogador2_id'] === null && $partida['usuario_id'] !== $usuario_id) {
            $stmt = $pdo->prepare("UPDATE partidas SET jogador2_id = ? WHERE id = ?");
            $stmt->execute([$usuario_id, $codigo_partida]);
            $_SESSION['modo'] = 'duo';
            $_SESSION['id_partida'] = $codigo_partida;
            header("Location: game.php?id_partida=$codigo_partida");
            exit();
        } else if($partida['modo'] === 'solo') {
            echo "<script>alert('Não é possível entrar nessa partida (Modo solo).');</script>";
        } else if($partida['usuario_id'] === $usuario_id) {
            echo "<script>alert('Você é o criador da partida');</script>";
        }
        else {
            echo "<script>alert('Partida já está cheia.');</script>";
        }
    } else { 
        echo "<script>alert('Partida não encontrada.');</script>";
    }
}
?>

<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="./css/header.css">
  
    <link rel="stylesheet" href="./css/ranking.css">
    <title>Jogo da Memória</title>

</head>

<body>

    <?php include_once './php/header.php'; ?>
    
   <main id="ranking-screen" class="screen">
        <div class="container">
            <div class="screen-header">
                <h2>Hall da Fama</h2>
                <button id="btn-fechar-ranking" class="btn btn-secondary">Voltar</button>
            </div>
            <div class="ranking-content">
                <div class="ranking-tabs">
                    <button class="tab-btn active" data-tab="geral">Ranking Geral</button>
                    <button class="tab-btn" data-tab="pontos">Top Pontos</button>
                    <button class="tab-btn" data-tab="tempo">Melhor Tempo</button>
                </div>
                <div class="ranking-table-container">
                    <table id="ranking-table" class="ranking-table">
                        <thead>
                           
                        </thead>
                        <tbody id="ranking-tbody">
                           
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </main>
      <script>

      

        document.addEventListener('DOMContentLoaded', () => {
          const tabs = document.querySelectorAll('.tab-btn');
            const tableHead = document.querySelector('#ranking-table thead');
            const tableBody = document.getElementById('ranking-tbody');
            const closeButton = document.getElementById('btn-fechar-ranking');

            closeButton.addEventListener('click', () => {
                window.location.href = 'index.php'; 
            });


            const dummyData = {
                geral: {
                    headers: ['Posição', 'Jogador', 'Pontos Totais', 'Partidas', 'Vitórias', 'Melhor Tempo'],
                    rows: [
                    
                        ['1', 'Chewbacca', '12000', '55', '35', '01:30'],
                        ['2', 'Darth Vader', '11500', '40', '38', '01:10']
                    ]
                },
                pontos: {
                    headers: ['Posição', 'Jogador', 'Maior Pontuação', 'Data'],
                    rows: [
                        ['1', 'Darth Vader', '550', '25/05/2024'],
                        ['2', 'Chewbacca', '485', '18/05/2024']
                    ]
                },
                tempo: {
                    headers: ['Posição', 'Jogador', 'Melhor Tempo', 'Dificuldade'],
                    rows: [
                        ['1', 'Yoda', '00:58', 'Difícil'],
                        ['2', 'Darth Vader', '01:10', 'Difícil'],
            
                    ]
                }
            };

            
            function renderTable(tabName) {
                const data = dummyData[tabName];
                
              
                tableHead.innerHTML = '';
                tableBody.innerHTML = '';

                
                const headerRow = document.createElement('tr');
                data.headers.forEach(headerText => {
                    const th = document.createElement('th');
                    th.textContent = headerText;
                    headerRow.appendChild(th);
                });
                tableHead.appendChild(headerRow);

                
                data.rows.forEach(rowData => {
                    const row = document.createElement('tr');
                    rowData.forEach(cellData => {
                        const td = document.createElement('td');
                        td.textContent = cellData;
                        row.appendChild(td);
                    });
                    tableBody.appendChild(row);
                });
            }

           
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    
                    tabs.forEach(t => t.classList.remove('active'));
                   
                    tab.classList.add('active');
                    
                    const tabName = tab.getAttribute('data-tab');
                    renderTable(tabName);
                });
            });

            
            renderTable('geral');
        });
    </script>
</body>
</html>