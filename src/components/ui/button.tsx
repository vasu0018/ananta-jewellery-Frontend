import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[7px] font-bold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-[18px] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-rose text-white hover:bg-[#de5f7b] active:scale-[0.98]",
        rose: "bg-rose text-white hover:bg-[#de5f7b] active:scale-[0.98]",
        gold: "bg-maroon-grad text-white hover:brightness-110 active:scale-[0.98]",
        outline: "border border-[#373737] bg-white font-normal text-ink hover:bg-cream",
        soft: "bg-blush text-ink hover:bg-[#ffd0da]",
        ghost: "font-normal text-ink hover:bg-cream",
        link: "h-auto rounded-none px-0 font-normal text-ink underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-4 text-[13px]",
        md: "h-11 px-6 text-[15px]",
        lg: "h-[50px] px-8 text-[17px]",
        icon: "size-10 [&_svg]:size-5",
        "icon-sm": "size-8 [&_svg]:size-4",
      },
      block: { true: "w-full" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
  };

export function Button({ className, variant, size, block, asChild, loading, disabled, children, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size, block }), className)} disabled={disabled || loading} {...props}>
      {asChild ? (
        children
      ) : (
        <>
          {loading && <Loader2 className="animate-spin" />}
          {children}
        </>
      )}
    </Comp>
  );
}
