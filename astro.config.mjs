import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://awac.ganemo.com',
  integrations: [
    starlight({
      title: 'AWaC',
      description: 'Agent Workspace as Code — declare, compose, sync.',
      logo: { src: './src/assets/logo.svg', replacesTitle: false },
      favicon: '/favicon.svg',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/getGanemo/workspace-cli' },
      ],
      editLink: {
        baseUrl: 'https://github.com/getGanemo/awac-docs/edit/main/',
      },
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
      },
      sidebar: [
        {
          label: 'Start',
          items: [
            { label: 'Getting started', slug: 'getting-started' },
            { label: 'Architecture', slug: 'architecture' },
          ],
        },
        {
          label: 'Reference',
          items: [
            { label: 'Manifest (workspace.yml)', slug: 'manifest-reference' },
            { label: 'Stack metadata (awac.yml)', slug: 'stack-reference' },
            { label: 'CLI (wsp)', slug: 'cli-reference' },
            { label: 'Templates', slug: 'templates' },
            { label: 'Agent context files', slug: 'agent-context-files' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Create a new stack', slug: 'creating-new-stack' },
            { label: 'Workspace repo layout', slug: 'workspace-repo' },
            { label: 'Migration from a fixed template', slug: 'migration-from-template' },
            { label: 'Deploy & secrets', slug: 'deploy-and-secrets' },
            { label: 'Governance', slug: 'governance' },
          ],
        },
        {
          label: 'FAQ',
          items: [
            { label: 'Frequently Asked Questions', slug: 'faq' },
          ],
        },
        {
          label: 'Decisions (ADRs)',
          collapsed: true,
          autogenerate: { directory: 'decisions' },
        },
      ],
      customCss: ['./src/styles/custom.css'],
    }),
  ],
});
