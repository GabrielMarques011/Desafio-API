async function fetchAllPages() {
    const startDate = '2024-11-01';
    const endDate = '2024-11-14';
    const baseUrl = 'https://api.themoviedb.org/3/discover/movie';
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyNTgyNjM0YTg3NzkxOWMwMWExMjA4NjVjZjRkZmY3YSIsIm5iZiI6MTczMjgwMzYyOS4zNTAxODIsInN1YiI6IjY3NDg3YjNkODQ1NGM2Y2EzNjM2NTkyZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.OwczzDIdxuFm-GFRkEDlLcIzKvWka1e58b0txdZIdhE'
        }
    };

    try {
        // Fazendo a primeira requisição para obter o número total de páginas
        const firstResponse = await fetch(`${baseUrl}?start_date=${startDate}&end_date=${endDate}&page=1`, options);
        const firstData = await firstResponse.json();

        const totalPages = firstData.total_pages; // Número total de páginas
        console.log(`Total de páginas: ${totalPages}`);

        let allResults = []; // Array para armazenar todos os dados

        // Percorrendo todas as páginas dinamicamente
        for (let page = 1; page <= totalPages; page++) {
            const url = `${baseUrl}?start_date=${startDate}&end_date=${endDate}&page=${page}`;
            const response = await fetch(url, options);
            const data = await response.json();

            console.log(data.results);

            // Passando por todos os filmes que estão percorrendo determinadas paginas
            /* data.results.forEach(totalResult => {
                console.log(totalResult.original_title);
            }); */

            // Adicionando os resultados da página atual ao array
            allResults = allResults.concat(data.results);
            /* console.log(`Página ${page} processada.`); */
        }

        console.log(`Total de mudanças coletadas: ${allResults.length}`);
        return allResults;
    } catch (err) {
        console.error('Erro ao buscar dados:', err);
    }
}

fetchAllPages();