import * as vscode from 'vscode';
import { devtoolConsole } from './lib/console/console';


import {
  detailAnnotationMaker,
  blockAnnotationMaker
} from './lib/annotation/annotationMaker';

// ────────────────────────────────────────────────────────
// Copyright (c) 
// license MIT
// DESCRIPTION ---
// AUTHOR ---
// DATA ---
// BUG ---  
//  
// ────────────────────────────────────────────────────────

/*────────────────────────────────────────────────────────
 * this is the best man who has a des a 
 *  @BUG ---
 *   
 *  ────────────────────────────────────────────────────────* /

/*──── BUG ──────────────────────────────────────────────────── */



export function activate(context: vscode.ExtensionContext) {


  let detail_annotation = vscode.commands.registerCommand('muguet.detailAnnotation', detailAnnotationMaker);

  let block_annotation = vscode.commands.registerCommand('muguet.blockAnnotation', blockAnnotationMaker);

  let devtool_console = vscode.commands.registerCommand('muguet.console', devtoolConsole);

  context.subscriptions.push(
    block_annotation,
    detail_annotation,
    devtool_console
  );
}

export function deactivate() { }
