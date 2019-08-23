import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export const supportLanguages = [
  'typescript',
  'typescriptreact',
  'javascript',
  'javascriptreact',
  'css',
  'scss',
  'less'
];

export const randomNumber = (min: number, max: number): number =>
  min + Math.floor(Math.random() * (max - min)) + 1;

export const randomColor = (): string =>
  `rgba(${Array(3).fill('').map(_ => randomNumber(0, 255)).join(',')},1)`;

export const pathMaker = (pattern) => {
  return Array.isArray(pattern) ?
    pattern.map(val => new vscode.RelativePattern(vscode.workspace.rootPath, val)) :
    false;
};


interface AvailablePkg {
  author: string;
  license: string;
  description: string;
  repository: { url: string };
}

export const getWorkSpacePkg = (): AvailablePkg | boolean => {
  let currentPath = vscode.window.activeTextEditor.document.fileName;
  let topWorkspace = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(currentPath));
  let a = path.resolve(topWorkspace.uri.fsPath, 'package.json');
  if (fs.existsSync(a)) {
    let content = fs.readFileSync(a).toString('utf8');
    return JSON.parse(content);
  } else {
    vscode.window.showErrorMessage('当前工作区根目录不存在package.json');
    return false;
  }
};

export const pkgInfo = () => {
  let pkg = <AvailablePkg>getWorkSpacePkg();
  if (pkg) {
    let author = pkg.author || '';
    let license = pkg.license || '';
    let description = pkg.description || '';
    let repository = (pkg.repository && ((typeof pkg.repository === 'string' ? pkg.repository : false) || pkg.repository.url)) || '';
    return {
      author,
      license,
      description,
      repository
    };
  } else {
    return false;
  }
}


