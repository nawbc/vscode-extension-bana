import * as vscode from 'vscode';
import { randomColor } from '../../utils/utils';
let matchNameReg = /(?<=\/\*(=+)\s*)([A-Z]+|[A-Z]+\s*-*\s*[A-Z]+)(?=\s*\=+\*\/)/g;
let { window, Position, Range } = vscode;
let styleMap: Map<vscode.TextEditorDecorationType, vscode.Range> = new Map();

export const keywordsHighlight = (settings: vscode.WorkspaceConfiguration) => {
  let colorRanges: Array<vscode.Range> = [];
  let activeTextEditor = window.activeTextEditor;
  let document = activeTextEditor.document;
  let { lineCount, lineAt } = document;
  let startLine = 0;
  let style = {
    ...settings.get('style'),
    ...{
      backgroundColor: randomColor(),
      color: '#fff',
      borderRadius: '5px'
    }
  };

  for (let line = startLine; line < lineCount; line++) {
    let lineText = lineAt(line).text;
    let matches = lineText.match(matchNameReg);
    if (matches) {
      for (let index = 0; index < matches.length; index++) {
        let a = lineText.indexOf(matches[index].trim());
        if (a > 0) {
          let startChar = a;
          let endChar = startChar + matches[index].length;
          let startPos = new Position(line, startChar);
          let endPos = new Position(line, endChar);
          let range = new Range(startPos, endPos);
          colorRanges.push(range);
          console.log(matches, range);
        }
      }
    }
  }
  let decorationStyle = window.createTextEditorDecorationType(style);
  window.activeTextEditor.setDecorations(decorationStyle, colorRanges);
};



  // let activeTextEditor = window.activeTextEditor;
  // let document = activeTextEditor.document;
  // let endLine = document.lineCount;
  // let keyWords: vscode.Range[] = [];
  // let settings = workspace.getConfiguration('muguetAnnotation');

  // let reg = /[^─\*\/\s]+(?=\s?─)+|[A-Z]+\s---\s/g;
  // for (let i = 0; i < endLine; i++) {
  //   let text = document.lineAt(i).text;
  //   let a = text.match(reg);
  //   if (a !== null) {
  //     for (let j = 0; j < a.length; j++) {
  //       let b = text.indexOf(a[j]);
  //       if (b > -1) {
  //         let start = new vscode.Position(i, b);
  //         let end = new vscode.Position(i, b + a[j].length);
  //         keyWords.push(new vscode.Range(start, end));
  //       }
  //     }
  //   }
  // }
  // setTimeout(() => {
  //   activeTextEditor.setDecorations(decorationStyle(settings), keyWords);
  // }, 500);
