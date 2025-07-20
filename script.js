// =================================================================
// 1. CONFIGURAÇÃO E INICIALIZAÇÃO DO SUPABASE
// =================================================================
const SUPABASE_URL = 'https://vftbpsbaxdimvcpufxzz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmdGJwc2JheGRpbXZjcHVmeHp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTgwMTcsImV4cCI6MjA2ODUzNDAxN30.BPyS-rd1Er_NWORgeCU8iyeUdV0kBNAhwaO3p8_Zbcw';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =================================================================
// 3. LÓGICA DO APLICATIVO
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
    const { data, error } = await supabaseClient
        .from('permissoes_consulta_peticionamento')
        .select('perfil, vinculo_processo, nivel_sigilo');

    if (error) {
        console.error('Erro ao buscar dados para os filtros:', error.message);
        alert('Não foi possível carregar os filtros. Verifique o console do navegador (F12).');
        return;
    }

    const perfis = [...new Set(data.map(item => item.perfil))];
    const vinculos = [...new Set(data.map(item => item.vinculo_processo))];
    const sigilos = [...new Set(data.map(item => item.nivel_sigilo))];

    perfis.sort().forEach(valor => {
        if (valor) {
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

    let query = supabaseClient.from('permissoes_consulta_peticionamento').select('*');

    if (perfilSelecionado) {
        query = query.eq('perfil', perfilSelecionado);
    }
    if (vinculoSelecionado) {
        query = query.eq('vinculo_processo', vinculoSelecionado);
    }
    if (sigiloSelecionado) {
        query = query.eq('nivel_sigilo', sigiloSelecionado);
    }
    
    const { data, error } = await query;

    if (error) {
        console.error('Erro na busca:', error.message);
        resultadoDiv.innerHTML = `<p class="nenhum-resultado">Ocorreu um erro ao buscar os dados.p>`;
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
        resultadoDiv.innerHTML = `<p class="nenhum-resultado">Nenhuma combinação encontrada para os filtros selecionados.p>`;
        return;
    }

    resultados.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card-resultado';

        // ## MUDANÇA APLICADA AQUI ##
        // Agora o h2 mostra o Perfil e também o Nível de Sigilo do resultado.
        card.innerHTML = `
            <h2>${item.perfil || 'Perfil não informado'} (Sigilo: ${item.nivel_sigilo || 'N/A'})h2>
            <h3>Ação de Consulta de Processosh3>
            <p>${item.consulta_processos || 'Não especificado'}p>
            <h3>Ação de Peticionarh3>
            <p>${item.peticionar || 'Não especificado'}p>
        `;

        resultadoDiv.appendChild(card);
    });
}

// "Ouvintes" de eventos
filtroPerfil.addEventListener('change', buscarPermissoes);
filtroVinculo.addEventListener('change', buscarPermissoes);
filtroSigilo.addEventListener('change', buscarPermissoes);

document.addEventListener('DOMContentLoaded', () => {
    popularFiltros(); 
    buscarPermissoes(); 
});
