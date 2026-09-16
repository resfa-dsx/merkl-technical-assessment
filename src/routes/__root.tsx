import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

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
      <body className="bg-slate-950 text-slate-100 antialiased">
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-slate-800">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6">
              <Link className="font-semibold tracking-tight" to="/opportunities">
                Merkl Opportunity Explorer
              </Link>
              <nav aria-label="Primary navigation">
                <Link
                  activeProps={{ className: 'text-emerald-300' }}
                  className="text-sm text-slate-300 hover:text-white"
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

          <footer className="border-t border-slate-800">
            <div className="mx-auto w-full max-w-6xl px-4 py-4 text-sm text-slate-400 sm:px-6">
              Data provided by{' '}
              <a
                className="underline decoration-slate-600 underline-offset-4 hover:text-slate-200"
                href="https://merkl.xyz"
                rel="noreferrer"
                target="_blank"
              >
                Merkl
              </a>
            </div>
          </footer>
        </div>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
