let queue = []

export const handlequeue = (socket, io, action = 'connect') => {
    if (action === 'connect') {
        queue.push(socket)
        console.log(`Socket ${socket.id} added to the queue.`)

        if (queue.length >= 2) {
            const user1 = queue.shift()
            const user2 = queue.shift()

            user1.emit("matched", { opponentId: user2.id, role: 'caller' })
            user2.emit("matched", { opponentId: user1.id, role: 'callee' })

            console.log(`Users ${user1.id} and ${user2.id} are matched!`)

            setupWebRTC(user1, user2, io)
        }
    } else if (action === 'disconnect') {
        const initialLength = queue.length
        queue = queue.filter(user => user.id !== socket.id)
        console.log(`Socket ${socket.id} removed from the queue.`)

        if (initialLength !== queue.length) {
            console.log(`Updated queue length: ${queue.length}`)
        }

        // Optionally, notify remaining users or handle re-matching
    }
}

const setupWebRTC = (user1, user2, io) => {
    user1.on('offer', (offer) => {
        console.log(`Received offer from ${user1.id}, forwarding to ${user2.id}`)
        user2.emit('offer', offer)
    })
    user2.on('answer', (answer) => {
        console.log(`Received answer from ${user2.id}, forwarding to ${user1.id}`)
        user1.emit('answer', answer)
    })

    user1.on('ice-candidate', (candidate) => {
        console.log(`Received ICE candidate from ${user1.id}, forwarding to ${user2.id}`)
        user2.emit('ice-candidate', candidate)
    })
    user2.on('ice-candidate', (candidate) => {
        console.log(`Received ICE candidate from ${user2.id}, forwarding to ${user1.id}`)
        user1.emit('ice-candidate', candidate)
    })

    // Removed redundant disconnect handlers from here
}
