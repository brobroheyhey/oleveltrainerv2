import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';

async function signIn(formData: FormData) {
  'use server';
  const supabase = createServerClient();
  const email = String(formData.get('email'));
  const password = String(formData.get('password'));
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  // ensure profile
  await supabase.from('profiles').upsert({ user_id: data.user!.id, display_name: data.user!.email ?? null });
  redirect('/dashboard');
}

export default async function LoginPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/dashboard');
  return (
    <form action={signIn} className="space-y-3">
      <h1 className="text-xl font-semibold">Sign in</h1>
      <input className="w-full rounded-md border p-2" type="email" name="email" placeholder="Email" required />
      <input className="w-full rounded-md border p-2" type="password" name="password" placeholder="Password" required />
      <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground">Sign in</button>
    </form>
  );
}


