
var _ = require('lodash');
var fs = require('fs-extra');
var path = require('path');
var autobass = require('autobass');
var cssnext = require('cssnext');
var css = cssnext([
    '@import "basscss";',
    '@import "./site";',
  ].join('\n'), {
  features: {
    pseudoElements: false,
    rem: false,
    colorRgba: false,
    customProperties: {
      variables: {
        'bold-font-weight': '500',
        'heading-font-weight': '500',
        'button-font-weight': '500',
        'button-font-size': 'var(--h5)',
        'pre-font-size': '87.5%',
      }
    }
  },
  compress: true
});

var kitchensink = cssnext('@import "./all";', {
  compress: true,
  features: {
    pseudoElements: false,
    rem: false,
    colorRgba: false,
  }
});
fs.writeFileSync('kitchensink.css', kitchensink);

var helpers = require('./data/helpers');
var modules = require('./data/modules');


// Data
var data = require('basscss/package.json');

data.src = path.join(__dirname, './templates');

data.layout = fs.readFileSync(path.join(__dirname, './templates/layouts/base.html'), 'utf8');
data.title = _.capitalize(data.name);
data.baseurl = '//basscss.com';

//data.stylesheet = '/kitchensink.css';

data.css = css;

data.routes = require('./data/routes');
data.pages = [
  { title: 'Stats', path: '/stats' },
  { title: 'Showcase', path: '/showcase' },
  { title: 'Themes', path: '/themes' },
  { title: 'Customize', path: '/customize' },
];
data.showcase = require('showcase/data');
data.stats = require('./data/stats');
data.colorCombinations = require('./data/color-combinations');

data.modules = modules;
data.optional_modules = data.basscss.optional_modules;

data.partials = {};
data.partials.head = fs.readFileSync('./templates/partials/head.html', 'utf8');
data.partials.footer = fs.readFileSync('./templates/partials/footer.html', 'utf8');
data.partials['side-nav'] = fs.readFileSync('./templates/partials/side-nav.html', 'utf8');
data.partials['page-header'] = fs.readFileSync('./templates/partials/page-header.html', 'utf8');
data.partials['showcase-widget'] = fs.readFileSync('./templates/partials/showcase-widget.html', 'utf8');
data.partials.pagination = fs.readFileSync('./templates/partials/pagination.html', 'utf8');
data.partials['color-combo-card'] = fs.readFileSync('./templates/partials/color-combo-card.html', 'utf8');
data.partials['module-section'] = fs.readFileSync('./templates/partials/module-section.html', 'utf8');
data.partials['module-header'] = fs.readFileSync('./templates/partials/module-header.html', 'utf8');
data.partials['module-footer'] = fs.readFileSync('./templates/partials/module-footer.html', 'utf8');
data.partials['share-buttons'] = fs.readFileSync('./templates/partials/share-buttons.html', 'utf8');
data.partials['routes'] = fs.readFileSync('./templates/partials/routes.html', 'utf8');
data.partials.ad = fs.readFileSync('./templates/partials/ad.html', 'utf8');


Object.keys(helpers).forEach(function(key) {
  data[key] = helpers[key];
});

var pages = autobass(data);

function writePage(page) {
  var pagePath = path.join(__dirname, page.path);
  var filename = page.filename || 'index.html';
  var html = page.body;
  fs.ensureDirSync(pagePath);
  fs.writeFileSync(pagePath + '/' + filename, html);
  console.log((pagePath + ' written'));
  if (page.routes) {
    page.routes.forEach(writePage);
  }
}

pages.forEach(writePage);


// 404 page
var errorPageBody = _.template(fs.readFileSync('templates/404.html', 'utf8'))(data);
var errorPage = _.template(data.layout)(_.assign(data, {
  page: {
    title: '404',
    breadcrumbs: [],
  },
  body: errorPageBody
}));

writePage({ path: '/', filename: '404.html', body: errorPage });

// Single page doc
var docBody = _.template(fs.readFileSync('templates/doc/index.html', 'utf8'))(_.assign(data, {
  page: {
    title: 'Basscss',
    breadcrumbs: [],
  }
}));
writePage({ path: '/doc', body: docBody });


