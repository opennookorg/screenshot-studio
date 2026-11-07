"use client";

import * as React from "react";
import { ArrowDown01Icon, Search01Icon, Tick02Icon } from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResponsivePopover } from "@/components/ui/responsive-popover";
import { cn } from "@/lib/utils";
import {
  findResizeTemplate,
  searchResizeTemplates,
  type ResizeTemplateSelection,
} from "@/lib/image-tools";

function PickerRow({
  name,
  meta,
  selected,
  onClick,
}: {
  name: string;
  meta?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-md px-2.5 py-1.5 text-left text-sm text-foreground transition-colors duration-150 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:min-h-9",
        selected && "bg-muted"
      )}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        <span className="truncate">{name}</span>
        {selected ? <Tick02Icon size={14} className="shrink-0" aria-hidden="true" /> : null}
      </span>
      {meta ? (
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{meta}</span>
      ) : null}
    </button>
  );
}

interface ResizeTemplatePickerProps {
  selectedId: string | null;
  /** Null means a hand-typed size with no template. */
  onSelect: (selection: ResizeTemplateSelection | null) => void;
}

export function ResizeTemplatePicker({ selectedId, onSelect }: ResizeTemplatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const selected = findResizeTemplate(selectedId);
  const groups = searchResizeTemplates(query);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setQuery("");
  };

  const choose = (selection: ResizeTemplateSelection | null) => {
    onSelect(selection);
    handleOpenChange(false);
  };

  return (
    <ResponsivePopover
      open={open}
      onOpenChange={handleOpenChange}
      title="Choose a size"
      description="Pick a ready-made size. You can still change the numbers afterwards."
      className="w-80 p-0"
      trigger={
        <Button variant="outline" className="w-full justify-between font-normal">
          <span className="truncate">{selected?.template.name ?? "Custom size"}</span>
          <ArrowDown01Icon size={15} className="shrink-0 text-muted-foreground" aria-hidden="true" />
        </Button>
      }
    >
      <div className="relative border-b border-border p-2">
        <Search01Icon
          size={15}
          className="pointer-events-none absolute left-4.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search sizes, like passport"
          aria-label="Search sizes"
          className="pl-8"
        />
      </div>

      <div className="max-h-80 overflow-y-auto overscroll-contain p-2">
        {query ? null : (
          <PickerRow name="Custom size" selected={!selected} onClick={() => choose(null)} />
        )}

        {groups.map((group) => (
          <div key={group.id} className="mt-2 first:mt-0">
            <p className="px-2.5 pb-1 pt-1.5 text-xs font-medium text-muted-foreground">
              {group.label}
            </p>
            {group.templates.map((template) => (
              <PickerRow
                key={template.id}
                name={template.name}
                meta={`${template.width} × ${template.height}`}
                selected={template.id === selectedId}
                onClick={() => choose({ template, group })}
              />
            ))}
          </div>
        ))}

        {groups.length === 0 ? (
          <p className="px-2.5 py-6 text-center text-sm text-muted-foreground">
            No sizes match. You can type your own after closing this.
          </p>
        ) : null}
      </div>
    </ResponsivePopover>
  );
}
