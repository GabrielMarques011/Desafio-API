import fetch from 'node-fetch'; // Caso não esteja em ambiente que já suporta fetch
import pLimit from 'p-limit'; // Limita o número de requisições simultâneas
import fs from 'fs'; // Módulo File System para manipular arquivos

async function fetchAllPages() {
    const baseUrl = 'https://api.themoviedb.org/3/discover/movie';
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyNTgyNjM0YTg3NzkxOWMwMWExMjA4NjVjZjRkZmY3YSIsIm5iZiI6MTczMjgwMzYyOS4zNTAxODIsInN1YiI6IjY3NDg3YjNkODQ1NGM2Y2EzNjM2NTkyZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.OwczzDIdxuFm-GFRkEDlLcIzKvWka1e58b0txdZIdhE'
        }
    };

    try {
        // Fazendo a primeira requisição para descobrir o total de páginas
        const firstResponse = await fetch(`${baseUrl}?page=1`, options);
        const firstData = await firstResponse.json();

        console.log(firstData);

        const totalPages = Math.min(firstData.total_pages, 500); // Limita a 500 páginas
        console.log(`Total de páginas a processar: ${totalPages}`);

        // Configurando o limitador para 50 requisições simultâneas
        const limit = pLimit(50);

        // Criando as requisições para todas as páginas
        const fetchPromises = Array.from({ length: totalPages }, (_, index) => {
            const page = index + 1;
            return limit(() =>
                fetch(`${baseUrl}?page=${page}`, options)
                .then(response => response.json())
                .then(data => {
                    if (Array.isArray(data.results)) {
                        // Extrai apenas os títulos dos filmes usando map()
                        const votos = data.results.map(filme => filme.vote_average); // Avaliação Geral
                        const qntVotos = data.results.map(filme => filme.vote_count); // Quantidade de votos

                        console.log(`Página ${page} contém os seguintes títulos:`, votos, qntVotos);
                        return votos, qntVotos; // Retorna apenas os títulos
                    } else {
                        console.warn(`Página ${page} não contém resultados válidos.`);
                        return []; // Retorna array vazio
                    }
                })
            );
        });

        // Executa todas as requisições simultâneas controladas
        const results = await Promise.all(fetchPromises);

        // Unindo todos os resultados em um único array
        const allMovies = results.flat(); // Flatten para unir arrays de filmes

        console.log(`Total de filmes coletados: ${allMovies.length}`);
        return allMovies;
    } catch (err) {
        console.error('Erro ao buscar dados:', err);
    }
}

fetchAllPages();
