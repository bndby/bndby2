module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = require('../../../ssr-module-cache.js');
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete installedModules[moduleId];
/******/ 		}
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./components/Age/index.js":
/*!*********************************!*\
  !*** ./components/Age/index.js ***!
  \*********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
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

/***/ }),

/***/ "./pages/index.js":
/*!************************!*\
  !*** ./pages/index.js ***!
  \************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _components_Age__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../components/Age */ "./components/Age/index.js");
var _jsxFileName = "/var/www/html/bndby2/pages/index.js";


var expirienceStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gridTemplateAreas: '"n o" "n h"',
  gridColumnGap: '1rem'
};
/* harmony default export */ __webpack_exports__["default"] = (function () {
  return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_0___default.a.Fragment, null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("h1", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 12
    },
    __self: this
  }, "\u0411\u043E\u043D\u0434\u0430\u0440\u0435\u043D\u043A\u043E \u042E\u0440\u0438\u0439, \u0432\u0435\u0431-\u0440\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u0447\u0438\u043A"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("p", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 13
    },
    __self: this
  }, "\u041C\u0435\u043D\u044F \u0437\u043E\u0432\u0443\u0442 \u0411\u043E\u043D\u0434\u0430\u0440\u0435\u043D\u043A\u043E \u042E\u0440\u0438\u0439, \u043C\u043D\u0435 ", react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_components_Age__WEBPACK_IMPORTED_MODULE_1__["default"], {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 13
    },
    __self: this
  }), ". \u041B\u044E\u0431\u043B\u044E \u0436\u0435\u043D\u0443 \u0438 \u0434\u043E\u0447\u044C. \u0417\u0430\u043D\u0438\u043C\u0430\u044E\u0441\u044C \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u0435\u043C \u0441\u0430\u0439\u0442\u043E\u0432, \u0431\u0430\u0437 \u0437\u043D\u0430\u043D\u0438\u0439 \u0438 \u043E\u043D\u043B\u0430\u0439\u043D-\u0441\u043F\u0440\u0430\u0432\u043E\u0447\u043D\u0438\u043A\u043E\u0432."), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("ul", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 15
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 16
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {
    href: "https://github.com/bndby/bndby",
    __source: {
      fileName: _jsxFileName,
      lineNumber: 16
    },
    __self: this
  }, "Github")), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 17
    },
    __self: this
  }, "Telegram: ", react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {
    href: "https://t.me/bndby",
    __source: {
      fileName: _jsxFileName,
      lineNumber: 17
    },
    __self: this
  }, "@bndby")), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 18
    },
    __self: this
  }, "E-mail: ", react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {
    href: "mailto:by@klen.by",
    __source: {
      fileName: _jsxFileName,
      lineNumber: 18
    },
    __self: this
  }, "by@klen.by"))), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("hr", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 21
    },
    __self: this
  }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
    style: expirienceStyle,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 23
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
    style: {
      gridArea: 'n'
    },
    __source: {
      fileName: _jsxFileName,
      lineNumber: 24
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("h2", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 25
    },
    __self: this
  }, "\u041D\u0430\u0432\u044B\u043A\u0438"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("ol", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 26
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 27
    },
    __self: this
  }, "HTML, Markdown;"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 28
    },
    __self: this
  }, "CSS, LESS, SCSS;"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 29
    },
    __self: this
  }, "JavaScript, JQuery;"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 30
    },
    __self: this
  }, "ES6, Node.js, React, Next.js;"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 31
    },
    __self: this
  }, "XML, XSLT, XPath, SVG;"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 32
    },
    __self: this
  }, "PHP, Parser;"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 33
    },
    __self: this
  }, "MySQL;"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 34
    },
    __self: this
  }, "WAI-ARIA;"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 35
    },
    __self: this
  }, "Wordpress, Symphony CMS, Mediawiki, Tilda, Github Pages, Cloudflare."), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 36
    },
    __self: this
  }, "Gulp, Webpack, Git"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 37
    },
    __self: this
  }, "Linux, Windows"))), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
    style: {
      gridArea: 'o'
    },
    __source: {
      fileName: _jsxFileName,
      lineNumber: 41
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("h2", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 42
    },
    __self: this
  }, "\u041E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u0435"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("p", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 43
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("b", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 44
    },
    __self: this
  }, "\u0412\u0413\u0423 \u0438\u043C. \u041C\u0430\u0448\u0435\u0440\u043E\u0432\u0430"), ", 1999 \u2014 2004", react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("br", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 44
    },
    __self: this
  }), "\u0412\u044B\u0441\u0448\u0435\u0435, \u0442\u0435\u0445\u043D\u0438\u0447\u0435\u0441\u043A\u043E\u0435.", react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("br", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 45
    },
    __self: this
  }), "\u0421\u043F\u0435\u0446\u0438\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u0438: \u043C\u0430\u0442\u0435\u043C\u0430\u0442\u0438\u043A-\u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0438\u0441\u0442, \u043F\u0440\u0435\u043F\u043E\u0434\u0430\u0432\u0430\u0442\u0435\u043B\u044C \u043C\u0430\u0442\u0435\u043C\u0430\u0442\u0438\u043A\u0438 \u0438 \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0442\u0438\u043A\u0438.")), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
    style: {
      gridArea: 'h'
    },
    __source: {
      fileName: _jsxFileName,
      lineNumber: 50
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("h2", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 51
    },
    __self: this
  }, "\u0425\u043E\u0431\u0431\u0438"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("p", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 52
    },
    __self: this
  }, "\u041A\u0430\u0442\u0430\u044E\u0441\u044C \u043D\u0430 \u0432\u0435\u043B\u043E\u0441\u0438\u043F\u0435\u0434\u0435, \u0447\u0438\u0442\u0430\u044E, \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0440\u0443\u044E, \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u044E \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u043B\u0438\u0447\u043D\u044B\u0445 \u043F\u0440\u043E\u0435\u043A\u0442\u043E\u0432:"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("ul", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 53
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 54
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {
    href: "https://xsltdev.ru/",
    __source: {
      fileName: _jsxFileName,
      lineNumber: 54
    },
    __self: this
  }, "xsltdev.ru"), " \u2014 \u0441\u043F\u0440\u0430\u0432\u043E\u0447\u043D\u0438\u043A\u0438 \u043F\u043E HTML, CSS, XSLT, XPath;"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 55
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {
    href: "https://swgg.ru/",
    __source: {
      fileName: _jsxFileName,
      lineNumber: 55
    },
    __self: this
  }, "swgg.ru"), " \u2014 \u0444\u0430\u043D-\u0444\u043E\u0440\u0443\u043C \u043F\u043E \u0438\u0433\u0440\u0435 Star Wars.")))), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("hr", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 60
    },
    __self: this
  }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("h2", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 62
    },
    __self: this
  }, "\u041E\u043F\u044B\u0442 \u0440\u0430\u0431\u043E\u0442\u044B"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("h3", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 64
    },
    __self: this
  }, "BN Studio"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("p", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 65
    },
    __self: this
  }, "\u0430\u043F\u0440\u0435\u043B\u044C 2017 \u2014 \u043D\u0430\u0441\u0442\u043E\u044F\u0449\u0435\u0435 \u0432\u0440\u0435\u043C\u044F"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("ol", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 67
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 68
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {
    href: "https://bnweb.studio",
    __source: {
      fileName: _jsxFileName,
      lineNumber: 68
    },
    __self: this
  }, "BN Studio"), ", ", react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("time", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 68
    },
    __self: this
  }, "\u0430\u0432\u0433\u0443\u0441\u0442 2018 \u0433\u043E\u0434\u0430"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("br", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 68
    },
    __self: this
  }), "\u0421\u0442\u0430\u0442\u0438\u0447\u043D\u044B\u0439 HTML \u0441\u0430\u0439\u0442: HTML, LESS, JS, Gulp, Cloudflare"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 69
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {
    href: "https://skirollers.ru/",
    __source: {
      fileName: _jsxFileName,
      lineNumber: 69
    },
    __self: this
  }, "Ski Rollers"), ", ", react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("time", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 69
    },
    __self: this
  }, "\u0438\u044E\u043D\u044C 2018 \u0433\u043E\u0434\u0430"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("br", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 69
    },
    __self: this
  }), "\u041F\u0440\u043E\u0441\u0442\u043E\u0439 \u0441\u0430\u0439\u0442-\u0432\u0438\u0437\u0438\u0442\u043A\u0430: Wordpress, LESS"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 70
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {
    href: "https://ahec-tax.co.il/",
    dir: "rtl",
    __source: {
      fileName: _jsxFileName,
      lineNumber: 70
    },
    __self: this
  }, "\u05D0\u05E8\u05E6\u05D9, \u05D7\u05D9\u05D1\u05D4, \u05D0\u05DC\u05DE\u05E7\u05D9\u05D9\u05E1, \u05DB\u05D4\u05DF \u2014 \u05E4\u05EA\u05E8\u05D5\u05E0\u05D5\u05EA \u05DE\u05D9\u05E1\u05D5\u05D9"), ", ", react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("time", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 70
    },
    __self: this
  }, "\u043E\u043A\u0442\u044F\u0431\u0440\u044C 2017 \u0433\u043E\u0434\u0430"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("br", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 70
    },
    __self: this
  }), "\u0420\u0435\u0434\u0438\u0437\u0430\u0439\u043D \u043C\u0443\u043B\u044C\u0442\u0438\u044F\u0437\u044B\u0447\u043D\u043E\u0433\u043E \u043A\u043E\u0440\u043F\u043E\u0440\u0430\u0442\u0438\u0432\u043D\u043E\u0433\u043E \u0441\u0430\u0439\u0442\u0430: Wordpress, LESS")), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("h3", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 73
    },
    __self: this
  }, "\u0420\u0435\u043A\u043B\u0430\u043C\u043D\u043E\u0435 \u0430\u0433\u0435\u043D\u0442\u0441\u0442\u0432\u043E \xAB\u041A\u043B\u0451\u043D\xBB"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("p", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 74
    },
    __self: this
  }, "\u043D\u043E\u044F\u0431\u0440\u044C 2009 \u2014 2016"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("p", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 76
    },
    __self: this
  }, "\u0420\u0430\u0431\u043E\u0442\u0430\u043B \u043D\u0430\u0434 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u0435\u043C, \u0440\u0430\u0437\u0432\u0438\u0442\u0438\u0435\u043C \u0438 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u043E\u0439 \u0441\u0430\u0439\u0442\u043E\u0432 \u0430\u0433\u0435\u043D\u0442\u0441\u0442\u0432\u0430. \u0412 \u0441\u0432\u043E\u0431\u043E\u0434\u043D\u043E\u0435 \u0432\u0440\u0435\u043C\u044F \u043F\u0438\u0441\u0430\u043B \u0441\u0430\u0439\u0442\u044B \u0434\u043B\u044F \u043A\u043B\u0438\u0435\u043D\u0442\u043E\u0432 \u0430\u0433\u0435\u043D\u0442\u0441\u0442\u0432\u0430 \u0438\u043B\u0438 \u0443\u0434\u0430\u043B\u0435\u043D\u043D\u043E \u0437\u0430\u043D\u0438\u043C\u0430\u043B\u0441\u044F \u0444\u0440\u0438\u043B\u0430\u043D\u0441\u043E\u043C. \u0414\u043B\u044F \u0440\u0435\u043A\u043B\u0430\u043C\u043D\u043E\u0433\u043E \u0430\u0433\u0435\u043D\u0442\u0441\u0442\u0432\u0430 \u0441\u043E\u0437\u0434\u0430\u043B \u0438 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u043B \u0441\u0430\u0439\u0442\u044B:"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("ol", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 78
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 79
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {
    href: "http://klen.by/",
    __source: {
      fileName: _jsxFileName,
      lineNumber: 79
    },
    __self: this
  }, "\u0420\u0435\u043A\u043B\u0430\u043C\u043D\u043E\u0435 \u0430\u0433\u0435\u043D\u0442\u0441\u0442\u0432\u043E \xAB\u041A\u043B\u0451\u043D\xBB"), ", ", react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("time", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 79
    },
    __self: this
  }, "\u0438\u044E\u043B\u044C 2015 \u0433\u043E\u0434\u0430"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("br", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 79
    },
    __self: this
  }), "\u041A\u043E\u0440\u043F\u043E\u0440\u0430\u0442\u0438\u0432\u043D\u044B\u0439 \u0441\u0430\u0439\u0442: Symphony CMS, XSLT"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 80
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {
    href: "http://skinali.by/",
    __source: {
      fileName: _jsxFileName,
      lineNumber: 80
    },
    __self: this
  }, "\u041A\u0430\u0442\u0430\u043B\u043E\u0433 \u0441\u043A\u0438\u043D\u0430\u043B\u0435\u0439"), ", ", react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("time", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 80
    },
    __self: this
  }, "\u0441\u0435\u043D\u0442\u044F\u0431\u0440\u044C 2015 \u0433\u043E\u0434\u0430"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("br", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 80
    },
    __self: this
  }), "\u0424\u043E\u0442\u043E\u043A\u0430\u0442\u0430\u043B\u043E\u0433: Symphony CMS, XSLT")), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("p", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 83
    },
    __self: this
  }, "\u0424\u0440\u0438\u043B\u0430\u043D\u0441-\u0440\u0430\u0431\u043E\u0442\u044B:"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("ol", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 85
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 86
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {
    href: "https://fitness.edu.au/",
    __source: {
      fileName: _jsxFileName,
      lineNumber: 86
    },
    __self: this
  }, "Australian Institute of Fitness"), ", ", react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("br", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 86
    },
    __self: this
  }), "\u041E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0435 \u0443\u0447\u0440\u0435\u0436\u0434\u0435\u043D\u0438\u0435: Symphony CMS, XSLT, UIKit"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 87
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {
    href: "http://ratur.by/",
    __source: {
      fileName: _jsxFileName,
      lineNumber: 87
    },
    __self: this
  }, "\u0411\u0443\u0440\u043E\u0432\u0430\u044F \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u044F"), ", ", react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("br", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 87
    },
    __self: this
  }), "\u041A\u043E\u0440\u043F\u043E\u0440\u0430\u0442\u0438\u0432\u043D\u044B\u0439 \u0441\u0430\u0439\u0442: Wordpress"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 88
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {
    href: "http://teplo-vitebsk.by/",
    __source: {
      fileName: _jsxFileName,
      lineNumber: 88
    },
    __self: this
  }, "\u041C\u0430\u0433\u0430\u0437\u0438\u043D \u043E\u0442\u043E\u043F\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0433\u043E \u043E\u0431\u043E\u0440\u0443\u0434\u043E\u0432\u0430\u043D\u0438\u044F"), ", ", react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("br", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 88
    },
    __self: this
  }), "\u0418\u043D\u0442\u0435\u0440\u043D\u0435\u0442-\u043C\u0430\u0433\u0430\u0437\u0438\u043D: Wordpress, WooCommerce")), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("h3", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 91
    },
    __self: this
  }, "Creative People"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("p", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 92
    },
    __self: this
  }, "\u0441\u0435\u043D\u0442\u044F\u0431\u0440\u044C 2011 \u2014 \u043D\u043E\u044F\u0431\u0440\u044C 2012, \u043D\u043E\u044F\u0431\u0440\u044C 2015 \u2014 \u043C\u0430\u0439 2017"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("p", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 94
    },
    __self: this
  }, "\u0420\u0430\u0431\u043E\u0442\u0430\u043B \u0443\u0434\u0430\u043B\u0435\u043D\u043D\u043E \u0442\u0435\u0445\u043D\u043E\u043B\u043E\u0433\u043E\u043C \u0432 \u043E\u0442\u0434\u0435\u043B\u0435 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0438. \u0417\u0430\u043D\u0438\u043C\u0430\u043B\u0441\u044F \u0441\u043E\u043F\u0440\u043E\u0432\u043E\u0436\u0434\u0435\u043D\u0438\u0435\u043C \u0441\u0430\u0439\u0442\u043E\u0432 \u043A\u043B\u0438\u0435\u043D\u0442\u043E\u0432:"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("ol", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 96
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 97
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {
    href: "http://polyusgold.com/ru/",
    __source: {
      fileName: _jsxFileName,
      lineNumber: 97
    },
    __self: this
  }, "\u041F\u043E\u043B\u044E\u0441"), " \u2014 \u043A\u043E\u043D\u0442\u0435\u043D\u0442-\u043C\u0435\u043D\u0435\u0434\u0436\u043C\u0435\u043D\u0442, Bitrix;"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 98
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {
    href: "http://stada.ru/",
    __source: {
      fileName: _jsxFileName,
      lineNumber: 98
    },
    __self: this
  }, "\u0428\u0442\u0430\u0434\u0430"), " \u2014 \u043A\u043E\u043D\u0442\u0435\u043D\u0442-\u043C\u0435\u043D\u0435\u0434\u0436\u043C\u0435\u043D\u0442, Bitrix;"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 99
    },
    __self: this
  }, "\u041F\u0440\u0438\u0440\u043E\u0434\u0430 Amway \u2014 \u043A\u043E\u043D\u0442\u0435\u043D\u0442-\u043C\u0435\u043D\u0435\u0434\u0436\u043C\u0435\u043D\u0442, Bitrix;"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 100
    },
    __self: this
  }, "\u0424\u0438\u0442\u043D\u0435\u0441 \u043A\u043B\u0443\u0431\u044B \xAB\u0424\u0438\u0437\u0438\u043A\u0430\xBB \u2014 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0430 \u0438 \u0434\u043E\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u0441\u0430\u0439\u0442\u0430, \xAB\u041A\u043E\u0440\u043E\u0431\u043E\u0447\u043A\u0430\xBB;"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 101
    },
    __self: this
  }, "Merz \u2014 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0430 \u0438 \u0434\u043E\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u0441\u0430\u0439\u0442\u0430;"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 102
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {
    href: "http://carpethouse.ru/",
    __source: {
      fileName: _jsxFileName,
      lineNumber: 102
    },
    __self: this
  }, "Carpet House"), " \u2014 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0430 \u0441\u0430\u0439\u0442\u0430;"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 103
    },
    __self: this
  }, "\u0412\u043E\u0434\u043A\u0430 Saimaa \u2014 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0430 \u0441\u0430\u0439\u0442\u0430;"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 104
    },
    __self: this
  }, "Braer \u2014 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0430 \u0438 \u0434\u043E\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u0441\u0430\u0439\u0442\u0430.")), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("p", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 107
    },
    __self: this
  }, "\u0412\u0435\u0440\u0441\u0442\u043A\u043E\u0439 \u0448\u0430\u0431\u043B\u043E\u043D\u043E\u0432:"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("ol", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 109
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 110
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {
    href: "http://www.at-consulting.ru/",
    __source: {
      fileName: _jsxFileName,
      lineNumber: 110
    },
    __self: this
  }, "AT Consulting"), " \u2014 \u0432\u0435\u0440\u0441\u0442\u043A\u0430 \u0448\u0430\u0431\u043B\u043E\u043D\u043E\u0432;"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 111
    },
    __self: this
  }, "DSMU \u2014 \u0432\u0435\u0440\u0441\u0442\u043A\u0430 \u0448\u0430\u0431\u043B\u043E\u043D\u043E\u0432.")), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("p", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 114
    },
    __self: this
  }, "\u041A\u0440\u043E\u043C\u0435 \u044D\u0442\u043E\u0433\u043E \u0441\u043E\u0431\u0440\u0430\u043B \u0434\u0432\u0430 \u0441\u0430\u0439\u0442\u0430 \u043D\u0430 Symphony CMS:"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("ol", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 116
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 117
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {
    href: "http://jenialubich.com/",
    __source: {
      fileName: _jsxFileName,
      lineNumber: 117
    },
    __self: this
  }, "\u0421\u0430\u0439\u0442 \u043F\u0435\u0432\u0438\u0446\u044B \u0416\u0435\u043D\u0438 \u041B\u044E\u0431\u0438\u0447"), " \u2014 \u0441\u0431\u043E\u0440\u043A\u0430 \u0441\u0430\u0439\u0442\u0430, Symphony CMS;"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 118
    },
    __self: this
  }, "\u0418\u043D\u0433\u0440\u0443\u043F \u0421\u0442\u0421 \u2014 \u0441\u0431\u043E\u0440\u043A\u0430 \u0441\u0430\u0439\u0442\u0430, Symphony CMS.")), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("h3", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 121
    },
    __self: this
  }, "\u0421\u0442\u0443\u0434\u0438\u044F \u0410\u0440\u0442\u0435\u043C\u0438\u044F \u041B\u0435\u0431\u0435\u0434\u0435\u0432\u0430"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("p", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 122
    },
    __self: this
  }, "\u043D\u043E\u044F\u0431\u0440\u044C 2006 \u2014 \u043D\u043E\u044F\u0431\u0440\u044C 2009"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("p", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 124
    },
    __self: this
  }, "\u0420\u0430\u0431\u043E\u0442\u0430\u043B \u043A\u043E\u0434\u0435\u0440\u043E\u043C \u0432 \u043E\u0442\u0434\u0435\u043B\u0435 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0438. \u0417\u0430\u043D\u0438\u043C\u0430\u043B\u0441\u044F \u0441\u043E\u043F\u0440\u043E\u0432\u043E\u0436\u0434\u0435\u043D\u0438\u0435\u043C \u0441\u0430\u0439\u0442\u043E\u0432 \u043A\u043B\u0438\u0435\u043D\u0442\u043E\u0432 \u043D\u0430 \u0441\u0438\u0441\u0442\u0435\u043C\u0430\u0445 ", react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {
    href: "https://imprimatur.artlebedev.ru/",
    __source: {
      fileName: _jsxFileName,
      lineNumber: 124
    },
    __self: this
  }, "Imprimatur \u0438 Imprimatur II"), ":"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("ol", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 126
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 127
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {
    href: "https://www.artlebedev.ru/everything/vbank/site2/",
    __source: {
      fileName: _jsxFileName,
      lineNumber: 127
    },
    __self: this
  }, "\u0411\u0430\u043D\u043A \u0412\u043E\u0437\u0440\u043E\u0436\u0434\u0435\u043D\u0438\u0435"), ";"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 128
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {
    href: "https://www.artlebedev.ru/everything/gazprom/gazfond-site2/",
    __source: {
      fileName: _jsxFileName,
      lineNumber: 128
    },
    __self: this
  }, "\u041D\u041F\u0424 \xAB\u0413\u0430\u0437\u0444\u043E\u043D\u0434\xBB"), ";"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 129
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {
    href: "https://www.artlebedev.ru/everything/caravan/",
    __source: {
      fileName: _jsxFileName,
      lineNumber: 129
    },
    __self: this
  }, "\u041A\u0430\u0440\u0430\u0432\u0430\u043D"), ";"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 130
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {
    href: "https://www.artlebedev.ru/everything/medicina/site2/",
    __source: {
      fileName: _jsxFileName,
      lineNumber: 130
    },
    __self: this
  }, "\u041C\u0435\u0434\u0438\u0446\u0438\u043D\u0430"), ";"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 131
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {
    href: "https://www.artlebedev.ru/everything/imb/site2/",
    __source: {
      fileName: _jsxFileName,
      lineNumber: 131
    },
    __self: this
  }, "\u041C\u0435\u0436\u0434\u0443\u043D\u0430\u0440\u043E\u0434\u043D\u044B\u0439 \u043C\u043E\u0441\u043A\u043E\u0432\u0441\u043A\u0438\u0439 \u0431\u0430\u043D\u043A"), ";"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 132
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {
    href: "https://www.artlebedev.ru/everything/nomos/site/",
    __source: {
      fileName: _jsxFileName,
      lineNumber: 132
    },
    __self: this
  }, "\u041D\u043E\u043C\u043E\u0441-\u0431\u0430\u043D\u043A"), ";"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 133
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {
    href: "https://www.artlebedev.ru/everything/spb/site2/",
    __source: {
      fileName: _jsxFileName,
      lineNumber: 133
    },
    __self: this
  }, "\u0421\u0430\u0439\u0442 \u0433\u043E\u0440\u043E\u0434\u0430 \u0421\u0430\u043D\u043A\u0442-\u041F\u0435\u0442\u0435\u0440\u0431\u0443\u0440\u0433\u0430"), ";"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 134
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {
    href: "https://www.artlebedev.ru/everything/hp/site4/",
    __source: {
      fileName: _jsxFileName,
      lineNumber: 134
    },
    __self: this
  }, "Hewlett-Packard"), ".")), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("hr", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 137
    },
    __self: this
  }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("h2", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 139
    },
    __self: this
  }, "\u041F\u0440\u0435\u0434\u043F\u043E\u0447\u0442\u0435\u043D\u0438\u044F \u0432 \u0440\u0430\u0431\u043E\u0442\u0435"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("ul", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 141
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 142
    },
    __self: this
  }, "\u041B\u044E\u0431\u043B\u044E XSLT \u0438 \u0437\u0430\u0434\u0430\u0447\u0438, \u0441\u0432\u044F\u0437\u0430\u043D\u043D\u044B\u0435 \u0441 \u043F\u0440\u0435\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u0435\u043C \u0434\u0430\u043D\u043D\u044B\u0445. \u041B\u044E\u0431\u0438\u043C\u0430\u044F CMS \u2014 Symphony CMS."), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 143
    },
    __self: this
  }, "\u041D\u0440\u0430\u0432\u0438\u0442\u0441\u044F \u0441\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0438\u0435 \u043E\u0431\u044A\u0435\u043C\u044B \u0434\u0430\u043D\u043D\u044B\u0445 \u0438 \u043F\u0440\u043E\u0435\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0441\u0435\u043C\u0430\u043D\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u0431\u0438\u0431\u043B\u0438\u043E\u0442\u0435\u043A\u0438 \u0438 \u0431\u0430\u0437\u044B \u0437\u043D\u0430\u043D\u0438\u0439 \u043D\u0430 Mediawiki.")));
});

/***/ }),

/***/ 3:
/*!******************************!*\
  !*** multi ./pages/index.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! /var/www/html/bndby2/pages/index.js */"./pages/index.js");


/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("react");

/***/ })

/******/ });
//# sourceMappingURL=index.js.map