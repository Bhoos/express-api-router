import createRoute from './createRoute';
import createProxy from './createProxy';

const TYPE_PARAM = 'params';
const TYPE_QUERY = 'query';
const TYPE_FORM = 'body';

function createArgument(type, name) {
  return {
    type,
    name,
    extract: req => req[type][name],
  };
}

export default function setupRouter(router, api, setup) {
  function createBranch(parent, name) {
    const branch = {
      api: parent === null ? api : api[name],

      path: parent === null ? '' : `${parent.path}/${name}`,

      branch: path => createBranch(branch, path),

      wsProxy: (proxyUrl, path, ...args) => {
        // First figure out if there are params defined, which need to be appended
        const params = args
          .filter(arg => arg.type === TYPE_PARAM)
          .reduce((acc, arg) => `${acc}/:${arg.name}`, '');

        // Get the full path
        const fullPath = `${branch.path}/${path}${params}`;

        // websocket proxying is supported only through get
        router.use(fullPath, createProxy(proxyUrl, branch.api[path], args.map(a => a.extract)));
        return branch;
      },

      route: (path, ...args) => {
        // First figure out if there are params defined, which need to be appended
        const params = args
          .filter(arg => arg.type === TYPE_PARAM)
          .reduce((acc, arg) => `${acc}/:${arg.name}`, '');

        // Check if post method is needed
        const usePost = args.some(arg => arg.type === TYPE_FORM);
        const method = usePost ? 'post' : 'get';
        // Get the full path
        const fullPath = `${branch.path}/${path}${params}`;
        // Setup the router
        router[method](fullPath, createRoute(branch.api[path], args.map(a => a.extract)));

        return branch;
      },

      param: argName => createArgument(TYPE_PARAM, argName),

      query: argName => createArgument(TYPE_QUERY, argName),

      form: argName => createArgument(TYPE_FORM, argName),
    };

    return branch;
  }

  const r = createBranch(null, '');

  setup(r);

  return router;
}
