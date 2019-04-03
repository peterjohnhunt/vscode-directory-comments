'use strict';

import { ExtensionContext } from 'vscode';

import { Handler } from './class-handler';

export function activate(context: ExtensionContext) {
    let handler = new Handler();

    context.subscriptions.push(handler);
}

export function deactivate() {
}