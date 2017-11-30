export default function createProxy(proxyUrl, apiCall, argTypes) {
  return (req) => {
    // Make sure the proxy and ws parameters are set
    if (!req.wsProxy) {
      throw new Error('Invalid request. Expecting a websocket client request.');
    }

    // generate arguments, include session as the first argument
    const args = argTypes.reduce((acc, arg) => {
      acc.push(arg(req));
      return acc;
    }, [req.session]);

    // Make the api call
    // eslint-disable-next-line prefer-spread
    Promise.resolve(apiCall.apply(null, args))
      .then((apiResult) => {
        const url = typeof proxyUrl === 'function' ? proxyUrl(apiResult) : proxyUrl;
        req.wsProxy(url);
      });
  };
}
