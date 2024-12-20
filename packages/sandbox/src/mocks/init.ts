export async function initMocks() {
  const params = new URLSearchParams(window.location.search);

  if (!params.has('mocks')) {
    return
  }
 
  const { worker } = await import('./browser')
 
  // `worker.start()` returns a Promise that resolves
  // once the Service Worker is up and ready to intercept requests.
  return worker.start()
}
