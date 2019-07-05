using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using GalaSoft.MvvmLight.Messaging;
using HandyControl.Controls;
using Newtonsoft.Json;

namespace HandyPyditor.Data
{
    /// <summary>
    ///     编辑器配置
    /// </summary>
    public class EditorConfig
    {
        [JsonIgnore]
        private readonly string _configPath = $"{AppDomain.CurrentDomain.BaseDirectory}components\\editor\\js\\config.js";

        [JsonProperty(PropertyName = "variableJson")]
        public Dictionary<string, Dictionary<string, List<VariableConfig>>> VariableJson { get; set; }

        [JsonProperty(PropertyName = "tokenJson")]
        public TokenConfig TokenJson { get; set; }

        [JsonProperty(PropertyName = "builtinFunctions")]
        public string BuiltinFunctions { get; set; }

        [JsonProperty(PropertyName = "snippetText")]
        public string SnippetText { get; set; }

        [JsonProperty(PropertyName = "customJson")]
        public CustomConfig CustomJson { get; set; } = new CustomConfig();

        public string WorkGroundPath { get; set; }

        public bool Save()
        {
            try
            {
                var json = new StringBuilder(JsonConvert.SerializeObject(this));
                json.Insert(0, "var editorConfig = ");
                var jsonStr = json.ToString();
                return Save(ref jsonStr);
            }
            catch (Exception e)
            {
                PopupWindow.ShowDialog(e.Message);
                return false;
            }
        }

        public bool Save(ref string info)
        {
            try
            {
                using (var sw = new StreamWriter(_configPath))
                {
                    sw.Write(info);
                }

                return true;
            }
            catch (Exception e)
            {
                PopupWindow.ShowDialog(e.Message);
                return false;
            }
        }

        /// <summary>
        ///     更新
        /// </summary>
        public void Update()
        {
            if (File.Exists(_configPath))
            {
                try
                {
                    var json = File.ReadAllText(_configPath);
                    var symbolIndex = json.IndexOf('{');
                    json = json.Substring(symbolIndex, json.Length - symbolIndex);
                    var config = JsonConvert.DeserializeObject<EditorConfig>(json);

                    Update(config);
                }
                catch
                {
                    Update(new EditorConfig());
                }
            }
            else
            {
                Update(new EditorConfig());
            }

            Messenger.Default.Send<object>(null, MessageToken.LoadUrl);
        }

        private void Update(EditorConfig config)
        {
            VariableJson = config.VariableJson;
            TokenJson = config.TokenJson;
            BuiltinFunctions = config.BuiltinFunctions;
            SnippetText = config.SnippetText;
            CustomJson = config.CustomJson ?? new CustomConfig();
            WorkGroundPath = config.WorkGroundPath;
        }
    }
}