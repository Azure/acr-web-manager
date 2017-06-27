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
var docker_1 = require("../services/docker");
var auth_banner_1 = require("./auth-banner");
var Breadcrumb_1 = require("office-ui-fabric-react/lib/Breadcrumb");
var react_router_1 = require("react-router");
var checkbox_1 = require("./checkbox");
var Button_1 = require("office-ui-fabric-react/lib/Button");
var MultiArch = (function (_super) {
    __extends(MultiArch, _super);
    function MultiArch(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            service: new docker_1.Docker(_this.props.params.registryName),
            isLoggedIn: false,
            optionsChecked: [],
        };
        return _this;
    }
    MultiArch.prototype.onLogout = function () {
        this.setState({
            isLoggedIn: false
        });
    };
    MultiArch.prototype.onLogin = function () {
        this.setState({
            isLoggedIn: true
        });
    };
    MultiArch.prototype.changeEvent = function (event) {
        var checkedArray = this.state.optionsChecked;
        var selectedValue = event.target.value;
        if (event.target.checked === true) {
            checkedArray.push(selectedValue);
            this.setState({
                optionsChecked: checkedArray
            });
        }
        else {
            var valueIndex = checkedArray.indexOf(selectedValue);
            checkedArray.splice(valueIndex, 1);
            this.setState({
                optionsChecked: checkedArray
            });
        }
    };
    MultiArch.prototype.makeManifest = function () {
    };
    MultiArch.prototype.render = function () {
        var _this = this;
        var outputCheckBoxes = (React.createElement("div", null,
            React.createElement("div", null,
                React.createElement(checkbox_1.Checkbox, { value: "Linux", id: 'string_', onChange: this.changeEvent.bind(this) }),
                React.createElement("label", null, " Linux ")),
            React.createElement("div", null,
                React.createElement(checkbox_1.Checkbox, { value: "Windows", id: 'string_', onChange: this.changeEvent.bind(this) }),
                React.createElement("label", null, " Windows "))));
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
                            text: this.props.params.repositoryName + " MultiArch",
                            key: "3"
                        }
                    ], className: "breadcrumb" }),
                !this.state.isLoggedIn ?
                    null :
                    React.createElement("div", null,
                        React.createElement("div", null, outputCheckBoxes),
                        React.createElement("div", null, JSON.stringify(this.state.optionsChecked)),
                        React.createElement("div", { className: "multi-button" },
                            React.createElement(Button_1.Button, { disabled: false, buttonType: Button_1.ButtonType.primary, onClick: this.makeManifest.bind(this) }, "Make Manifest"))))));
    };
    return MultiArch;
}(React.Component));
exports.MultiArch = MultiArch;
//# sourceMappingURL=multiarch.js.map