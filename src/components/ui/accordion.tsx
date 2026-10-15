"use client";

import * as React from "react";
import { Accordion as Primitive } from "radix-ui";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type AccordionItem = { id: string; title: React.ReactNode; content: React.ReactNode };

export function Accordion({
  items,
  defaultOpen,
  className,
  multiple = true,
}: {
  items: AccordionItem[];
  defaultOpen?: string[];
  className?: string;
  multiple?: boolean;
}) {
  const body = items.map((item) => (
    <Primitive.Item key={item.id} value={item.id} className="border-b border-line">
      <Primitive.Header>
        <Primitive.Trigger className="group flex w-full items-center justify-between gap-4 py-4 text-left text-[15px] font-medium text-ink">
          {item.title}
          <ChevronDown className="size-4 shrink-0 text-muted transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </Primitive.Trigger>
      </Primitive.Header>
      <Primitive.Content className="overflow-hidden pb-5 text-sm leading-6 text-ink-soft">{item.content}</Primitive.Content>
    </Primitive.Item>
  ));
  return multiple ? (
    <Primitive.Root type="multiple" defaultValue={defaultOpen} className={cn("border-t border-line", className)}>
      {body}
    </Primitive.Root>
  ) : (
    <Primitive.Root type="single" collapsible defaultValue={defaultOpen?.[0]} className={cn("border-t border-line", className)}>
      {body}
    </Primitive.Root>
  );
}
