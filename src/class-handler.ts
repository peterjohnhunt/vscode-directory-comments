import { workspace, window, Disposable, TextEdit, TextDocument, TextDocumentWillSaveEvent, Range } from 'vscode';

export class Handler {
    private _disposable: Disposable;

    constructor(){
        let subscriptions: Disposable[] = [];

        workspace.onWillSaveTextDocument(this._onWillDocumentSave, this, subscriptions);

        this._disposable = Disposable.from(...subscriptions);
    }

    private _onWillDocumentSave(event: TextDocumentWillSaveEvent){
        // Prevent run command without active TextEditor
        if ( !window.activeTextEditor ) {
            return null;
        }

        let changes = this._updateDirectory(event.document);

        event.waitUntil(Promise.resolve([changes]));
    }

    private _updateDirectory(document: TextDocument){
        let text = document.getText();

        let oldDirectory = this._findDirectoryRange(document);

        if (oldDirectory) {
            let newDirectory = this._generateDirectory(text);

            return TextEdit.replace(oldDirectory, newDirectory);
        }
    }

    private _findDirectoryRange(document){
        let start, end;
        
        let pattern = new RegExp('^[\\t ]*(<\\? )?\\/\\/░+( \\?>)?$', 'm');

        for (let index = 0; index < document.lineCount; index++) {
            const line = document.lineAt(index);

            let matches = line.text.match(pattern);
            
            if ( matches ) {
                let prefix  = matches[1];
                let postfix = matches[2];
                if ( !start ) {
                    start  = line.range['start'];
                    if (prefix) {
                        start = start.translate({characterDelta: prefix.length});
                    }
                } else {
                    end = line.range['end'];
                    if (postfix) {
                        end = end.translate({characterDelta: -postfix.length});
                    }
                    break;
                }
            }
        }

        return start && end ? new Range(start, end) : false;
    }

    private _generateDirectory(text){
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
            let type    = s[1];
            let name    = s[2];
            let spaces  = (type == '_') ? 4: 6;
            return '\/\/' + ' '.repeat(spaces) + type + name;
        });

        return '\/\/░░░░░░░░░░░░░░░░░░░░░░░░░░░\n\/\/\n\/\/    DIRECTORY\n\/\/\n' + sections.join('\n') + '\n\/\/\n\/\/░░░░░░░░░░░░░░░░░░░░░░░░░░░';
    }

    public dispose() {
        this._disposable.dispose();
    }
}