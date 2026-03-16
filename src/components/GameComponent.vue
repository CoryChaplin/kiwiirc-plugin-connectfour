<template>
    <div id="connectfour">
        <div
            v-if="game && game.getShowInvite()"
            :style="{'margin-bottom': (game.getShowGame() ? '6px' : '0')}"
            class="invite"
        >
            <span class="invite_text">You have been invited to play Connect Four</span>
            <div class="invite_button invite_button_accept" @click="inviteClicked(true)">
                Accept
            </div>
            <div class="invite_button invite_button_decline" @click="inviteClicked(false)">
                Decline
            </div>
        </div>
        <div v-if="game && game.getShowGame()">
            <table id="board">
                <tr v-for="(row, rowIndex) in game.getGameBoard()" :key="rowIndex">
                    <td
                        v-for="(box, colIndex) in row"
                        :key="colIndex"
                        :class="[ isViableColumn(colIndex) ? 'selectable' : '', box.win ? 'winner' : '' ]"
                        @click="columnClicked(colIndex)"
                    >
                        {{ box.val }}
                    </td>
                </tr>
            </table>
            <div class="message">{{ game.getGameMessage() }}</div>
        </div>
    </div>
</template>

<script>
import * as Utils from '../libs/Utils.js';

export default {
    computed: {
        game() {
            // eslint-disable-next-line no-undef
            let buffer = kiwi.state.getActiveBuffer();
            return Utils.getGame(buffer.name);
        },
    },
    methods: {
        isViableColumn(colIndex) {
            // eslint-disable-next-line no-undef
            let buffer = kiwi.state.getActiveBuffer();
            let game = Utils.getGame(buffer.name);
            if (!game || game.getGameOver() || !game.isMyTurn()) {
                return false;
            }
            let board = game.getGameBoard();
            // Column is viable if there is at least one empty cell
            return board.some((row) => row[colIndex].val === '');
        },
        columnClicked(colIndex) {
            // eslint-disable-next-line no-undef
            let buffer = kiwi.state.getActiveBuffer();
            let game = Utils.getGame(buffer.name);
            if (!game || !this.isViableColumn(colIndex)) {
                return;
            }

            let rowIndex = game.placeDisc(colIndex);
            if (rowIndex === -1) {
                return;
            }

            Utils.sendData(buffer.getNetwork(), game.getRemotePlayer(), {
                cmd: 'action', column: colIndex, turn: game.getGameTurn(),
            });
            game.incrementGameTurn();
            game.checkGame();
            if (!game.getGameOver() && !game.isMyTurn()) {
                game.setTurnMessage();
            }
        },
        inviteClicked(accepted) {
            /* eslint-disable no-undef */
            let network = kiwi.state.getActiveNetwork();
            let remotePlayer = kiwi.state.getActiveBuffer().name;
            /* eslint-enable no-undef */

            let game = Utils.getGame(remotePlayer);
            game.setShowInvite(false);
            game.setInviteSent(false);
            if (accepted) {
                let startPlayer = Math.floor(Math.random() * 2) === 0 ? network.nick : remotePlayer;
                game.startGame(startPlayer);
                game.setTurnMessage();
                Utils.sendData(network, remotePlayer, {
                    cmd: 'invite_accepted', startPlayer: startPlayer,
                });
            } else {
                Utils.sendData(network, remotePlayer, { cmd: 'invite_declined' });
                // eslint-disable-next-line no-undef
                kiwi.emit('mediaviewer.hide');
            }
        },
    },
};
</script>

<style>
#connectfour {
    position: relative;
    display: block;
    width: 100%;
    padding: 6px 0;
    text-align: center;
}

#connectfour .invite {
    display: inline-flex;
    margin: 0 auto;
    font-size: 1.1em;
    font-weight: bold;
    align-items: center;
}

#connectfour .invite_text {
    float: left;
    margin-right: 5px;
}

#connectfour .invite_button {
    float: left;
    cursor: pointer;
    margin: 0 5px;
    padding: 1px 5px;
    color: var(--brand-default-bg);
    border: 1px solid var(--brand-default-fg);
    border-radius: 4px;
}

#connectfour .invite_button_accept {
    background-color: var(--brand-primary);
}

#connectfour .invite_button_decline {
    background-color: var(--brand-error);
}

#connectfour table {
    margin: 0 auto;
    font-size: 3em;
    text-align: center;
    font-weight: bold;
    border-collapse: collapse;
}

#connectfour .selectable {
    cursor: pointer;
}

#connectfour .winner {
    background-color: #6bff5e;
}

#connectfour .message {
    text-align: center;
    font-size: 1.4em;
    font-weight: bold;
    margin-top: 6px;
}

#connectfour table td {
    border: 4px solid black;
    width: 60px;
    height: 60px;
    -webkit-user-select: none; /* Safari */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* IE10+/Edge */
    user-select: none; /* Standard */
}

#connectfour table tr:first-child td {
    border-top: 0;
}

#connectfour table tr:last-child td {
    border-bottom: 0;
}

#connectfour table tr td:first-child,
table tr th:first-child {
    border-left: 0;
}

#connectfour table tr td:last-child,
table tr th:last-child {
    border-right: 0;
}
</style>

