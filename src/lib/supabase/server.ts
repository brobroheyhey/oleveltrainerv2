import { createServerClient as createServerClientSSO } from '@supabase/ssr';
import { cookies, headers } from 'next/headers';

export function createServerClient() {
  const cookieStore = cookies();
  const supabase = createServerClientSSO(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: any) {
          cookieStore.set(name, '', { ...options, maxAge: 0 });
        },
      },
      headers: {
        get(name: string) {
          // pass-forward for RSC context
          return headers().get(name) ?? undefined;
        },
      },
    },
  );
  return supabase;
}


