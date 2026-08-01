"use client";

import { LanguageSwitcher } from "./LanguageSwitcher";

export function PlatformLanguageControl() {
  return (
    <div className="systemly-language-control" data-platform-language-control>
      <LanguageSwitcher compact />
    </div>
  );
}
