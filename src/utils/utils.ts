import * as vscode from 'vscode';

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

