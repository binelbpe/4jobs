"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupPeerServer = void 0;
const peer_1 = require("peer");
const setupPeerServer = (server) => {
    const peerServer = (0, peer_1.ExpressPeerServer)(server, {
        path: '/peerjs',
        allow_discovery: true,
        proxied: true
    });
    peerServer.on('connection', (client) => {
        console.log('Client connected to peer server:', client.getId());
    });
    peerServer.on('disconnect', (client) => {
        console.log('Client disconnected from peer server:', client.getId());
    });
    return peerServer;
};
exports.setupPeerServer = setupPeerServer;
