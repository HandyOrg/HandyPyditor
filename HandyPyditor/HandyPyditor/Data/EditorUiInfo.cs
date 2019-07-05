using System.Windows.Controls;
using System.Windows.Controls.Primitives;
using HandyPyditor.Control;

namespace HandyPyditor.Data
{
    public class EditorUiInfo
    {
        public ColumnDefinition DefinitionWork { get; set; }

        public ColumnDefinition DefinitionScript { get; set; }

        public RowDefinition DefinitionDebug { get; set; }

        public GridSplitter SplitterWork { get; set; }

        public IBrowser Browser { get; set; }

        public TreeView TreeViewWork { get; set; }

        public Popup PopupMenu { get; set; }

        public Grid GridMain { get; set; }

        public TextBox TextBoxDebug { get; set; }
    }
}