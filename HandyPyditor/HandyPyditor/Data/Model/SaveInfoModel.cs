using System;
using System.IO;
using System.Windows;
using Newtonsoft.Json;
using MessageBox = HandyControl.Controls.MessageBox;

namespace HandyPyditor.Data
{
    public class SaveInfoModel
    {
        [JsonIgnore]
        private static readonly string _saveInfoPath = $"{AppDomain.CurrentDomain.BaseDirectory}components\\editor\\js\\saveInfo.js";

        [JsonProperty(PropertyName = "code")]
        public string Code { get; set; }

        [JsonProperty(PropertyName = "cursorPos")]
        public Point CursorPos { get; set; }

        [JsonProperty(PropertyName = "path")]
        public string Path { get; set; }

        [JsonProperty(PropertyName = "selected")]
        public string Selected { get; set; }

        [JsonProperty(PropertyName = "title")]
        public string Title { get; set; }

        public static bool Save(ref string info)
        {
            try
            {
                File.WriteAllText(_saveInfoPath, info);
                return true;
            }
            catch (Exception e)
            {
                MessageBox.Show(e.Message);
                return false;
            }
        }
    }
}