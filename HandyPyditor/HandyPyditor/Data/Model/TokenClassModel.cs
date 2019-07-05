using System.Collections.Generic;

namespace HandyPyditor.Data
{
    public class TokenClassModel
    {
        public string ClassName { get; set; }

        public string ClassCaption { get; set; }

        public Dictionary<string, string> MethodDic { get; set; } = new Dictionary<string, string>();
    }
}