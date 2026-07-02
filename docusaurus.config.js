// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

const url = process.env.URL || 'https://emexlabs.org/';
const baseUrl = process.env.BASE_URL || '/';

const config = {
  title: 'emexLabs',
  tagline: 'Unfolding the power of programming',
  favicon: '/favicon.ico', // More favicons at headTags

  titleDelimiter: '·',

  future: {
    v4: {
      removeLegacyPostBuildHeadAttribute: true,
      useCssCascadeLayers: true,
      siteStorageNamespacing: true,
      fasterByDefault: (process.env.DOCUSAURUS_FASTER ?? 'true') === 'true',
      mdx1CompatDisabledByDefault: true,
    },
  },

  url: url,
  baseUrl: baseUrl,

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  /*i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de'],
    localeConfigs: {
      en: {
        htmlLang: 'en-GB',
      },
      de: {
        baseUrl: '/de',
        htmlLang: 'de',
      },
    },
  },*/

  plugins: [
    require.resolve('docusaurus-lunr-search'),
    '@docusaurus/plugin-content-pages',
    '@docusaurus/plugin-sitemap',
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'emexOS',
        path: 'emexOS/docs',
        routeBasePath: 'emexOS/docs',
        sidebarPath: require.resolve('./sidebars.js'),
        editUrl:
          'https://github.com/emexlab/emexlab.github.io/tree/main/',
      },
    ],
    [
      '@docusaurus/plugin-content-blog',
      {
        id: 'emexOS',
        path: 'emexOS/blog',
        routeBasePath: 'emexOS/blog',
        blogTitle: 'emexOS News',
        blogDescription: 'News about emexOS and its development progress.',
        showReadingTime: true,
        feedOptions: {
          type: ['rss', 'atom'],
          xslt: true,
        },
        onInlineTags: 'warn',
        onInlineAuthors: 'warn',
        onUntruncatedBlogPosts: 'warn',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'emexDE',
        path: 'emexDE/docs',
        routeBasePath: 'emexDE/docs',
        sidebarPath: require.resolve('./sidebars.js'),
        editUrl:
          'https://github.com/emexlab/emexlab.github.io/tree/main/',
      },
    ],
    [
      '@docusaurus/plugin-content-blog',
      {
        id: 'emexDE',
        path: 'emexDE/blog',
        routeBasePath: 'emexDE/blog',
        blogTitle: 'emexDE News',
        blogDescription: 'News about emexDE and its development progress.',
        showReadingTime: true,
        feedOptions: {
          type: ['rss', 'atom'],
          xslt: true,
        },
        onInlineTags: 'warn',
        onInlineAuthors: 'warn',
        onUntruncatedBlogPosts: 'warn',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'emex64',
        path: 'emex64/docs',
        routeBasePath: 'emex64/docs',
        sidebarPath: require.resolve('./sidebars.js'),
        editUrl:
          'https://github.com/emexlab/emexlab.github.io/tree/main/',
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/social-card.png',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'emexLabs',
        logo: {
          alt: 'Logo',
          src: 'org.png',
          className: 'rounded',
        },
        items: [
          {
            to: 'emexOS',
            label: 'emexOS/docs', // Revert this to 'emexOS'
            position: 'left',
          },
          {
            to: 'emexDE',
            label: 'emexDE',
            position: 'left',
          },
          {
            to: 'emex64/docs',
            label: 'emex64',
            position: 'left',
          },
          {
            to: 'emexMC',
            label: 'emexMC',
            position: 'right',
          },
          /*{
            type: 'localeDropdown',
            position: 'right',
            queryString: '?persistLocale=true',
          },*/
          {
            href: 'https://github.com/emexlab',
            position: 'right',
            className: "navbar-icon github",
            'aria-label': 'GitHub',
          },
          {
            href: 'https://discord.gg/Cbeg3gJzC7',
            position: 'right',
            className: "navbar-icon discord",
            'aria-label': 'Discord',
          },
          {
            href: 'https://github.com/sponsors/emexlab',
            position: 'right',
            className: "navbar-icon sponsor",
            'aria-label': 'Sponsor',
          },
        ],
      },
      footer: {
        style: 'light',
        links: [
          {
            title: 'Team',
            items: [
              {
                label: 'Members',
                to: 'members',
              },
              {
                label: 'Website Credits',
                to: 'website/credits',
              },
            ],
          },
          {
            title: 'Socials & Contact',
            items: [
              {
                label: 'X (formerly Twitter)',
                href: 'https://x.com/emexlabs',
              },
              {
                label: 'YouTube',
                href: 'https://www.youtube.com/@emexlabs',
              },
              {
                label: 'Email',
                href: 'mailto:lucavmu@emexlab.de',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} emexLabs. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['c', 'csharp'],
      },
      metadata: [
        {name: 'keywords', content: 'emexlab, emexOS, OS, 64bit, scratch, kernel, emexDE, iOS, app development, IDE, jailed, unjailbroken, custom kernel'},
        {name: 'description', content: 'The team behind emexOS, a simple 64 bit experimental Operating System written from scratch, and emexDE, an IDE to develop native code iOS apps and tools on unjailbroken iOS.'},
        {name: 'apple-mobile-web-app-title', content: 'emexLabs'},
      ],
    }),
  headTags: [
    // Additional favicons
    {
      tagName: 'link',
      attributes: {
        rel: 'icon',
        type: 'image/png',
        href: baseUrl + 'favicon/favicon-96x96.png',
        sizes: '96x96',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'icon',
        type: 'image/svg+xml',
        href: baseUrl + 'favicon/favicon.svg',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'shortcut icon',
        href: baseUrl + 'favicon.ico',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: baseUrl + 'favicon/apple-touch-icon.png',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'manifest',
        href: baseUrl + 'site.webmanifest',
      },
    },
    // Metadata
    {
      tagName: 'link',
      attributes: {
        rel: 'sitemap',
        href: baseUrl + 'sitemap.xml',
      },
    },
    {
      tagName: 'script',
      attributes: {
        type: 'application/ld+json',
      },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org/',
        '@type': 'Organization',
        name: 'emexLabs',
        url: url,
        logo: baseUrl + 'org.png',
      }),
    },
  ],
  markdown: {
    mermaid: true,
  },
  themes: [
    '@docusaurus/theme-mermaid',
    [
      '@docusaurus/theme-classic',
      {
        customCss: './src/css/custom.css',
      },
    ]
  ],
};

if (['production', 'staging', 'testing'].includes(process.env.NODE_ENV)) {
  config.onBrokenLinks = 'throw';
  config.onBrokenAnchors = 'throw';
  config.onBrokenMarkdownLinks = 'throw';
  config.onDuplicateRoutes = 'throw';
};

export default config;
