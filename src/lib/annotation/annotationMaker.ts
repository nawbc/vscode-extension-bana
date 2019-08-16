import * as vscode from 'vscode';
import { keywordsHighlight } from '../style/keywordsHighlight';
type AnnotationType = 'detail' | 'title' | 'block';
let { workspace, window } = vscode;
let endAnnotationStack: Array<string> = [];
let nameAnnotationReg: RegExp = /(((?<=function\s+)(.+))(?=\s*\())|(((?<=class\s+)(.+))(?=\s*\{))|(((?<=var|const|let|type)(.+))(?=(\s*=\s*\()))/g;
let timeout = null;

const supportLanguages = [
  'typescript',
  'typescriptreact',
  'javascript',
  'javascriptreact',
  'css',
  'scss',
  'less'
];

const insertAnnotation = (
  value: string,
  type: 'start' | 'end',
  { annotationIntend, annotationWidth }
): string | boolean => {

  let newAnnotation = '/*';
  if (value.length >= annotationWidth) {
    window.showWarningMessage('字符串超出限制长度');
    return false;
  } else {
    if (type === 'start') {
      let a = value.toUpperCase().trim();
      for (let i = 0; i < annotationWidth; i++) {
        if (i < annotationIntend) { newAnnotation += '='; }
        if (i === annotationIntend) { newAnnotation += ' ' + a + ' '; }
        if (i > annotationIntend + value.length && i < annotationWidth - 1) { newAnnotation += '='; }
        if (i === annotationWidth - 1) { newAnnotation += '*/'; }
      }
      endAnnotationStack.push(a);
    } else if (type === 'end') {
      let a = annotationWidth - annotationIntend - value.length;
      for (let j = 0; j < annotationWidth; j++) {
        if (j > 0 && j < a) { newAnnotation += '='; }
        if (j === a) { newAnnotation += ' ' + value + ' '; }
        if (j > annotationWidth - annotationIntend) { newAnnotation += '='; }
        if (j === annotationWidth - 1) { newAnnotation += '*/'; }
      }
    }
  }
  return newAnnotation;
};

const blockMaker = (
  type: AnnotationType,
  settings: vscode.WorkspaceConfiguration,
  activeTextEditor: vscode.TextEditor
): void => {
  let annotationWidth = settings.get('width', 100);
  let annotationIntend = settings.get('annotationWidth', 6);
  let selectionLine = <vscode.Selection>activeTextEditor.selection;
  let cursorLine = selectionLine.active.line;
  let lineText = activeTextEditor.document.lineAt(cursorLine).text;
  let endValue = endAnnotationStack.pop();
  // 是否是开始注释
  let isStart = endValue === void 0;
  let afterEditString;
  let matches = null;

  if (insertAnnotation) {
    if (isStart) {
      matches = lineText.match(nameAnnotationReg);
      // tslint:disable-next-line: no-unused-expression
      matches && (cursorLine -= 2);
      let transVal = matches ? matches[0] : lineText;
      afterEditString = insertAnnotation(transVal, 'start', { annotationWidth, annotationIntend });
    } else {
      afterEditString = insertAnnotation(endValue + ' --- END', 'end', { annotationWidth, annotationIntend });
    }
    activeTextEditor.edit((editor) => {
      let start = new vscode.Position(cursorLine, 0);
      if (matches) {
        editor.insert(start, <string>afterEditString);
      } else {
        let end = new vscode.Position(cursorLine, annotationWidth);
        editor.replace(new vscode.Range(start, end), <string>afterEditString);
      }
    });
  }
};

function maker(type: AnnotationType) {
  let settings = workspace.getConfiguration('muguetAnnotation');
  let activeTextEditor = window.activeTextEditor;
  let document = activeTextEditor.document;
  let language = document.languageId;

  if (settings.get('enable')) {
    window.showWarningMessage('muguet-annotation 已关闭');
    return false;
  }

  if (supportLanguages.includes(language)) {
    switch (type) {
      case 'detail': { }
        break;
      case 'block': blockMaker('block', settings, activeTextEditor);
        break;
    }
  } else {
    window.showWarningMessage('muguet-annotation 不支持该语言');
  }
}

export const titleAnnotationMaker = () => maker('title');

export const blockAnnotationMaker = () => maker('block');

export const detailAnnotationMaker = () => maker('detail');

vscode.workspace.onDidChangeTextDocument(() => {
  let settings = workspace.getConfiguration('muguetAnnotation');
  // tslint:disable-next-line: no-unused-expression
  timeout && clearTimeout(timeout);
  timeout = setTimeout(() => {
    keywordsHighlight(settings);
  }, 200);
});
