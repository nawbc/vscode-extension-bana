import * as vscode from 'vscode';
import { devtoolConsole } from './lib/console/console';
import {
  detailAnnotationMaker,
  blockAnnotationMaker
} from './lib/annotation/annotationMaker';


export function activate(context: vscode.ExtensionContext) {

  if (vscode.workspace.getConfiguration('bana').get('enable', true)) {
    let detail_annotation = vscode.commands.registerCommand('bana.detailAnnotation', detailAnnotationMaker);

    let block_annotation = vscode.commands.registerCommand('bana.blockAnnotation', blockAnnotationMaker);

    let devtool_console = vscode.commands.registerCommand('bana.console', devtoolConsole);

    context.subscriptions.push(
      block_annotation,
      detail_annotation,
      devtool_console
    );
  } else {
    vscode.window.showWarningMessage('bana 已关闭');
  }
}

// export function deactivate() { }
