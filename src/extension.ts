import * as vscode from 'vscode';
import { devtoolConsole } from './lib/console/console';
// import { keywordsHighlight } from './lib/style/keywordsHighlight';




import {
  detailAnnotationMaker,
  blockAnnotationMaker,
  titleAnnotationMaker
} from './lib/annotation/annotationMaker';

// let timeout = null;
/**=================================================================================================
 *			AUTHOR --- HanWang
 *			BLOCK ---  activate
 *			LASTMODIFY --- 2019-08-23T03:25:30.258Z
 *			DESCRIPTION --- 
 *=================================================================================================*/
/*========================================================================  ACTIVATE --- END =====*/
export function activate(context: vscode.ExtensionContext) {

  // let activeTextEditor = vscode.window.activeTextEditor;

  if (vscode.workspace.getConfiguration('bana').get('enable', true)) {


    // tslint:disable-next-line: no-unused-expression
    // activeTextEditor && keywordsHighlight(activeTextEditor);

    let title_annotation = vscode.commands.registerCommand('bana.titleAnnotation', titleAnnotationMaker);

    let detail_annotation = vscode.commands.registerCommand('bana.detailAnnotation', detailAnnotationMaker);

    let block_annotation = vscode.commands.registerCommand('bana.blockAnnotation', blockAnnotationMaker);

    let devtool_console = vscode.commands.registerCommand('bana.console', devtoolConsole);

    context.subscriptions.push(
      block_annotation,
      title_annotation,
      detail_annotation,
      devtool_console
    );

  } else {
    vscode.window.showWarningMessage('bana 已关闭');
  }

  // const updateKeyWordHighlight = () => {
  //   // tslint:disable-next-line: no-unused-expression
  //   timeout && clearTimeout(timeout);
  //   timeout = setTimeout(() => {
  //     keywordsHighlight(activeTextEditor);
  //   }, 0);
  // };

  // vscode.workspace.onDidChangeTextDocument((e) => {
  //   if (activeTextEditor && e.document === activeTextEditor.document) {
  //     updateKeyWordHighlight();
  //   }
  // }, null, context.subscriptions);

  // vscode.workspace.onDidChangeConfiguration(() => {
  //   updateKeyWordHighlight();
  // }, null, context.subscriptions);

  // vscode.window.onDidChangeActiveTextEditor((editor) => {
  //   activeTextEditor = editor;
  //   // tslint:disable-next-line: no-unused-expression
  //   editor && updateKeyWordHighlight();
  // }, null, context.subscriptions);

}








// export function deactivate() { }