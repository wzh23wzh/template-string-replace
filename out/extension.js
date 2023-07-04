"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = require("vscode");
const parser_1 = require("@babel/parser");
const traverse_1 = require("@babel/traverse");
const generator_1 = require("@babel/generator");
const core_1 = require("@babel/core");
function activate(context) {
    // 注册命令
    let disposable = vscode.commands.registerCommand('template-string-replace.tsReplace', function () {
        // 获取当前编辑器
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active text editor found.');
            return;
        }
        // 获取用户输入的待替换单词和变量
        vscode.window
            .showInputBox({ prompt: 'Enter the word to replace:' })
            .then(searchText => {
            if (!searchText) {
                return;
            }
            vscode.window
                .showInputBox({ prompt: 'Enter the replacement variable:' })
                .then(replacementVariable => {
                if (!replacementVariable) {
                    return;
                }
                const document = editor.document;
                const text = document.getText();
                try {
                    // 解析选中文本为 AST
                    const ast = (0, parser_1.parse)(text, {
                        sourceType: 'module',
                        plugins: ['jsx']
                    });
                    // 遍历 AST，替换匹配的单词为模板字符串变量
                    (0, traverse_1.default)(ast, {
                        StringLiteral(path) {
                            const curValue = path.node.value;
                            if (curValue.includes(searchText)) {
                                const [prefix, suffix] = curValue.split(searchText);
                                const templateLiteral = core_1.types.templateLiteral([
                                    core_1.types.templateElement({
                                        raw: prefix,
                                        cooked: prefix
                                    }),
                                    core_1.types.templateElement({
                                        raw: suffix,
                                        cooked: suffix
                                    }, true)
                                ], [core_1.types.identifier(replacementVariable)]);
                                // 替换为模板字符串
                                path.replaceWith(templateLiteral);
                            }
                        },
                        TemplateLiteral(path) {
                            path.node.quasis.forEach(quasi => {
                                if (quasi.value.raw.includes(searchText)) {
                                    quasi.value.raw = quasi.value.raw.replace(searchText, `\${${replacementVariable}}`);
                                }
                            });
                        }
                    });
                    // 生成替换后的代码
                    const replacedCode = (0, generator_1.default)(ast).code;
                    // 插入替换后的代码到编辑器
                    editor.edit(editBuilder => {
                        const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(text.length));
                        editBuilder.replace(fullRange, replacedCode);
                    });
                }
                catch (error) {
                    vscode.window.showErrorMessage('Failed to generate template string.');
                }
            });
        });
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map