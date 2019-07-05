using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Windows;
using GalaSoft.MvvmLight.Messaging;
using HandyPyditor.Data;
using Microsoft.Win32;
using Python.Runtime;
using MessageBox = HandyControl.Controls.MessageBox;

namespace HandyPyditor.Tools
{
    /// <summary>
    ///     编辑器文件帮助类
    /// </summary>
    internal class FileHelper
    {
        private const string FormatModuleName = "yapf.yapflib.yapf_api";

        public FileSystemWatcher FileSystemWatcher { get; } = new FileSystemWatcher { Filter = "*.py" };

        private readonly EditorUiInfo _editorUiInfo;

        public Dictionary<string, string> FileNameDic { get; set; } = new Dictionary<string, string>();

        public FileHelper(EditorUiInfo editorUiInfo)
        {
            _editorUiInfo = editorUiInfo;
            FileSystemWatcher.Created += FileSystemWatcher_Created;
        }

        /// <summary>
        ///     当在指定的目录发现了新的脚本文件时触发
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void FileSystemWatcher_Created(object sender, FileSystemEventArgs e)
        {
            Application.Current.Dispatcher.BeginInvoke(new Action(() =>
            {
                FileSystemWatcher.EnableRaisingEvents = false;
                Messenger.Default.Send<object>(null, MessageToken.RefreshAllWorkItems);
                Messenger.Default.Send(e.FullPath, MessageToken.SelectWorkItem);
            }));
        }

        /// <summary>
        ///     格式化代码
        /// </summary>
        /// <param name="code"></param>
        public void FormatCode(ref string code)
        {
            using (Py.GIL())
            {
                dynamic api = Py.Import(FormatModuleName);

                try
                {
                    var str = api.FormatCode(code).ToString();
                    var s = new StringBuilder(str);
                    var index = str.LastIndexOf('\'');
                    s.Remove(index, str.Length - index);
                    s.Remove(0, 2);
                    _editorUiInfo.Browser.ExecuteJavascript("setCode", s.ToString());
                }
                catch (Exception e)
                {
                    Messenger.Default.Send(e.Message, MessageToken.AppendDebugText);
                }
            }
        }

        /// <summary>
        ///     保存代码
        /// </summary>
        /// <param name="savePath"></param>
        /// <param name="activeTabName"></param>
        /// <param name="code"></param>
        /// <remarks>考虑到一个脚本中一般含有较多的字符，所以使用ref避免字符串作参时的值拷贝</remarks>
        public string SaveCode(string savePath, string activeTabName, ref string code)
        {
            if (!File.Exists(savePath))
            {
                var saveFileDialog = new SaveFileDialog
                {
                    Filter = "Python files|*.py",
                    FilterIndex = 2,
                    RestoreDirectory = true,
                    FileName = "Untitled-1.py"
                };

                if (saveFileDialog.ShowDialog() == true)
                {
                    savePath = saveFileDialog.FileName;

                    Messenger.Default.Send(savePath, MessageToken.UpdateScriptName);
                    FileNameDic[activeTabName] = saveFileDialog.FileName;
                    var path = saveFileDialog.FileName.Replace('\\', '/');
                    _editorUiInfo.Browser.ExecuteJavascript("setFileInfo", activeTabName, path, Path.GetFileName(saveFileDialog.FileName));

                    FileSystemWatcher.Path = Path.GetDirectoryName(saveFileDialog.FileName);
                    FileSystemWatcher.EnableRaisingEvents = true;
                }
                else
                {
                    return string.Empty;
                }
            }
            try
            {
                using (var sw = new StreamWriter(savePath))
                {
                    sw.Write(code);
                }

                return savePath;
            }
            catch (Exception e)
            {
                Messenger.Default.Send(e.Message, MessageToken.AppendDebugText);
                return string.Empty;
            }
        }

        /// <summary>
        ///     打开文件
        /// </summary>
        public void OpenFile()
        {
            var openFileDialog = new OpenFileDialog
            {
                Filter = "Python files|*.py",
                RestoreDirectory = true
            };

            if (openFileDialog.ShowDialog() == true)
            {
                OpenFile(openFileDialog.FileName);
            }
        }

        /// <summary>
        ///     打开文件
        /// </summary>
        public void OpenFile(string fileName)
        {
            foreach (var info in FileNameDic)
            {
                if (info.Value.Equals(fileName))
                {
                    _editorUiInfo.Browser.ExecuteJavascript("jumpToTab", info.Key);
                    return;
                }
            }
            var code = File.ReadAllText(fileName);
            var path = fileName.Replace('\\', '/');
            _editorUiInfo.Browser.ExecuteJavascript("openFile", Path.GetFileName(fileName), path, code);
        }

        /// <summary>
        ///     代码另存为
        /// </summary>
        public void CodeSaveAs(string activeTabName, ref string code)
        {
            var saveFileDialog = new SaveFileDialog
            {
                Filter = "Python files|*.py",
                FilterIndex = 2,
                RestoreDirectory = true,
                FileName = "Untitled-1.py"
            };

            if (saveFileDialog.ShowDialog() == true)
            {
                FileSystemWatcher.Path = Path.GetDirectoryName(saveFileDialog.FileName);
                FileSystemWatcher.EnableRaisingEvents = true;

                if (FileNameDic.Values.Contains(saveFileDialog.FileName))
                {
                    MessageBox.Show(Properties.Langs.Lang.ScriptIsOpen);
                    return;
                }

                using (var sw = new StreamWriter(saveFileDialog.FileName))
                {
                    sw.Write(code);
                    Messenger.Default.Send(saveFileDialog.FileName, MessageToken.UpdateScriptName);

                    FileNameDic[activeTabName] = saveFileDialog.FileName;
                    var path = saveFileDialog.FileName.Replace('\\', '/');
                    _editorUiInfo.Browser.ExecuteJavascript("setFileInfo", activeTabName, path, Path.GetFileName(saveFileDialog.FileName));
                }
            }
        }

        /// <summary>
        ///     关闭前保存
        /// </summary>
        public void SaveBeforeClose(string savePath)
        {
            _editorUiInfo.Browser.EvaluateJavascript("getSaveInfo", (value, exception) =>
            {
                if (value == null) return;
                SaveInfoModel.Save(ref value);
            });
            if (!string.IsNullOrEmpty(savePath) && File.Exists(savePath))
            {
                _editorUiInfo.Browser.EvaluateJavascript("getCode", (value, exception) =>
                {
                    if (value == null || !File.Exists(savePath)) return;
                    using (var sw = new StreamWriter(savePath))
                    {
                        sw.Write(value);
                    }
                });
            }
        }
    }
}