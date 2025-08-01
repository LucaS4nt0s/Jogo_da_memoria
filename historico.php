<?php
session_start();
require_once './php/auth.php'; 
require_once './php/conexao_bd.php'; 

if (!isset($_SESSION['usuario_id'])) {
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


if (isset($_POST['logout'])) {
    session_destroy();
    header('Location: index.php');
    exit();
}


if (isset($_POST['modo'])) {
   
    require_once './php/criar_partidas.php'; 

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
    <link rel="stylesheet" href="./css/historico.css">
    <title>Jogo da Memória - Histórico de Partidas</title>
</head>
<body>

    <?php include_once './php/header.php';  ?>

    <main id="historico-screen" class="screen">
        <div class="container">
            <div class="screen-header">
                <h2>Histórico de Partidas</h2>
                <button id="btn-fechar-historico" class="btn btn-secondary">Voltar</button>
            </div>
            <div class="historico-content">
                <div class="historico-table-container">
                    <table id="historico-table" class="historico-table">
                        <thead>
                            </thead>
                        <tbody id="historico-tbody">
                            </tbody>
                    </table>
                </div>
            </div>
        </div>
    </main>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const tableHead = document.querySelector('#historico-table thead');
            const tableBody = document.getElementById('historico-tbody');
            const closeButton = document.getElementById('btn-fechar-historico');

            // Event listener para o botão "Voltar"
            closeButton.addEventListener('click', () => {
                window.location.href = 'home.php'; 
            });

           
            async function fetchAndRenderHistorico() {
                const url = './php/historico_partidas.php';

                try {
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`Erro HTTP! status: ${response.status}`);
                    }
                    const data = await response.json();

                    if (data.success) {
                        renderTable(data.headers, data.rows);
                    } else {
                        console.error('Erro ao buscar histórico:', data.message);
                        tableHead.innerHTML = '';
                        tableBody.innerHTML = `<tr><td colspan="${data.headers ? data.headers.length : 8}">Erro ao carregar histórico: ${data.message}</td></tr>`;
                    }
                } catch (error) {
                    console.error('Falha ao buscar histórico:', error);
                    tableHead.innerHTML = '';
                    tableBody.innerHTML = `<tr><td colspan="8">Não foi possível conectar ao servidor ou houve um erro inesperado.</td></tr>`;
                }
            }

          
            function renderTable(headers, rows) {
                tableHead.innerHTML = ''; 
                tableBody.innerHTML = ''; 

               
                const headerRow = document.createElement('tr');
                headers.forEach(headerText => {
                    const th = document.createElement('th');
                    th.textContent = headerText;
                    headerRow.appendChild(th);
                });
                tableHead.appendChild(headerRow);

                
                if (rows.length === 0) {
                 
                    const noDataRow = document.createElement('tr');
                    const td = document.createElement('td');
                    td.setAttribute('colspan', headers.length);
                    td.textContent = 'Nenhuma partida encontrada no seu histórico.';
                    noDataRow.appendChild(td);
                    tableBody.appendChild(noDataRow);
                } else {
                  
                    rows.forEach(rowData => {
                        const row = document.createElement('tr');
                        rowData.forEach(cellData => {
                            const td = document.createElement('td');
                            td.textContent = cellData;
                            row.appendChild(td);
                        });
                        tableBody.appendChild(row);
                    });
                }
            }

            
            fetchAndRenderHistorico();
        });
    </script>
</body>
</html>