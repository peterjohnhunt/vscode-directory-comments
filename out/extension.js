'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const class_handler_1 = require("./class-handler");
function activate(context) {
    let handler = new class_handler_1.Handler();
    context.subscriptions.push(handler);
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map