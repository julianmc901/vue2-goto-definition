"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vue2DefinitionProvider = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
class Vue2DefinitionProvider {
    async provideDefinition(document, position, token) {
        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange)
            return null;
        const word = document.getText(wordRange); // e.g., "handleLogin"
        const text = document.getText();
        // Buscar el src del script externo
        const scriptTagMatch = text.match(/<script\s+src=["'](.+?)["']/);
        if (!scriptTagMatch)
            return null;
        const relativeScriptPath = scriptTagMatch[1];
        const scriptFilePath = path.resolve(path.dirname(document.uri.fsPath), relativeScriptPath);
        if (!fs.existsSync(scriptFilePath))
            return null;
        const scriptText = fs.readFileSync(scriptFilePath, 'utf8');
        // Buscar método
        const methodRegex = new RegExp(`\\b${word}\\s*\\(`);
        const lines = scriptText.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (methodRegex.test(lines[i])) {
                const uri = vscode.Uri.file(scriptFilePath);
                const position = new vscode.Position(i, lines[i].indexOf(word));
                return new vscode.Location(uri, position);
            }
        }
        return null;
    }
}
exports.Vue2DefinitionProvider = Vue2DefinitionProvider;
//# sourceMappingURL=Vue2DefinitionProvider.js.map