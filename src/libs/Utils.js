import ConnectFour from './ConnectFour.js';

const games = {};

export function newGame(network, localPlayer, remotePlayer) {
    games[remotePlayer] = new ConnectFour(network, localPlayer, remotePlayer);
}

export function getGame(key) {
    return games[key];
}

export function setGame(key, game) {
    games[key] = game;
}

export function removeGame(key) {
    delete games[key];
}

export function getGames() {
    return games;
}

export function sendData(network, target, data) {
    let msg = new network.ircClient.Message('TAGMSG', target);
    msg.prefix = network.nick;
    msg.tags['+kiwiirc.com/c4'] = JSON.stringify(data);
    network.ircClient.raw(msg);
}

export function terminateGame(game) {
    if (!game) {
        return;
    }
    let network = game.getNetwork();
    let buffer = kiwi.state.getBufferByName(network.id, game.getRemotePlayer());

    if (network && game.getShowInvite()) {
        sendData(network, game.getRemotePlayer(), { cmd: 'invite_declined' });
    } else if (!game.getGameOver()) {
        game.setGameOver(true);
        if (network) {
            sendData(network, game.getRemotePlayer(), { cmd: 'terminate' });
        }
        if (buffer) {
            kiwi.state.addMessage(buffer, {
                nick: '*',
                message: 'You ended the game of Connect Four!',
                type: 'message',
            });
        }
    }
    removeGame(game.getRemotePlayer());
}

export function incrementUnread(buffer) {
    let activeBuffer = kiwi.state.getActiveBuffer();
    if (activeBuffer && activeBuffer !== buffer) {
        buffer.incrementFlag('unread');
    }
}

