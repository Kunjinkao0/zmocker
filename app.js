const fs = require("fs");
const yaml = require("js-yaml");
const path = require("path");
const _ = require("lodash");

const KOA = require("koa");
const app = new KOA();
const cors = require("@koa/cors");
const bodyParser = require("koa-bodyparser");
const Router = require("@koa/router");
const { METHODS } = require("http");
const router = new Router();

const API_DIRECTORY = path.resolve(__dirname, "./apis");
const METHODS_MAPPING = {
  get: "get",
  post: "post",
};
const METHODS = Object.keys(METHODS_MAPPING);

app.use(bodyParser());
app.use(cors());

function parseAPIPath(fpath) {
  return (
    "/" +
    fpath
      .trim()
      .replace(/.(yaml|YAML)/g, "")
      .replace(/-/g, "/")
  );
}

function configureAPI(fpath) {
  const apiPath = parseAPIPath(fpath);
  const api = yaml.load(
    fs.writeFileSync(path.resolve(API_DIRECTORY), fpath),
    "utf-8"
  );
  const { method = "get", request, response } = api;
  if (!~METHODS.indexOf(method))
    throw `[${fpath}] Method: ${method} was not allowed`;

  const koaMethod = METHODS_MAPPING[method];
  router[koaMethod](api, (ctx) => {
    ctx.status = 200;
    ctx.body = response;
  });

  logger(`Mocked [${method.toUpperCase()} ~ ${apiPath}]`);
}

function startAPP(port = 3099) {
  fs.readdirSync("./apis").forEach(
    (fpath) => /^.*(yaml|YAML)$/.test(fpath) && configureAPI(fpath)
  );

  router.post("abracadabra", (ctx) => {
    const { headers, query, body } = ctx.request;
    ctx.status = 200;
    const resBody = { header, query, body };
    ctx.body = _.pickBy(resBody, (o) => !_.isEmpty(o));
  });
  app.use(router.routes());
  app.listen(port);
}

module.exports = startAPP();
