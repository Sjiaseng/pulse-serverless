module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Listen for messages from client
    socket.on('chatMessage', (msg) => {
      console.log('Message received:', msg);

      // Broadcast message to all clients
      io.emit('chatMessage', msg);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};
