using System;
using Microsoft.Toolkit.Wpf.UI.Controls;

namespace HandyPyditor.Control
{
    public class BrowserWrapper : IBrowser
    {
        private readonly WebView _webView;

        public BrowserWrapper(WebView webView)
        {
            _webView = webView;
        }

        public void ExecuteJavascript(string scriptName, params string[] args)
        {
            _webView.InvokeScript(scriptName, args);
        }

        public void EvaluateJavascript(string scriptName, Action<string, Exception> callback, params string[] args)
        {
            try
            {
                var value = _webView.InvokeScript(scriptName, args);
                callback.Invoke(value, null);
            }
            catch (Exception e)
            {
                callback.Invoke(null, e);
            }
        }
    }
}