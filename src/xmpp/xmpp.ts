import { Server } from 'ws';
import express from 'express';
import { create } from 'xmlbuilder';
import { parse as XMLParser } from 'xml-parser';
import { UserModel } from '../models/user.model';
import { FriendsModel } from '../models/friends.model';
import { log, MakeID, DecodeBase64, getPresenceFromUser } from '../utils/functions';
import { Matchmaker } from '../services/matchmaking.service';

const app = express();
const port = 80;
const wss = new Server({ server: app.listen(port) });

global.xmppDomain = 'prod.ol.epicgames.com';
global.Clients = [] as Array<Client>;
global.MUCs = {} as Record<string, MUC>;

interface Client {
    client: WebSocket;
    accountId: string;
    displayName: string;
    token: string;
    jid: string;
    resource: string;
    lastPresenceUpdate: {
        away: boolean;
        status: string;
    };
}

interface MUC {
    members: Array<{ accountId: string }>;
}

wss.on('listening', () => {
    log.xmpp(`XMPP and Matchmaker started listening on port ${port}`);
});

wss.on('connection', (ws: WebSocket) => {
    let joinedMUCs: string[] = [];
    let accountId = '';
    let displayName = '';
    let token = '';
    let jid = '';
    let resource = '';
    let ID = '';
    let Authenticated = false;
    let clientExists = false;
    let connectionClosed = false;

    ws.on('message', async (message: string) => {
        if (Buffer.isBuffer(message)) message = message.toString();
        const msg = XMLParser(message);
        if (!msg || !msg.root || !msg.root.name) return sendError(ws);

        switch (msg.root.name) {
            case 'open':
                handleOpen(ws);
                break;
            case 'auth':
                await handleAuth(ws, msg, { accountId, displayName, token, ID, Authenticated });
                break;
            case 'iq':
                await handleIq(ws, msg, { clientExists, accountId, jid });
                break;
            case 'message':
                await handleMessage(ws, msg, clientExists, jid);
                break;
            case 'presence':
                await handlePresence(ws, msg, clientExists, accountId, displayName, resource);
                break;
        }

        if (!clientExists && !connectionClosed && accountId && displayName && token && jid && ID && resource && Authenticated) {
            global.Clients.push({
                client: ws,
                accountId,
                displayName,
                token,
                jid,
                resource,
                lastPresenceUpdate: {
                    away: false,
                    status: '{}',
                },
            });
            clientExists = true;
        }
    });

    ws.on('close', () => {
        connectionClosed = true;
        clientExists = false;
        removeClient(ws, joinedMUCs);
    });
});

app.get('/', (req, res) => {
    res.type('application/json').header('Access-Control-Allow-Origin', '*');
    const data = JSON.stringify({
        Clients: {
            amount: global.Clients.length,
            clients: global.Clients.map(i => i.displayName),
        },
    }, null, 2);
    res.send(data);
});

function sendError(ws: WebSocket) {
    ws.send(create('close').attribute('xmlns', 'urn:ietf:params:xml:ns:xmpp-framing').toString());
    ws.close();
}

function handleOpen(ws: WebSocket) {
    const ID = MakeID();
    ws.send(create('open')
        .attribute('xmlns', 'urn:ietf:params:xml:ns:xmpp-framing')
        .attribute('from', global.xmppDomain)
        .attribute('id', ID)
        .attribute('version', '1.0')
        .attribute('xml:lang', 'en')
        .toString());
}

async function handleAuth(ws: WebSocket, msg: any, state: any) {
    const decodedBase64 = DecodeBase64(msg.root.content).split('\u0000');
    const object = global.accessTokens.find(i => i.token === decodedBase64[2]);
    if (!object) return sendError(ws);

    const user = await UserModel.findOne({ accountId: object.accountId, banned: false }).lean();
    if (!user) return sendError(ws);

    state.accountId = user.accountId;
    state.displayName = user.username;
    state.token = object.token;
    state.Authenticated = true;

    ws.send(create('success').attribute('xmlns', 'urn:ietf:params:xml:ns:xmpp-sasl').toString());
}

async function handleIq(ws: WebSocket, msg: any, state: any) {
    const bindElement = msg.root.children.find((i: any) => i.name === 'bind');
    if (!bindElement || !state.accountId) return sendError(ws);

    const resourceElement = bindElement.children.find((i: any) => i.name === 'resource');
    if (!resourceElement) return;

    state.resource = resourceElement.content;
    state.jid = `${state.accountId}@${global.xmppDomain}/${state.resource}`;

    ws.send(create('iq')
        .attribute('to', state.jid)
        .attribute('id', '_xmpp_bind1')
        .attribute('xmlns', 'jabber:client')
        .attribute('type', 'result')
        .element('bind')
        .attribute('xmlns', 'urn:ietf:params:xml:ns:xmpp-bind')
        .element('jid', state.jid).up().up().toString());
}

async function handleMessage(ws: WebSocket, msg: any, clientExists: boolean, jid: string) {
    if (!clientExists) return sendError(ws);
    const body = msg.root.children.find((i: any) => i.name === 'body')?.content;
    if (!body || body.length >= 300) return;

    const receiver = global.Clients.find(i => i.jid.split('/')[0] === msg.root.attributes.to);
    if (!receiver) return;

    receiver.client.send(create('message')
        .attribute('to', receiver.jid)
        .attribute('from', jid)
        .attribute('xmlns', 'jabber:client')
        .attribute('type', 'chat')
        .element('body', body).up().toString());
}

async function handlePresence(ws: WebSocket, msg: any, clientExists: boolean, accountId: string, displayName: string, resource: string) {
    if (!clientExists) return sendError(ws);

    const roomName = msg.root.attributes.to?.split('@')[0];
    if (!global.MUCs[roomName]) global.MUCs[roomName] = { members: [] };

    if (!global.MUCs[roomName].members.find(i => i.accountId === accountId)) {
        global.MUCs[roomName].members.push({ accountId });
    }

    ws.send(create('presence')
        .attribute('to', `${accountId}@${global.xmppDomain}/${resource}`)
        .attribute('from', `${roomName}@muc.${global.xmppDomain}`)
        .attribute('xmlns', 'jabber:client')
        .element('x').attribute('xmlns', 'http://jabber.org/protocol/muc#user').up()
        .toString());
}

function removeClient(ws: WebSocket, joinedMUCs: string[]) {
    const clientIndex = global.Clients.findIndex(i => i.client === ws);
    if (clientIndex === -1) return;

    global.Clients.splice(clientIndex, 1);
    joinedMUCs.forEach(roomName => {
        if (global.MUCs[roomName]) {
            const memberIndex = global.MUCs[roomName].members.findIndex(i => i.accountId === global.Clients[clientIndex].accountId);
            if (memberIndex !== -1) global.MUCs[roomName].members.splice(memberIndex, 1);
        }
    });
    log.xmpp(`Client disconnected: ${global.Clients[clientIndex].displayName}`);
}
