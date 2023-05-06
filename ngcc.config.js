module.exports = {
  packages: {
    '@webdpt/components': {
      ignorableDeepImportMatchers: [
        /@fullcalendar\/core\/locales-all/
      ]
    },
    'ngx-echarts': {
      ignorableDeepImportMatchers: [
        /echarts\/lib\/echarts/
      ]
    }
  },
};
