# DocIntel AI — Diagrams

Mermaid diagram sources for architecture and UI documentation. GitHub renders `.mmd` files when linked from markdown, or embed the contents in fenced ` ```mermaid ` blocks.

| File | Description |
|------|-------------|
| [system-overview.mmd](./system-overview.mmd) | High-level components and Supabase integration |
| [upload-pipeline.mmd](./upload-pipeline.mmd) | Upload validation → queue → storage → DB |
| [pdf-viewer-flow.mmd](./pdf-viewer-flow.mmd) | Sequence: open tab → PDF.js → proxy → Supabase |
| [app-shell-layout.mmd](./app-shell-layout.mmd) | AppShell structure (header, sidebar, main, footer) |
| [page-layouts.mmd](./page-layouts.mmd) | Upload, Library, and Workspace page regions |
| [document-status.mmd](./document-status.mmd) | Document status state machine |
| [user-journey.mmd](./user-journey.mmd) | Interview demo user flow |
| [state-management.mmd](./state-management.mmd) | Zustand vs React Query responsibilities |

## Preview locally

- [Mermaid Live Editor](https://mermaid.live) — paste `.mmd` file contents
- VS Code — Mermaid extension
- GitHub — diagrams render in markdown when using ` ```mermaid ` code fences

## Related docs

- [README.md](../../README.md)
- [ARCHITECTURE.md](../../ARCHITECTURE.md)
