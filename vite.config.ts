@"
/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  // Supabase
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  
  // MyFreeScoreNow
  readonly VITE_MFSN_API_KEY: string
  
  // Application
  readonly VITE_APP_VERSION: string
  readonly VITE_SENTRY_DSN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// CSS Modules
declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}

// Images
declare module '*.jpg' {
  const src: string
  export default src
}
declare module '*.jpeg' {
  const src: string
  export default src
}
declare module '*.png' {
  const src: string
  export default src
}
declare module '*.gif' {
  const src: string
  export default src
}
declare module '*.svg' {
  const src: string
  export default src
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >
}

// Custom types for your credit repair CRM
declare namespace App {
  interface Client {
    id: string
    name: string
    creditScore: number
    disputes: Dispute[]
  }
  
  interface Dispute {
    id: string
    creditor: string
    status: 'pending' | 'in-progress' | 'resolved'
    dateSubmitted: string
  }
}
"@ | Out-File -FilePath .\src\vite-env.d.ts -Encoding utf8
