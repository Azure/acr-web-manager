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
var repository_tag_viewer_1 = require("./repository-tag-viewer");
var Repository = (function (_super) {
    __extends(Repository, _super);
    function Repository(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            service: new docker_1.Docker(_this.props.params.registryName),
            isLoggedIn: false
        };
        return _this;
    }
    Repository.prototype.onLogout = function () {
        this.setState({
            isLoggedIn: false
        });
    };
    Repository.prototype.onLogin = function () {
        this.setState({
            isLoggedIn: true
        });
    };
    Repository.prototype.render = function () {
        var _this = this;
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
                            text: this.state.service.registryName,
                            key: "2",
                            onClick: function () { return react_router_1.browserHistory.push("/" + _this.props.params.registryName); }
                        },
                        {
                            text: this.props.params.repositoryName,
                            key: "3"
                        }
                    ], className: "breadcrumb" }),
                !this.state.isLoggedIn ?
                    null :
                    React.createElement("div", null,
                        React.createElement(repository_tag_viewer_1.RepositoryTagViewer, { service: this.state.service, params: this.props.params })))));
    };
    return Repository;
}(React.Component));
exports.Repository = Repository;
//# sourceMappingURL=repository.js.map