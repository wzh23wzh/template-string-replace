import * as vscode from 'vscode';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import { NodePath, types as t } from '@babel/core';

export function activate(context: vscode.ExtensionContext) {
    // 注册命令
    let disposable = vscode.commands.registerCommand(
        'template-string-replace.tsReplace',
        function () {
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
                                const ast = parse(text, {
                                    sourceType: 'module',
                                    plugins: ['jsx']
                                });

                                // 遍历 AST，替换匹配的单词为模板字符串变量
                                traverse(ast, {
                                    StringLiteral(path: NodePath<t.StringLiteral>) {
                                        const curValue = path.node.value;
                                        if (curValue.includes(searchText)) {
                                            const [prefix, suffix] = curValue.split(searchText);
                                            const templateLiteral = t.templateLiteral(
                                                [
                                                    t.templateElement({
                                                        raw: prefix,
                                                        cooked: prefix
                                                    }),
                                                    t.templateElement(
                                                        {
                                                            raw: suffix,
                                                            cooked: suffix
                                                        },
                                                        true
                                                    )
                                                ],
                                                [t.identifier(replacementVariable)]
                                            );
                                            // 替换为模板字符串
                                            path.replaceWith(templateLiteral);
                                        }
                                    },
                                    TemplateLiteral(path: NodePath<t.TemplateLiteral>) {
                                        path.node.quasis.forEach(quasi => {
                                            if (quasi.value.raw.includes(searchText)) {
                                                quasi.value.raw = quasi.value.raw.replace(
                                                    searchText,
                                                    `\${${replacementVariable}}`
                                                );
                                            }
                                        });
                                    }
                                });

                                // 生成替换后的代码
                                const replacedCode = generate(ast).code;
                                // 插入替换后的代码到编辑器
                                editor.edit(editBuilder => {
                                    const fullRange = new vscode.Range(
                                        document.positionAt(0),
                                        document.positionAt(text.length)
                                    );
                                    editBuilder.replace(fullRange, replacedCode);
                                });
                            } catch (error) {
                                vscode.window.showErrorMessage(
                                    'Failed to generate template string.'
                                );
                            }
                        });
                });
        }
    );

    context.subscriptions.push(disposable);
}
