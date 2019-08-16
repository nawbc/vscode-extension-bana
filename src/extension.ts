import * as vscode from 'vscode';
import { keywordsHighlight } from './lib/style/keywordsHighlight';
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

  let keywords_highlight = vscode.commands.registerCommand('muguet.keywordsHighlight', keywordsHighlight);

  let detail_annotation = vscode.commands.registerCommand('muguet.detailAnnotation', detailAnnotationMaker);

  let block_annotation = vscode.commands.registerCommand('muguet.blockAnnotation', blockAnnotationMaker);

  context.subscriptions.push(
    block_annotation,
    keywords_highlight
  );
}

export function deactivate() { }
