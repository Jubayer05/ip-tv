"use client";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

const RichTextEditor = ({ value, onChange, placeholder, className = "" }) => {
  const [content, setContent] = useState(value || "");

  const options = [
    "bold",
    "italic",
    "underline",
    "strikethrough",
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
    "image",
    "|",
    "undo",
    "redo",
  ];

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: placeholder || "Start typing...",
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
      height: 300,
      theme: "default",
      spellcheck: true,
      language: "en",
      showCharsCounter: false,
      showWordsCounter: false,
      showXPathInStatusbar: false,
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      uploader: {
        insertImageAsBase64URI: true,
      },
      style: {
        background: "#ffffff",
        color: "#000000",
      },
    }),
    [placeholder]
  );

  const handleChange = useCallback(
    (newContent) => {
      setContent(newContent);
      if (onChange) {
        onChange(newContent);
      }
    },
    [onChange]
  );

  return (
    <div className={className}>
      <div className="jodit-tailwind-wrapper">
        <JoditEditor config={config} value={content} onChange={handleChange} />
      </div>
    </div>
  );
};

export default RichTextEditor;
