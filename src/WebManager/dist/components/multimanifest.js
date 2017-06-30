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
var MultiArchManifest = (function () {
    function MultiArchManifest() {
    }
    return MultiArchManifest;
}());
var SingleManifest = (function () {
    function SingleManifest() {
    }
    return SingleManifest;
}());
var Platform = (function () {
    function Platform() {
    }
    return Platform;
}());
var MultiManifest = (function (_super) {
    __extends(MultiManifest, _super);
    function MultiManifest() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.cancel = null;
        return _this;
    }
    MultiManifest.prototype.createSingleManifest = function (info) {
        var allInfo = info.split(";", 3);
        var digestM, sizeM, osM, architectureM;
        digestM = "";
        sizeM = "";
        osM = "";
        architectureM = "";
        for (var i = 0; i < 3; i++) {
            if (allInfo[i].split(":")[0] === "docker-content-digest") {
                digestM = allInfo[i].split(":")[1] + ":" + allInfo[i].split(":")[2];
            }
            if (allInfo[i].split(":")[0] === "content-length") {
                sizeM = allInfo[i].split(":")[1];
            }
            if (allInfo[i].split(":")[0] === "tag") {
                osM = allInfo[i].split(":")[1].split("-")[1];
                architectureM = allInfo[i].split(":")[1].split("-")[2];
            }
        }
        var plat = {
            architecture: architectureM,
            os: osM
        };
        var man = {
            mediaType: "application/vnd.docker.distribution.manifest.v2+json",
            size: +sizeM,
            digest: digestM,
            platform: plat
        };
        return man;
    };
    MultiManifest.prototype.createMultiArchManifest = function () {
        if (this.props.digests == null || this.props.digests.length <= 0)
            return;
        var singleManifests = [];
        for (var i = 0; i < this.props.digests.length; i++) {
            singleManifests[i] = this.createSingleManifest(this.props.digests[i]);
        }
        var multiMan = {
            schemaVersion: 2,
            mediaType: "application/vnd.docker.distribution.manifest.list.v2+json",
            manifests: singleManifests
        };
        return multiMan;
    };
    MultiManifest.prototype.render = function () {
        return (React.createElement("div", null,
            this.renderValue(this.createMultiArchManifest()),
            React.createElement("br", null),
            React.createElement(Button_1.Button, { disabled: false, buttonType: Button_1.ButtonType.primary, onClick: this.pushManifest.bind(this) }, "MultiArch")));
    };
    MultiManifest.prototype.escapeSpecialChars = function (s) {
        return s.replace(/\\n/g, "\\n")
            .replace(/\\'/g, "\\'")
            .replace(/"/g, '\\"')
            .replace(/\\&/g, "\\&")
            .replace(/\\r/g, "\\r")
            .replace(/\\t/g, "\\t")
            .replace(/\\b/g, "\\b")
            .replace(/\\f/g, "\\f");
    };
    ;
    MultiManifest.prototype.pushManifest = function () {
        var _this = this;
        if (this.cancel) {
            return;
        }
        this.cancel = this.props.service.createCancelToken();
        this.props.service.putMultiArch(this.props.repositoryName, "Multi-Tag", this.cancel.token, '"' + JSON.stringify(this.createMultiArchManifest()).replace(/"/g, '\\"') + '"')
            .then(function (value) {
            _this.cancel = null;
            if (!value)
                return;
        });
    };
    MultiManifest.prototype.renderObject = function (value) {
        var props = [];
        for (var key in value) {
            if (value.hasOwnProperty(key)) {
                if (key == "v1Compatibility") {
                    props.push({ key: key, value: this.renderJson(value[key]) });
                }
                else {
                    props.push({ key: key, value: this.renderValue(value[key]) });
                }
            }
        }
        var el = (React.createElement("div", null,
            React.createElement("div", { className: "ms-Grid ms-font-m" }, props.map(function (x) { return (React.createElement("div", { className: "ms-Grid-row manifest-entry", key: x.key },
                React.createElement("div", { className: "ms-Grid-col ms-u-sm2" },
                    React.createElement("span", null, x.key)),
                React.createElement("div", { className: "ms-Grid-col ms-u-sm10" }, x.value))); }))));
        return el;
    };
    MultiManifest.prototype.renderValue = function (value) {
        if (typeof (value) === "string") {
            try {
                value = JSON.parse(value);
            }
            catch (err) { }
        }
        if (typeof (value) === "number" ||
            typeof (value) === "string" ||
            typeof (value) === "boolean") {
            return this.renderPrimitive(value);
        }
        else if (Array.isArray(value)) {
            return this.renderArray(value);
        }
        else {
            return this.renderObject(value);
        }
    };
    MultiManifest.prototype.renderPrimitive = function (value) {
        return (React.createElement("pre", null, value.toString()));
    };
    MultiManifest.prototype.renderArray = function (value) {
        var _this = this;
        return (React.createElement("ul", null, value.map(function (e, i) { return React.createElement("li", { key: i }, _this.renderValue(e)); })));
    };
    MultiManifest.prototype.renderJson = function (value) {
        return (React.createElement("pre", null, JSON.stringify(JSON.parse(value), null, 4)));
    };
    return MultiManifest;
}(React.Component));
exports.MultiManifest = MultiManifest;
//# sourceMappingURL=multimanifest.js.map