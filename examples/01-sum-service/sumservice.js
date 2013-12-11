"use strict";
var wish = require("../../lib/wish.js"),
  app = wish.generateApp();

/* example usage:
 * HTTP GET http://localhost:8080/sum?x=6&y=99
 * HTTP 200 {"sum":105}
 *
 * HTTP GET http://localhost:8080/sum?x=6&y=-9
 * HTTP 400 {"error":"unacceptable request data"}
 *
 * HTTP GET http://localhost:8080/sum?x=92&y=9
 * HTTP 400 {"error":"x may not equal 92"}
 */

app.get("/sum", wish.composeContextualizedRequestHandler(wish.generateContextResponder(),
  wish.acceptInput({
    x: {
      type: "integer",
      minimum: 0,
      maximum: 65535
    },
    y: {
      type: "integer",
      minimum: 0,
      maximum: 65535
    }
  }),
  function (context, callback) {
    if (context.internal.input.x === 92) {
      callback(wish.generateError(wish.constants.HTTP_BAD_REQUEST, "x may not equal 92"), context);
    }
    context.sum = context.internal.input.x + context.internal.input.y;
    callback(undefined, context);
  }));

app.listen(8080);