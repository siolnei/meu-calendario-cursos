// Configuração inicial
document.addEventListener('DOMContentLoaded', () => {
    // Verifica se o Firebase está carregado
    if (typeof firebase === 'undefined') {
        console.error('Firebase não carregado!');
        return;
    }

    initializeCalendar();
    setupEventListeners();
});

// Função para carregar cursos
async function loadCourses(fetchInfo, successCallback) {
    try {
        const snapshot = await firebase.firestore().collection("cursos")
            .where("data", ">=", firebase.firestore.Timestamp.fromDate(fetchInfo.start))
            .where("data", "<=", firebase.firestore.Timestamp.fromDate(fetchInfo.end))
            .get();

        const events = snapshot.docs.map(doc => ({
            id: doc.id,
            title: doc.data().nome,
            start: doc.data().data.toDate(),
            end: doc.data().dataVencimento.toDate(),
            extendedProps: doc.data()
        }));

        successCallback(events);
    } catch (error) {
        console.error("Erro ao carregar cursos:", error);
    }
}

// Restante do código (initializeCalendar, setupEventListeners, etc.)
