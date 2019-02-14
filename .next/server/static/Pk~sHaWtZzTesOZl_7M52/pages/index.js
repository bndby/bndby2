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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__("RNiq");


/***/ }),

/***/ "RNiq":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// EXTERNAL MODULE: external "react"
var external_react_ = __webpack_require__("cDcd");
var external_react_default = /*#__PURE__*/__webpack_require__.n(external_react_);

// CONCATENATED MODULE: ./components/Age/index.js

var wasBurn = new Date(1981, 10, 16, 19, 55, 0, 0);
var now = new Date();
var age = new Date(Math.abs(now - wasBurn));

var Age_Age = function Age() {
  return external_react_default.a.createElement("span", null, age.getDate() - 1, ".", age.getMonth() < 10 ? '0' : '', age.getMonth(), ".", age.toISOString().slice(0, 4) - 1970, " ", age.getHours(), ":", age.getMinutes());
};

/* harmony default export */ var components_Age = (Age_Age);
// CONCATENATED MODULE: ./pages/index.js


var expirienceStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gridTemplateAreas: '"n o" "n h"',
  gridColumnGap: '1rem'
};
/* harmony default export */ var pages = __webpack_exports__["default"] = (function () {
  return external_react_default.a.createElement(external_react_default.a.Fragment, null, external_react_default.a.createElement("h1", null, "\u0411\u043E\u043D\u0434\u0430\u0440\u0435\u043D\u043A\u043E \u042E\u0440\u0438\u0439, \u0432\u0435\u0431-\u0440\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u0447\u0438\u043A"), external_react_default.a.createElement("p", null, "\u041C\u0435\u043D\u044F \u0437\u043E\u0432\u0443\u0442 \u0411\u043E\u043D\u0434\u0430\u0440\u0435\u043D\u043A\u043E \u042E\u0440\u0438\u0439, \u043C\u043D\u0435 ", external_react_default.a.createElement(components_Age, null), ". \u041B\u044E\u0431\u043B\u044E \u0436\u0435\u043D\u0443 \u0438 \u0434\u043E\u0447\u044C. \u0417\u0430\u043D\u0438\u043C\u0430\u044E\u0441\u044C \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u0435\u043C \u0441\u0430\u0439\u0442\u043E\u0432, \u0431\u0430\u0437 \u0437\u043D\u0430\u043D\u0438\u0439 \u0438 \u043E\u043D\u043B\u0430\u0439\u043D-\u0441\u043F\u0440\u0430\u0432\u043E\u0447\u043D\u0438\u043A\u043E\u0432."), external_react_default.a.createElement("ul", null, external_react_default.a.createElement("li", null, external_react_default.a.createElement("a", {
    href: "https://github.com/bndby/bndby"
  }, "Github")), external_react_default.a.createElement("li", null, "Telegram: ", external_react_default.a.createElement("a", {
    href: "https://t.me/bndby"
  }, "@bndby")), external_react_default.a.createElement("li", null, "E-mail: ", external_react_default.a.createElement("a", {
    href: "mailto:by@klen.by"
  }, "by@klen.by"))), external_react_default.a.createElement("hr", null), external_react_default.a.createElement("div", {
    style: expirienceStyle
  }, external_react_default.a.createElement("div", {
    style: {
      gridArea: 'n'
    }
  }, external_react_default.a.createElement("h2", null, "\u041D\u0430\u0432\u044B\u043A\u0438"), external_react_default.a.createElement("ol", null, external_react_default.a.createElement("li", null, "HTML, Markdown;"), external_react_default.a.createElement("li", null, "CSS, LESS, SCSS;"), external_react_default.a.createElement("li", null, "JavaScript, JQuery;"), external_react_default.a.createElement("li", null, "ES6, Node.js, React, Next.js;"), external_react_default.a.createElement("li", null, "XML, XSLT, XPath, SVG;"), external_react_default.a.createElement("li", null, "PHP, Parser;"), external_react_default.a.createElement("li", null, "MySQL;"), external_react_default.a.createElement("li", null, "WAI-ARIA;"), external_react_default.a.createElement("li", null, "Wordpress, Symphony CMS, Mediawiki, Tilda, Github Pages, Cloudflare."), external_react_default.a.createElement("li", null, "Gulp, Webpack, Git"), external_react_default.a.createElement("li", null, "Linux, Windows"))), external_react_default.a.createElement("div", {
    style: {
      gridArea: 'o'
    }
  }, external_react_default.a.createElement("h2", null, "\u041E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u0435"), external_react_default.a.createElement("p", null, external_react_default.a.createElement("b", null, "\u0412\u0413\u0423 \u0438\u043C. \u041C\u0430\u0448\u0435\u0440\u043E\u0432\u0430"), ", 1999 \u2014 2004", external_react_default.a.createElement("br", null), "\u0412\u044B\u0441\u0448\u0435\u0435, \u0442\u0435\u0445\u043D\u0438\u0447\u0435\u0441\u043A\u043E\u0435.", external_react_default.a.createElement("br", null), "\u0421\u043F\u0435\u0446\u0438\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u0438: \u043C\u0430\u0442\u0435\u043C\u0430\u0442\u0438\u043A-\u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0438\u0441\u0442, \u043F\u0440\u0435\u043F\u043E\u0434\u0430\u0432\u0430\u0442\u0435\u043B\u044C \u043C\u0430\u0442\u0435\u043C\u0430\u0442\u0438\u043A\u0438 \u0438 \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0442\u0438\u043A\u0438.")), external_react_default.a.createElement("div", {
    style: {
      gridArea: 'h'
    }
  }, external_react_default.a.createElement("h2", null, "\u0425\u043E\u0431\u0431\u0438"), external_react_default.a.createElement("p", null, "\u041A\u0430\u0442\u0430\u044E\u0441\u044C \u043D\u0430 \u0432\u0435\u043B\u043E\u0441\u0438\u043F\u0435\u0434\u0435, \u0447\u0438\u0442\u0430\u044E, \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0440\u0443\u044E, \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u044E \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u043B\u0438\u0447\u043D\u044B\u0445 \u043F\u0440\u043E\u0435\u043A\u0442\u043E\u0432:"), external_react_default.a.createElement("ul", null, external_react_default.a.createElement("li", null, external_react_default.a.createElement("a", {
    href: "https://xsltdev.ru/"
  }, "xsltdev.ru"), " \u2014 \u0441\u043F\u0440\u0430\u0432\u043E\u0447\u043D\u0438\u043A\u0438 \u043F\u043E HTML, CSS, XSLT, XPath;"), external_react_default.a.createElement("li", null, external_react_default.a.createElement("a", {
    href: "https://swgg.ru/"
  }, "swgg.ru"), " \u2014 \u0444\u0430\u043D-\u0444\u043E\u0440\u0443\u043C \u043F\u043E \u0438\u0433\u0440\u0435 Star Wars.")))), external_react_default.a.createElement("hr", null), external_react_default.a.createElement("h2", null, "\u041E\u043F\u044B\u0442 \u0440\u0430\u0431\u043E\u0442\u044B"), external_react_default.a.createElement("h3", null, "BN Studio"), external_react_default.a.createElement("p", null, "\u0430\u043F\u0440\u0435\u043B\u044C 2017 \u2014 \u043D\u0430\u0441\u0442\u043E\u044F\u0449\u0435\u0435 \u0432\u0440\u0435\u043C\u044F"), external_react_default.a.createElement("ol", null, external_react_default.a.createElement("li", null, external_react_default.a.createElement("a", {
    href: "https://bnweb.studio"
  }, "BN Studio"), ", ", external_react_default.a.createElement("time", null, "\u0430\u0432\u0433\u0443\u0441\u0442 2018 \u0433\u043E\u0434\u0430"), external_react_default.a.createElement("br", null), "\u0421\u0442\u0430\u0442\u0438\u0447\u043D\u044B\u0439 HTML \u0441\u0430\u0439\u0442: HTML, LESS, JS, Gulp, Cloudflare"), external_react_default.a.createElement("li", null, external_react_default.a.createElement("a", {
    href: "https://skirollers.ru/"
  }, "Ski Rollers"), ", ", external_react_default.a.createElement("time", null, "\u0438\u044E\u043D\u044C 2018 \u0433\u043E\u0434\u0430"), external_react_default.a.createElement("br", null), "\u041F\u0440\u043E\u0441\u0442\u043E\u0439 \u0441\u0430\u0439\u0442-\u0432\u0438\u0437\u0438\u0442\u043A\u0430: Wordpress, LESS"), external_react_default.a.createElement("li", null, external_react_default.a.createElement("a", {
    href: "https://ahec-tax.co.il/",
    dir: "rtl"
  }, "\u05D0\u05E8\u05E6\u05D9, \u05D7\u05D9\u05D1\u05D4, \u05D0\u05DC\u05DE\u05E7\u05D9\u05D9\u05E1, \u05DB\u05D4\u05DF \u2014 \u05E4\u05EA\u05E8\u05D5\u05E0\u05D5\u05EA \u05DE\u05D9\u05E1\u05D5\u05D9"), ", ", external_react_default.a.createElement("time", null, "\u043E\u043A\u0442\u044F\u0431\u0440\u044C 2017 \u0433\u043E\u0434\u0430"), external_react_default.a.createElement("br", null), "\u0420\u0435\u0434\u0438\u0437\u0430\u0439\u043D \u043C\u0443\u043B\u044C\u0442\u0438\u044F\u0437\u044B\u0447\u043D\u043E\u0433\u043E \u043A\u043E\u0440\u043F\u043E\u0440\u0430\u0442\u0438\u0432\u043D\u043E\u0433\u043E \u0441\u0430\u0439\u0442\u0430: Wordpress, LESS")), external_react_default.a.createElement("h3", null, "\u0420\u0435\u043A\u043B\u0430\u043C\u043D\u043E\u0435 \u0430\u0433\u0435\u043D\u0442\u0441\u0442\u0432\u043E \xAB\u041A\u043B\u0451\u043D\xBB"), external_react_default.a.createElement("p", null, "\u043D\u043E\u044F\u0431\u0440\u044C 2009 \u2014 2016"), external_react_default.a.createElement("p", null, "\u0420\u0430\u0431\u043E\u0442\u0430\u043B \u043D\u0430\u0434 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u0435\u043C, \u0440\u0430\u0437\u0432\u0438\u0442\u0438\u0435\u043C \u0438 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u043E\u0439 \u0441\u0430\u0439\u0442\u043E\u0432 \u0430\u0433\u0435\u043D\u0442\u0441\u0442\u0432\u0430. \u0412 \u0441\u0432\u043E\u0431\u043E\u0434\u043D\u043E\u0435 \u0432\u0440\u0435\u043C\u044F \u043F\u0438\u0441\u0430\u043B \u0441\u0430\u0439\u0442\u044B \u0434\u043B\u044F \u043A\u043B\u0438\u0435\u043D\u0442\u043E\u0432 \u0430\u0433\u0435\u043D\u0442\u0441\u0442\u0432\u0430 \u0438\u043B\u0438 \u0443\u0434\u0430\u043B\u0435\u043D\u043D\u043E \u0437\u0430\u043D\u0438\u043C\u0430\u043B\u0441\u044F \u0444\u0440\u0438\u043B\u0430\u043D\u0441\u043E\u043C. \u0414\u043B\u044F \u0440\u0435\u043A\u043B\u0430\u043C\u043D\u043E\u0433\u043E \u0430\u0433\u0435\u043D\u0442\u0441\u0442\u0432\u0430 \u0441\u043E\u0437\u0434\u0430\u043B \u0438 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u043B \u0441\u0430\u0439\u0442\u044B:"), external_react_default.a.createElement("ol", null, external_react_default.a.createElement("li", null, external_react_default.a.createElement("a", {
    href: "http://klen.by/"
  }, "\u0420\u0435\u043A\u043B\u0430\u043C\u043D\u043E\u0435 \u0430\u0433\u0435\u043D\u0442\u0441\u0442\u0432\u043E \xAB\u041A\u043B\u0451\u043D\xBB"), ", ", external_react_default.a.createElement("time", null, "\u0438\u044E\u043B\u044C 2015 \u0433\u043E\u0434\u0430"), external_react_default.a.createElement("br", null), "\u041A\u043E\u0440\u043F\u043E\u0440\u0430\u0442\u0438\u0432\u043D\u044B\u0439 \u0441\u0430\u0439\u0442: Symphony CMS, XSLT"), external_react_default.a.createElement("li", null, external_react_default.a.createElement("a", {
    href: "http://skinali.by/"
  }, "\u041A\u0430\u0442\u0430\u043B\u043E\u0433 \u0441\u043A\u0438\u043D\u0430\u043B\u0435\u0439"), ", ", external_react_default.a.createElement("time", null, "\u0441\u0435\u043D\u0442\u044F\u0431\u0440\u044C 2015 \u0433\u043E\u0434\u0430"), external_react_default.a.createElement("br", null), "\u0424\u043E\u0442\u043E\u043A\u0430\u0442\u0430\u043B\u043E\u0433: Symphony CMS, XSLT")), external_react_default.a.createElement("p", null, "\u0424\u0440\u0438\u043B\u0430\u043D\u0441-\u0440\u0430\u0431\u043E\u0442\u044B:"), external_react_default.a.createElement("ol", null, external_react_default.a.createElement("li", null, external_react_default.a.createElement("a", {
    href: "https://fitness.edu.au/"
  }, "Australian Institute of Fitness"), ", ", external_react_default.a.createElement("br", null), "\u041E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0435 \u0443\u0447\u0440\u0435\u0436\u0434\u0435\u043D\u0438\u0435: Symphony CMS, XSLT, UIKit"), external_react_default.a.createElement("li", null, external_react_default.a.createElement("a", {
    href: "http://ratur.by/"
  }, "\u0411\u0443\u0440\u043E\u0432\u0430\u044F \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u044F"), ", ", external_react_default.a.createElement("br", null), "\u041A\u043E\u0440\u043F\u043E\u0440\u0430\u0442\u0438\u0432\u043D\u044B\u0439 \u0441\u0430\u0439\u0442: Wordpress"), external_react_default.a.createElement("li", null, external_react_default.a.createElement("a", {
    href: "http://teplo-vitebsk.by/"
  }, "\u041C\u0430\u0433\u0430\u0437\u0438\u043D \u043E\u0442\u043E\u043F\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0433\u043E \u043E\u0431\u043E\u0440\u0443\u0434\u043E\u0432\u0430\u043D\u0438\u044F"), ", ", external_react_default.a.createElement("br", null), "\u0418\u043D\u0442\u0435\u0440\u043D\u0435\u0442-\u043C\u0430\u0433\u0430\u0437\u0438\u043D: Wordpress, WooCommerce")), external_react_default.a.createElement("h3", null, "Creative People"), external_react_default.a.createElement("p", null, "\u0441\u0435\u043D\u0442\u044F\u0431\u0440\u044C 2011 \u2014 \u043D\u043E\u044F\u0431\u0440\u044C 2012, \u043D\u043E\u044F\u0431\u0440\u044C 2015 \u2014 \u043C\u0430\u0439 2017"), external_react_default.a.createElement("p", null, "\u0420\u0430\u0431\u043E\u0442\u0430\u043B \u0443\u0434\u0430\u043B\u0435\u043D\u043D\u043E \u0442\u0435\u0445\u043D\u043E\u043B\u043E\u0433\u043E\u043C \u0432 \u043E\u0442\u0434\u0435\u043B\u0435 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0438. \u0417\u0430\u043D\u0438\u043C\u0430\u043B\u0441\u044F \u0441\u043E\u043F\u0440\u043E\u0432\u043E\u0436\u0434\u0435\u043D\u0438\u0435\u043C \u0441\u0430\u0439\u0442\u043E\u0432 \u043A\u043B\u0438\u0435\u043D\u0442\u043E\u0432:"), external_react_default.a.createElement("ol", null, external_react_default.a.createElement("li", null, external_react_default.a.createElement("a", {
    href: "http://polyusgold.com/ru/"
  }, "\u041F\u043E\u043B\u044E\u0441"), " \u2014 \u043A\u043E\u043D\u0442\u0435\u043D\u0442-\u043C\u0435\u043D\u0435\u0434\u0436\u043C\u0435\u043D\u0442, Bitrix;"), external_react_default.a.createElement("li", null, external_react_default.a.createElement("a", {
    href: "http://stada.ru/"
  }, "\u0428\u0442\u0430\u0434\u0430"), " \u2014 \u043A\u043E\u043D\u0442\u0435\u043D\u0442-\u043C\u0435\u043D\u0435\u0434\u0436\u043C\u0435\u043D\u0442, Bitrix;"), external_react_default.a.createElement("li", null, "\u041F\u0440\u0438\u0440\u043E\u0434\u0430 Amway \u2014 \u043A\u043E\u043D\u0442\u0435\u043D\u0442-\u043C\u0435\u043D\u0435\u0434\u0436\u043C\u0435\u043D\u0442, Bitrix;"), external_react_default.a.createElement("li", null, "\u0424\u0438\u0442\u043D\u0435\u0441 \u043A\u043B\u0443\u0431\u044B \xAB\u0424\u0438\u0437\u0438\u043A\u0430\xBB \u2014 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0430 \u0438 \u0434\u043E\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u0441\u0430\u0439\u0442\u0430, \xAB\u041A\u043E\u0440\u043E\u0431\u043E\u0447\u043A\u0430\xBB;"), external_react_default.a.createElement("li", null, "Merz \u2014 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0430 \u0438 \u0434\u043E\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u0441\u0430\u0439\u0442\u0430;"), external_react_default.a.createElement("li", null, external_react_default.a.createElement("a", {
    href: "http://carpethouse.ru/"
  }, "Carpet House"), " \u2014 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0430 \u0441\u0430\u0439\u0442\u0430;"), external_react_default.a.createElement("li", null, "\u0412\u043E\u0434\u043A\u0430 Saimaa \u2014 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0430 \u0441\u0430\u0439\u0442\u0430;"), external_react_default.a.createElement("li", null, "Braer \u2014 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0430 \u0438 \u0434\u043E\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u0441\u0430\u0439\u0442\u0430.")), external_react_default.a.createElement("p", null, "\u0412\u0435\u0440\u0441\u0442\u043A\u043E\u0439 \u0448\u0430\u0431\u043B\u043E\u043D\u043E\u0432:"), external_react_default.a.createElement("ol", null, external_react_default.a.createElement("li", null, external_react_default.a.createElement("a", {
    href: "http://www.at-consulting.ru/"
  }, "AT Consulting"), " \u2014 \u0432\u0435\u0440\u0441\u0442\u043A\u0430 \u0448\u0430\u0431\u043B\u043E\u043D\u043E\u0432;"), external_react_default.a.createElement("li", null, "DSMU \u2014 \u0432\u0435\u0440\u0441\u0442\u043A\u0430 \u0448\u0430\u0431\u043B\u043E\u043D\u043E\u0432.")), external_react_default.a.createElement("p", null, "\u041A\u0440\u043E\u043C\u0435 \u044D\u0442\u043E\u0433\u043E \u0441\u043E\u0431\u0440\u0430\u043B \u0434\u0432\u0430 \u0441\u0430\u0439\u0442\u0430 \u043D\u0430 Symphony CMS:"), external_react_default.a.createElement("ol", null, external_react_default.a.createElement("li", null, external_react_default.a.createElement("a", {
    href: "http://jenialubich.com/"
  }, "\u0421\u0430\u0439\u0442 \u043F\u0435\u0432\u0438\u0446\u044B \u0416\u0435\u043D\u0438 \u041B\u044E\u0431\u0438\u0447"), " \u2014 \u0441\u0431\u043E\u0440\u043A\u0430 \u0441\u0430\u0439\u0442\u0430, Symphony CMS;"), external_react_default.a.createElement("li", null, "\u0418\u043D\u0433\u0440\u0443\u043F \u0421\u0442\u0421 \u2014 \u0441\u0431\u043E\u0440\u043A\u0430 \u0441\u0430\u0439\u0442\u0430, Symphony CMS.")), external_react_default.a.createElement("h3", null, "\u0421\u0442\u0443\u0434\u0438\u044F \u0410\u0440\u0442\u0435\u043C\u0438\u044F \u041B\u0435\u0431\u0435\u0434\u0435\u0432\u0430"), external_react_default.a.createElement("p", null, "\u043D\u043E\u044F\u0431\u0440\u044C 2006 \u2014 \u043D\u043E\u044F\u0431\u0440\u044C 2009"), external_react_default.a.createElement("p", null, "\u0420\u0430\u0431\u043E\u0442\u0430\u043B \u043A\u043E\u0434\u0435\u0440\u043E\u043C \u0432 \u043E\u0442\u0434\u0435\u043B\u0435 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0438. \u0417\u0430\u043D\u0438\u043C\u0430\u043B\u0441\u044F \u0441\u043E\u043F\u0440\u043E\u0432\u043E\u0436\u0434\u0435\u043D\u0438\u0435\u043C \u0441\u0430\u0439\u0442\u043E\u0432 \u043A\u043B\u0438\u0435\u043D\u0442\u043E\u0432 \u043D\u0430 \u0441\u0438\u0441\u0442\u0435\u043C\u0430\u0445 ", external_react_default.a.createElement("a", {
    href: "https://imprimatur.artlebedev.ru/"
  }, "Imprimatur \u0438 Imprimatur II"), ":"), external_react_default.a.createElement("ol", null, external_react_default.a.createElement("li", null, external_react_default.a.createElement("a", {
    href: "https://www.artlebedev.ru/everything/vbank/site2/"
  }, "\u0411\u0430\u043D\u043A \u0412\u043E\u0437\u0440\u043E\u0436\u0434\u0435\u043D\u0438\u0435"), ";"), external_react_default.a.createElement("li", null, external_react_default.a.createElement("a", {
    href: "https://www.artlebedev.ru/everything/gazprom/gazfond-site2/"
  }, "\u041D\u041F\u0424 \xAB\u0413\u0430\u0437\u0444\u043E\u043D\u0434\xBB"), ";"), external_react_default.a.createElement("li", null, external_react_default.a.createElement("a", {
    href: "https://www.artlebedev.ru/everything/caravan/"
  }, "\u041A\u0430\u0440\u0430\u0432\u0430\u043D"), ";"), external_react_default.a.createElement("li", null, external_react_default.a.createElement("a", {
    href: "https://www.artlebedev.ru/everything/medicina/site2/"
  }, "\u041C\u0435\u0434\u0438\u0446\u0438\u043D\u0430"), ";"), external_react_default.a.createElement("li", null, external_react_default.a.createElement("a", {
    href: "https://www.artlebedev.ru/everything/imb/site2/"
  }, "\u041C\u0435\u0436\u0434\u0443\u043D\u0430\u0440\u043E\u0434\u043D\u044B\u0439 \u043C\u043E\u0441\u043A\u043E\u0432\u0441\u043A\u0438\u0439 \u0431\u0430\u043D\u043A"), ";"), external_react_default.a.createElement("li", null, external_react_default.a.createElement("a", {
    href: "https://www.artlebedev.ru/everything/nomos/site/"
  }, "\u041D\u043E\u043C\u043E\u0441-\u0431\u0430\u043D\u043A"), ";"), external_react_default.a.createElement("li", null, external_react_default.a.createElement("a", {
    href: "https://www.artlebedev.ru/everything/spb/site2/"
  }, "\u0421\u0430\u0439\u0442 \u0433\u043E\u0440\u043E\u0434\u0430 \u0421\u0430\u043D\u043A\u0442-\u041F\u0435\u0442\u0435\u0440\u0431\u0443\u0440\u0433\u0430"), ";"), external_react_default.a.createElement("li", null, external_react_default.a.createElement("a", {
    href: "https://www.artlebedev.ru/everything/hp/site4/"
  }, "Hewlett-Packard"), ".")), external_react_default.a.createElement("hr", null), external_react_default.a.createElement("h2", null, "\u041F\u0440\u0435\u0434\u043F\u043E\u0447\u0442\u0435\u043D\u0438\u044F \u0432 \u0440\u0430\u0431\u043E\u0442\u0435"), external_react_default.a.createElement("ul", null, external_react_default.a.createElement("li", null, "\u041B\u044E\u0431\u043B\u044E XSLT \u0438 \u0437\u0430\u0434\u0430\u0447\u0438, \u0441\u0432\u044F\u0437\u0430\u043D\u043D\u044B\u0435 \u0441 \u043F\u0440\u0435\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u0435\u043C \u0434\u0430\u043D\u043D\u044B\u0445. \u041B\u044E\u0431\u0438\u043C\u0430\u044F CMS \u2014 Symphony CMS."), external_react_default.a.createElement("li", null, "\u041D\u0440\u0430\u0432\u0438\u0442\u0441\u044F \u0441\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0438\u0435 \u043E\u0431\u044A\u0435\u043C\u044B \u0434\u0430\u043D\u043D\u044B\u0445 \u0438 \u043F\u0440\u043E\u0435\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0441\u0435\u043C\u0430\u043D\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u0431\u0438\u0431\u043B\u0438\u043E\u0442\u0435\u043A\u0438 \u0438 \u0431\u0430\u0437\u044B \u0437\u043D\u0430\u043D\u0438\u0439 \u043D\u0430 Mediawiki.")));
});

/***/ }),

/***/ "cDcd":
/***/ (function(module, exports) {

module.exports = require("react");

/***/ })

/******/ });