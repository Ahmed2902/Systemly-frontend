// src/modules/wizard/components/FaqEditor.tsx
"use client";

import { Plus, Trash2 } from "lucide-react";
import { useWizard } from "../wizard.context";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function FaqEditor() {
  const { state, patch } = useWizard();

  function addFaq() {
    patch({
      faqs: [...state.faqs, { clientId: uid(), question: "", answer: "" }],
    });
  }

  function updateFaq(
    clientId: string,
    field: "question" | "answer",
    value: string,
  ) {
    patch({
      faqs: state.faqs.map((f) =>
        f.clientId === clientId ? { ...f, [field]: value } : f,
      ),
    });
  }

  function removeFaq(clientId: string) {
    patch({ faqs: state.faqs.filter((f) => f.clientId !== clientId) });
  }

  return (
    <div className="space-y-3">
      {state.faqs.map((faq) => (
        <div
          key={faq.clientId}
          className="space-y-2 rounded-lg border border-surface-border bg-surface-1 p-3"
        >
          <div className="flex items-center gap-2">
            <input
              value={faq.question}
              onChange={(e) =>
                updateFaq(faq.clientId, "question", e.target.value)
              }
              placeholder="Question"
              className="flex-1 rounded-md border border-surface-border bg-surface-2 px-3 py-1.5 text-sm text-foreground"
            />
            <button
              onClick={() => removeFaq(faq.clientId)}
              className="text-muted hover:text-red-400"
            >
              <Trash2 size={15} />
            </button>
          </div>
          <textarea
            value={faq.answer}
            onChange={(e) => updateFaq(faq.clientId, "answer", e.target.value)}
            placeholder="Answer"
            rows={2}
            className="w-full rounded-md border border-surface-border bg-surface-2 px-3 py-1.5 text-sm text-foreground"
          />
        </div>
      ))}

      <button
        onClick={addFaq}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-surface-border py-2.5 text-sm text-muted transition-colors hover:border-surface-border-strong hover:text-foreground"
      >
        <Plus size={15} /> Add question
      </button>
    </div>
  );
}
