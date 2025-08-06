// Importação do Firebase
const db = firebase.firestore();

// Variáveis globais
let calendar;
let currentCourse = null;
let currentCollaborator = null;
let collaborators = [];

// Função principal de inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeCalendar();
    setupEventListeners();
    loadCollaborators();
});

// ==================== FUNÇÕES DO CALENDÁRIO ====================

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

// ==================== FUNÇÕES DE CURSOS ====================

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
        
        if (successCallback) {
            successCallback(events);
        } else {
            calendar.refetchEvents();
        }
    } catch (error) {
        console.error("Erro ao carregar cursos:", error);
        if (failureCallback) failureCallback(error);
    }
}

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
            await db.collection("cursos").doc(currentCourse.id).update(courseData);
        } else {
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

function showCourseDetails(event) {
    currentCourse = {
        id: event.id,
        nome: event.title,
        data: event.start,
        dataVencimento: event.end,
        descricao: event.extendedProps.descricao,
        local: event.extendedProps.local,
        participantes: event.extendedProps.participantes || [],
        criadoEm: event.extendedProps.criadoEm
    };

    document.getElementById('viewCourseTitle').textContent = currentCourse.nome;
    document.getElementById('viewCourseDate').textContent = currentCourse.data.toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });
    document.getElementById('viewCourseTime').textContent = 
        `${currentCourse.data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ${currentCourse.dataVencimento.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    document.getElementById('viewCourseLocation').textContent = currentCourse.local;
    document.getElementById('viewCourseDescription').textContent = currentCourse.descricao || "Sem descrição";

    const participantsList = document.getElementById('viewCourseParticipants');
    participantsList.innerHTML = '';
    
    if (currentCourse.participantes.length > 0) {
        currentCourse.participantes.forEach(participant => {
            const li = document.createElement('li');
            li.textContent = participant;
            participantsList.appendChild(li);
        });
    } else {
        participantsList.innerHTML = '<li>Nenhum participante cadastrado</li>';
    }

    document.getElementById('viewCourseModal').style.display = 'block';
}

// ==================== FUNÇÕES DE COLABORADORES ====================

async function loadCollaborators() {
    try {
        const snapshot = await db.collection("colaboradores").orderBy("nome").get();
        collaborators = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                nome: data.nome,
                cargo: data.cargo || ""
            };
        });
        
        updateParticipantsSelect();
        updateCollaboratorsTable();
    } catch (error) {
        console.error("Erro ao carregar colaboradores:", error);
    }
}

function updateParticipantsSelect() {
    const select = document.getElementById('participantsSelect');
    select.innerHTML = '';
    
    collaborators.forEach(collaborator => {
        const option = document.createElement('option');
        option.value = collaborator.nome;
        option.textContent = `${collaborator.nome}${collaborator.cargo ? ` (${collaborator.cargo})` : ''}`;
        select.appendChild(option);
    });
}

// ==================== FUNÇÕES AUXILIARES ====================

function setupEventListeners() {
    document.getElementById('newCourseBtn').addEventListener('click', () => {
        currentCourse = null;
        resetCourseForm();
        document.getElementById('modalTitle').textContent = "Adicionar Novo Curso";
        document.getElementById('courseModal').style.display = 'block';
    });

    document.getElementById('newCollaboratorBtn').addEventListener('click', () => {
        currentCollaborator = null;
        resetCollaboratorForm();
        document.getElementById('collaboratorModal').style.display = 'block';
    });

    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    document.getElementById('courseForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveCourse();
    });

    document.getElementById('editCourseBtn').addEventListener('click', () => {
        if (currentCourse) {
            document.getElementById('viewCourseModal').style.display = 'none';
            editCourse(currentCourse);
        }
    });
}

function resetCourseForm() {
    document.getElementById('courseForm').reset();
    document.getElementById('courseId').value = '';
    const select = document.getElementById('participantsSelect');
    Array.from(select.options).forEach(option => {
        option.selected = false;
    });
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

function formatDateTimeForInput(date) {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
}
