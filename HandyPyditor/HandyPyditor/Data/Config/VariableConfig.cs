using Newtonsoft.Json;

namespace HandyPyditor.Data
{
    /// <summary>
    ///     变量配置窗口
    /// </summary>
    public class VariableConfig
    {
        [JsonProperty(PropertyName = "value")]
        public string Value { get; set; }

        [JsonProperty(PropertyName = "caption")]
        public string Caption { get; set; }
    }
}