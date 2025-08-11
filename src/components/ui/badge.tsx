import { cn } from '@/lib/utils';
import * as React from 'react';

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold',
        className,
      )}
      {...props}
    />
  );
}


