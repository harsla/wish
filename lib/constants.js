"use strict";

//////////////////////////////
// HTTP 1.1 REQUEST METHODS //
//////////////////////////////

module.exports.HTTP_OPTIONS = "OPTIONS";
module.exports.HTTP_GET = "GET";
module.exports.HTTP_HEAD = "HEAD";
module.exports.HTTP_POST = "POST";
module.exports.HTTP_PUT = "PUT";
module.exports.HTTP_DELETE = "DELETE";
module.exports.HTTP_TRACE = "TRACE";
module.exports.HTTP_CONNECT = "CONNECT";

/////////////////////////////
// HTTP 1.1 RESPONSE CODES //
/////////////////////////////

module.exports.HTTP_CONTINUE = 100;
module.exports.HTTP_SWITCHING_PROTOCOLS = 101;
module.exports.HTTP_OK = 200;
module.exports.HTTP_CREATED = 201;
module.exports.HTTP_ACCEPTED = 202;
module.exports.HTTP_NON_AUTHORATATIVE_INFORMATION = 203;
module.exports.HTTP_NO_CONTENT = 204;
module.exports.HTTP_RESET_CONTENT = 205;
module.exports.HTTP_PARTIAL_CONTENT = 206;
module.exports.HTTP_MULTIPLE_CHOICES = 300;
module.exports.HTTP_MOVED_PERMANENTLY = 301;
module.exports.HTTP_FOUND = 302;
module.exports.HTTP_SEE_OTHER = 303;
module.exports.HTTP_NOT_MODIFIED = 304;
module.exports.HTTP_USE_PROXY = 305;
module.exports.HTTP_TEMPORARY_REDIRECT = 307;
module.exports.HTTP_BAD_REQUEST = 400;
module.exports.HTTP_UNAUTHORIZED = 401;
module.exports.HTTP_PAYMENT_REQUIRED = 402;
module.exports.HTTP_FORBIDDEN = 403;
module.exports.HTTP_NOT_FOUND = 404;
module.exports.HTTP_METHOD_NOT_ALLOWED = 405;
module.exports.HTTP_NOT_ACCEPTABLE = 406;
module.exports.HTTP_PROXY_AUTHENTICATION_REQUIRED = 407;
module.exports.HTTP_REQUEST_TIMEOUT = 408;
module.exports.HTTP_CONFLICT = 409;
module.exports.HTTP_GONE = 410;
module.exports.HTTP_LENGTH_REQUIRED = 411;
module.exports.HTTP_PRECONDITION_FAILED = 412;
module.exports.HTTP_REQUEST_ENTITY_TOO_LARGE = 413;
module.exports.HTTP_REQUEST_URI_TOO_LONG = 414;
module.exports.HTTP_UNSUPPORTED_MEDIA_TYPE = 415;
module.exports.HTTP_REQUESTED_RANGE_NOT_SATISFIABLE = 416;
module.exports.HTTP_EXPECTATION_FAILED = 417;
module.exports.HTTP_INTERNAL_SERVER_ERROR = 500;
module.exports.HTTP_NOT_IMPLEMENTED = 501;
module.exports.HTTP_BAD_GATEWAY = 502;
module.exports.HTTP_SERVICE_UNAVAILABLE = 503;
module.exports.HTTP_GATEWAY_TIMEOUT = 504;
module.exports.HTTP_HTTP_VERSION_NOT_SUPPORTED = 505;