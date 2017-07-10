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
var Button_1 = require("office-ui-fabric-react/lib/Button");
var credential_1 = require("../services/credential");
var AuthBanner = (function (_super) {
    __extends(AuthBanner, _super);
    function AuthBanner(props) {
        var _this = _super.call(this, props) || this;
        _this.credService = new credential_1.CredentialService();
        _this.cancel = null;
        _this.state = {
            loggedInAs: null,
            formUsername: "",
            formPassword: "",
            formMessage: ""
        };
        return _this;
    }
    AuthBanner.prototype.componentWillMount = function () {
        var credential = this.credService.getRegistryCredentials(this.props.service.registryName);
        this.setState({
            loggedInAs: credential != null ? credential.username : null
        });
        if (credential != null) {
            if (this.props.onLogin) {
                this.props.onLogin();
            }
        }
    };
    AuthBanner.prototype.componentWillUnmount = function () {
        if (this.cancel) {
            this.cancel.cancel("component unmounting");
            this.cancel = null;
        }
    };
    AuthBanner.prototype.onUsernameChange = function (e) {
        this.setState({
            formUsername: e.target.value.replace(/[^\x00-\x7F]/g, ""),
        });
    };
    AuthBanner.prototype.onPasswordChange = function (e) {
        this.setState({
            formPassword: e.target.value.replace(/[^\x00-\x7F]/g, ""),
        });
    };
    AuthBanner.prototype.onPasswordKeyPress = function (e) {
        if (e.charCode == 13) {
            this.submitCredential();
        }
    };
    AuthBanner.prototype.onLogout = function () {
        this.setState({
            loggedInAs: null
        });
        this.credService.setRegistryCredentials(this.props.service.registryName, null);
        if (this.props.onLogout) {
            this.props.onLogout();
        }
    };
    AuthBanner.prototype.submitCredential = function () {
        var _this = this;
        if (this.cancel) {
            return;
        }
        var cred = new credential_1.RegistryCredentials();
        cred.username = this.state.formUsername;
        cred.basicAuth = btoa(this.state.formUsername + ":" + this.state.formPassword);
        this.setState({
            formPassword: ""
        });
        this.cancel = this.props.service.createCancelToken();
        this.props.service.tryAuthenticate(cred, this.cancel.token)
            .then(function (success) {
            _this.cancel = null;
            if (success) {
                _this.setState({
                    loggedInAs: cred.username
                });
                _this.credService.setRegistryCredentials(_this.props.service.registryName, cred);
                if (_this.props.onLogin) {
                    _this.props.onLogin();
                }
            }
            else {
                _this.setState({
                    formMessage: "Invalid credentials"
                });
            }
        }).catch(function (err) {
            _this.cancel = null;
        });
    };
    AuthBanner.prototype.renderAuthPanel = function () {
        if (this.state.loggedInAs) {
            return null;
        }
        else {
            return (React.createElement("div", { className: "header header-auth-panel ms-bgColor-themeLight" },
                React.createElement("div", { className: "banner ms-Grid" },
                    React.createElement("div", { className: "ms-Grid-row banner-auth-row" },
                        React.createElement("div", { className: "ms-Grid-col ms-u-sm3" },
                            React.createElement("div", { className: "ms-TextField" },
                                React.createElement("input", { className: "ms-TextField-field", type: "text", placeholder: "Username", onChange: this.onUsernameChange.bind(this) }))),
                        React.createElement("div", { className: "ms-Grid-col ms-u-sm3" },
                            React.createElement("div", { className: "ms-TextField" },
                                React.createElement("input", { className: "ms-TextField-field", type: "password", placeholder: "Password", onChange: this.onPasswordChange.bind(this), onKeyPress: this.onPasswordKeyPress.bind(this) }))),
                        React.createElement("div", { className: "ms-Grid-col ms-u-sm2" },
                            React.createElement("div", null,
                                React.createElement(Button_1.Button, { className: "banner-auth-row-login-button", disabled: this.cancel != null, buttonType: Button_1.ButtonType.primary, onClick: this.submitCredential.bind(this) }, "Log in"))),
                        React.createElement("div", { className: "ms-Grid-col ms-u-sm4" },
                            React.createElement("span", { className: "ms-fontColor-black ms-font-l banner-auth-row-info" }, this.state.formMessage))))));
        }
    };
    AuthBanner.prototype.render = function () {
        return (React.createElement("div", null,
            React.createElement("div", { className: "header ms-bgColor-themeDarker" },
                React.createElement("div", { className: "banner banner-primary" },
                    React.createElement("span", { className: "banner-title ms-font-xxl ms-fontColor-white" },
                        React.createElement("a", { href: "/" }, "Azure Container Registry")),
                    React.createElement(LoginPanel, { loggedInAs: this.state.loggedInAs, onLogout: this.onLogout.bind(this) }))),
            this.renderAuthPanel()));
    };
    return AuthBanner;
}(React.Component));
exports.AuthBanner = AuthBanner;
var LoginPanel = (function (_super) {
    __extends(LoginPanel, _super);
    function LoginPanel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LoginPanel.prototype.render = function () {
        if (!this.props.loggedInAs) {
            return null;
        }
        else {
            return (React.createElement("div", { className: "banner-login-group" },
                React.createElement("span", { className: "banner-logged-in ms-font-l ms-fontColor-themeLight" },
                    "Logged in as user ",
                    this.props.loggedInAs),
                React.createElement("span", { className: "banner-logout ms-font-l ms-fontColor-themeLight", onClick: this.props.onLogout }, "(log out)")));
        }
    };
    return LoginPanel;
}(React.Component));
//# sourceMappingURL=auth-banner.js.map