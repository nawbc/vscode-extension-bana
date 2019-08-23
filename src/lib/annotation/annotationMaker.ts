/**=================================================================================================
 *			AUTHOR --- HanWang
 *			LICENSE --- MIT
 *			LASTMODIFY --- 2019-08-23T06:01:10.880Z
 *			DESCRIPTION --- A tool collection for js/ts development
 *			REPOSITORY --- https://github.com/sewerganger/vscode-extension-bana
 *=================================================================================================*/


import * as vscode from 'vscode';
import { pkgInfo, supportLanguages } from '../../utils/utils';

type AnnotationType = 'block' | 'title' | 'detail';
let { workspace, window } = vscode;
let endAnnotationStack: Array<string> = [];
let isStart = true;

const endAnnotationMaker = (value: string, annotationWidth, annotationIntends): string | boolean => {

  let newAnnotation = '/*';
  let a = annotationWidth - value.length - 13;
  for (let j = 0; j < annotationWidth; j++) {
    if (j > 0 && j < a) { newAnnotation += '='; }
    if (j === a) { newAnnotation += ' ' + value + ' '; }
    if (j > annotationWidth - annotationIntends) { newAnnotation += '='; }
    if (j === annotationWidth - 1) { newAnnotation += '*/'; }
  }
  return newAnnotation;

};

// 生成多行注释 
const multiAnnotationMaker = (
  content: string[],
  annotationWidth: number,
  startLine: number,
  endLine: number,
): string => {
  let EOL = vscode.window.activeTextEditor.document.eol === 2 ? '\r\n' : '\n';
  let newAnnotation = '/**';

  for (let i = startLine; i <= endLine; i++) {
    let lineText;
    if (!content) {
      lineText = vscode.window.activeTextEditor.document.lineAt(i).text;
    } else {
      lineText = content[i - startLine];
    }

    if (i === startLine) {
      let width = annotationWidth - 3;
      for (let j = 0; j < width; j++) {
        newAnnotation += '=';
      }
      newAnnotation += EOL + ' *\t\t\t' + lineText + EOL;
    }

    if (i > startLine && i < endLine)
      newAnnotation += ' *\t\t\t' + lineText + EOL;

    if (i === endLine) {
      let width = annotationWidth - 3;
      // tslint:disable-next-line: no-unused-expression
      endLine !== startLine && (newAnnotation += ' *\t\t\t' + lineText + EOL);
      newAnnotation += ' *';
      for (let j = 0; j < width; j++) {
        newAnnotation += '=';
      }
      newAnnotation += '*/' + EOL;
    }
  }
  return newAnnotation;
};

const handleBlockName = (text: string): string | boolean => {
  let hasFunction = text.includes('function');
  let varNameReg = /(?<=var|const|let|type)(.+)(?=\s*=\s*)/g;
  let hasArrowFunction = /\)(.+|)=>/.test(text);
  let hasVarName = varNameReg.test(text);
  let hasClass = text.includes('class');
  let start = null;
  let end = null;

  if (hasVarName && (hasFunction || hasArrowFunction)) {

    let c = text.indexOf('const'), l = text.indexOf('let'), v = text.indexOf('var');
    end = text.indexOf('=');
    start = (c > -1 ? c + 5 : false) || (l > -1 ? l + 3 : false) || (v > -1 ? v + 3 : false);

  } else if (hasClass || hasFunction) {

    let tokenIndex = [
      text.indexOf('<'),
      text.indexOf('('),
      text.indexOf('extends'),
      text.indexOf('implements'),
      text.indexOf('{')
    ].filter(v => v > -1);

    if (hasFunction) {
      start = text.indexOf('function') + 'function'.length;
    } else if (hasClass) {
      start = text.indexOf('class') + 'class'.length;
    }
    // 谁小先匹配谁
    end = Math.min.apply(null, tokenIndex);
  } else {
    return false;
  }
  return text.slice(start, end);
};

const blockMaker = (annotationWidth, annotationIntends): void => {
  let activeTextEditor = vscode.window.activeTextEditor;
  let selectionLine = activeTextEditor.selection;
  let cursorLine = selectionLine.active.line;
  let cursorLineText = activeTextEditor.document.lineAt(cursorLine).text;
  let startPos = new vscode.Position(cursorLine, 0);
  let endPos = new vscode.Position(cursorLine, annotationWidth);
  let range = new vscode.Range(startPos, endPos);

  if (isStart) {
    let matches = <string>handleBlockName(cursorLineText);

    // tslint:disable-next-line: no-unused-expression
    matches && (cursorLine -= 1);
    activeTextEditor.edit((editor) => {
      let pkg = pkgInfo();

      if (pkg) {
        let value = matches ? matches : cursorLineText;
        let content = [
          'AUTHOR --- ' + pkg.author,
          'LASTMODIFY --- ' + new Date().toISOString(),
          'BLOCK --- ' + value,
          'DESCRIPTION --- '
        ];
        let endLine = cursorLine + content.length - 1;
        let afterEditString = multiAnnotationMaker(content, annotationWidth, cursorLine, endLine);
        matches ? editor.insert(startPos, <string>afterEditString) : editor.replace(range, <string>afterEditString);
        endAnnotationStack.push(value.toUpperCase());
        isStart = false;
      }
    });
  } else if (cursorLineText === '') {
    isStart = true;
    let endValue = endAnnotationStack.pop();
    let afterEditString = endAnnotationMaker(endValue + ' --- END', annotationWidth, annotationIntends);
    activeTextEditor.edit((editor) => {
      editor.replace(range, <string>afterEditString);
    });
  } else if (cursorLineText !== '') {
    vscode.window.showWarningMessage('请先释放闭合注释');
  }
};

// 多行注释
const multiMaker = (annotationWidth) => {
  let activeTextEditor = window.activeTextEditor;
  let startLine = activeTextEditor.selection.start.line;
  let endLine = activeTextEditor.selection.end.line;
  let annotation = multiAnnotationMaker(null, annotationWidth, startLine, endLine);
  let endLineLen = activeTextEditor.document.lineAt(endLine).text.length;

  let sPos = new vscode.Position(startLine, 0);
  let ePos = new vscode.Position(endLine, endLineLen);

  activeTextEditor.edit(editor => {
    editor.replace(new vscode.Selection(sPos, ePos), annotation);
  });
};

// title 注释
const titleMaker = (annotationWidth) => {
  let activeTextEditor = window.activeTextEditor;
  // 自定义注释内容 
  // let settings = vscode.workspace.getConfiguration('bana.annotation');
  let pkg = pkgInfo();

  if (pkg) {

    let cursorLine = activeTextEditor.selection.active.line;
    let content = [
      'AUTHOR --- ' + pkg.author,
      'LICENSE --- ' + pkg.license,
      'LASTMODIFY --- ' + new Date().toISOString(),
      'DESCRIPTION --- ' + pkg.description,
      'REPOSITORY --- ' + pkg.repository,
    ];

    let endLine = cursorLine + content.length - 1;
    let annotation = multiAnnotationMaker(content, annotationWidth, cursorLine, endLine);
    activeTextEditor.edit(editor => {
      editor.insert(new vscode.Position(cursorLine, 0), annotation);
    });
  } else {
    return;
  }
};

const maker = (type: AnnotationType) => {

  let settings = workspace.getConfiguration('bana.annotation');
  let activeTextEditor = window.activeTextEditor;
  let document = activeTextEditor.document;
  let language = document.languageId;
  let annotationWidth = settings.get('width', 100);
  let annotationIntends = settings.get('intends', 6);

  if (!settings.get('enable', true)) {
    window.showWarningMessage('bana-annotation 已关闭');
    return;
  }

  if (supportLanguages.includes(language)) {
    switch (type) {
      case 'detail': multiMaker(annotationWidth);
        break;
      case 'block': blockMaker(annotationWidth, annotationIntends);
        break;
      case 'title': titleMaker(annotationWidth);
        break;
    }
  } else {
    window.showWarningMessage('bana-annotation 不支持该语言');
  }
};

export const titleAnnotationMaker = () => maker('title');

export const blockAnnotationMaker = () => maker('block');

export const detailAnnotationMaker = () => maker('detail');