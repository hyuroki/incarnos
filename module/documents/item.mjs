/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class IncarnosItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    // As with the actor class, items are documents that can have their data
    // preparation methods overridden (such as prepareBaseData()).
    super.prepareData();
  }

  /**
   * Prepare a data object which is passed to any Roll formulas which are created related to this Item
   * @private
   */
   getRollData() {
    // If present, return the actor's roll data.
    if ( !this.actor ) return null;
    const rollData = this.actor.getRollData();
    // Grab the item's system data as well.
    rollData.item = foundry.utils.deepClone(this.system);

    return rollData;
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll() {
    const item = this;

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');
    const label = `<b>${item.name}</b>
    <i>${item.system.description}</i>`;

    // If there's no roll data, send a chat message.
    if (!this.system.formula) {
      ChatMessage.create({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
        content: item.system.description ?? ''
      });
    }
    // Otherwise, create a roll and send a chat message from it.
    else {
      if (this.type === "weapon") {
        const flavor = label
        const rollData = this.getRollData();
        const dmg = rollData.item.formula

        const d = new Dialog({
            title: "Attackroll",
            content: "<p>Choose:</p>",
            buttons: {
                1: {
                    label: "Advantage",
                    callback: () => doRoll('2d20kl')
                },
                2: {
                    label: "Normal",
                    callback: () => doRoll('1d20')
                },
                3: {
                    label: "Disadvantage",
                    callback: () => doRoll('2d20kh')
                }
            },
        });
        d.render(true);

        async function doRoll(hit) {
            const rollHit = await new Roll(hit, rollData).evaluate();
            const rollDmg = await new Roll(dmg, rollData).evaluate();
            await ChatMessage.create({speaker: speaker, flavor: flavor, rolls:[rollHit, rollDmg],type: CONST.CHAT_MESSAGE_TYPES.ROLL}); 
        }
      } else {
        // Retrieve roll data.
        const rollData = this.getRollData();
        new Roll('1d20').toMessage({
          speaker: speaker,
          rollMode: rollMode,
          flavor: label,
        });
        // Invoke the roll and submit it to chat.
        const roll = new Roll(rollData.item.formula, rollData);
        // If you need to store the value first, uncomment the next line.
        // let result = await roll.roll({async: true});
        roll.toMessage({
          speaker: speaker,
          rollMode: rollMode,
          flavor: "Damage",
        });
        return roll;
      }
    }
  }
}