// Importa a configuração do Firebase
import { db } from './firebase-config.js';

// Variáveis globais
let calendar;
let currentCourse = null;
let currentCollaborator = null;
let collaborators = [];

// Inicialização do calendário
document.addEventListener('DOMContentLoaded', function() {
    initializeCalendar();
    setupEventListeners();
    loadCollaborators();
});

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
        events: loadCourses,
        eventContent: renderEventContent
    });

    calendar.render();
}

function renderEventContent(arg) {
    const eventEl = document.createElement('div');
    
    const titleEl = document.createElement('div');
    titleEl.className = 'fc-event-title';
    titleEl.textContent = arg.event.title;
    
    const participantsEl = document.createElement('div');
    participantsEl.className = 'fc-event-participants';
    
    const participantes = arg.event.extendedProps.participantes || [];
    participantes.slice(0, 3).forEach(participant => {
        const badge = document.createElement('span');
        badge.className = 'participant-badge';
        badge.textContent = participant;
        participantsEl.appendChild(badge);
    });
    
    if (participantes.length > 3) {
        const moreCount = participantes.length - 3;
        const moreEl = document.createElement('span');
        moreEl.className = 'participant-badge';
        moreEl.textContent = `+${moreCount}`;
        participantsEl.appendChild(moreEl);
    }
    
    eventEl.appendChild(titleEl);
    eventEl.appendChild(participantsEl);
    
    return { domNodes: [eventEl] };
}

// ... (demais funções mantidas como no código anterior, mas usando 'db' importado)

// Função para salvar curso (atualizada)
async function saveCourse() {
    const selectedOptions = Array.from(document.getElementById('participantsSelect').selectedOptions);
    const participantes = selectedOptions.map(option => option.value);
    
    const courseData = {
        nome: document.getElementById('courseName').value,
        descricao: document.getElementById('courseDescription').value,
        local: document.getElementById('courseLocation').value,
        data: firebase.firestore.Timestamp.fromDate(new Date(document.getElementById('courseDate').value)),
        dataVencimento: firebase.firestore.Timestamp.fromDate(new Date(document.getElementById('courseEndDate').value)),
        participantes: participantes,
        status: "ativo",
        atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        if (currentCourse) {
            // Atualiza curso existente sem modificar criadoEm
            await db.collection("cursos").doc(currentCourse.id).update(courseData);
        } else {
            // Adiciona criadoEm apenas para novos cursos
            courseData.criadoEm = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection("cursos").add(courseData);
        }

        loadCourses();
        document.getElementById('courseModal').style.display = 'none';
        resetCourseForm();
    } catch (error) {
        console.error("Erro ao salvar curso:", error);
        alert(`Erro ao salvar: ${error.message}`);
    }
}

// ... (outras funções permanecem iguais)