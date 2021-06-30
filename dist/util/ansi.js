"use strict";
//#region Imports
Object.defineProperty(exports, "__esModule", { value: true });
exports.embedLink = void 0;
//#endregion Imports
var $;
(function ($) {
    $.ESC = `\u001B`;
    $.ST = `\u0007`;
    $.BEL = `\u0007`;
    $.OSC = `${$.ESC}]`;
    $.CSI = `${$.ESC}[`;
    $.SP = ' ';
})($ || ($ = {}));
//#region Embedded Link
function embedLink(text, target, id) {
    return `${$.OSC}8;${id ? `id=${id.replace(/[;=:]/gm, '')}` : ''};${target}${$.ST}${text}${$.OSC}8;;${$.ST}`;
}
exports.embedLink = embedLink;
//#endregion Embedded Link
exports.default = { embed: embedLink };
//# sourceMappingURL=ansi.js.map