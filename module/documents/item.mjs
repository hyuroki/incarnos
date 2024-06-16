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

        const attacktype = ["Attack","Attack (Precision)","Attack (Fury)","Attack (Relentless)","Attack (Power)","Attack (Feint)"];
        const attacktypeSelected = "Attack";
        const atktypeoptions = attacktype.reduce((acc,e)=>acc+`<option value="${e}" ${e===attacktypeSelected ? "attacktypeSelected": ""}>${e}</option>`,"");

        const advantage = ["Normal", "Advantage", "Disadvantage"];
        const advSelected = "Normal";
        const advoptions = advantage.reduce((acc,e)=>acc+`<option value="${e}" ${e===advSelected ? "advSelected": ""}>${e}</option>`,"");
        
        new Dialog({
          title: "Choose your attack",
          content: `
            <form>
              <fieldset><legend>Attack action</legend>
                <div class="form-group">
                  <label>Type of attack</label>
                  <select name="atk">
                    ${atktypeoptions}
                  </select>
                </div>
                <div class="form-group">
                  <label>Actionpoints</label>
                  <input name="ap" type="number" class="auto-select" value=1 min=1 step=1 />
                </div>
                <div class="form-group">
                  <label>Advantage</label>
                  <select name="advtype">
                    ${advoptions}
                  </select>
                  <input name="advnum" type="number" class="auto-select" value=0 min=0 step=1 />
                </div>
              </fieldset>
              <script>
                document.querySelectorAll('.auto-select').forEach(input => {
                  input.addEventListener('focus', function() {
                      this.select();
                  });
                });
              </script>
            </form>`,
          buttons: {
            ok: {
              label: "Roll",
              callback: html => {
                const form = new FormDataExtended(html[0].querySelector("form")).object;
                switch (form.atk) {
                  case "Attack": {
                    rollAttack(form.advtype, form.advnum, form.ap, rollData.item.hands); 
                    break;
                  }
                  case "Attack (Precision)": {
                    rollAttackPrecision(form.advtype, form.advnum, form.ap, rollData.item.hands);
                    break;
                  }
                  case "Attack (Fury)": {
                    rollAttackFury(form.advtype, form.advnum, form.ap, rollData.item.hands);
                    break;
                  }
                  case "Attack (Relentless)": {
                    rollAttackRelentless(form.advtype, form.advnum, form.ap, rollData.item.hands);
                    break;
                  }
                  case "Attack (Power)": {
                    let powerattacktype = '';
                    new Dialog({
                      title: "Strength or Dexterity",
                      content: "Do you use Strength or Dexterity for your attack?",
                      buttons: {
                        button1: {
                          label: "Strength",
                          callback: () => {powerattacktype = 1}
                        },
                        button2: {
                          label: "Dexterity",
                          callback: () => {powerattacktype = 2}
                        }
                      }
                    }).render(true);
                    rollAttackPower(form.advtype, form.advnum, form.ap, rollData.item.hands, powerattacktype, rollData);
                    break;
                  }
                  case "Attack (Feint)": {
                    rollAttackFeint(form.advtype, form.advnum, form.ap, rollData.item.hands);
                    break;
                  }
                }
              }
            },
            cancel: {
              label: "Cancel"
            }
          }
        }).render(true);

        function calculateAdvantageDice(advtype, advnum, difference) {
          let adv = ''
          if (advtype == "Disadvantage") {
            advnum *= -1;
          }
          let calc = advnum + difference
          if (calc < 0) {
            adv = 'kh';
            calc *= -1;
          } else if (calc > 0) {
            adv = 'kl';
          } else if (calc == 0) {
            calc = 1;
          }
          return `${calc}d20${adv}`
        }

        async function rollAttack(advtype, advnum, ap, numHands) {
          const rollHit = await new Roll(calculateAdvantageDice(advtype, advnum, 0),rollData).evaluate();
          const rollDmg = await new Roll(dmg,rollData).evaluate();
          const text = `<br>Spend ${ap} AP on Attack with ${advnum}x ${advtype}`
          await ChatMessage.create({speaker: speaker, flavor: flavor+text, rolls:[rollHit,rollDmg],type: CONST.CHAT_MESSAGE_TYPES.ROLL}); 
        }

        async function rollAttackPrecision(advtype, advnum, ap, numHands) {
          const rollHit = await new Roll(calculateAdvantageDice(advtype, advnum, ap-1),rollData).evaluate();
          const rollDmg = await new Roll(dmg,rollData).evaluate();
          const text = `<br>Spend ${ap} AP on Attack (Precision) with ${advnum}x ${advtype}`
          await ChatMessage.create({speaker: speaker, flavor: flavor+text, rolls:[rollHit,rollDmg],type: CONST.CHAT_MESSAGE_TYPES.ROLL}); 
        }

        async function rollAttackFury(advtype, advnum, ap, numHands) {
          const rollHit = await new Roll(calculateAdvantageDice(advtype, advnum, -ap),rollData).evaluate();
          function replaceNumberInString(str, newNumber) {
            return str.replace(/^\d+/, newNumber);
          }
          const furydmg = replaceNumberInString(dmg, ap);
          const rollDmg = await new Roll(furydmg,rollData).evaluate();
          const text = `<br>Spend ${ap} AP on Attack (Fury) with ${advnum}x ${advtype}`
          await ChatMessage.create({speaker: speaker, flavor: flavor+text, rolls:[rollHit,rollDmg],type: CONST.CHAT_MESSAGE_TYPES.ROLL}); 
        }
        
        async function rollAttackRelentless(advtype, advnum, ap, numHands) {
          const rollHit = await new Roll(calculateAdvantageDice(advtype, advnum, ap-1),rollData).evaluate();
          function replaceNumberInString(str, newNumber) {
            return str.replace(/^\d+/, newNumber);
          }
          const furydmg = replaceNumberInString(dmg, ap);
          const rollDmg = await new Roll(furydmg,rollData).evaluate();
          const text = `<br>Spend ${ap} AP on Attack (Relentless) with ${advnum}x ${advtype}
          <br>You have disadvantage ${ap}x on all parries/duels until beginning of your turn`
          await ChatMessage.create({speaker: speaker, flavor: flavor+text, rolls:[rollHit,rollDmg],type: CONST.CHAT_MESSAGE_TYPES.ROLL}); 
        }

        async function rollAttackPower(advtype, advnum, ap, numHands, powerattacktype, rollData) {
          const rollHit = await new Roll(calculateAdvantageDice(advtype, advnum, 0),rollData).evaluate();
          let powerdmg;
          if (powerattacktype == 1) {
            // const bonus = rollData.
          }
          console.log(rollData);
          const rollDmg = await new Roll(dmg,rollData).evaluate();
          const text = `<br>Spend ${ap} AP on Attack (Power) with ${advnum}x ${advtype}`
          await ChatMessage.create({speaker: speaker, flavor: flavor+text, rolls:[rollHit,rollDmg],type: CONST.CHAT_MESSAGE_TYPES.ROLL}); 
        }
        
        async function rollAttackRelentless(advtype, advnum, ap, numHands) {
          const rollHit = await new Roll(calculateAdvantageDice(advtype, advnum, ap-1),rollData).evaluate();
          const rollDmg = await new Roll(dmg,rollData).evaluate();
          const text = `<br>Spend ${ap} AP on Attack (Feint) with ${advnum}x ${advtype}`
          await ChatMessage.create({speaker: speaker, flavor: flavor+text, rolls:[rollHit,rollDmg],type: CONST.CHAT_MESSAGE_TYPES.ROLL}); 
        }
        // const d = new Dialog({
        //     title: "Attackroll",
        //     content: "<p>Choose:</p>",
        //     buttons: {
        //         1: {
        //             label: "Advantage",
        //             callback: () => doRoll('2d20kl')
        //         },
        //         2: {
        //             label: "Normal",
        //             callback: () => doRoll('1d20')
        //         },
        //         3: {
        //             label: "Disadvantage",
        //             callback: () => doRoll('2d20kh')
        //         }
        //     },
        // }).render(true);

        // async function doRoll(hit) {
        //     const rollHit = await new Roll(hit, rollData).evaluate();
        //     const rollDmg = await new Roll(dmg, rollData).evaluate();
        //     await ChatMessage.create({speaker: speaker, flavor: flavor, rolls:[rollHit, rollDmg],type: CONST.CHAT_MESSAGE_TYPES.ROLL}); 
        // }
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