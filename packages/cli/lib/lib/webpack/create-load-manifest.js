const isESM = filename => /\.esm\.js$/.test(filename);
const isMatch = (filename, condition) => (isESM(filename) === condition);

module.exports = (assets, isESMBuild = false) => {
  let mainJs, mainCss, scripts=[], styles=[];
  for (let filename in assets) {
    if (!/\.map$/.test(filename)) {
      if (/route-/.test(filename)) {
        // both ESM & regular match here
        isMatch(filename, isESMBuild) && scripts.push(filename);
      } else if (/chunk\.(.+)\.css$/.test(filename)) {
        styles.push(filename);
      } else if (/^bundle(.+)\.css$/.test(filename)) {
        mainCss = filename;
      } else if (/^bundle(.+)\.js$/.test(filename)) {
        // both ESM & regular bundles match here
        if (isMatch(filename, isESMBuild)) {
          mainJs = filename;
        }
      }
    }
  }

  let defaults = {
    [mainCss]: {
      type: 'style',
      weight: 1
    },
    [mainJs]: {
      type: 'script',
      weight: 1
    },
  },
  manifest = {
    '/': defaults
  };

  let path, css, obj;
  scripts.forEach((filename, idx) => {
    css = styles[idx];
    obj = Object.assign({}, defaults);
    obj[filename] = { type:'script', weight:0.9 };
    if (css) obj[css] = { type:'style', weight:0.9 };
    path = filename.replace(/route-/, '/')
      .replace(/\.chunk(\.\w+)?(\.esm)?\.js$/, '')
      .replace(/\/home/, '/');
    manifest[path] = obj;
  });

  return manifest;
};
