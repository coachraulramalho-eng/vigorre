// supabase-config.js
// Configuração do Supabase para Vigorre One™

// ✅ SUAS CHAVES DO SUPABASE
const SUPABASE_URL = 'https://dfthdcnaqmqswidwgezj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_bcLZGSu_wLmhcNOQmY3TLQ_yp3CHiZo';

// Inicializar cliente Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Função para gerar ID único
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Função para formatar data
function formatDate(date) {
  return new Date(date).toLocaleString('pt-BR');
}

// Salvar no Supabase com fallback para localStorage
async function saveToSupabase(table, data, localStorageKey) {
  try {
    const { error } = await supabase.from(table).upsert(data);
    if (error) throw error;
    console.log('✅ Salvou no Supabase:', table, data.id);
    return true;
  } catch (e) {
    console.warn('⚠️ Offline - salvando no localStorage:', e);
    const existing = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
    const idx = existing.findIndex(item => item.id === data.id);
    if (idx > -1) existing[idx] = data;
    else existing.push(data);
    localStorage.setItem(localStorageKey, JSON.stringify(existing));
    return false;
  }
}

// Buscar do Supabase com fallback para localStorage
async function loadFromSupabase(table, localStorageKey, filterKey, filterValue) {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq(filterKey, filterValue)
      .maybeSingle();
    
    if (error) throw error;
    if (data) {
      console.log('✅ Carregou do Supabase:', table, data.id);
      return data;
    }
  } catch (e) {
    console.warn('⚠️ Offline - usando localStorage:', e);
  }
  
  // Fallback localStorage
  const items = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
  return items.find(item => item[filterKey] === filterValue) || null;
}

// Exportar para uso global
window.VigorreDB = {
  supabase,
  generateId,
  formatDate,
  saveToSupabase,
  loadFromSupabase
};

console.log('🔗 VigorreDB conectado ao Supabase');
