import createRoute from './createRoute';

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
  class Branch {
    constructor(parent, path) {
      this.parent = parent;
      this.path = path;

      this.api = parent === null ? api[path] : parent.api[path];
    }

    getFullPath() {
      if (this.parent === null) {
        return `/${this.path}`;
      }

      return `${this.parent.getFullPath()}/${this.path}`;
    }

    branch(path) {
      return new Branch(this, path);
    }

    route(path, ...args) {
      // First figure out if there are params defined, which need to be appended
      const params = args
        .filter(arg => arg.type === TYPE_PARAM)
        .reduce((acc, arg) => `${acc}/:${arg.name}`, '');

      // Check if post method is needed
      const usePost = args.some(arg => arg.type === TYPE_FORM);
      const method = usePost ? router.post : router.get;

      // Get the full path
      const fullPath = `${this.getFullPath()}/${path}${params}`;

      // Setup the router
      method(fullPath, createRoute(this.api[path], args.map(a => a.extract)));

      return this;
    }
  }

  const r = {
    branch: path => new Branch(null, path),

    param: name => createArgument(TYPE_PARAM, name),

    query: name => createArgument(TYPE_QUERY, name),

    form: name => createArgument(TYPE_FORM, name),
  };

  return setup(r);
}
