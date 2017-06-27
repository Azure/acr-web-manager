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
var Button_1 = require("office-ui-fabric-react/lib/Button");
var credential_1 = require("../services/credential");
var docker_1 = require("../services/docker");
var Login = (function (_super) {
    __extends(Login, _super);
    function Login(props) {
        var _this = _super.call(this, props) || this;
        _this.credService = new credential_1.CredentialService();
        _this.cancel = null;
        _this.state = {
            formRegistry: "",
            formUsername: "",
            formPassword: "",
            formMessage: "",
        };
        return _this;
    }
    Login.prototype.extractDomain = function (url) {
        var domain;
        if (url.indexOf("://") > -1) {
            domain = url.split('/')[2];
        }
        else {
            domain = url.split('/')[0];
        }
        return domain;
    };
    Login.prototype.componentWillUnmount = function () {
        if (this.cancel) {
            this.cancel.cancel("component unmounting");
            this.cancel = null;
        }
    };
    Login.prototype.onRegistryChange = function (e) {
        this.setState({
            formRegistry: e.target.value.replace(/[^\x00-\x7F]/g, ""),
        });
    };
    Login.prototype.onUsernameChange = function (e) {
        this.setState({
            formUsername: e.target.value.replace(/[^\x00-\x7F]/g, ""),
        });
    };
    Login.prototype.onPasswordChange = function (e) {
        this.setState({
            formPassword: e.target.value.replace(/[^\x00-\x7F]/g, ""),
        });
    };
    Login.prototype.onPasswordKeyPress = function (e) {
        if (e.charCode == 13) {
            this.submitCredential();
        }
    };
    Login.prototype.submitCredential = function () {
        var _this = this;
        if (this.cancel) {
            return;
        }
        var cred = new credential_1.RegistryCredentials();
        var service = new docker_1.Docker(this.extractDomain(this.state.formRegistry));
        cred.username = this.state.formUsername;
        cred.basicAuth = btoa("composetest:P==L//y==5=T/=7DP/4F/RYdc7CSs=WY");
        this.setState({
            formPassword: "",
            formMessage: "",
        });
        this.cancel = service.createCancelToken();
        service.tryAuthenticate(cred, this.cancel.token)
            .then(function (success) {
            _this.cancel = null;
            if (success) {
                _this.credService.setRegistryCredentials(service.registryName, cred);
                react_router_1.browserHistory.push("/" + service.registryName);
            }
            else {
                _this.setState({
                    formMessage: "Invalid credentials"
                });
            }
        }).catch(function (err) {
            _this.cancel = null;
            _this.setState({
                formMessage: "Network error"
            });
        });
    };
    Login.prototype.render = function () {
        return (React.createElement("div", null,
            React.createElement("div", { className: "header ms-bgColor-themeDarker" },
                React.createElement("div", { className: "banner banner-primary" },
                    React.createElement("span", { className: "banner-title ms-font-xxl ms-fontColor-white" },
                        React.createElement("a", { href: "/" }, "Azure Container Registry")))),
            React.createElement("div", { className: "login ms-bgColor-themeLight" },
                React.createElement("div", { className: "login-title" },
                    React.createElement("span", { className: "ms-font-xxl ms-fontColor-themeDarker" }, "Log in to Azure Container Registry Web Portal")),
                React.createElement("div", { className: "login-panel" },
                    React.createElement("div", { className: "ms-TextField login-field" },
                        React.createElement("input", { className: "ms-TextField-field", type: "text", placeholder: "Registry", onChange: this.onRegistryChange.bind(this) })),
                    React.createElement("div", { className: "ms-TextField login-field" },
                        React.createElement("input", { className: "ms-TextField-field", type: "text", placeholder: "Username", onChange: this.onUsernameChange.bind(this) })),
                    React.createElement("div", { className: "ms-TextField login-field" },
                        React.createElement("input", { className: "ms-TextField-field", type: "password", placeholder: "Password", onChange: this.onPasswordChange.bind(this), onKeyPress: this.onPasswordKeyPress.bind(this) })),
                    React.createElement("div", { className: "login-button" },
                        React.createElement(Button_1.Button, { disabled: this.cancel != null, buttonType: Button_1.ButtonType.primary, onClick: this.submitCredential.bind(this) }, "Log in")),
                    React.createElement("span", { className: "ms-fontColor-black ms-font-l login-message" }, this.state.formMessage)))));
    };
    return Login;
}(React.Component));
exports.Login = Login;
//# sourceMappingURL=login.js.map