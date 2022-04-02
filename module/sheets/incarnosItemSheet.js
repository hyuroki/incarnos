export default class IncarnosItemSheet extends ItemSheet {
    get template() {
        return `systems/incarnos/templates/sheets/${this.item.data.type}-sheet.html`;
    }
}
