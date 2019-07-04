define("ace/ext/searchbox",["require","exports","module","ace/lib/dom","ace/lib/lang","ace/lib/event","ace/keyboard/hash_handler","ace/lib/keys"], function(require, exports, module) {
"use strict";

var dom = require("../lib/dom");
var lang = require("../lib/lang");
var event = require("../lib/event");
var searchboxCss = `
.find-part, .replace-part {
    margin: 4px 0 0 17px;
    font-size: 12px;
    display: -webkit-flex;
    align-items: center;
    display: flex;
}
.matchesCount {
    display: flex;
    display: -webkit-flex;
    flex: initial;
    margin: 0 1px 0 3px;
    padding: 2px 2px 0;
    height: 25px;
    vertical-align: middle;
    box-sizing: border-box;
    text-align: center;
    line-height: 23px;
}
.monaco-inputbox {
    height: 25px;
    position: relative;
    display: block;
    padding: 0;
    -o-box-sizing: border-box;
    -ms-box-sizing: border-box;
    box-sizing: border-box;
    line-height: auto!important;
    font-size: inherit;
}
.monaco-inputbox>.wrapper>.input {
    padding-right: 66px;
    padding-top: 2px;
    padding-bottom: 2px;
    display: inline-block;
    -o-box-sizing: border-box;
    -ms-box-sizing: border-box;
    box-sizing: border-box;
    height: 100%;
    line-height: inherit;
    border: none;
    font-family: inherit;
    font-size: inherit;
    resize: none;
    padding: 4px;
}
.monaco-inputbox.idle {
    border: 1px solid transparent;
}
.monaco-findInput .monaco-inputbox {
    font-size: 13px;
    width: 100%;
    height: 25px;
}
.monaco-findInput {
    vertical-align: middle;
    display: flex;
    display: -webkit-flex;
    flex: 1;
    position: relative;
}
.monaco-findInput>.controls {
    position: absolute;
    top: 3px;
    right: 2px;
}
.find-part .monaco-inputbox>.wrapper>.input {
    width: 100%!important;
    padding-right: 66px;
}
.monaco-custom-checkbox.monaco-case-sensitive {
    background: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHN0eWxlIHR5cGU9InRleHQvY3NzIj4uc3Qwe29wYWNpdHk6MDtmaWxsOiNGNkY2RjY7fSAuc3Qxe2ZpbGw6I0Y2RjZGNjt9IC5zdDJ7ZmlsbDojNDI0MjQyO308L3N0eWxlPjxnIGlkPSJvdXRsaW5lIj48cmVjdCBjbGFzcz0ic3QwIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiLz48cGF0aCBjbGFzcz0ic3QxIiBkPSJNMTQuMTc2IDUuNTkyYy0uNTU1LS42LTEuMzM2LS45MDQtMi4zMjItLjkwNC0uMjU4IDAtLjUyMS4wMjQtLjc4NC4wNzItLjI0Ni4wNDQtLjQ3OS4xMDEtLjcuMTY5LS4yMjguMDctLjQzMi4xNDctLjYxMy4yMjktLjIyLjA5OS0uMzg5LjE5Ni0uNTEyLjI4NGwtLjQxOS4yOTl2Mi43MDFjLS4wODYuMTA4LS4xNjIuMjIzLS4yMjkuMzQ0bC0yLjQ1LTYuMzU0aC0yLjM5NGwtMy43NTMgOS44MDR2LjU5OGgzLjAyNWwuODM4LTIuMzVoMi4xNjdsLjg5MSAyLjM1aDMuMjM3bC0uMDAxLS4wMDNjLjMwNS4wOTIuNjMzLjE1Ljk5My4xNS4zNDQgMCAuNjcxLS4wNDkuOTc4LS4xNDZoMi44NTN2LTQuOTAzYy0uMDAxLS45NzUtLjI3MS0xLjc2My0uODA1LTIuMzR6Ii8+PC9nPjxnIGlkPSJpY29uX3g1Rl9iZyI+PHBhdGggY2xhc3M9InN0MiIgZD0iTTcuNjExIDExLjgzNGwtLjg5MS0yLjM1aC0zLjU2MmwtLjgzOCAyLjM1aC0xLjA5NWwzLjIxNy04LjQwMmgxLjAybDMuMjQgOC40MDJoLTEuMDkxem0tMi41MzEtNi44MTRsLS4wNDQtLjEzNS0uMDM4LS4xNTYtLjAyOS0uMTUyLS4wMjQtLjEyNmgtLjAyM2wtLjAyMS4xMjYtLjAzMi4xNTItLjAzOC4xNTYtLjA0NC4xMzUtMS4zMDcgMy41NzRoMi45MThsLTEuMzE4LTMuNTc0eiIvPjxwYXRoIGNsYXNzPSJzdDIiIGQ9Ik0xMy4wMiAxMS44MzR2LS45MzhoLS4wMjNjLS4xOTkuMzUyLS40NTYuNjItLjc3MS44MDZzLS42NzMuMjc4LTEuMDc1LjI3OGMtLjMxMyAwLS41ODgtLjA0NS0uODI2LS4xMzVzLS40MzgtLjIxMi0uNTk4LS4zNjYtLjI4MS0uMzM4LS4zNjMtLjU1MS0uMTI0LS40NDItLjEyNC0uNjg4YzAtLjI2Mi4wMzktLjUwMi4xMTctLjcyMXMuMTk4LS40MTIuMzYtLjU4LjM2Ny0uMzA4LjYxNS0uNDE5LjU0NC0uMTkuODg4LS4yMzdsMS44MTEtLjI1MmMwLS4yNzMtLjAyOS0uNTA3LS4wODgtLjdzLS4xNDMtLjM1MS0uMjUyLS40NzItLjI0MS0uMjEtLjM5Ni0uMjY3LS4zMjUtLjA4NS0uNTEzLS4wODVjLS4zNjMgMC0uNzE0LjA2NC0xLjA1Mi4xOTNzLS42MzguMzEtLjkwNC41NHYtLjk4NGMuMDgyLS4wNTkuMTk2LS4xMjEuMzQzLS4xODhzLjMxMi0uMTI4LjQ5NS0uMTg1LjM3OC0uMTA0LjU4My0uMTQxLjQwNy0uMDU2LjYwNi0uMDU2Yy42OTkgMCAxLjIyOS4xOTQgMS41ODguNTgzcy41MzkuOTQyLjUzOSAxLjY2MXYzLjkwMmgtLjk2em0tMS40NTQtMi44M2MtLjI3My4wMzUtLjQ5OC4wODUtLjY3NC4xNDlzLS4zMTMuMTQ0LS40MS4yMzctLjE2NS4yMDUtLjIwMi4zMzQtLjA1NS4yNzYtLjA1NS40NGMwIC4xNDEuMDI1LjI3MS4wNzYuMzkzcy4xMjQuMjI3LjIyLjMxNi4yMTUuMTYuMzU3LjIxMS4zMDguMDc2LjQ5NS4wNzZjLjI0MiAwIC40NjUtLjA0NS42NjgtLjEzNXMuMzc4LS4yMTQuNTI0LS4zNzIuMjYxLS4zNDQuMzQzLS41NTcuMTIzLS40NDIuMTIzLS42ODh2LS42MDlsLTEuNDY1LjIwNXoiLz48L2c+PC9zdmc+) 50% no-repeat;
}
.monaco-custom-checkbox.monaco-whole-word {
    background: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHN0eWxlIHR5cGU9InRleHQvY3NzIj4uc3Qwe29wYWNpdHk6MDtmaWxsOiNGNkY2RjY7fSAuc3Qxe2ZpbGw6I0Y2RjZGNjt9IC5zdDJ7ZmlsbDojNDI0MjQyO308L3N0eWxlPjxnIGlkPSJvdXRsaW5lIj48cmVjdCBjbGFzcz0ic3QwIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiLz48cGF0aCBjbGFzcz0ic3QxIiBkPSJNMTYgNC4wMjJ2LTMuMDIyaC0xNi4wMTR2My4wMjJoMy4wNDZsLTMuMDQzIDcuOTQ1aC0uMDA0di4wMWwuMDE1IDEuMDIzaC0uMDE0djEuOTkxaDE2LjAxNHYtMy4wMjNoLTF2LTcuOTQ2aDF6bS01LjkxNCA1LjMwMWMwIC4yMzMtLjAyMy40NDEtLjA2Ni41OTUtLjA0Ny4xNjQtLjA5OS4yNDctLjEyNy4yODRsLS4wNzguMDY5LS4xNTEuMDI2LS4xMTUtLjAxNy0uMTM5LS4xMzdjLS4wMzEtLjA3OC0uMTEyLS4zMzItLjExMi0uNTY2IDAtLjI1NC4wOTEtLjU2MS4xMjYtLjY1NmwuMDY5LS4xNDEuMTA5LS4wODIuMTc4LS4wMjdjLjA3NyAwIC4xMTcuMDE0LjE3Ny4wNTZsLjA4Ny4xNzkuMDUxLjIzNy0uMDA5LjE4em0tMy42OTUtNS4zMDF2Mi44OTNsLTEuMTE2LTIuODkzaDEuMTE2em0tMy4wMjYgNy4wMmgxLjU3M2wuMzUxLjkyNmgtMi4yNTRsLjMzLS45MjZ6bTguNjM1LTQuMzU0Yy0uMjA2LS4yLS40MzEtLjM4LS42OTUtLjUxMi0uMzk2LS4xOTgtLjg1My0uMjk4LTEuMzU1LS4yOTgtLjIxNSAwLS40MjMuMDItLjYyMS4wNTh2LTEuOTE0aDIuNjcxdjIuNjY2eiIvPjwvZz48ZyBpZD0iaWNvbl94NUZfYmciPjxyZWN0IHg9IjEzIiB5PSI0IiBjbGFzcz0ic3QyIiB3aWR0aD0iMSIgaGVpZ2h0PSI4Ii8+PHBhdGggY2xhc3M9InN0MiIgZD0iTTExLjIyNSA4LjM4N2MtLjA3OC0uMjk5LS4xOTktLjU2Mi0uMzYtLjc4NnMtLjM2NS0uNDAxLS42MDktLjUzLS41MzQtLjE5My0uODY2LS4xOTNjLS4xOTggMC0uMzguMDI0LS41NDcuMDczLS4xNjUuMDQ5LS4zMTYuMTE3LS40NTMuMjA1LS4xMzYuMDg4LS4yNTcuMTk0LS4zNjUuMzE4bC0uMTc5LjI1OHYtMy4xNTRoLS44OTN2Ny40MjJoLjg5M3YtLjU3NWwuMTI2LjE3NWMuMDg3LjEwMi4xODkuMTkuMzA0LjI2OS4xMTcuMDc4LjI0OS4xNC4zOTguMTg2LjE0OS4wNDYuMzE0LjA2OC40OTguMDY4LjM1MyAwIC42NjYtLjA3MS45MzctLjIxMi4yNzItLjE0My40OTktLjMzOC42ODItLjU4Ni4xODMtLjI1LjMyMS0uNTQzLjQxNC0uODc5LjA5My0uMzM4LjE0LS43MDMuMTQtMS4wOTctLjAwMS0uMzQyLS4wNC0uNjYzLS4xMi0uOTYyem0tMS40NzktLjYwN2MuMTUxLjA3MS4yODIuMTc2LjM5LjMxNC4xMDkuMTQuMTk0LjMxMy4yNTUuNTE3LjA1MS4xNzQuMDgyLjM3MS4wODkuNTg3bC0uMDA3LjEyNWMwIC4zMjctLjAzMy42Mi0uMS44NjktLjA2Ny4yNDYtLjE2MS40NTMtLjI3OC42MTQtLjExNy4xNjItLjI2LjI4NS0uNDIxLjM2Ni0uMzIyLjE2Mi0uNzYuMTY2LTEuMDY5LjAxNS0uMTUzLS4wNzUtLjI4Ni0uMTc1LS4zOTMtLjI5Ni0uMDg1LS4wOTYtLjE1Ni0uMjE2LS4yMTgtLjM2NyAwIDAtLjE3OS0uNDQ3LS4xNzktLjk0NyAwLS41LjE3OS0xLjAwMi4xNzktMS4wMDIuMDYyLS4xNzcuMTM2LS4zMTguMjI0LS40My4xMTQtLjE0My4yNTYtLjI1OS40MjQtLjM0NS4xNjgtLjA4Ni4zNjUtLjEyOS41ODctLjEyOS4xOSAwIC4zNjQuMDM3LjUxNy4xMDl6Ii8+PHJlY3QgeD0iLjk4NyIgeT0iMiIgY2xhc3M9InN0MiIgd2lkdGg9IjE0LjAxMyIgaGVpZ2h0PSIxLjAyMyIvPjxyZWN0IHg9Ii45ODciIHk9IjEyLjk2OCIgY2xhc3M9InN0MiIgd2lkdGg9IjE0LjAxMyIgaGVpZ2h0PSIxLjAyMyIvPjxwYXRoIGNsYXNzPSJzdDIiIGQ9Ik0xLjk5MSAxMi4wMzFsLjcyOC0yLjAzMWgyLjIxOWwuNzc4IDIuMDMxaDEuMDgybC0yLjQ4NS03LjE1OGgtLjk0MWwtMi40NDEgNy4wODYtLjAyNS4wNzJoMS4wODV6bTEuODI3LTUuNjA5aC4wMjJsLjkxNCAyLjc1M2gtMS44NDFsLjkwNS0yLjc1M3oiLz48L2c+PC9zdmc+) 50% no-repeat;
}
.monaco-custom-checkbox.monaco-regex {
    background: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHBvbHlnb24gZmlsbD0iI0Y2RjZGNiIgcG9pbnRzPSIxMy42NCw3LjM5NiAxMi4xNjksMi44OTggMTAuNzA2LDMuNzYxIDExLjA4NywyIDYuNTU3LDIgNi45MzYsMy43NjIgNS40NzMsMi44OTggNCw3LjM5NiA1LjY4Miw3LjU1NCA0LjUxMyw4LjU2MSA1LjAxMyw5IDIsOSAyLDE0IDcsMTQgNywxMC43NDcgNy45NzgsMTEuNjA2IDguODIsOS43MjUgOS42NjEsMTEuNjAyIDEzLjE0NCw4LjU2MiAxMS45NjgsNy41NTQiLz48ZyBmaWxsPSIjNDI0MjQyIj48cGF0aCBkPSJNMTIuMzAxIDYuNTE4bC0yLjc3Mi4yNjIgMi4wODYgMS43ODgtMS41OTQgMS4zOTItMS4yMDEtMi42ODItMS4yMDEgMi42ODItMS41ODMtMS4zOTIgMi4wNzUtMS43ODgtMi43NzEtLjI2Mi42OTYtMi4xMjYgMi4zNTggMS4zOTItLjU5OS0yLjc4NGgyLjA1M2wtLjYwMiAyLjc4MyAyLjM1OS0xLjM5Mi42OTYgMi4xMjd6Ii8+PHJlY3QgeD0iMyIgeT0iMTAiIHdpZHRoPSIzIiBoZWlnaHQ9IjMiLz48L2c+PC9zdmc+) 50% no-repeat;
}
.monaco-custom-checkbox {
    margin-left: 2px;
    float: left;
    cursor: pointer;
    overflow: hidden;
    width: 20px;
    height: 20px;
    border: 1px solid transparent;
    padding: 1px;
    -o-box-sizing: border-box;
    -ms-box-sizing: border-box;
    box-sizing: border-box;
    -webkit-user-select: none;
    -moz-user-select: none;
    -o-user-select: none;
    -ms-user-select: none;
    user-select: none;
}
.find-widget {
    position: absolute;
    z-index: 3;
    top: -44px;
    height: 34px;
    overflow: hidden;
    line-height: 19px;
    transition: top .2s linear;
    padding: 0 4px;
}
.find-widget .previous {
    background-image: url(data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiCgkgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIKCSB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCIgdmlld0JveD0iLTEgLTMgMTYgMTYiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgLTEgLTMgMTYgMTYiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8cG9seWdvbiBmaWxsPSIjNDI0MjQyIiBwb2ludHM9IjEzLDQgNiw0IDksMSA2LDEgMiw1IDYsOSA5LDkgNiw2IDEzLDYgIi8+Cjwvc3ZnPgo=);
}
.find-widget .next {
    background-image: url(data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiCgkgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIKCSB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCIgdmlld0JveD0iLTEgLTMgMTYgMTYiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgLTEgLTMgMTYgMTYiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8cGF0aCBmaWxsPSIjNDI0MjQyIiBkPSJNMSw0aDdMNSwxaDNsNCw0TDgsOUg1bDMtM0gxVjR6Ii8+Cjwvc3ZnPgo=);
}
.find-widget .monaco-checkbox {
    width: 20px;
    height: 20px;
    display: inline-block;
    vertical-align: middle;
    margin-left: 3px;
}
.find-widget .button {
    min-width: 20px;
    width: 20px;
    height: 20px;
    display: flex;
    display: -webkit-flex;
    flex: initial;
    margin-left: 3px;
    background-position: 50%;
    background-repeat: no-repeat;
    cursor: pointer;
}
.monaco-checkbox .checkbox {
    position: absolute;
    overflow: hidden;
    clip: rect(0 0 0 0);
    height: 1px;
    width: 1px;
    margin: -1px;
    padding: 0;
    border: 0;
}
.monaco-checkbox.label {
    content: "";
    cursor: pointer;
    display: inline-block;
    background-repeat: no-repeat;
    border: none;
    background-position: 0 0;
    background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAsLTEwMzIuMzYyMikiPgogIDxyZWN0IHdpZHRoPSI5IiBoZWlnaHQ9IjIiIHg9IjIiIHk9IjEwNDYuMzYyMiIgc3R5bGU9ImZpbGw6IzQyNDI0MjtmaWxsLW9wYWNpdHk6MTtzdHJva2U6bm9uZSIgLz4KICA8cmVjdCB3aWR0aD0iMTMiIGhlaWdodD0iMiIgeD0iMiIgeT0iMTA0My4zNjIyIiBzdHlsZT0iZmlsbDojNDI0MjQyO2ZpbGwtb3BhY2l0eToxO3N0cm9rZTpub25lIiAvPgogIDxyZWN0IHdpZHRoPSI2IiBoZWlnaHQ9IjIiIHg9IjIiIHk9IjEwNDAuMzYyMiIgc3R5bGU9ImZpbGw6IzQyNDI0MjtmaWxsLW9wYWNpdHk6MTtzdHJva2U6bm9uZSIgLz4KICA8cmVjdCB3aWR0aD0iMTIiIGhlaWdodD0iMiIgeD0iMiIgeT0iMTAzNy4zNjIyIiBzdHlsZT0iZmlsbDojNDI0MjQyO2ZpbGwtb3BhY2l0eToxO3N0cm9rZTpub25lIiAvPgo8L2c+Cjwvc3ZnPg==);
    width: 20px;
    height: 20px;
}
.monaco-checkbox.label.checked {
    background-color: rgba(0,0,0,.1);
}
.find-widget .close-fw {
    background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMyAzIDE2IDE2IiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDMgMyAxNiAxNiI+PHBvbHlnb24gZmlsbD0iIzQyNDI0MiIgcG9pbnRzPSIxMi41OTcsMTEuMDQyIDE1LjQsMTMuODQ1IDEzLjg0NCwxNS40IDExLjA0MiwxMi41OTggOC4yMzksMTUuNCA2LjY4MywxMy44NDUgOS40ODUsMTEuMDQyIDYuNjgzLDguMjM5IDguMjM4LDYuNjgzIDExLjA0Miw5LjQ4NiAxMy44NDUsNi42ODMgMTUuNCw4LjIzOSIvPjwvc3ZnPg==);
}
.find-widget .button:not(.disabled):hover {
    background-color: rgba(0,0,0,.1);
}
.find-widget .collapse {
    background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHBhdGggZmlsbD0iIzY0NjQ2NSIgZD0iTTYgNHY4bDQtNC00LTR6bTEgMi40MTRsMS41ODYgMS41ODYtMS41ODYgMS41ODZ2LTMuMTcyeiIvPjwvc3ZnPg==);
}
.find-widget .button.toggle {
    position: absolute;
    top: 0;
    left: 0;
    width: 18px;
    height: 100%;
    -o-box-sizing: border-box;
    -ms-box-sizing: border-box;
    box-sizing: border-box;
}
.find-widget .button.left {
    margin-left: 0;
    margin-right: 3px;
}
.find-widget .expand {
    background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHBhdGggZmlsbD0iIzY0NjQ2NSIgZD0iTTExIDEwLjA3aC01LjY1Nmw1LjY1Ni01LjY1NnY1LjY1NnoiLz48L3N2Zz4=);
}
.find-widget .button {
    min-width: 20px;
    width: 20px;
    height: 20px;
    display: flex;
    display: -webkit-flex;
    flex: initial;
    margin-left: 3px;
    background-position: 50%;
    background-repeat: no-repeat;
    cursor: pointer;
}
.find-widget .replace {
    background-image: url(data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iMTZweCIKCSBoZWlnaHQ9IjE2cHgiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTYgMTYiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8ZyBpZD0iaWNvbl94NUZfYmciPgoJPGc+CgkJPHBhdGggZmlsbD0iIzQyNDI0MiIgZD0iTTExLDNWMWgtMXY1djFoMWgyaDFWNFYzSDExeiBNMTMsNmgtMlY0aDJWNnoiLz4KCQk8cGF0aCBmaWxsPSIjNDI0MjQyIiBkPSJNMiwxNWg3VjlIMlYxNXogTTQsMTBoM3YxSDV2MmgydjFINFYxMHoiLz4KCTwvZz4KPC9nPgo8ZyBpZD0iY29sb3JfeDVGX2ltcG9ydGFuY2UiPgoJPHBhdGggZmlsbD0iIzAwNTM5QyIgZD0iTTMuOTc5LDMuNUw0LDZMMyw1djEuNUw0LjUsOEw2LDYuNVY1TDUsNkw0Ljk3OSwzLjVjMC0wLjI3NSwwLjIyNS0wLjUsMC41LTAuNUg5VjJINS40NzkKCQlDNC42NTEsMiwzLjk3OSwyLjY3MywzLjk3OSwzLjV6Ii8+CjwvZz4KPC9zdmc+Cg==);
}
.find-widget .replace-all {
    background-image: url(data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iMTZweCIKCSBoZWlnaHQ9IjE2cHgiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTYgMTYiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8ZyBpZD0iaWNvbl94NUZfYmciPgoJPHBhdGggZmlsbD0iIzQyNDI0MiIgZD0iTTExLDE1VjlIMXY2SDExeiBNMiwxNHYtMmgxdi0xSDJ2LTFoM3Y0SDJ6IE0xMCwxMUg4djJoMnYxSDd2LTRoM1YxMXogTTMsMTN2LTFoMXYxSDN6IE0xMyw3djZoLTFWOEg1VjcKCQlIMTN6IE0xMywyVjFoLTF2NWgzVjJIMTN6IE0xNCw1aC0xVjNoMVY1eiBNMTEsMnY0SDhWNGgxdjFoMVY0SDlWM0g4VjJIMTF6Ii8+CjwvZz4KPGcgaWQ9ImNvbG9yX3g1Rl9hY3Rpb24iPgoJPHBhdGggZmlsbD0iIzAwNTM5QyIgZD0iTTEuOTc5LDMuNUwyLDZMMSw1djEuNUwyLjUsOEw0LDYuNVY1TDMsNkwyLjk3OSwzLjVjMC0wLjI3NSwwLjIyNS0wLjUsMC41LTAuNUg3VjJIMy40NzkKCQlDMi42NTEsMiwxLjk3OSwyLjY3MywxLjk3OSwzLjV6Ii8+CjwvZz4KPC9zdmc+Cg==);
}
.monaco-inputbox>.wrapper>input {
    text-overflow: ellipsis;
}
.find-widget.replaceToggled {
    height: 64px;
}
.ace_button.checked {
    border-color: #3399ff;
}
`;
var HashHandler = require("../keyboard/hash_handler").HashHandler;
var keyUtil = require("../lib/keys");

var MAX_COUNT = 999;

dom.importCssString(searchboxCss, "ace_searchbox");

var html = `<div class="editor-widget find-widget visible" style="z-index: 99;box-shadow: 0 2px 8px #a8a8a8;background-color: #efeff2;width: 411px; position: absolute; max-width: 735px; top: 0px; right: 10px;">
<div title="切换替换模式" action="toggleReplace" tabindex="0" class="button toggle left collapse editortip" role="button"></div>
<div class="find-part ace_search_form">
    <div class="monaco-findInput" style="width: 221px;">
        <div class="monaco-inputbox idle" style="background-color: rgb(255, 255, 255); color: rgb(97, 97, 97);">
            <div class="wrapper">
                <input class="input ace_search_field editortip" spellcheck="false" type="text" placeholder="查找" title="查找" style="width: 155px; background-color: rgb(255, 255, 255); color: rgb(97, 97, 97);">
            </div>
        </div>
        <div class="controls">
            <div action="toggleCaseSensitive" title="区分大小写 (Alt+C)" class="editortip ace_button monaco-custom-checkbox monaco-case-sensitive unchecked" role="checkbox"></div>
            <div action="toggleWholeWords" title="全字匹配 (Alt+W)" class="editortip ace_button monaco-custom-checkbox monaco-whole-word unchecked" role="checkbox" tabindex="0"></div>
            <div action="toggleRegexpMode" title="使用正则表达式 (Alt+R)" class="editortip ace_button monaco-custom-checkbox monaco-regex unchecked" role="checkbox" tabindex="0"></div>
        </div>
    </div>
    <div class="editortip matchesCount ace_search_counter" title="" style="min-width: 69px;">无结果</div>
    <div title="上一个匹配(Shift+F3)" action="findPrev" tabindex="-1" class="editortip button previous disabled" role="button"></div>
    <div title="下一个匹配(F3)" action="findNext tabindex="-1" class="editortip button next disabled" role="button"></div>
    <div class="editortip monaco-checkbox ace_button label" action="searchInSelection" title="在选定内容中查找" tabindex="-1"></div>
    <div title="关闭 (Esc)" action="hide" tabindex="0" class="editortip button close-fw" role="button"></div>
</div>
<div class="replace-part ace_replace_form">
    <div class="replace-input">
        <div class="monaco-inputbox idle" style="background-color: rgb(255, 255, 255); color: rgb(97, 97, 97);">
            <div class="wrapper">
                <input class="editortip input ace_search_field" spellcheck="false" type="text" placeholder="替换" title="替换" style="background-color: rgb(255, 255, 255); color: rgb(97, 97, 97); width: 227px;">
            </div>
        </div>
    </div>
    <div title="替换 (Alt+Return)" action="replaceAndFindNext" tabindex="-1" class="editortip button replace disabled" role="button"></div>
    <div title="全部替换 (Ctrl+Alt+Return)" action="replaceAll" tabindex="-1" class="editortip button replace-all disabled" role="button"></div>
</div>
</div>`;

var SearchBox = function(editor, range, showReplaceForm) {
    var div = dom.createElement("div");
    div.innerHTML = html;
    this.element = div.firstChild;
    
    this.setSession = this.setSession.bind(this);

    this.$init();
    this.setEditor(editor);
};

(function() {
    this.setEditor = function(editor) {
        editor.searchBox = this;
        editor.renderer.scroller.appendChild(this.element);
        this.editor = editor;
    };
    
    this.setSession = function(e) {
        this.searchRange = null;
        this.$syncOptions(true);
    };

    this.$initElements = function(sb) {
        this.findWidget = sb;
        this.searchBox = sb.querySelector(".ace_search_form");
        this.replaceBox = sb.querySelector(".ace_replace_form");
        this.searchOption = sb.querySelector("[action=searchInSelection]");
        this.replaceOption = sb.querySelector("[action=toggleReplace]");
        this.regExpOption = sb.querySelector("[action=toggleRegexpMode]");
        this.caseSensitiveOption = sb.querySelector("[action=toggleCaseSensitive]");
        this.wholeWordOption = sb.querySelector("[action=toggleWholeWords]");
        this.searchInput = this.searchBox.querySelector(".ace_search_field");
        this.replaceInput = this.replaceBox.querySelector(".ace_search_field");
        this.searchCounter = sb.querySelector(".ace_search_counter");
    };
    
    this.$init = function() {
        var sb = this.element;
        
        this.$initElements(sb);
        
        var _this = this;
        event.addListener(sb, "mousedown", function(e) {
            setTimeout(function(){
                _this.activeInput.focus();
            }, 0);
            event.stopPropagation(e);
        });
        event.addListener(sb, "click", function(e) {
            var t = e.target || e.srcElement;
            var action = t.getAttribute("action");
            if (action && _this[action])
                _this[action]();
            else if (_this.$searchBarKb.commands[action])
                _this.$searchBarKb.commands[action].exec(_this);
            event.stopPropagation(e);
        });

        event.addCommandKeyListener(sb, function(e, hashId, keyCode) {
            var keyString = keyUtil.keyCodeToString(keyCode);
            var command = _this.$searchBarKb.findKeyCommand(hashId, keyString);
            if (command && command.exec) {
                command.exec(_this);
                event.stopEvent(e);
            }
        });

        this.$onChange = lang.delayedCall(function() {
            _this.find(false, false);
        });

        event.addListener(this.searchInput, "input", function() {
            _this.$onChange.schedule(20);
        });
        event.addListener(this.searchInput, "focus", function() {
            _this.activeInput = _this.searchInput;
            _this.searchInput.value && _this.highlight();
        });
        event.addListener(this.replaceInput, "focus", function() {
            _this.activeInput = _this.replaceInput;
            _this.searchInput.value && _this.highlight();
        });
    };
    this.$closeSearchBarKb = new HashHandler([{
        bindKey: "Esc",
        name: "closeSearchBar",
        exec: function(editor) {
            editor.searchBox.hide();
        }
    }]);
    this.$searchBarKb = new HashHandler();
    this.$searchBarKb.bindKeys({
        "Ctrl-f|Command-f": function(sb) {
            var isReplace = sb.isReplace = !sb.isReplace;
            sb.replaceBox.style.display = isReplace ? "" : "none";
            sb.replaceOption.checked = false;
            sb.$syncOptions();
            sb.searchInput.focus();
        },
        "Ctrl-H|Command-Option-F": function(sb) {
            sb.replaceOption.checked = true;
            sb.$syncOptions();
            sb.replaceInput.focus();
        },
        "F3": function(sb) {
            sb.findNext();
        },
        "Shift-F3": function(sb) {
            sb.findPrev();
        },
        "esc": function(sb) {
            setTimeout(function() { sb.hide();});
        },
        "Return": function(sb) {
            if (sb.activeInput == sb.replaceInput)
                sb.replace();
            sb.findNext();
        },
        "Shift-Return": function(sb) {
            if (sb.activeInput == sb.replaceInput)
                sb.replace();
            sb.findPrev();
        },
        "Ctrl+Alt+Return": function(sb) {
            if (sb.activeInput == sb.replaceInput)
                sb.replaceAll();
            sb.findAll();
        },
        "Alt-Return": function(sb) {
            if (sb.activeInput == sb.replaceInput)
                sb.replaceAndFindNext();
        },
        "Tab": function(sb) {
            (sb.activeInput == sb.replaceInput ? sb.searchInput : sb.replaceInput).focus();
        }
    });

    this.$searchBarKb.addCommands([{
        name: "toggleRegexpMode",
        bindKey: {win: "Alt-R|Alt-/", mac: "Ctrl-Alt-R|Ctrl-Alt-/"},
        exec: function(sb) {
            sb.regExpOption.checked = !sb.regExpOption.checked;
            sb.$syncOptions();
        }
    }, {
        name: "toggleCaseSensitive",
        bindKey: {win: "Alt-C|Alt-I", mac: "Ctrl-Alt-R|Ctrl-Alt-I"},
        exec: function(sb) {
            sb.caseSensitiveOption.checked = !sb.caseSensitiveOption.checked;
            sb.$syncOptions();
        }
    }, {
        name: "toggleWholeWords",
        bindKey: {win: "Alt-B|Alt-W", mac: "Ctrl-Alt-B|Ctrl-Alt-W"},
        exec: function(sb) {
            sb.wholeWordOption.checked = !sb.wholeWordOption.checked;
            sb.$syncOptions();
        }
    }, {
        name: "toggleReplace",
        exec: function(sb) {
            sb.replaceOption.checked = !sb.replaceOption.checked;
            sb.$syncOptions();
        }
    }, {
        name: "searchInSelection",
        exec: function(sb) {
            sb.searchOption.checked = !sb.searchRange;
            sb.setSearchRange(sb.searchOption.checked && sb.editor.getSelectionRange());
            sb.$syncOptions();
        }
    }]);
    
    this.setSearchRange = function(range) {
        this.searchRange = range;
        if (range) {
            this.searchRangeMarker = this.editor.session.addMarker(range, "ace_active-line");
        } else if (this.searchRangeMarker) {
            this.editor.session.removeMarker(this.searchRangeMarker);
            this.searchRangeMarker = null;
        }
    };

    this.$syncOptions = function(preventScroll) {
        dom.setCssClass(this.replaceOption, "checked", this.searchRange);
        dom.setCssClass(this.searchOption, "checked", this.searchOption.checked);
        // this.replaceOption.textContent = this.replaceOption.checked ? "-" : "+";

        if(this.replaceOption.checked) {
            this.replaceOption.classList.remove("collapse");
            this.replaceOption.classList.add("expand");
            this.findWidget.classList.add("replaceToggled");
            this.replaceBox.style.display = "-webkit-flex";
        }
        else{
            this.replaceOption.classList.remove("expand");
            this.replaceOption.classList.add("collapse");
            this.findWidget.classList.remove("replaceToggled");
            this.replaceBox.style.display = "none";
        }

        dom.setCssClass(this.regExpOption, "checked", this.regExpOption.checked);
        dom.setCssClass(this.wholeWordOption, "checked", this.wholeWordOption.checked);
        dom.setCssClass(this.caseSensitiveOption, "checked", this.caseSensitiveOption.checked);
        // this.replaceBox.style.display = this.replaceOption.checked ? "" : "none";
        this.find(false, false, preventScroll);
    };

    this.highlight = function(re) {
        this.editor.session.highlight(re || this.editor.$search.$options.re);
        this.editor.renderer.updateBackMarkers();
    };
    this.find = function(skipCurrent, backwards, preventScroll) {
        var range = this.editor.find(this.searchInput.value, {
            skipCurrent: skipCurrent,
            backwards: backwards,
            wrap: true,
            regExp: this.regExpOption.checked,
            caseSensitive: this.caseSensitiveOption.checked,
            wholeWord: this.wholeWordOption.checked,
            preventScroll: preventScroll,
            range: this.searchRange
        });
        var noMatch = !range && this.searchInput.value;
        dom.setCssClass(this.searchBox, "ace_nomatch", noMatch);
        this.editor._emit("findSearchBox", { match: !noMatch });
        this.highlight();
        this.updateCounter();
    };
    this.updateCounter = function() {
        var editor = this.editor;
        var regex = editor.$search.$options.re;
        var all = 0;
        var before = 0;
        if (regex) {
            var value = this.searchRange
                ? editor.session.getTextRange(this.searchRange)
                : editor.getValue();
            
            var offset = editor.session.doc.positionToIndex(editor.selection.anchor);
            if (this.searchRange)
                offset -= editor.session.doc.positionToIndex(this.searchRange.start);
                
            var last = regex.lastIndex = 0;
            var m;
            while ((m = regex.exec(value))) {
                all++;
                last = m.index;
                if (last <= offset)
                    before++;
                if (all > MAX_COUNT)
                    break;
                if (!m[0]) {
                    regex.lastIndex = last += 1;
                    if (last >= value.length)
                        break;
                }
            }
        }
        if(before == 0){
            this.searchCounter.textContent = "无结果";
        }
        else{
            this.searchCounter.textContent = before + "/" + (all > MAX_COUNT ? MAX_COUNT + "+" : all);
        }
    };
    this.findNext = function() {
        this.find(true, false);
    };
    this.findPrev = function() {
        this.find(true, true);
    };
    this.findAll = function(){
        var range = this.editor.findAll(this.searchInput.value, {            
            regExp: this.regExpOption.checked,
            caseSensitive: this.caseSensitiveOption.checked,
            wholeWord: this.wholeWordOption.checked
        });
        var noMatch = !range && this.searchInput.value;
        dom.setCssClass(this.searchBox, "ace_nomatch", noMatch);
        this.editor._emit("findSearchBox", { match: !noMatch });
        this.highlight();
        this.hide();
    };
    this.replace = function() {
        if (!this.editor.getReadOnly())
            this.editor.replace(this.replaceInput.value);
    };    
    this.replaceAndFindNext = function() {
        if (!this.editor.getReadOnly()) {
            this.editor.replace(this.replaceInput.value);
            this.findNext();
        }
    };
    this.replaceAll = function() {
        if (!this.editor.getReadOnly())
            this.editor.replaceAll(this.replaceInput.value);
    };

    this.hide = function() {
        this.active = false;
        this.setSearchRange(null);
        this.editor.off("changeSession", this.setSession);
        
        this.element.style.display = "none";
        this.editor.keyBinding.removeKeyboardHandler(this.$closeSearchBarKb);
        this.editor.focus();
    };
    this.show = function(value, isReplace) {
        this.active = true;
        this.editor.on("changeSession", this.setSession);
        this.element.style.display = "";
        this.replaceOption.checked = isReplace;
        
        if (value)
            this.searchInput.value = value;
        
        this.searchInput.focus();
        this.searchInput.select();

        this.editor.keyBinding.addKeyboardHandler(this.$closeSearchBarKb);
        
        this.$syncOptions(true);
    };

    this.isFocused = function() {
        var el = document.activeElement;
        return el == this.searchInput || el == this.replaceInput;
    };
}).call(SearchBox.prototype);

exports.SearchBox = SearchBox;

exports.Search = function(editor, isReplace) {
    var sb = editor.searchBox || new SearchBox(editor);
    sb.show(editor.session.getTextRange(), isReplace);
};

});
                (function() {
                    window.require(["ace/ext/searchbox"], function(m) {
                        if (typeof module == "object" && typeof exports == "object" && module) {
                            module.exports = m;
                        }
                    });
                })();
            