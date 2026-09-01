// Small async helpers shared by startup and authentication.

export function defer(fn, ...args) {
  setTimeout(() => {
    try {
      Promise.resolve(fn(...args)).catch((e) => console.error(e));
    } catch (e) {
      console.error(e);
    }
  }, 0);
}

export async function withTimeout(promise, ms, label) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`${label}逾時，${Math.ceil(ms / 1000)} 秒內沒有回應。`)),
          ms,
        );
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}
