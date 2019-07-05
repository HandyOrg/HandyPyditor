using Newtonsoft.Json;

namespace HandyPyditor.Data
{
    /// <summary>
    ///     用户自定义配置
    /// </summary>
    public class CustomConfig
    {
        [JsonProperty(PropertyName = "fontSize")]
        public int FontSize { get; set; } = 12;

        [JsonProperty(PropertyName = "fontFamily")]
        public string FontFamily { get; set; } = "Consolas";

        [JsonProperty(PropertyName = "themeName")]
        public string ThemeName { get; set; } = "xcode";

        [JsonProperty(PropertyName = "powerMode")]
        public bool PowerMode { get; set; }
    }
}