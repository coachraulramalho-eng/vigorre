// Configuração do Firebase (Banco de Dados Gratuito)
// Siga estes passos:
// 1. Acesse https://console.firebase.google.com
// 2. Crie um novo projeto
// 3. Vá em "Configurações do projeto" → "Geral"
// 4. Role para baixo e clique no ícone Web "</>"
// 5. Registre o app e copie as credenciais abaixo

const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referências ao Firestore Database
const db = firebase.firestore();

// Funções de Banco de Dados
const database = {
  // Salvar empresa
  saveCompany: async (companyData) => {
    try {
      const docRef = await db.collection('companies').add(companyData);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
      return { success: false, error };
    }
  },

  // Salvar participante
  saveParticipant: async (participantData) => {
    try {
      const docRef = await db.collection('participants').add(participantData);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Erro ao salvar participante:', error);
      return { success: false, error };
    }
  },

  // Salvar teste
  saveTest: async (testData) => {
    try {
      const docRef = await db.collection('tests').add({
        ...testData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Erro ao salvar teste:', error);
      return { success: false, error };
    }
  },

  // Salvar relatório
  saveReport: async (reportData) => {
    try {
      const docRef = await db.collection('reports').add({
        ...reportData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Erro ao salvar relatório:', error);
      return { success: false, error };
    }
  },

  // Buscar todos os testes de uma empresa
  getTestsByCompany: async (companyId) => {
    try {
      const snapshot = await db.collection('tests')
        .where('companyId', '==', companyId)
        .get();
      
      const tests = [];
      snapshot.forEach(doc => {
        tests.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, tests };
    } catch (error) {
      console.error('Erro ao buscar testes:', error);
      return { success: false, error };
    }
  },

  // Atualizar status do teste
  updateTestStatus: async (testId, status, answers = null) => {
    try {
      const updateData = { status };
      if (answers) updateData.answers = answers;
      if (status === 'completed') {
        updateData.completedAt = firebase.firestore.FieldValue.serverTimestamp();
      }
      
      await db.collection('tests').doc(testId).update(updateData);
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar teste:', error);
      return { success: false, error };
    }
  }
};

// Exportar para uso global
window.firebaseDB = database;