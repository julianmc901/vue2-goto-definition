import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class Vue2HoverProvider implements vscode.HoverProvider {
  async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Promise<vscode.Hover | null> {
    const wordRange = document.getWordRangeAtPosition(position);
    if (!wordRange) return null;

    const word = document.getText(wordRange);
    const text = document.getText();

    const scriptTagMatch = text.match(/<script\s+src=["'](.+?)["']/);
    if (!scriptTagMatch) return null;

    const relativeScriptPath = scriptTagMatch[1];
    const scriptFilePath = path.resolve(path.dirname(document.uri.fsPath), relativeScriptPath);
    if (!fs.existsSync(scriptFilePath)) return null;

    const scriptText = fs.readFileSync(scriptFilePath, 'utf8');
    const lines = scriptText.split('\n');

    const matchRegexes = [
      new RegExp(`\\b${word}\\s*\\(`), // métodos
      new RegExp(`\\b${word}\\s*:\\s*`), // data, props, computed
    ];

    for (let i = 0; i < lines.length; i++) {
        for (const regex of matchRegexes) {
          if (regex.test(lines[i])) {
            const previewLines = lines.slice(i, i + 5).join('\n'); // mostramos 5 líneas como vista previa
            const markdown = new vscode.MarkdownString();
            markdown.isTrusted = true;
      
            const headerLine = 'vue2goto';
            markdown.appendMarkdown(`${headerLine}\n\n`);
            markdown.appendCodeblock(previewLines, 'js');
            return new vscode.Hover(markdown, wordRange);
          }
        }
      }
      
    return null;
  }
}
