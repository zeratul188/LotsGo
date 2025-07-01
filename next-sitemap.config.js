/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: 'https://www.lotsgo.kr',
  generateRobotsTxt: true,
  outDir: 'public',
  exclude: ['/administrator']
};

export default config;