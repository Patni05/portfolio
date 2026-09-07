/**
 * The account-level workers.dev subdomain.
 *
 * Every workers.dev URL is `<worker-name>.<subdomain>.workers.dev`, and the
 * subdomain is shared by every Worker on the account — this portfolio and
 * CanvasX both sit under it. Keeping it in one constant means changing it is a
 * single edit here rather than hunting through data files that would otherwise
 * drift apart.
 *
 * To change it: Cloudflare dashboard → Workers & Pages → Your subdomain →
 * Change. The public API's subdomain endpoint is create-only (it rejects an
 * account that already has one with error 10036), so this cannot be scripted.
 */
export const workersSubdomain = "canvax1";

/** Full https URL for a Worker on this account. */
export function workersUrl(workerName: string): string {
  return `https://${workerName}.${workersSubdomain}.workers.dev`;
}
