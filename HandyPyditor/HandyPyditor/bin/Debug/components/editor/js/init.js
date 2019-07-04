require("file_drop");
var langTools = ace.require("ace/ext/language_tools");
var editor = ace.edit("editor");
editor.session.setMode("ace/mode/python");
editor.session.setUseWrapMode(true);
editor.$blockScrolling = Infinity;
editor.setTheme("ace/theme/xcode");
editor.setFontSize(16);
editor.setFadeFoldWidgets(true);
editor.setOptions({
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true
});
var Editor = require("ace/editor").Editor;
var TokenTooltip = require("token_tooltip").TokenTooltip;
new TokenTooltip(editor);

var methodCompleter = {
    getCompletions: function (editor, session, pos, prefix, callback) {
        var row = pos.row;
        var tokens = editor.session.getTokens(row);
        var index = tokens.length - 2;
        var showMethods = [];
        if (index > -1 && tokens[index + 1].value === ".") {
            var tokenValue = tokens[index].value;
            for (var i = row - 1; i > -1; i--) {
                var tokensInLine = editor.session.getTokens(i);
                var lineStr = editor.session.getLine(i).trim();
                var tokenArr = tokensInLine.filter(function (token) {
                    return token.value === tokenValue && token.type === "identifier";
                });
                if (lineStr.indexOf(tokenValue) > -1 && tokenArr.length > 0) {
                    var keyArr = /^([a-zA-Z0-9_\s,]+)=([^\n=]+)$/g.exec(lineStr);
                    if (keyArr && keyArr.length > 2) {
                        var vArr = keyArr[1].split(",");
                        vArr.forEach(function (currentValue, index, arr) {
                            arr[index] = currentValue.trim();
                        });
                        var vIndex = vArr.indexOf(tokenValue) + 1;
                        var methodStr = keyArr[2];
                        var lIndex = methodStr.indexOf("(");
                        var rIndex = methodStr.indexOf(")");
                        var count = 1;
                        for (var j = lIndex + 1; j < rIndex; j++) {
                            if (methodStr[j] === ",") {
                                count++;
                            }
                        }
                        var methodName = methodStr.substring(0, lIndex) + "(" + new Array(count).join(",") + ")";
                        showMethods = editorConfig.variableJson[methodName.trim()]["v" + vIndex];
                        break;
                    }
                }
            }
        }
        if (!showMethods || showMethods.length == 0) {
            callback(null, []);
        }
        else {
            callback(null, showMethods.map(function (item) {
                return {
                    meta: item.caption,
                    value: prefix + item.value
                };
            }));
        }
    }
};
langTools.addCompleter(methodCompleter);

document.getElementById("openFile").onclick = function () {
    document.getElementById("file-open").click();
}

document.getElementById("file-open").onchange = function (e) {
    var file = e.target.files[0];
    if (!file) {
        return;
    }
    var reader = new FileReader();
    reader.onload = function (e) {
        var contents = e.target.result;
        editor.setValue(contents);
        editor.clearSelection();
        editor.selection.moveCursorFileStart();
    };
    reader.readAsText(file);
}

document.getElementById("newFile").onclick = function () {
    if (editor.getValue().length > 0) {
        swal({
            title: '需要保存吗？',
            text: "如果不保存，则无法恢复当前的编辑状态！",
            type: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: '不保存',
            confirmButtonText: '我要保存'
        }).then(function (isConfirm) {
            if (isConfirm == true) {
                saveFile(true);
            }
            else if (isConfirm == false) {
                refresh();
                sendMessage("refresh");
            }
        });
    }
    else {
        sendMessage("refresh");
    }
}

function refresh() {
    editor.setValue("");
}

function getCode() {
    return editor.getValue();
}

function setCode(str) {
    editor.setValue(str);
}

editor.commands.addCommand({
    name: 'saveFile',
    bindKey: {
        win: 'Ctrl-S',
        sender: 'editor|cli'
    },
    exec: function (env, args, request) {
        saveFile(false);
    }
});

editor.commands.addCommand({
    name: 'saveAsFile',
    bindKey: {
        win: 'Shift-Ctrl-S',
        sender: 'editor|cli'
    },
    exec: function (env, args, request) {
        saveAsFile(false);
    }
});

editor.commands.addCommand({
    name: 'debug',
    bindKey: {
        win: 'F5',
        sender: 'editor|cli'
    },
    exec: function (env, args, request) {
        debugCode();
    }
});

editor.commands.addCommand({
    name: 'stopDebug',
    bindKey: {
        win: 'Shift-F5',
        sender: 'editor|cli'
    },
    exec: function (env, args, request) {
        stopDebugCode();
    }
});

editor.commands.addCommand({
    name: 'setBreakpoints',
    bindKey: {
        win: 'F9',
        sender: 'editor|cli'
    },
    exec: function (env, args, request) {
        var pos = editor.getCursorPosition();
        var arr = editor.session.getBreakpoints();
        if (arr[pos.row]) {
            editor.session.clearBreakpoint(pos.row);
            sendMessage("clearBreakpoint", pos.row);
        }
        else {
            editor.session.setBreakpoint(pos.row);
            sendMessage("setBreakpoint", pos.row);
        }
    }
});

editor.commands.addCommand({
    name: 'formatCode',
    bindKey: {
        win: 'Alt-Shift-F',
        sender: 'editor|cli'
    },
    exec: function (env, args, request) {
        sendMessage("format", getCode());
    }
});

var handler;

editor.on("change", function (e) {
    clearTimeout(handler);
    handler = setTimeout("autoSave()", "2000");
})

function autoSave() {
    sendMessage("autoSave");
}

editor.on("guttermousedown", function (e) {
    if(e.domEvent.buttons != 1) return;
    var target = e.domEvent.target;
    if (target.className.indexOf("ace_gutter-cell") == -1)
        return;
    if (!editor.isFocused())
        return;
    var t = target.getBoundingClientRect().left;
    if (e.clientX > 20 + target.getBoundingClientRect().left)
        return;

    var row = e.getDocumentPosition().row
    var arr = editor.session.getBreakpoints();
    if (arr[row]) {
        editor.session.clearBreakpoint(row);
        sendMessage("clearBreakpoint", row);
    }
    else {
        editor.session.setBreakpoint(row);
        sendMessage("setBreakpoint", row);
    }
    e.stop()
})

function saveAsFile() {
    sendMessage("saveAsFile");
}

function saveFile(refresh) {
    sendMessage("saveFile", refresh);
}

document.getElementById("formatCode").onclick = function () {
    sendMessage("format", getCode());
}

document.getElementById("commentCode").onclick = function () {
    editor.commentLines();
}

document.getElementById("unCommentCode").onclick = function () {
    editor.unCommentLines();
}

document.getElementById("undo").onclick = function () {
    editor.undo();
}

document.getElementById("redo").onclick = function () {
    editor.redo();
}

document.getElementById("find").onclick = function () {
    editor.execCommand("find");
}

document.getElementById("saveFile").onclick = function () {
    saveFile(false);
}

document.getElementById("saveAsFile").onclick = function () {
    saveAsFile();
}

document.getElementById("tooltipConfig").onclick = function () {
    sendMessage("tooltipConfig");
}

document.getElementById("variableConfig").onclick = function () {
    sendMessage("variableConfig");
}

document.getElementById("snippetConfig").onclick = function () {
    sendMessage("snippetConfig");
}

var run = document.getElementById("run");
var stop = document.getElementById("stop");

run.onclick = debugCode;
var isDebug = false;

function debugCode() {
    if (isDebug) return;
    sendMessage("run");
}

stop.onclick = stopDebugCode;

function stopDebugCode() {
    if (!isDebug) return;
    sendMessage("stop");
}

function setDebugStatus(status) {
    isDebug = status;

    if (status) {
        editor.session.setAnnotations([]);
        stop.style.display = "inline-block";
        run.style.display = "none";
    }
    else {
        run.style.display = "inline-block";
        stop.style.display = "none";
    }
}

function sendMessage(p1, p2) {
    if (typeof (message) != "undefined") {
        message(p1, p2);
    }
}

new Tippy('#toolBar li', {
    animation: "fade",
    theme: "light",
    duration: 0,
    delay: 400
});

if (tempData.tempCode && tempData.tempCode.length > 0) {
    editor.setValue(tempData.tempCode);
    editor.clearSelection();
    editor.selection.moveCursorFileStart();
}

function setError(row, column, text) {
    editor.session.setAnnotations([{
        row: row,
        column: column,
        text: text,
        type: "error"
    }]);
}