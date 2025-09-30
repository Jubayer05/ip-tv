import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

const RichTextEditor = ({ value, title, onDataChange }) => {
  const [content, setContent] = useState(value || "");

  // Update content when value prop changes
  useEffect(() => {
    setContent(value || "");
  }, [value]);

  // Call onDataChange when content changes, but only if it's different
  useEffect(() => {
    if (onDataChange && content !== value) {
      onDataChange(content);
    }
  }, [content]); // Remove onDataChange from dependencies to prevent infinite loop

  const options = [
    "bold",
    "italic",
    "|",
    "ul",
    "ol",
    "|",
    "font",
    "fontsize",
    "|",
    "outdent",
    "indent",
    "align",
    "|",
    "hr",
    "|",
    "fullsize",
    "brush",
    "|",
    "table",
    "link",
    "|",
    "undo",
    "redo",
  ];

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: "Start typing...",
      defaultActionOnPaste: "insert_as_html",
      defaultLineHeight: 1.5,
      enter: "div",
      buttons: options,
      buttonsMD: options,
      buttonsSM: options,
      buttonsXS: options,
      statusbar: false,
      sizeLG: 900,
      sizeMD: 700,
      sizeSM: 400,
      toolbarAdaptive: false,
      theme: "dark",
      color: "#ffffff",
      background: "#000000",
      editorBackground: "#000000",
      editorTextColor: "#ffffff",
      toolbarBackground: "#1f2937",
      toolbarColor: "#ffffff",
    }),
    []
  );

  return (
    <div className="mt-5">
      <div className="jodit-tailwind-wrapper">
        <style jsx>{`
          .jodit-tailwind-wrapper :global(.jodit-container) {
            background-color: #000000 !important;
            color: #ffffff !important;
          }
          .jodit-tailwind-wrapper :global(.jodit-wysiwyg) {
            background-color: #000000 !important;
            color: #ffffff !important;
          }
          .jodit-tailwind-wrapper :global(.jodit-toolbar) {
            background-color: #1f2937 !important;
            border-color: #374151 !important;
          }
          .jodit-tailwind-wrapper :global(.jodit-toolbar-button) {
            color: #ffffff !important;
          }
          .jodit-tailwind-wrapper :global(.jodit-toolbar-button:hover) {
            background-color: #374151 !important;
          }
        `}</style>
        <JoditEditor
          config={config}
          value={content}
          onChange={(newContent) => setContent(newContent)}
        />
      </div>
    </div>
  );
};

export default RichTextEditor;
