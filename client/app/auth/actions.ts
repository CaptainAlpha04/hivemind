'use server';
import { signIn } from '@/auth';

export async function signInWithProvider(provider: string, callbackUrl: string) {
  return signIn(provider, { redirectTo: callbackUrl });
}