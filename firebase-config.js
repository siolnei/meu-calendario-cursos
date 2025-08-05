// firebase-config.js
const firebaseConfig = {
  apiKey: "AIzaSyD3kjJk0qIvYcxat9QgRk-5Z-tv9S1dSm4",
  authDomain: "calenario-de-cursos.firebaseapp.com",
  projectId: "calenario-de-cursos",
  storageBucket: "calenario-de-cursos.firebasestorage.app",
  messagingSenderId: "968930225234",
  appId: "1:968930225234:web:f69ee44bf4ba1bf4ccc38b",
  measurementId: "G-M51RRXD1QL"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);

// Exporta as referências do Firestore para uso em outros arquivos
const db = firebase.firestore();

export { db };

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    projectId: "SEU_PROJETO",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "SEU_SENDER_ID",
    appId: "SEU_APP_ID"
};

// Inicialização do Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
