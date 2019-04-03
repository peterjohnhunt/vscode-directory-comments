"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
class Handler {
    constructor() {
        let subscriptions = [];
        vscode_1.workspace.onWillSaveTextDocument(this._onWillDocumentSave, this, subscriptions);
        this._disposable = vscode_1.Disposable.from(...subscriptions);
    }
    _onWillDocumentSave(event) {
        // Prevent run command without active TextEditor
        if (!vscode_1.window.activeTextEditor) {
            return null;
        }
        let changes = this._updateDirectory(event.document);
        event.waitUntil(Promise.resolve([changes]));
    }
    _updateDirectory(document) {
        let text = document.getText();
        let oldDirectory = this._findDirectoryRange(document);
        if (oldDirectory) {
            let newDirectory = this._generateDirectory(text);
            return vscode_1.TextEdit.replace(oldDirectory, newDirectory);
        }
    }
    _findDirectoryRange(document) {
        let start, end;
        let pattern = new RegExp('^[\\t ]*(<\\? )?\\/\\/░+( \\?>)?$', 'm');
        for (let index = 0; index < document.lineCount; index++) {
            const line = document.lineAt(index);
            let matches = line.text.match(pattern);
            if (matches) {
                let prefix = matches[1];
                let postfix = matches[2];
                if (!start) {
                    start = line.range['start'];
                    if (prefix) {
                        start = start.translate({ characterDelta: prefix.length });
                    }
                }
                else {
                    end = line.range['end'];
                    if (postfix) {
                        end = end.translate({ characterDelta: -postfix.length });
                    }
                    break;
                }
            }
        }
        return start && end ? new vscode_1.Range(start, end) : false;
    }
    _generateDirectory(text) {
        let sections = [];
        let pattern = new RegExp('^[\\t ]*(<\\? )?\\/\\/[≡∴▀▄░].+$\\n^[\\t ]*\\/\\/\\s([_∟])(.*)$\\n^[\\t ]*\\/\\/[≡∴▀▄░].+( \\?>)?$', 'gm');
        let matches = text.match(pattern);
        pattern = new RegExp('^[\\t ]*\\/\\/\\s([_∟])(.*)$', 'm');
        for (let index = 0; index < matches.length; index++) {
            text = matches[index];
            let pieces = text.match(pattern);
            sections.push(pieces);
        }
        sections = sections.map((s) => {
            let type = s[1];
            let name = s[2];
            let spaces = (type == '_') ? 4 : 6;
            return '\/\/' + ' '.repeat(spaces) + type + name;
        });
        return '\/\/░░░░░░░░░░░░░░░░░░░░░░░░░░░\n\/\/\n\/\/    DIRECTORY\n\/\/\n' + sections.join('\n') + '\n\/\/\n\/\/░░░░░░░░░░░░░░░░░░░░░░░░░░░';
    }
    dispose() {
        this._disposable.dispose();
    }
}
exports.Handler = Handler;
//# sourceMappingURL=class-handler.js.map