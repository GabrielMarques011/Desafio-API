import fetch from 'node-fetch';
import pLimit from 'p-limit';
import terminalKit from 'terminal-kit';
import fs from 'fs'; // Importando módulo fs para manipulação de arquivos

const { terminal } = terminalKit; // Importa a função terminal

async function fetchAllPages() {
    const baseUrl = 'https://api.themoviedb.org/3/discover/movie';
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyNTgyNjM0YTg3NzkxOWMwMWExMjA4NjVjZjRkZmY3YSIsIm5iZiI6MTczMjgwMzYyOS4zNTAxODIsInN1YiI6IjY3NDg3YjNkODQ1NGM2Y2EzNjM2NTkyZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.OwczzDIdxuFm-GFRkEDlLcIzKvWka1e58b0txdZIdhE' // Coloque seu Token aqui
        }
    };

    try {
        const firstResponse = await fetch(`${baseUrl}?page=1`, options);
        const firstData = await firstResponse.json();
        const totalPages = Math.min(firstData.total_pages, 500);

        const limit = pLimit(50);
        const allMovies = [];

        const fetchPromises = Array.from({ length: totalPages }, (_, index) => {
            const page = index + 1;

            return limit(() =>
                fetch(`${baseUrl}?page=${page}`, options)
                    .then(response => response.json())
                    .then(data => {
                        // Extrai os dados relevantes de cada filme e adiciona ao array allMovies
                        data.results.forEach(filme => {
                            allMovies.push({
                                title: filme.original_title,
                                votes: filme.vote_count,
                                vote_average: filme.vote_average
                            });
                        });
                    })
            );
        });

        // Espera que todas as páginas sejam processadas
        await Promise.all(fetchPromises);

        // Pega os 10 filmes mais votados
        const top10Movies = allMovies
            .sort((a, b) => b.votes - a.votes) // Ordena pelo número de votos
            .slice(0, 50); // Pega apenas os 10 primeiros

        console.log("\nTop 10 Filmes mais votados:");

        // Exibe um gráfico de barras manualmente no terminal
        top10Movies.forEach(filme => {
            const bar = '-'.repeat(filme.votes / 1000); // Ajusta o tamanho da barra (dividido por 1000)
            terminal.cyan(`${filme.title} `);
            terminal.green(`${bar} (${filme.votes} votos)\n`);
        });

        // Formata os dados para armazenar no arquivo .txt
        const movieData = top10Movies.map(filme => {
            return `Título: ${filme.title}\nVotos: ${filme.votes}\nMédia de Votos: ${filme.vote_average}\n`;
        }).join('\n');

        // Armazena os dados no arquivo .txt
        fs.writeFileSync('filmes.txt', movieData); // Escreve os dados no arquivo de texto

        console.log("Dados armazenados em 'filmes.txt'");

    } catch (err) {
        console.error('Erro ao buscar dados:', err);
    }
}

fetchAllPages();
