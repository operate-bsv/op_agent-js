module.exports = {
  source: {
    include: [
      'README.md',
      'lib/index.js',
      'lib/operate/'
    ]
  },
  opts: {
    recurse: true,
    destination: 'docs',
    template: 'node_modules/better-docs'
  },
  plugins: [
    'plugins/markdown',
    'node_modules/better-docs/category'
  ],
  tags: {
    allowUnknownTags: ['category']
  },
  templates: {
    default: {
      includeDate: false
    },
    betterDocs: {
      name: 'Operate | Agent (js)',
      hideGenerator: false,
      navigation: [
        { label: 'Homepage', href: 'https://www.operatebsv.org' },
        { label: 'Github', href: 'https://github.com/operate-bsv/op_agent-js' }
      ]
    }
  }
}