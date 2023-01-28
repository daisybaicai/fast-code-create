const vscode = require('vscode')
const fs = require('fs')
const path = require('path')
const open = require('open')
const DB_PATH = path.join(__dirname, './data/db.json')
const strategy = require('./strategy/index');

function getExtensionFileAbsolutePath(context, relativePath) {
    return path.join(context.extensionPath, relativePath)
}

/**
 * 从某个HTML文件读取能被Webview加载的HTML内容
 * @param {*} context 上下文
 * @param {*} templatePath 相对于插件根目录的html文件相对路径
 */
function getWebViewContent(context, templatePath) {
    const resourcePath = getExtensionFileAbsolutePath(context, templatePath)
    const dirPath = path.dirname(resourcePath)
    let html = fs.readFileSync(resourcePath, 'utf-8')
    // vscode不支持直接加载本地资源，需要替换成其专有路径格式，这里只是简单的将样式和JS的路径替换
    html = html.replace(/(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g, (m, $1, $2) => {
        return $1 + vscode.Uri.file(path.resolve(dirPath, $2)).with({ scheme: 'vscode-resource' }).toString() + '"'
    })
    return html
}

const methods = {
    writeFile: function (message, vscode, dirPath) {
        let { fileName, code, text, options } = message.data
        console.log('d', dirPath);
        // let filePath = path.join(dirPath, fileName)
        // fs.writeFileSync(filePath, code)
        console.log('text1235', typeof text, text)
        const result = JSON.parse(text);


        console.log('vscode', vscode.workspace.getConfiguration().get('VFormMaker.url'));
        console.log("🚀 ~ file: vform-loader.js:35 ~ result", result)
        const {actionType} = result;
        console.log("🚀 ~ file: vform-loader.js:36 ~ actionType", actionType)

        console.log('d', strategy);
        console.log('3', strategy[actionType]);
        
        strategy[actionType]({
            paths: {
                absSrcPath: dirPath + '/src'
            }
        }, text, options);

        // var handleText = function (type: any, text: any, api: any, options: any) {
        //     return strategy[type](api, text, options);
        // };

        vscode.window.showInformationMessage(`文件${text.slice(10)}创建成功`)
    },
    openUrl: function (message, vscode, dirPath) {
        //vscode.window.showInformationMessage(message.data.url)
        open(message.data.url)
    },
    setStorageItem: function (message, vscode, dirPath) {
        const { key, val } = message.data
        const str = fs.readFileSync(DB_PATH).toString()
        let json = {}
        if (str) {
            json = JSON.parse(str)
        }
        json[key] = val
        fs.writeFileSync(DB_PATH, JSON.stringify(json))
    },
}

module.exports = function (context) {
    context.subscriptions.push(vscode.commands.registerCommand('extension.openVFormMaker', (uri) => {
        if (uri) {
            let dirPath = uri.fsPath,
                stat = fs.lstatSync(dirPath)
            if (stat.isFile()) dirPath = path.dirname(dirPath)

            console.log('3', dirPath)

            let pclintBar = vscode.window.createStatusBarItem()
            pclintBar.text = `目标文件夹：${dirPath}`
            pclintBar.show()

            const panel = vscode.window.createWebviewPanel(
                'vFormMaker',
                "CodeCreate设计器配置",
                vscode.ViewColumn.One,
                {
                    enableScripts: true, // 启用JS，默认禁用
                    retainContextWhenHidden: true, // webview被隐藏时保持状态，避免被重置
                }
            )
            panel.onDidChangeViewState(e => {
                if (panel.visible) {
                    pclintBar.show()
                } else {
                    pclintBar.hide()
                }
            })
            panel.webview.html = getWebViewContent(context, 'src/view/index.html')
            console.log('from', vscode.workspace.getConfiguration().get('VFormMaker.url'));
            panel.webview.postMessage({
                cmd: 'setSrc',
                data: {
                    src: vscode.workspace.getConfiguration().get('VFormMaker.url'),
                    db: JSON.parse(fs.readFileSync(DB_PATH).toString() || '{}')
                }
            })
            panel.webview.onDidReceiveMessage(message => {
                if (message.cmd && message.data) {
                    //vscode.window.showInformationMessage(message.cmd)

                    let method = methods[message.cmd]
                    if (method) method(message, vscode, dirPath)
                } else {
                    vscode.window.showInformationMessage(`没有与消息对应的方法`)
                }
            }, undefined, context.subscriptions)
            panel.onDidDispose(e => {
                pclintBar.dispose()
            })
        } else {
            vscode.window.showInformationMessage(`无法获取文件夹路径`)
        }
    }))
}