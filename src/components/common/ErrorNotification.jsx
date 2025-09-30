"use client";
import { useEffect } from "react";
import Swal from "sweetalert2";

export default function ErrorNotification({ error, onClose }) {
  useEffect(() => {
    if (error) {
      Swal.fire({
        title: "Error",
        text: error,
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#ef4444",
        background: "#1f2937",
        color: "#ffffff",
        customClass: {
          popup: "border border-red-500/20 font-secondary",
          title: "text-red-400 font-secondary",
          content: "text-gray-300 font-secondary",
          confirmButton:
            "bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-2 rounded-lg transition-colors font-secondary",
        },
      }).then(() => {
        if (onClose) {
          onClose();
        }
      });
    }
  }, [error, onClose]);

  return null;
}
