using System;

namespace HandyPyditor.Control
{
    public interface IBrowser
    {
        void ExecuteJavascript(string scriptName, params string[] args);

        void EvaluateJavascript(string scriptName, Action<string, Exception> callback, params string[] args);
    }
}