// =================================================================
// 1. CONFIGURAÇÃO E INICIALIZAÇÃO DO SUPABASE
// =================================================================
const SUPABASE_URL = 'https://vftbpsbaxdimvcpufxzz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmdGJwc2JheGRpbXZjcHVmeHp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTgwMTcsImV4cCI6MjA2ODUzNDAxN30.BPyS-rd1Er_NWORgeCU8iyeUdV0kBNAhwaO3p8_Zbcw';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =================================================================
// LÓGICA DO APLICATIVO
// =================================================================

// Elementos do DOM
const filtroPerfil = document.getElementById('filtro-perfil');
const filtroVinculo = document.getElementById('filtro-vinculo');
const filtroSigilo = document.getElementById('filtro-sigilo');
const resultadoDiv = document.getElementById('resultado');

/**
 * Popula os menus de filtro com dados únicos do banco.
 */
async function popularFiltros() {
    // CORREÇÃO: Usando o nome correto da tabela e das colunas.
    const { data, error } = await supabase
        .from('permissoes_consulta_peticionamento') // NOME DA TABELA CORRETO
        .select('perfil, vinculo_processo, nivel_sigilo'); // NOMES DAS COLUNAS CORRETOS

    if (error) {
        console.error('Erro ao buscar dados para os filtros:', error.message);
        alert('Não foi possível carregar os filtros. Verifique o console do navegador (F12).');
        return;
    }

    // Extrai valores únicos para evitar duplicados
    const perfis = [...new Set(data.map(item => item.perfil))];
    const vinculos = [...new Set(data.map(item => item.vinculo_processo))]; // NOME DA COLUNA CORRETO
    const sigilos = [...new Set(data.map(item => item.nivel_sigilo))];     // NOME DA COLUNA CORRETO

    // Popula os selects com os valores
    perfis.sort().forEach(valor => {
        if (valor) { // Garante que valores nulos não entrem no filtro
            const option = document.createElement('option');
            option.value = valor;
            option.textContent = valor;
            filtroPerfil.appendChild(option);
        }
    });

    vinculos.sort().forEach(valor => {
        if (valor) {
            const option = document.createElement('option');
            option.value = valor;
            option.textContent = valor.charAt(0).toUpperCase() + valor.slice(1);
            filtroVinculo.appendChild(option);
        }
    });

    sigilos.sort().forEach(valor => {
        if (valor) {
            const option = document.createElement('option');
            option.value = valor;
            option.textContent = valor;
            filtroSigilo.appendChild(option);
        }
    });
}

/**
 * Busca no Supabase com base nos filtros e exibe os resultados.
 */
async function buscarPermissoes() {
    const perfilSelecionado = filtroPerfil.value;
    const vinculoSelecionado = filtroVinculo.value;
    const sigiloSelecionado = filtroSigilo.value;

    // CORREÇÃO: Usando o nome correto da tabela.
    let query = supabase.from('permissoes_consulta_peticionamento').select('*');

    // Adiciona filtros à query (aqui usamos os nomes corretos das colunas)
    if (perfilSelecionado) {
        query = query.eq('perfil', perfilSelecionado);
    }
    if (vinculoSelecionado) {
        query = query.eq('vinculo_processo', vinculoSelecionado); // NOME DA COLUNA CORRETO
    }
    if (sigiloSelecionado) {
        query = query.eq('nivel_sigilo', sigiloSelecionado);     // NOME DA COLUNA CORRETO
    }
    
    const { data, error } = await query;

    if (error) {
        console.error('Erro na busca:', error.message);
        resultadoDiv.innerHTML = `<p class="nenhum-resultado">Ocorreu um erro ao buscar os dados.</p>`;
        return;
    }
    
    exibirResultados(data);
}

/**
 * Renderiza os resultados da busca na tela.
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

        // Aqui os nomes das variáveis (item.perfil, etc.) correspondem às colunas corretas.
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
// EVENT LISTENERS - "Ouvintes" de ações do usuário
// =================================================================

filtroPerfil.addEventListener('change', buscarPermissoes);
filtroVinculo.addEventListener('change', buscarPermissoes);
filtroSigilo.addEventListener('change', buscarPermissoes);

document.addEventListener('DOMContentLoaded', () => {
    popularFiltros(); 
    buscarPermissoes(); 
});
