const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const _ = require('lodash');

const KOA = require('koa');
const app = new KOA();
const cors = require('@koa/cors');
const bodyParser = require('koa-bodyparser');
const Router = require('@koa/router');
const router = new Router();

const log = require('./logger');

const METHODS_MAPPING = {
  get: 'get',
  post: 'post',
};
const METHODS = Object.keys(METHODS_MAPPING);

let API_FOLDER_PATH = './apis';

app.use(bodyParser());
app.use(cors());

function loadAPIFolders() {
  const apiFiles = fs.readdirSync(API_FOLDER_PATH);
  apiFiles.forEach((fpath) => {
    if (/^.*(yaml|YAML)$/.test(fpath)) {
      const fullPath = path.resolve(API_FOLDER_PATH, fpath);
      configureAPI(fullPath);
    }
  });
}

function getAPIPath(fname) {
  return (
    '/' +
    fname
      .replace(/.(yaml|YAML)/g, '')
      .match(/[a-zA-Z0-9]+/g)
      .join('')
  );
}

function configureAPI(apiFilePath) {
  const apiFileName = path.basename(apiFilePath);
  const apiFile = fs.readFileSync(apiFilePath, 'utf-8');
  const { method = 'get', request, response } = yaml.load(apiFile);
  if (!~METHODS.indexOf(method))
    throw `[${path.basename(apiFilePath)}] Method: ${method} was not allowed`;

  const koaMethod = METHODS_MAPPING[method];
  const apiPath = getAPIPath(apiFileName);
  router[koaMethod](apiPath, (ctx) => {
    ctx.status = 200;
    ctx.body = response.body;
  });

  log.i(`Mocked [${method.toUpperCase()} ~ ${apiPath}]`);
}

function abracadabra() {
  router.post('abracadabra', (ctx) => {
    const { headers, query, body } = ctx.request;
    ctx.status = 200;
    const resBody = { header, query, body };
    ctx.body = _.pickBy(resBody, (o) => !_.isEmpty(o));
  });
}

function doEmptyCheck() {
  if (!fs.existsSync(API_FOLDER_PATH)) {
    log.i(
      'API folder does not exist, creating sample YAML file (/apis/sample.yaml)...'
    );
    fs.mkdirSync(API_FOLDER_PATH);

    fs.copyFileSync(
      path.join(__dirname, './sample/api.yaml'),
      path.resolve(API_FOLDER_PATH + '/api.yaml')
    );
  }
}

function startAPP(port, apiPath) {
  apiPath && (API_PATH = apiPath);

  doEmptyCheck();
  loadAPIFolders();

  abracadabra();

  app.use(router.routes());
  app.listen(port, function () {
    log.v('Server - listening on port ' + port);
  });
}

function startAPPWithSingleFile(port, filePath) {
  configureAPI(filePath);

  app.use(router.routes());
  app.listen(port, function () {
    log.v('Server - listening on port ' + port);
  });
}

module.exports = { startAPP, startAPPWithSingleFile };
