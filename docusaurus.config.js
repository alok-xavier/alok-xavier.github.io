// @ts-check
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Alok Xavier',
  tagline: 'SRE and DevOps engineer. I keep the lights on.',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  url: 'https://alok-xavier.github.io',
  baseUrl: '/',

  // GitHub Pages deployment config — keep in sync with the repo
  organizationName: 'alok-xavier',
  projectName: 'alok-xavier.github.io',
  trailingSlash: false,

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  headTags: [
    {tagName: 'link', attributes: {rel: 'icon', href: '/img/favicon.ico', sizes: 'any'}},
    {tagName: 'link', attributes: {rel: 'apple-touch-icon', href: '/img/apple-touch-icon.png'}},
    {tagName: 'meta', attributes: {name: 'theme-color', content: '#161b33'}},
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/alok-xavier/alok-xavier.github.io/tree/main/',
        },
        blog: {
          blogTitle: 'Weekly learning log',
          blogDescription: 'What Alok Xavier learned this week about SRE, DevOps, cloud and AIOps.',
          blogSidebarTitle: 'Recent entries',
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: 'https://github.com/alok-xavier/alok-xavier.github.io/tree/main/',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          // Fonts are self-hosted from npm (no Google Fonts request)
          customCss: [
            require.resolve('@fontsource-variable/archivo/wdth.css'),
            require.resolve('@fontsource/jetbrains-mono/400.css'),
            require.resolve('@fontsource/jetbrains-mono/600.css'),
            './src/css/custom.css',
          ],
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/social-card.png',
      metadata: [
        {name: 'keywords', content: 'SRE, DevOps, AWS, Terraform, Kubernetes, EKS, Argo CD, AIOps, Alok Xavier'},
      ],
      colorMode: {
        defaultMode: 'light',
        disableSwitch: true,
        respectPrefersColorScheme: false,
      },
      navbar: {
        title: 'Alok Xavier',
        style: 'dark',
        logo: {
          alt: '',
          src: 'img/logo.svg',
          width: 28,
          height: 28,
        },
        items: [
          {to: '/blog', label: 'Learning log', position: 'right'},
          {
            type: 'docSidebar',
            sidebarId: 'deepDives',
            position: 'right',
            label: 'Deep dives',
          },
          {href: 'https://github.com/alok-xavier', label: 'GitHub', position: 'right'},
          {
            href: 'pathname:///files/resume.pdf',
            label: 'Résumé',
            position: 'right',
            className: 'ax-nav-resume',
            target: '_blank',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {label: 'Email', href: 'mailto:alokx6@gmail.com'},
          {label: 'LinkedIn', href: 'https://www.linkedin.com/in/alok-xavier'},
          {label: 'GitHub', href: 'https://github.com/alok-xavier'},
          {label: 'RSS', href: 'pathname:///blog/rss.xml'},
        ],
        copyright: `© ${new Date().getFullYear()} Alok Xavier`,
      },
      prism: {
        theme: prismThemes.oneLight,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['hcl', 'bash', 'yaml'],
      },
    }),
};

export default config;
