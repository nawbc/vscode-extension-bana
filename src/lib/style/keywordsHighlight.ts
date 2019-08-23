import * as vscode from 'vscode';

let annoKeyReg = /[A-Z]+(?=\s*-{3}\s*)/g;
let defaultStyle = {
  color: '#fff',
  border: '2px solid #00BFFF',
  backgroundColor: '#22c7fd36',
  overviewRulerLane: vscode.OverviewRulerLane.Right
};


export const keywordsHighlight = (activeTextEditor: vscode.TextEditor) => {

  let colorPositions: vscode.Range[] = [];
  if (!activeTextEditor || !activeTextEditor.document) return;

  let document = activeTextEditor.document;
  let settings = vscode.workspace.getConfiguration('bana.keywords');
  let startLine = 0;
  let endLine = document.lineCount;

  let style = {
    ...defaultStyle,
    ...settings.get('style')
  };

  for (let line = startLine; line < endLine; line++) {

    let lineText = document.lineAt(line).text;
    let matches = lineText.match(annoKeyReg);

    if (matches) {
      for (let index = 0; index < matches.length; index++) {
        let startChar = lineText.indexOf(matches[index].trim());
        if (startChar > 0) {
          let endChar = startChar + matches[index].length;
          let startPos = new vscode.Position(line, startChar);
          let endPos = new vscode.Position(line, endChar);
          let range = new vscode.Range(startPos, endPos);
          colorPositions.push(range);
        }
      }
    }
  }
  let decorationType = vscode.window.createTextEditorDecorationType(style);
  activeTextEditor.setDecorations(decorationType, colorPositions);
}; 