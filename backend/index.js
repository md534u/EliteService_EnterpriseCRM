const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();

// --- CAMBIO 1: CORS GLOBAL ---
// Permitimos conexión desde cualquier origen ('*') para evitar problemas
// entre Render (Backend) y tu PC/Vercel (Frontend).
app.use(cors({
    origin: "*", 
    methods: ["GET", "POST"]
}));
app.use(express.json());

const server = http.createServer(app);

// --- CAMBIO 2: SOCKET.IO ADAPTADO ---
const io = new Server(server, {
    cors: {
        origin: "*", // Aceptamos conexiones desde tu localhost y desde la web publicada
        methods: ["GET", "POST"]
    }
});

// --- RUTA QUE RECIBIRÁ LOS CORREOS DESDE MAKE.COM ---
app.post('/webhook-email', (req, res) => {
    // Leemos body o query para asegurar que los datos lleguen
    const from = req.body.from || req.query.from || "Desconocido";
    const subject = req.body.subject || req.query.subject || "Sin asunto";
    
    console.log(`📩 Webhook recibido en Nube: ${subject} de ${from}`);

    // Emitimos el evento a todos los clientes conectados
    io.emit('new_mail_notification', { from, subject });

    res.status(200).json({ status: 'Notificación enviada exitosamente' });
});

// Mensaje de diagnóstico para saber si hay clientes conectados
io.on('connection', (socket) => {
    console.log(`💻 Cliente conectado ID: ${socket.id}`);
    
    socket.on('disconnect', () => {
        console.log(`❌ Cliente desconectado ID: ${socket.id}`);
    });
});

// --- CAMBIO 3: PUERTO DINÁMICO (VITAL PARA RENDER) ---
// Render nos dará un puerto en process.env.PORT. Si no, usamos el 4000.
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📡 Esperando conexiones Socket.io y Webhooks...`);
});