// =================================================================
// 1. CONFIGURAÇÃO DO SUPABASE - Chaves definidas primeiro
// =================================================================
const SUPABASE_URL = 'https://vftbpsbaxdimvcpufxzz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmdGJwc2JheGRpbXZjcHVmeHp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTgwMTcsImV4cCI6MjA2ODUzNDAxN30.BPyS-rd1Er_NWORgeCU8iyeUdV0kBNAhwaO3p8_Zbcw';

// =================================================================
// 2. INICIALIZAÇÃO DO CLIENTE SUPABASE
// =================================================================
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =================================================================
// LÓGICA DO APLICATIVO
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
    const { data, error } = await supabase.from('permissoes').select('perfil, vinculo_ao_processo, nivel_de_sigilo');

    if (error) {
        console.error('Erro ao buscar dados para os filtros:', error);
        alert('Não foi possível carregar os filtros. Verifique o console para mais detalhes.');
        return;
    }

    // Extrai valores únicos para evitar duplicados
    const perfis = [...new Set(data.map(item => item.perfil))];
    const vinculos = [...new Set(data.map(item => item.vinculo_ao_processo))];
    const sigilos = [...new Set(data.map(item => item.nivel_de_sigilo))];

    // Popula os selects com os valores
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

    let query = supabase.from('permissoes').select('*');

    if (perfilSelecionado) {
        query = query.eq('perfil', perfilSelecionado);
    }
    if (vinculoSelecionado) {
        query = query.eq('vinculo_ao_processo', vinculoSelecionado);
    }
    if (sigiloSelecionado) {
        query = query.eq('nivel_de_sigilo', sigiloSelecionado);
    }
    
    const { data, error } = await query;

    if (error) {
        console.error('Erro na busca:', error);
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
    resultadoDiv.innerHTML = ''; 

    if (resultados.length === 0) {
        resultadoDiv.innerHTML = `<p class="nenhum-resultado">Nenhuma combinação encontrada para os filtros selecionados.</p>`;
        return;
    }

    resultados.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card-resultado';

        card.innerHTML = `
            <h2>${item.perfil}</h2>
            <h3>Ação de Consulta de Processos</h3>
            <p>${item.consulta_processos}</p>
            <h3>Ação de Peticionar</h3>
            <p>${item.peticionar}</p>
        `;

        resultadoDiv.appendChild(card);
    });
}

// =================================================================
// EVENT LISTENERS - Código que "ouve" as ações do usuário
// =================================================================

filtroPerfil.addEventListener('change', buscarPermissoes);
filtroVinculo.addEventListener('change', buscarPermissoes);
filtroSigilo.addEventListener('change', buscarPermissoes);

document.addEventListener('DOMContentLoaded', () => {
    popularFiltros(); 
    buscarPermissoes(); 
});