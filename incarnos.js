import { incarnos } from "./module/config.js";
import IncarnosItemSheet from "./module/sheets/incarnosItemSheet.js";

Hooks.once("init", function() {
    console.log("incarnos initialized");

    CONFIG.incarnos = incarnos;

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("incarnos", IncarnosItemSheet, { makeDefault: true });
});