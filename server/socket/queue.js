// queue.js
const queue = []
const pairedUsers = new Map() // To track paired users

export const handlequeue = (socket, io, action = 'connect') => {
  if (action === 'connect') {
    queue.push(socket)
    console.log(`User ${socket.id} added to the queue`)

    if (queue.length >= 2) {
      const user1 = queue.shift()
      const user2 = queue.shift()

      // Pair the users
      pairedUsers.set(user1.id, user2.id)
      pairedUsers.set(user2.id, user1.id)

      user1.emit("matched", { opponentId: user2.id, role: 'caller' })
      user2.emit("matched", { opponentId: user1.id, role: 'callee' })

      console.log(`Users ${user1.id} and ${user2.id} are matched!`)

      setupWebRTC(user1, user2)
    }
  } else if (action === 'disconnect') {
    // Remove the user from the queue if they are waiting
    const index = queue.findIndex(user => user.id === socket.id)
    if (index !== -1) {
      queue.splice(index, 1)
      console.log(`User ${socket.id} removed from queue`)
    }

    // Check if the disconnected user was paired
    if (pairedUsers.has(socket.id)) {
      const opponentId = pairedUsers.get(socket.id)
      pairedUsers.delete(socket.id)
      pairedUsers.delete(opponentId)

      console.log(`User ${socket.id} disconnected. Notifying opponent ${opponentId}`)

      // Notify the opponent that their peer has disconnected
      io.to(opponentId).emit('peer-disconnected')

      // Requeue the opponent for matchmaking
      const opponentSocket = io.sockets.sockets.get(opponentId)
      if (opponentSocket) {
        console.log(`Requeuing opponent ${opponentId} after disconnection of ${socket.id}`)
        handlequeue(opponentSocket, io, 'connect')
      }
    }
  }
}

const setupWebRTC = (user1, user2) => {
  // Forward 'offer' from user1 to user2
  user1.on('offer', (data) => {
    console.log(`Forwarding offer from ${user1.id} to ${user2.id}`)
    user2.emit('offer', { offer: data.offer })
  })

  // Forward 'answer' from user2 to user1
  user2.on('answer', (data) => {
    console.log(`Forwarding answer from ${user2.id} to ${user1.id}`)
    user1.emit('answer', { answer: data.answer })
  })

  // Forward 'ice-candidate' from user1 to user2
  user1.on('ice-candidate', (data) => {
    console.log(`Forwarding ICE candidate from ${user1.id} to ${user2.id}`)
    user2.emit('ice-candidate', { candidate: data.candidate })
  })

  // Forward 'ice-candidate' from user2 to user1
  user2.on('ice-candidate', (data) => {
    console.log(`Forwarding ICE candidate from ${user2.id} to ${user1.id}`)
    user1.emit('ice-candidate', { candidate: data.candidate })
  })

  // Handle disconnections
  user1.on('disconnect', () => handlequeue(user1, io, 'disconnect'))
  user2.on('disconnect', () => handlequeue(user2, io, 'disconnect'))
}
