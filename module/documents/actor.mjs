/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class IncarnosActor extends Actor {

  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /**
   * @override
   * Augment the basic actor data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const actorData = this;
    const systemData = actorData.system;
    const flags = actorData.flags.incarnos || {};

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareCharacterData(actorData);
    this._prepareNpcData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;

    console.log(actorData);
    // Make modifications to data here. For example:
    const systemData = actorData.system;
    const abilityScore = systemData.abilities;
    const attributeScore = systemData.attributes;

    // Set Max HP and power 
    const healthbonus = systemData.health.bonus 
    systemData.health.max = 2*abilityScore.con.value + abilityScore.str.value + healthbonus
    const powerbonus = systemData.power.bonus
    systemData.power.max = 2*abilityScore.wis.value + abilityScore.int.value + powerbonus

    // Set Parry
    const parrybonus = attributeScore.parry.bonus
    attributeScore.parry.value = Math.floor((2*abilityScore.prc.value + abilityScore.dex.value)/3) + parrybonus

    // Set Movementspeed
    const movementbonus = attributeScore.movement.bonus
    attributeScore.movement.value = (abilityScore.spd.value/2) + movementbonus

    // Loop through ability scores, and add their modifiers to our sheet output
    for (let [key, ability] of Object.entries(abilityScore)) {
      // Calculate the abilityscore bonus value for its correspondant ability score
      const abilitybonus = ability.bonus
      ability.value += abilitybonus
      // Calculate the saving throw value for its correspondant ability score
      if (key == "str" || key == "dex" || key == "spd" || key == "con") {
        ability.save = Math.floor((ability.value*2 + abilityScore.con.value)/3)
      }
      if (key == "int" || key == "prc" || key == "wis" || key == "cha") {
        ability.save = Math.floor((ability.value*2 + abilityScore.wis.value)/3)
      }
    }
  }

  /**
   * Prepare NPC type specific data.
   */
  _prepareNpcData(actorData) {
    if (actorData.type !== 'npc') return;

     // Make modifications to data here. For example:
     const systemData = actorData.system;
     const abilityScore = systemData.abilities;
 
     // Loop through ability scores, and add their modifiers to our sheet output.
     for (let [key, ability] of Object.entries(abilityScore)) {
      // Calculate the saving throw value for its correspondant ability score.
      if (key == "str" || key == "dex" || key == "spd" || key == "con") {
        ability.save = Math.floor((ability.value*2 + abilityScore.con.value)/3)
      }
      if (key == "int" || key == "prc" || key == "wis" || key == "cha") {
        ability.save = Math.floor((ability.value*2 + abilityScore.wis.value)/3)
      }
    }
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const data = super.getRollData();

    // Prepare character roll data.
    this._getCharacterRollData(data);
    this._getNpcRollData(data);

    return data;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.type !== 'character') return;

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (data.abilities) {
      for (let [k, v] of Object.entries(data.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    // Add level for easier access, or fall back to 0.
    if (data.attributes.level) {
      data.lvl = data.attributes.level.value ?? 0;
    }
  }

  /**
   * Prepare NPC roll data.
   */
  _getNpcRollData(data) {
    if (this.type !== 'npc') return;

    // Process additional NPC data here.
  }

}