// =================================================================
// PASSO 1: Definir as chaves de conexão.
// Estas linhas PRECISAM vir primeiro.
// =================================================================
const SUPABASE_URL = 'https://vftbpsbaxdimvcpufxzz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmdGJwc2JheGRpbXZjcHVmeHp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTgwMTcsImV4cCI6MjA2ODUzNDAxN30.BPyS-rd1Er_NWORgeCU8iyeUdV0kBNAhwaO3p8_Zbcw';

// =================================================================
// PASSO 2: Criar o cliente Supabase.
// Esta linha SÓ PODE funcionar depois que as chaves acima foram definidas.
// =================================================================
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =================================================================
// PASSO 3: O resto da lógica da aplicação.
// =================================================================

// Elementos do DOM (onde o código interage com o HTML)
const filtroPerfil = document.getElementById('filtro-perfil');
const filtroVinculo = document.getElementById('filtro-vinculo');
const filtroSigilo = document.getElementById('filtro-sigilo');
const resultadoDiv = document.getElementById('resultado');

/**
 * Busca os valores únicos para perfil, vínculo e sigilo no banco de dados
 * e os adiciona como opções nos menus <select> do HTML.
 */
async function popularFiltros() {
    // Busca na tabela 'permissoes' as colunas necessárias para os filtros
    const { data, error } = await supabase.from('permissoes').select('perfil, vinculo_ao_processo, nivel_de_sigilo');

    if (error) {
        console.error('Erro ao buscar dados para os filtros:', error.message);
        alert('Não foi possível carregar os filtros. Verifique o console do navegador (F12) para mais detalhes.');
        return;
    }

    // Extrai valores únicos para evitar duplicados nos menus
    const perfis = [...new Set(data.map(item => item.perfil))];
    const vinculos = [...new Set(data.map(item => item.vinculo_ao_processo))];
    const sigilos = [...new Set(data.map(item => item.nivel_de_sigilo))];

    // Popula os selects com os valores, criando um <option> para cada
    perfis.sort().forEach(valor => {
        const option = document.createElement('option');
        option.value = valor;
        option.textContent = valor;
        filtroPerfil.appendChild(option);
    });

    vinculos.sort().forEach(valor => {
        const option = document.createElement('option');
        option.value = valor;
        option.textContent = valor.charAt(0).toUpperCase() + valor.slice(1);
        filtroVinculo.appendChild(option);
    });

    sigilos.sort().forEach(valor => {
        const option = document.createElement('option');
        option.value = valor;
        option.textContent = valor;
        filtroSigilo.appendChild(option);
    });
}

/**
 * Busca no Supabase os dados que correspondem aos filtros selecionados
 * e chama a função para exibi-los na tela.
 */
async function buscarPermissoes() {
    const perfilSelecionado = filtroPerfil.value;
    const vinculoSelecionado = filtroVinculo.value;
    const sigiloSelecionado = filtroSigilo.value;

    // Começa a montar a "pergunta" para o banco de dados
    let query = supabase.from('permissoes').select('*');

    // Adiciona filtros à query somente se um valor for selecionado no menu
    if (perfilSelecionado) {
        query = query.eq('perfil', perfilSelecionado);
    }
    if (vinculoSelecionado) {
        query = query.eq('vinculo_ao_processo', vinculoSelecionado);
    }
    if (sigiloSelecionado) {
        query = query.eq('nivel_de_sigilo', sigiloSelecionado);
    }

    // Executa a query e aguarda os dados (data) ou o erro (error)
    const { data, error } = await query;

    if (error) {
        console.error('Erro na busca:', error.message);
        resultadoDiv.innerHTML = `<p class="nenhum-resultado">Ocorreu um erro ao buscar os dados.</p>`;
        return;
    }
    
    exibirResultados(data);
}

/**
 * Renderiza os resultados da busca na tela, criando os cards de informação.
 * @param {Array} resultados - Um array de objetos vindos do Supabase.
 */
function exibirResultados(resultados) {
    resultadoDiv.innerHTML = ''; // Limpa resultados antigos antes de mostrar os novos

    if (resultados.length === 0) {
        resultadoDiv.innerHTML = `<p class="nenhum-resultado">Nenhuma combinação encontrada para os filtros selecionados.</p>`;
        return;
    }

    // Para cada item no array de resultados, cria um card HTML
    resultados.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card-resultado';

        card.innerHTML = `
            <h2>${item.perfil || 'Perfil não informado'}</h2>
            <h3>Ação de Consulta de Processos</h3>
            <p>${item.consulta_processos || 'Não especificado'}</p>
            <h3>Ação de Peticionar</h3>
            <p>${item.peticionar || 'Não especificado'}</p>
        `;

        resultadoDiv.appendChild(card);
    });
}

// =================================================================
// "Ouvintes" de eventos - Código que reage às ações do usuário
// =================================================================

// Chama a função de busca sempre que um filtro diferente for selecionado
filtroPerfil.addEventListener('change', buscarPermissoes);
filtroVinculo.addEventListener('change', buscarPermissoes);
filtroSigilo.addEventListener('change', buscarPermissoes);

// Quando a página terminar de carregar, executa estas funções
document.addEventListener('DOMContentLoaded', () => {
    popularFiltros(); // 1º: Popula os menus de filtro
    buscarPermissoes(); // 2º: Faz uma busca inicial para mostrar todos os resultados
});
