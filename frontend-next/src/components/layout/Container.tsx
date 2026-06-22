import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  /**
   * Optional override for max-width. Defaults to the design's 1340px.
   */
  maxWidth?: "default" | "wide" | "narrow";
};

const widths: Record<NonNullable<ContainerProps["maxWidth"]>, string> = {
  default: "max-w-[1340px]",
  wide: "max-w-[1600px]",
  narrow: "max-w-[960px]",
};

export function Container({
  children,
  className,
  maxWidth = "default",
}: ContainerProps) {
  return (
    <div
      className={cn(
        "w-full mx-auto px-7 md:px-7 sm:px-4",
        widths[maxWidth],
        className
      )}
    >
      {children}
    </div>
  );
}