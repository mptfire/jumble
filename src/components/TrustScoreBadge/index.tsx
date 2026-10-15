// Privacy patch (fork): the trust-score badge queried fayan.jumble.social with the
// pubkeys of every author rendered outside the web-of-trust — a default-on
// metadata leak. Disabled in this deployment; the component renders nothing.
export default function TrustScoreBadge(_: {
  pubkey: string
  className?: string
  classNames?: {
    container?: string
  }
}) {
  return null
}
