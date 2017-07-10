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
var Breadcrumb_1 = require("office-ui-fabric-react/lib/Breadcrumb");
var docker_1 = require("../services/docker");
var auth_banner_1 = require("./auth-banner");
var repository_list_1 = require("./repository-list");
var Catalog = (function (_super) {
    __extends(Catalog, _super);
    function Catalog(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            service: new docker_1.Docker(_this.props.params.registryName),
            isLoggedIn: false
        };
        return _this;
    }
    Catalog.prototype.onLogout = function () {
        this.setState({
            isLoggedIn: false
        });
    };
    Catalog.prototype.onLogin = function () {
        this.setState({
            isLoggedIn: true
        });
    };
    Catalog.prototype.onRepositoryClick = function (repository) {
        react_router_1.browserHistory.push("/" + this.props.params.registryName + "/" + repository);
    };
    Catalog.prototype.render = function () {
        return (React.createElement("div", null,
            React.createElement(auth_banner_1.AuthBanner, { onLogin: this.onLogin.bind(this), onLogout: this.onLogout.bind(this), service: this.state.service }),
            React.createElement("div", { id: "page", className: "page" },
                React.createElement(Breadcrumb_1.Breadcrumb, { items: [
                        {
                            text: "Home",
                            key: "1",
                            onClick: function () { return react_router_1.browserHistory.push("/"); }
                        },
                        {
                            text: this.props.params.registryName,
                            key: "2"
                        }
                    ], className: "breadcrumb" }),
                !this.state.isLoggedIn ?
                    null :
                    React.createElement("div", null,
                        React.createElement(repository_list_1.RepositoryList, { service: this.state.service, onRepositoryClick: this.onRepositoryClick.bind(this) })))));
    };
    return Catalog;
}(React.Component));
exports.Catalog = Catalog;
//# sourceMappingURL=catalog.js.map