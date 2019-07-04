using System;
using System.Runtime.InteropServices;

namespace HandyPyditor.Tools
{
    public class Win32
    {
        public struct Point
        {
            public int X;

            public int Y;

            public Point(int x, int y)
            {
                X = x;
                Y = y;
            }
        }

        /// <summary>   
        /// 获取鼠标的坐标   
        /// </summary>   
        [DllImport("user32.dll", CharSet = CharSet.Auto)]
        public static extern bool GetCursorPos(out Point point);

        [DllImport("kernel32.dll")]
        public static extern bool GenerateConsoleCtrlEvent(int dwCtrlEvent, int dwProcessGroupId);

        [DllImport("kernel32.dll")]
        public static extern bool SetConsoleCtrlHandler(IntPtr handlerRoutine, bool add);

        [DllImport("kernel32.dll")]
        public static extern bool AttachConsole(int dwProcessId);
    }
}