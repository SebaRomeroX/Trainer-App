import { cn } from "@/lib/utils"

interface MobileCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function MobileCard({ className, children, ...props }: MobileCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 space-y-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface MobileCardRowProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function MobileCardRow({ className, children, ...props }: MobileCardRowProps) {
  return (
    <div
      className={cn("flex items-center justify-between text-sm", className)}
      {...props}
    >
      {children}
    </div>
  )
}
