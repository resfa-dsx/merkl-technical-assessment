import { useState } from 'react'

export function ResourceIcon({
  name,
  src,
}: {
  name: string
  src: string | null
}) {
  const [failed, setFailed] = useState(false)
  const fallback = name.trim().slice(0, 2).toUpperCase() || 'OP'

  if (src === null || failed) {
    return (
      <span
        aria-hidden="true"
        className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
      >
        {fallback}
      </span>
    )
  }

  return (
    <img
      alt=""
      className="size-11 shrink-0 rounded-xl bg-slate-800 object-cover"
      height="44"
      onError={() => setFailed(true)}
      src={src}
      width="44"
    />
  )
}
