const actor = game.actors.get(ChatMessage.getSpeaker({ actor: this.actor }).actor);
const abilities = actor.system.abilities;
const advantage = ["Strength", "Dexterity", "Constitution", "Willpower", "Perception", "Speed", "Intelligence", "Charisma"];
const advSelected = "Intelligence";
const advoptions = advantage.reduce((acc, e) => acc + `<option value="${e}" ${e === advSelected ? "advSelected" : ""}>${e}</option>`, "");

new Dialog({
  title: "Choose your fabric's main attribute",
  content: `
    <form>
    <fieldset><legend>Fabrics attack</legend>
      <div class="form-group">
        <label>Stat</label>
        <select name="advtype">
          ${advoptions}
        </select>
      </div>
    </fieldset>
  </form>`,
  buttons: {
    ok: {
      label: "Roll",
      callback: html => {
        const form = new FormDataExtended(html[0].querySelector("form")).object;
        let flavor;
        switch (form.advtype) {
          case "Strength": {
            flavor = `${form.advtype}attackroll: ${calculateFabricAttack(abilities.str.value, abilities)}`
            break;
          }
          case "Dexterity": {
            flavor = `${form.advtype}attackroll: ${calculateFabricAttack(abilities.dex.value, abilities)}`
            break;
          }
          case "Constitution": {
            flavor = `${form.advtype}attackroll: ${calculateFabricAttack(abilities.con.value, abilities)}`
            break;
          }
          case "Willpower": {
            flavor = `${form.advtype}attackroll: ${calculateFabricAttack(abilities.wil.value, abilities)}`
            break;
          }
          case "Perception": {
            flavor = `${form.advtype}attackroll: ${calculateFabricAttack(abilities.prc.value, abilities)}`
            break;
          }
          case "Speed": {
            flavor = `${form.advtype}attackroll: ${calculateFabricAttack(abilities.spd.value, abilities)}`
            break;
          }
          case "Intelligence": {
            flavor = `${form.advtype}attackroll: ${calculateFabricAttack(abilities.int.value, abilities)}`
            break;
          }
          case "Charisma": {
            flavor = `${form.advtype}attackroll: ${calculateFabricAttack(abilities.cha.value, abilities)}`
            break;
          }
        }
        doRoll(`1d20`, flavor);
      }
    }
  }
}).render(true);

function calculateFabricAttack(val, abilities) {
  let highestStat
  if (abilities.int.value > abilities.cha.value) {
    highestStat = abilities.int.value
  } else {
    highestStat = abilities.cha.value
  }
  const formula = Math.floor((val/2) + (highestStat/2))
  return formula
}

async function doRoll(hit, flavor) {
  const rollHit = await new Roll(hit).evaluate();
  await ChatMessage.create({ speaker: speaker, flavor: flavor, rolls: [rollHit], type: CONST.CHAT_MESSAGE_TYPES.ROLL });
}