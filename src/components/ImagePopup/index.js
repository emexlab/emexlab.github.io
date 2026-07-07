import React, { useState, useEffect } from "react";
import styles from './styles.module.css';

export default function ImagePopup({ src, alt = "", className = "", style = {} }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    if (open) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={className}
        style={{
          cursor: "pointer",
          ...style,
        }}
        onClick={() => setOpen(true)}
      />

      {open && (
        <div onClick={() => setOpen(false)} className={styles.popup}>
          <button onClick={() => setOpen(false)}>X</button>
          <img
            src={src}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
          />
          <span onClick={(e) => e.stopPropagation()}>{alt}</span>
        </div>
      )}
    </>
  );
}