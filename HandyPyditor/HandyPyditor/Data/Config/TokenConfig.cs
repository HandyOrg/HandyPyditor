using System.Collections.Generic;
using Newtonsoft.Json;

namespace HandyPyditor.Data
{
    /// <summary>
    ///     标记配置
    /// </summary>
    public class TokenConfig
    {
        [JsonProperty(PropertyName = "classTokens")]
        public Dictionary<string, string> ClassTokens { get; set; }

        [JsonProperty(PropertyName = "methodTokens")]
        public Dictionary<string, string> MethodTokens { get; set; }
    }
}