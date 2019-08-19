import * as vscode from 'vscode';
import { randomColor } from '../../utils/utils';
let matchNameReg = /(?<=\/\*(=+)\s*)([A-Z]+|[A-Z]+\s*-*\s*[A-Z]+)(?=\s*\=+\*\/)/g;
let testEndReg = /\s*-+\s*END/gi;


export default 10;

// interface A {
//   range: vscode.Range;
//   decorationStyle: vscode.TextEditorDecorationType;
// }

// let aa: Array<A> = [];

// const subscribe = (arr: Array<A>, w: vscode.Range, s: A) => {
//   if (arr.findIndex(r => r.range.isEqual(w)) > -1) {
//     return arr;
//   } else {
//     arr.push(s);
//     return arr;
//   }
// }

// const unsubscribe = () => {

// }

// export const keywordsHighlight = (settings: vscode.WorkspaceConfiguration) => {
//   let closedColors = [];
//   let activeTextEditor = vscode.window.activeTextEditor;
//   let document = activeTextEditor.document;
//   let { lineCount, lineAt } = document;
//   let startLine = 0;
//   for (let line = startLine; line < lineCount; line++) {
//     let lineText = lineAt(line).text;
//     let matches = lineText.match(matchNameReg);
//     if (matches) {
//       for (let index = 0; index < matches.length; index++) {
//         let a = lineText.indexOf(matches[index].trim());
//         if (a > 0) {
//           let startChar = a;
//           let endChar = startChar + matches[index].length;
//           let startPos = new vscode.Position(line, startChar);
//           let endPos = new vscode.Position(line, endChar);
//           let range = new vscode.Range(startPos, endPos);

//           if (testEndReg.test(matches[index])) {
//             style = closedColors.pop();
//           } else {
//             let style = {
//               ...{
//                 backgroundColor: randomColor(),
//                 color: '#fff',
//                 borderRadius: '5px'
//               },
//               ...settings.get('style')
//             };
//           }
//           // subscribe(aa, range, { range, decorationStyle });
//         }
//       }
//     }
//   }
//   aa.forEach(({ range, decorationStyle }) => {
//     activeTextEditor.setDecorations(decorationStyle, [range]);
//   });
// };


