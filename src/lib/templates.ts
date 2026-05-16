export type TemplateConfig = {
  repo: string
  path: string
  fetcher: "create-next-app" | "degit"
}

export type TemplateName = "nextjs"

export const TEMPLATES: Record<TemplateName, TemplateConfig> = {
  nextjs: {
    repo: "https://github.com/cloud-position/codenow-starters",
    path: "templates/nextjs",
    fetcher: "create-next-app",
  },
}
