export default class IncarnosItemSheet extends ItemSheet {
    get template() {
        return `systems/incarnos/templates/sheets/${this.item.data.type}-sheet.html`;
    }

    getData() {
        const data = super.getData();

        data.config = CONFIG.incarnos;

        return data;
    }
}
