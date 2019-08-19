import * as vscode from 'vscode';
import { supportLanguages } from '../annotation/annotationMaker';

// 匹配函数 包含对象内函数 demo = ()=>{}

let funcReg = /(?<=\()(.+)(?=\)\s*=>)|(?<=(function\s*|(.+))\()(.+)(?=\)\s*\{)/g;
let variableToken = /const|let|type|var/g;
let tsTypeReg = /:(?<=\s*:\s*)(.+)/g;
let isWillSave = true;
let saveStack: Array<string> = [];
let defaultStyle = {
  'color': '#1E90FF',
  'font-size': '14px'
};

const back = (a) => a ? a : false;
const backIndex = (a, w) => a.indexOf(w) > -1 ? a.indexOf(w) : false;
// 处理掉ts 类型, js 也用没事
const handleTsType = (handledArgs: string): string =>
  handledArgs.split(',').map(v => v.replace(tsTypeReg, '').trim()).join(', ');

const styleToString = (style): string => {
  let styleString = '';
  for (let key in <any>style) {
    styleString += key + ':' + style[key] + ';';
  }
  return styleString;
};

export const devtoolConsole = () => {

  let activeTextEditor = vscode.window.activeTextEditor;

  if (!supportLanguages.includes(activeTextEditor.document.languageId)) { return; }

  let setting = vscode.workspace.getConfiguration('bana.console');
  let selection = activeTextEditor.selection;
  let cursorLine = selection.active.line;
  let consoleStyle = { ...defaultStyle, ...setting.get('style') };
  let styleString = styleToString(consoleStyle);

  if (isWillSave) {

    let cursorText = activeTextEditor.document.lineAt(cursorLine).text;
    let matches: string = null;
    let hasVariable = variableToken.test(cursorText);
    let hasFP = back(cursorText.match(funcReg));
    let consoleString = null;

    if (hasVariable && hasFP) {
      matches = handleTsType(hasFP[0]);
    } else if (hasVariable) {
      // 排除一行中有多个变量 let demo = 10; let a, b = 10;
      // 匹配变量
      let a = cursorText
        .split(';')
        .filter(v => v !== '')
        .map((v) => {
          let m = v.match(variableToken);
          let token = m && m[0];
          let end = backIndex(v, '=') ||
            (v.indexOf(',') > -1 ? v.length : false) ||
            backIndex(v, '\n') ||
            v.length;
          return v.slice(v.indexOf(token) + token.length, end).trim();
        })
        .join(', ');
      if (a) matches = handleTsType(a);
    } else if (hasFP) {
      matches = handleTsType(hasFP[0]);
    }

    try {

      let activeChar = selection.active.character;
      let anchorChar = selection.anchor.character;

      if (activeChar === anchorChar) {
        if (matches) {
          let args = matches.replace(/\{|\}|\.{3}/g, '');
          consoleString = `console.log("%CONSOLE -- ${args}", "${styleString}");\nconsole.log(${args});`;
          vscode.window.showInformationMessage("已暂存");
        }
      } else {

        let range = new vscode.Range(
          new vscode.Position(cursorLine, activeChar),
          new vscode.Position(cursorLine, anchorChar)
        );
        let selectText = activeTextEditor.document.getText(range);

        consoleString = `console.log("%CONSOLE -- ${selectText}", "${styleString}");\nconsole.log(${selectText});`;
        vscode.window.showInformationMessage("已暂存");
      }

      saveStack.push(consoleString);
      isWillSave = false;

    } catch (e) {

      vscode.window.showWarningMessage('请先选中打印的变量或参数');

    }
  } else {
    activeTextEditor.edit(editor => {
      let str = saveStack.pop();
      editor.insert(new vscode.Position(cursorLine, 0), str);
      isWillSave = true;
    });
  }
};