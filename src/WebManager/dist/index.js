"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var ReactDOM = require("react-dom");
var ES6Promise = require("es6-promise");
var application_1 = require("./components/application");
ES6Promise.polyfill();
ReactDOM.render(React.createElement(application_1.Application, null), document.getElementById("router"));
//# sourceMappingURL=index.js.map