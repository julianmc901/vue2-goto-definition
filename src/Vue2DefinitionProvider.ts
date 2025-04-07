import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class Vue2DefinitionProvider implements vscode.DefinitionProvider {
  async provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Promise<vscode.Definition | null> {
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

    const methodRegex = new RegExp(`\\b${word}\\s*\\(`);
    const dataPropertyRegex = new RegExp(`\\b${word}\\s*:\\s*`);
    const propsRegex = new RegExp(`\\b${word}\\s*:\\s*{?\\s*type:`);
    const computedRegex = /computed\s*:\s*{/;
    const watchRegex = /watch\s*:\s*{/;

    let insideComputed = false;
    let insideWatch = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Entramos/salimos de bloques
      if (computedRegex.test(line)) insideComputed = true;
      if (watchRegex.test(line)) insideWatch = true;
      if (line.includes('},')) {
        insideComputed = false;
        insideWatch = false;
      }

      // Detectar método
      if (methodRegex.test(line)) {
        return new vscode.Location(vscode.Uri.file(scriptFilePath), new vscode.Position(i, line.indexOf(word)));
      }

      // Detectar propiedad en data()
      if (dataPropertyRegex.test(line)) {
        return new vscode.Location(vscode.Uri.file(scriptFilePath), new vscode.Position(i, line.indexOf(word)));
      }

      // Detectar propiedad en props
      if (propsRegex.test(line)) {
        return new vscode.Location(vscode.Uri.file(scriptFilePath), new vscode.Position(i, line.indexOf(word)));
      }

      // Detectar en computed/watch
      if ((insideComputed || insideWatch) && line.includes(`${word}`)) {
        return new vscode.Location(vscode.Uri.file(scriptFilePath), new vscode.Position(i, line.indexOf(word)));
      }
    }

    // === Mejora: Manejo de objetos anidados tipo "auth.username"
    const fullLine = document.lineAt(position.line).text;
    const dotParts = fullLine.split(/[\s;]+/).find(p => p.includes('.'));
    if (dotParts) {
      const parts = dotParts.trim().split('.');
      if (parts.length >= 2) {
        const objName = parts[0];
        const propName = parts[1];

        const wordUnderCursor = document.getText(document.getWordRangeAtPosition(position));
        if (wordUnderCursor === propName) {
          const objRegex = new RegExp(`${objName}\\s*:\\s*{`);
          let insideObj = false;

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (objRegex.test(line)) {
              insideObj = true;
              continue;
            }

            if (insideObj && line.includes('}')) {
              insideObj = false;
            }

            if (insideObj && new RegExp(`\\b${propName}\\b`).test(line)) {
              return new vscode.Location(
                vscode.Uri.file(scriptFilePath),
                new vscode.Position(i, line.indexOf(propName))
              );
            }
          }
        }
      }
    }

    return null;
  }
}
