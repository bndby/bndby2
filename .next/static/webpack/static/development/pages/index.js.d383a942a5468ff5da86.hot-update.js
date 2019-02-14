webpackHotUpdate("static/development/pages/index.js",{

/***/ "./components/Age/index.js":
/*!*********************************!*\
  !*** ./components/Age/index.js ***!
  \*********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
var _jsxFileName = "/var/www/html/bndby2/components/Age/index.js";

var wasBurn = new Date(1981, 10, 16, 19, 55, 0, 0);
var now = new Date();
var age = new Date(Math.abs(now - wasBurn));

var Age = function Age() {
  return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("span", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 6
    },
    __self: this
  }, age.getDate() - 1, ".", age.getMonth() < 10 ? '0' : '', age.getMonth(), ".", age.toISOString().slice(0, 4) - 1970, " ", age.getHours(), ":", age.getMinutes());
};

/* harmony default export */ __webpack_exports__["default"] = (Age);

/***/ })

})
//# sourceMappingURL=index.js.d383a942a5468ff5da86.hot-update.js.map