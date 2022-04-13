export default class IncarnosCharacterSheet extends ActorSheet {
    
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 720,
            height: 680,
            classes: ["incarnos", "sheet", "character"]
        });
    }

    get template() {
        return `systems/incarnos/templates/sheets/${this.actor.data.type}-sheet.html`;
    }
}