using HandyPyditor.Data;

namespace HandyPyditor.Window
{
    public class ConfigWindow : HandyControl.Controls.Window
    {
        protected EditorConfig _editorConfig;

        public ConfigWindow(EditorConfig config)
        {
            _editorConfig = config;
        }
    }
}