const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testDocumentsAPI() {
  try {
    console.log('🧪 Test de l\'API Documents...\n');

    // Test 1: Récupérer tous les documents
    console.log('1️⃣ Test GET /documents');
    const documentsResponse = await axios.get(`${BASE_URL}/documents`);
    console.log('✅ Documents récupérés:', documentsResponse.data.length);
    console.log('📄 Premier document:', documentsResponse.data[0] || 'Aucun document');
    console.log('');

    // Test 2: Créer un document de test
    console.log('2️⃣ Test POST /documents');
    const testDocument = {
      type: 'supplier_purchase_order',
      number: 'TEST-BC-2025-001',
      workflowStep: 1,
      status: 'draft',
      amount: 1000.00,
      notes: 'Document de test pour vérifier l\'API',
      supplierId: null,
      clientId: null
    };

    const createResponse = await axios.post(`${BASE_URL}/documents`, testDocument);
    console.log('✅ Document créé avec succès');
    console.log('🆔 ID du document:', createResponse.data.id);
    console.log('📝 Numéro:', createResponse.data.number);
    console.log('');

    // Test 3: Récupérer le document créé
    console.log('3️⃣ Test GET /documents/:id');
    const documentId = createResponse.data.id;
    const getDocumentResponse = await axios.get(`${BASE_URL}/documents/${documentId}`);
    console.log('✅ Document récupéré par ID');
    console.log('📄 Document:', getDocumentResponse.data);
    console.log('');

    // Test 4: Mettre à jour le document
    console.log('4️⃣ Test PUT /documents/:id');
    const updateResponse = await axios.put(`${BASE_URL}/documents/${documentId}`, {
      status: 'sent',
      notes: 'Document de test mis à jour'
    });
    console.log('✅ Document mis à jour avec succès');
    console.log('📝 Nouveau statut:', updateResponse.data.status);
    console.log('');

    // Test 5: Supprimer le document de test
    console.log('5️⃣ Test DELETE /documents/:id');
    await axios.delete(`${BASE_URL}/documents/${documentId}`);
    console.log('✅ Document supprimé avec succès');
    console.log('');

    console.log('🎉 Tous les tests ont réussi ! L\'API Documents fonctionne parfaitement.');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
    
    if (error.response?.status === 500) {
      console.error('🔍 Détails de l\'erreur 500:');
      console.error('URL:', error.config?.url);
      console.error('Méthode:', error.config?.method);
      console.error('Données envoyées:', error.config?.data);
    }
  }
}

// Lancer le test
testDocumentsAPI();
