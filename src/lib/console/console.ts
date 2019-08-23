// 函数参数有多行


import * as vscode from 'vscode';
import { supportLanguages } from '../../utils/utils';


// 匹配函数 包含对象内函数 demo = ()=>{}

let isWillSave = true;
let saveStack: Array<string> = [];
let defaultStyle = {
  'color': '#1E90FF',
  'font-size': '14px'
};

const back = (a) => a ? a : false;
const backIndex = (a, w) => a.indexOf(w) > -1 ? a.indexOf(w) : false;

// 处理掉ts 类型, js 也用没事
const handleTsType = (handledArgs: string): string => {
  let tsTypeReg = /:(?<=\s*:\s*)(.+)/g;
  return handledArgs.split(',').map(v => v.replace(tsTypeReg, '').trim()).join(', ');
}



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

  let variableToken = /const|let|type|var/g;
  let funcReg = /(?<=\()(.+)(?=\)(.+|)=>)|(?<=(function\s*|(.+))\()(.+)(?=\)\s*\{)/g;
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
      console.log(matches)
    } else if (hasVariable) {
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
          vscode.window.showInformationMessage(args + " 已暂存");
        }
      } else {

        let range = new vscode.Range(
          new vscode.Position(cursorLine, activeChar),
          new vscode.Position(cursorLine, anchorChar)
        );
        let selectText = activeTextEditor.document.getText(range);

        consoleString = `console.log("%CONSOLE -- ${selectText}", "${styleString}");\nconsole.log(${selectText});`;
        vscode.window.showInformationMessage(selectText + " 已暂存");
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



// if (isStart) {
//   if (cursorLineText === '') return;
//   isStart = false;

//   matches = handleBlockName(cursorLineText);
//   // tslint:disable-next-line: no-unused-expression
//   matches && (cursorLine -= 1);

//   let startValue: string = matches ? <string>matches : cursorLineText;
//   let pkg = pkgInfo();

//   if (pkg) {
//     let content = [
//       'AUTHOR --- ' + pkg.author,
//       'BLOCK --- ' + startValue,
//       'LASTMODIFY --- ' + new Date().toISOString(),
//       'DESCRIPTION --- '
//     ];
//     let endLine = cursorLine + content.length - 1;
//     afterEditString = multiAnnotationMaker(content, annotationWidth, cursorLine, endLine);
//     endAnnotationStack.push(startValue.toUpperCase());
//   }
// } else if (cursorLineText === '') {
//   isStart = true;
//   let endValue = endAnnotationStack.pop();
//   afterEditString = endAnnotationMaker(endValue + ' --- END', annotationWidth, annotationIntend);
// }

// // 插入text
// activeTextEditor.edit((editor) => {
//   let start = new vscode.Position(cursorLine, 0);
//   if (matches) {
//     editor.insert(start, <string>afterEditString);
//   } else if (cursorLineText === '') {
//     let end = new vscode.Position(cursorLine, annotationWidth);
//     // 没有匹配就代替这一行 使用自己打的注释
//     editor.replace(new vscode.Range(start, end), <string>afterEditString);
//   }
// });