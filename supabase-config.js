// supabase-config.js
// Configuração do Supabase para Vigorre One™
// Arquivo de conexão com o banco de dados online

// ============================================
// 1. SUAS CHAVES DO SUPABASE
// ============================================
const SUPABASE_URL = 'https://dfthdcnaqmqswidwgezj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_bcLZGSu_wLmhcNOQmY3TLQ_yp3CHiZo';

// ============================================
// 2. INICIALIZAR CLIENTE SUPABASE (UMA VEZ SÓ!)
// ============================================
// Cria a conexão com o banco de dados
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// 3. FUNÇÃO PARA GERAR ID ÚNICO
// ============================================
function generateId() {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 9);
  return timestamp + randomPart;
}

// ============================================
// 4. FUNÇÃO PARA FORMATAR DATA
// ============================================
function formatDate(date) {
  return new Date(date).toLocaleString('pt-BR');
}

// ============================================
// 5. FUNÇÃO PARA SALVAR NO SUPABASE
// ============================================
async function saveToSupabase(table, data, localStorageKey) {
  try {
    // Tenta salvar no Supabase
    const { error } = await supabaseClient.from(table).upsert(data);
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Salvou no Supabase:', table, data.id);
    return true;
    
  } catch (e) {
    // Se falhar, salva no localStorage (offline)
    console.warn('⚠️ Offline - salvando no localStorage:', e);
    
    const existing = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
    const idx = existing.findIndex(item => item.id === data.id);
    
    if (idx > -1) {
      existing[idx] = data;
    } else {
      existing.push(data);
    }
    
    localStorage.setItem(localStorageKey, JSON.stringify(existing));
    return false;
  }
}

// ============================================
// 6. FUNÇÃO PARA BUSCAR DO SUPABASE
// ============================================
async function loadFromSupabase(table, localStorageKey, filterKey, filterValue) {
  try {
    // Tenta buscar no Supabase
    const { data, error } = await supabaseClient
      .from(table)
      .select('*')
      .eq(filterKey, filterValue)
      .maybeSingle();
    
    if (error) {
      throw error;
    }
    
    if (data) {
      console.log('✅ Carregou do Supabase:', table, data.id);
      return data;
    }
    
  } catch (e) {
    // Se falhar, usa localStorage (offline)
    console.warn('⚠️ Offline - usando localStorage:', e);
  }
  
  // Fallback: busca no localStorage
  const items = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
  return items.find(item => item[filterKey] === filterValue) || null;
}

// ============================================
// 7. EXPORTAR PARA USO GLOBAL
// ============================================
// Disponibiliza as funções para todos os arquivos HTML
window.VigorreDB = {
  supabase: supabaseClient,
  generateId: generateId,
  formatDate: formatDate,
  saveToSupabase: saveToSupabase,
  loadFromSupabase: loadFromSupabase
};

// ============================================
// 8. MENSAGEM DE CONFIRMAÇÃO
// ============================================
console.log('🔗 VigorreDB conectado ao Supabase');
console.log('📊 URL:', SUPABASE_URL);
console.log('✅ Sistema pronto para usar online e offline');
