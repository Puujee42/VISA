/** Race a Supabase thenable against a hard timeout (DNS / network hangs). */
export async function withSupabaseTimeout<T>(
  promise: PromiseLike<T>,
  ms = 2500,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.resolve(promise),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`Supabase request timed out after ${ms}ms`)),
          ms,
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
