// Importação do Firebase (deve ser a primeira linha)
import { db } from './firebase-config.js';

// 1. Primeiro declare TODAS as funções
async function loadCourses(fetchInfo, successCallback, failureCallback) {
    try {
        const snapshot = await db.collection("cursos")
            .where("data", ">=", firebase.firestore.Timestamp.fromDate(fetchInfo.start))
            .where("data", "<=", firebase.firestore.Timestamp.fromDate(fetchInfo.end))
            .orderBy("data", "asc")
            .get();

        const events = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.nome,
                start: data.data.toDate(),
                end: data.dataVencimento.toDate(),
                extendedProps: {
                    descricao: data.descricao,
                    local: data.local,
                    participantes: data.participantes || []
                }
            };
        });
        
        if (successCallback) successCallback(events);
        else calendar.refetchEvents();
    } catch (error) {
        console.error("Erro ao carregar cursos:", error);
        if (failureCallback) failureCallback(error);
    }
}

function initializeCalendar() {
    const calendarEl = document.getElementById('calendar');
    
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'pt-br',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        eventClick: function(info) {
            info.jsEvent.preventDefault();
            showCourseDetails(info.event);
        },
        dateClick: function(info) {
            openAddModal(info.date);
        },
        events: loadCourses, // Agora a função já está definida
        eventContent: renderEventContent
    });

    calendar.render();
}

// 2. Depois adicione as outras funções necessárias
function renderEventContent(arg) {
    // ... (mantenha o mesmo conteúdo)
}

// 3. Só então execute o código principal
document.addEventListener('DOMContentLoaded', function() {
    initializeCalendar(); // Agora todas as funções estão definidas
    setupEventListeners();
    loadCollaborators();
});
