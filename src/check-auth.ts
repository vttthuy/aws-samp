import * as CognitoExpress from 'cognito-express';
import * as createError from 'http-errors';

const cognitoExpress = new CognitoExpress({
  region: process.env.region,
  cognitoUserPoolId: process.env.cognitoUserPoolId,
  tokenUse: 'access', //Possible Values: access | id
  tokenExpiration: 3600000, //Up to default expiration of 1 hour (3600000 ms)
});

const exceptionPaths = ['/heath-check'];

export const checkAuth = (req, res, next) => {
  if (exceptionPaths.some((p) => req.url.startsWith(p))) {
    next();
    return;
  }

  const { authorization } = req.headers;
  if (!authorization) {
    return next(createError(401));
  }

  const accessToken = authorization.replace(/Bearer /g, '');
  cognitoExpress.validate(accessToken, function (err, response) {
    //If API is not authenticated, Return 401 with error message.
    if (err) return res.status(401).send(err);

    //Else API has been authenticated. Proceed.
    res.locals.user = response;
    next();
  });
};
