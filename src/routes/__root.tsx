import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Merkl Opportunity Explorer',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-canvas text-foreground antialiased">
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-line bg-canvas">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6">
              <Link
                className="font-semibold tracking-tight text-foreground transition hover:text-accent-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                to="/opportunities"
              >
                Merkl Opportunity Explorer
              </Link>
              <nav aria-label="Primary navigation">
                <Link
                  activeProps={{ className: 'text-accent' }}
                  className="text-sm font-medium text-secondary transition hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  to="/opportunities"
                >
                  Opportunities
                </Link>
              </nav>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
            <Outlet />
          </main>

          <footer className="border-t border-line">
            <div className="mx-auto w-full max-w-6xl px-4 py-4 text-sm text-muted sm:px-6">
              Data provided by{' '}
              <a
                className="underline decoration-line-strong underline-offset-4 transition hover:text-accent-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                href="https://merkl.xyz"
                rel="noreferrer"
                target="_blank"
              >
                Merkl
              </a>
            </div>
          </footer>
        </div>
        <Scripts />
      </body>
    </html>
  )
}
