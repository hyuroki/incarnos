import { incarnos } from "./module/config.js";
import IncarnosItemSheet from "./module/sheets/incarnosItemSheet.js";
import IncarnosCharacterSheet from "./module/sheets/incarnosCharacterSheet.js";

Hooks.once("init", function() {
    console.log("incarnos initialized");

    CONFIG.incarnos = incarnos;

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("incarnos", IncarnosItemSheet, { makeDefault: true });

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("incarnos", IncarnosCharacterSheet, { makeDefault: true });
});