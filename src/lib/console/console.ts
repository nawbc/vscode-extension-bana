import * as vscode from 'vscode';
// 只支持 function(){} ()=>{}  参数和变量 单行中不得 出现
let matchNameReg: RegExp = /(?<=var|const|let|type)(.+)(?=\s*=)|(?<=function\s+(.+)\()(.+)(?=\))|(?<=\()(.+)(?=\))/g;
let isWillSave = true;
let saveStack = [];

export const devtoolConsole = () => {
  let activeTextEditor = vscode.window.activeTextEditor;
  let setting = vscode.workspace.getConfiguration('muguet.console');
  let selection = activeTextEditor.selection;
  let cursorLine = selection.active.line;
  let styleString = '';
  let defaultStyle = {
    'color': '#0f0',
    'font-size': '14px'
  };
  let consoleStyle = {
    ...defaultStyle,
    ...setting.get('style')
  };

  for (let key in <any>consoleStyle) {
    styleString += key + ':' + consoleStyle[key] + ';';
  }

  if (isWillSave) {
    let cursorText = activeTextEditor.document.lineAt(cursorLine).text;
    let matches = cursorText.match(matchNameReg);
    let consoleString = null;
    if (matches) {

      if (matches.length > 1) {
        vscode.window.showWarningMessage('暂不支持一行中有多个括号对');
        return;
      }

      vscode.window.showInformationMessage("已暂存");
      let args = matches.pop().replace(/\{|\}|\.{3}/g, '');


      consoleString = `console.log("%cConsole <-> ${args}", "${styleString}", ${args})`;
    } else {
      vscode.window.showInformationMessage("已暂存");
      let activeChar = selection.active.character;
      let anchorChar = selection.anchor.character;
      let range = new vscode.Range(
        new vscode.Position(cursorLine, activeChar),
        new vscode.Position(cursorLine, anchorChar)
      );
      let selectText = activeTextEditor.document.getText(range);
      consoleString = `console.log("%cConsole <-> ${selectText}", "${styleString}", ${selectText})`;
    }
    saveStack.push(consoleString);
    isWillSave = false;
  } else {
    activeTextEditor.edit(editor => {
      let str = saveStack.pop();
      editor.insert(new vscode.Position(cursorLine, 0), str);
      isWillSave = true;
    });
  }
}
