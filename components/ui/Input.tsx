import { cn } from "@/lib/cn";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-base text-ink transition-colors duration-150 ease-out placeholder:text-ink-3 focus:border-accent/60 aria-invalid:border-danger/70",
        className
      )}
      {...props}
    />
  );
}

export function TextArea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-base text-ink transition-colors duration-150 ease-out placeholder:text-ink-3 focus:border-accent/60 aria-invalid:border-danger/70",
        className
      )}
      {...props}
    />
  );
}
