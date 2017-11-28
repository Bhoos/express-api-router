export default function createRoute(apiCall, argTypes) {
  return (req, res) => {
    // Generate arguments, include session as the first argument
    const args = argTypes.reduce((acc, arg) => {
      acc.push(arg(req));
      return acc;
    }, [req.session]);

    // Make the api call
    // eslint-disable-next-line prefer-spread
    const response = apiCall.apply(null, args);

    // Send back the response
    return res.send(response);
  };
}
