
let queue = []
export const handlequeue = (socket,io,action='connect') => {

    
    if(action==='connect'){
        queue.push(socket)

        if (queue.length >= 2){
            const user1 = queue.shift()
            const user2 = queue.shift()

            user1.emit("matched", {opponentId: user2.id, role: 'caller'})
            user2.emit("matched", {opponentId: user1.id, role: 'callee'})

            console.log(`Users ${user1.id} and ${user2.id} are matched!`);

            setupWebRTC(user1, user2)
        }
    }else if(action==='disconnect'){
        queue = queue.filter(user => user.id !== socket.id)

        if (queue.length >= 2){
            const user1 = queue.shift()
            const user2 = queue.shift()

            user1.emit("matched", {opponentId: user2.id, role: 'caller'})
            user2.emit("matched", {opponentId: user1.id, role: 'callee'})

            console.log(`Users ${user1.id} and ${user2.id} are matched!`);

            setupWebRTC(user1, user2)
        }
    }
}

const setupWebRTC = (user1, user2) => {
    user1.on('offer',(offer) => {
        user2.emit('offer',offer)
    })
    user2.on('answer',(answer) => {
        user1.emit('answer',answer)
    })

    user1.on('ice-candidate',(candidate) => {
        user2.emit('ice-candidate',candidate)
    })
    user2.on('ice-candidate',(candidate) => {
        user1.emit('ice-candidate',candidate)
    })

    user1.on('disconnect', () => handlequeue(user1, null, 'disconnect'));
    user2.on('disconnect', () => handlequeue(user2, null, 'disconnect'));

}