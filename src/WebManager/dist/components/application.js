"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var react_router_1 = require("react-router");
var catalog_1 = require("./catalog");
var repository_1 = require("./repository");
var login_1 = require("./login");
var multiarch_1 = require("./multiarch");
var Application = (function (_super) {
    __extends(Application, _super);
    function Application(props) {
        return _super.call(this, props) || this;
    }
    Application.prototype.render = function () {
        return (React.createElement(react_router_1.Router, { history: react_router_1.browserHistory },
            React.createElement(react_router_1.Route, { path: "/", component: login_1.Login }),
            React.createElement(react_router_1.Route, { path: ":registryName", component: catalog_1.Catalog }),
            React.createElement(react_router_1.Route, { path: ":registryName/:repositoryName", component: repository_1.Repository }),
            React.createElement(react_router_1.Route, { path: ":registryName/:repositoryName/multiarch", component: multiarch_1.MultiArch })));
    };
    return Application;
}(React.Component));
exports.Application = Application;
//# sourceMappingURL=application.js.map