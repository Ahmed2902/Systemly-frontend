"use client";

import { forwardRef, InputHTMLAttributes, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { usePlatformText } from "@/i18n/usePlatformText";

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField({ className = "", ...props }, ref) {
    const [visible, setVisible] = useState(false);
    const text = usePlatformText();

    return (
      <div className="auth-input-wrap">
        <input
          {...props}
          ref={ref}
          type={visible ? "text" : "password"}
          className={`auth-input has-action ${className}`.trim()}
        />
        <button
          type="button"
          className="auth-password-toggle"
          onClick={() => setVisible((value) => !value)}
          aria-label={text(visible ? "Hide password" : "Show password")}
          aria-pressed={visible}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    );
  },
);
