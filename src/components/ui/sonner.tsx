"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CheckCircleIcon,
  InfoIcon,
  WarningIcon,
  XCircleIcon,
  SpinnerIcon,
} from "@phosphor-icons/react";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CheckCircleIcon className="size-5 text-contrast" weight="fill" />
        ),
        info: <InfoIcon className="size-5" />,
        warning: <WarningIcon className="size-5" />,
        error: (
          <XCircleIcon className="size-5 text-destructive" weight="fill" />
        ),
        loading: <SpinnerIcon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast !border-2 !p-4 !text-base !font-medium !shadow-lg",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
