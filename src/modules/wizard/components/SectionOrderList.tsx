// src/modules/wizard/components/SectionOrderList.tsx
"use client";

import { GripVertical } from "lucide-react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useWizard } from "../wizard.context";

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero",
  services: "Services / treatments",
  team: "Artists / doctors",
  gallery: "Our space",
  why: "Why choose us",
  process: "Booking process",
  about: "About",
  faq: "FAQ",
  contact: "Contact",
};

function SortableItem({ id }: { id: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex cursor-grab items-center gap-3 rounded-lg border border-surface-border bg-surface-1 px-3 py-2.5 transition-colors hover:border-surface-border-strong active:cursor-grabbing"
    >
      <GripVertical size={15} className="text-muted" />
      <span className="text-sm text-foreground">{SECTION_LABELS[id] ?? id}</span>
    </div>
  );
}

export function SectionOrderList() {
  const { state, patch } = useWizard();

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = state.sectionOrder.indexOf(active.id as string);
    const newIndex = state.sectionOrder.indexOf(over.id as string);
    patch({ sectionOrder: arrayMove(state.sectionOrder, oldIndex, newIndex) });
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={state.sectionOrder} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {state.sectionOrder.map((key) => (
            <SortableItem key={key} id={key} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
