const flavor = "valiantly swings her longsword."
const dmg = "1d8"

const d = new Dialog({
    title: "Attackroll",
    content: "<p>Choose:</p>",
    buttons: {
        1: {
            label: "Disadvantage",
            callback: () => choice(1)
        },
        2: {
            label: "Normal",
            callback: () => choice(2)
        },
        3: {
            label: "Advantage",
            callback: () => choice(3)
        }
    },
});
d.render(true);
function choice(x) {
    switch(x) {
        case 1:
            doRoll('2d20kl')
            break;
        case 2:
            doRoll('1d20')
            break;
        case 3:
            doRoll('2d20kh')
            break;
    }
}

function doRoll(hit) {
    const rollHit = new Roll(hit).evaluate();
    const rollDmg = new Roll(dmg).evaluate();
    ChatMessage.create({speaker: ChatMessage.getSpeaker({actor: this.actor}), flavor: flavor, rolls:[rollHit, rollDmg],type: CONST.CHAT_MESSAGE_TYPES.ROLL}); 
}
