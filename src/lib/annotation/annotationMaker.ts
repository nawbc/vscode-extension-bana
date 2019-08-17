import * as vscode from 'vscode';
import { keywordsHighlight } from '../style/keywordsHighlight';

type AnnotationType = 'block' | 'title' | 'detail';
let { workspace, window } = vscode;
let endAnnotationStack: Array<string> = [];
let nameAnnotationReg: RegExp = /(((?<=function\s+)(.+))(?=\s*\())|(((?<=class\s+)(.+))(?=\s*\{))|(((?<=var|const|let|type)(.+))(?=(\s*=\s*\()))/g;
let timeout = null;
let isStart = true;

const supportLanguages = [
  'typescript',
  'typescriptreact',
  'javascript',
  'javascriptreact',
  'css',
  'scss',
  'less'
];



const insertBlockAnnotation = (
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
  { annotationWidth, annotationIntend },
  activeTextEditor: vscode.TextEditor
): void => {
  let selectionLine = <vscode.Selection>activeTextEditor.selection;
  let cursorLine = selectionLine.active.line;
  let cursorLineText = activeTextEditor.document.lineAt(cursorLine).text;
  // 是否是开始注释
  let afterEditString = null;
  // 匹配到函数和 类 自动 生成注释插入上一行
  let matches = null;

  if (isStart) {
    if (cursorLineText === '') return;
    isStart = false;
    vscode.window.showInformationMessage("已暂存");
    matches = cursorLineText.match(nameAnnotationReg);
    // tslint:disable-next-line: no-unused-expression
    matches && (cursorLine -= 2);
    let transVal = matches ? matches[0] : cursorLineText;
    afterEditString = insertBlockAnnotation(transVal, 'start', { annotationWidth, annotationIntend });
  } else {
    isStart = true;
    // 栈中取出 开始时push的值
    let endValue = endAnnotationStack.pop();
    afterEditString = insertBlockAnnotation(endValue + ' --- END', 'end', { annotationWidth, annotationIntend });
  }
  // 插入text
  activeTextEditor.edit((editor) => {
    let start = new vscode.Position(cursorLine, 0);
    if (matches) {
      editor.insert(start, <string>afterEditString);
    } else {
      let end = new vscode.Position(cursorLine, annotationWidth);
      // 没有匹配就代替这一行 使用自己打的注释
      editor.replace(new vscode.Range(start, end), <string>afterEditString);
    }
  });
};

const detailMaker = (
  { annotationWidth },
  activeTextEditor: vscode.TextEditor
) => {

  let startLine = activeTextEditor.selection.start.line;
  let endLine = activeTextEditor.selection.end.line;
  let EOL = activeTextEditor.document.eol === 2 ? '\r\n' : '\n';
  let detailAnnotation = '/**';
  for (let i = startLine; i <= endLine; i++) {
    let lineText = activeTextEditor.document.lineAt(i).text;
    if (i === startLine) {
      let width = annotationWidth - 3;
      for (let j = 0; j < width; j++) {
        detailAnnotation += '=';
      }
      detailAnnotation += EOL + ' *\t\t\t' + lineText + EOL;
    }

    if (i > startLine && i < endLine)
      detailAnnotation += ' *\t\t\t' + lineText + EOL;

    if (i === endLine) {
      let width = annotationWidth - 3;
      detailAnnotation += ' *\t\t\t' + lineText + EOL + ' *';
      for (let j = 0; j < width; j++) {
        detailAnnotation += '=';
      }
      detailAnnotation += '*/' + EOL;
      let a = new vscode.Position(startLine, 0);
      let b = new vscode.Position(endLine, lineText.length);
      activeTextEditor.edit(editor => {
        editor.replace(new vscode.Selection(a, b), detailAnnotation);
      }).then((bool) => {
        if (bool) {

        }
      })
    }
  }
}

const titleMaker = (
  { annotationWidth, annotationIntend },
  activeTextEditor: vscode.TextEditor
) => {

}

const maker = (type: AnnotationType) => {
  let settings = workspace.getConfiguration('muguet');
  let activeTextEditor = window.activeTextEditor;
  let document = activeTextEditor.document;
  let language = document.languageId;
  let options = {
    annotationWidth: settings.get('annotation.width', 100),
    annotationIntend: settings.get('annotation.intends', 6)
  };

  if (!activeTextEditor || !activeTextEditor.document) return false;

  if (!settings.get('enable', true)) {
    window.showWarningMessage('muguet-annotation 已关闭');
    return false;
  }

  if (supportLanguages.includes(language)) {
    switch (type) {
      case 'detail': detailMaker(options, activeTextEditor)
        break;
      case 'block': blockMaker(options, activeTextEditor);
        break;
      case 'title': titleMaker(options, activeTextEditor);
        break;
    }
  } else {
    window.showWarningMessage('muguet-annotation 不支持该语言');
  }
}
// 更新注释颜色
const updateKeyWordHighlight = () => {
  let settings = workspace.getConfiguration('muguet');
  // tslint:disable-next-line: no-unused-expression
  timeout && clearTimeout(timeout);
  timeout = setTimeout(() => {
    keywordsHighlight(settings);
  }, 100);
};

vscode.workspace.onDidChangeTextDocument(() => {
  updateKeyWordHighlight();
});

vscode.workspace.onDidChangeConfiguration(() => {
  updateKeyWordHighlight();
});

vscode.window.onDidChangeActiveTextEditor(() => {
  updateKeyWordHighlight();
});

export const titleAnnotationMaker = () => maker('title');

export const blockAnnotationMaker = () => maker('block');

export const detailAnnotationMaker = () => maker('detail');