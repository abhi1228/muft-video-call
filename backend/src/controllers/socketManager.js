import { Server } from "socket.io";

let connections = {}
let messages = {}
let timeOnline = {}

const connectToSocket = (server)=>{

    const io=new Server(server,{
        cors:{
            origin:"*",
            methonds:["GET","POST"],
            allowedHeaders:["*"],
            credentials:true
        }
    });

    io.on("connection", (socket) => {

        console.log("SOMETHING CONNECTED")

        socket.on("join-call", (path) => {

            if (connections[path] === undefined) {
                connections[path] = []
            }
            connections[path].push(socket.id)

            timeOnline[socket.id] = new Date();

            // connections[path].forEach(elem => {
            //     io.to(elem)
            // })
            //SENDING THE LIST OF USERS IN THE ROOM TO THE USER WHO JOINED
            for (let a = 0; a < connections[path].length; a++) {
                io.to(connections[path][a]).emit("user-joined", socket.id, connections[path])
            }
            //SENDING THE LIST OF MESSAGES PRESENT  TO THE USER WHO JOINED
            if (messages[path] !== undefined) {
                for (let a = 0; a < messages[path].length; ++a) {
                    io.to(socket.id).emit("chat-message", messages[path][a]['data'],
                        messages[path][a]['sender'], messages[path][a]['socket-id-sender'])
                }
            }

        })
        //NOTIFYING THE USERS IN THE ROOM ABOUT THE MESSAGE SENT BY THE USER
        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        })
        // THE USERS IN THE ROOM SEND THE MESSAGE 
        socket.on("chat-message", (data, sender) => {

            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {


                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }

                    return [room, isFound];

                }, ['', false]);

                
            if (found === true) {
                if (messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = []
                }

                messages[matchingRoom].push({ 'sender': sender, "data": data, "socket-id-sender": socket.id })
                console.log("message", matchingRoom, ":", sender, data)

                connections[matchingRoom].forEach((elem) => {
                    io.to(elem).emit("chat-message", data, sender, socket.id)
                })
            }

        })

        socket.on("disconnect", () => {

            var diffTime = Math.abs(timeOnline[socket.id] - new Date())

            var key
            //FIND THE USER ROOM AND NOTIFY THE USERS IN THE ROOM ABOUT THE USER WHO LEFT
            for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {

                for (let a = 0; a < v.length; ++a) {
                    if (v[a] === socket.id) {
                        key = k

                        for (let a = 0; a < connections[key].length; ++a) {
                            io.to(connections[key][a]).emit('user-left', socket.id)
                        }

                        var index = connections[key].indexOf(socket.id)

                        connections[key].splice(index, 1)


                        if (connections[key].length === 0) {
                            delete connections[key]
                        }
                    }
                }

            }


        })


    })


    return io;
}

export default connectToSocket;