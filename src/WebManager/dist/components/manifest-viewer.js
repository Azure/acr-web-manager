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
var ManifestViewer = (function (_super) {
    __extends(ManifestViewer, _super);
    function ManifestViewer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ManifestViewer.prototype.renderPrimitive = function (value) {
        return (React.createElement("pre", null, value.toString()));
    };
    ManifestViewer.prototype.renderArray = function (value) {
        var _this = this;
        return (React.createElement("ul", null, value.map(function (e, i) { return React.createElement("li", { key: i }, _this.renderValue(e)); })));
    };
    ManifestViewer.prototype.renderJson = function (value) {
        return (React.createElement("pre", null, JSON.stringify(JSON.parse(value), null, 4)));
    };
    ManifestViewer.prototype.renderValue = function (value) {
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
    ManifestViewer.prototype.renderHistoryEntry = function (value) {
        var pairs = [];
        for (var key in value) {
            if (value.hasOwnProperty(key)) {
                pairs.push({ key: key, value: this.renderValue(value[key]) });
            }
        }
        return (React.createElement("div", null, pairs.map(function (e, i) { return (React.createElement("div", { key: e.key },
            React.createElement("span", null, e.key),
            React.createElement("pre", null, e.value))); })));
    };
    ManifestViewer.prototype.renderHistory = function (value) {
        var _this = this;
        var list = value.map(function (e, i) {
            return React.createElement("li", { key: i }, _this.renderHistoryEntry(e));
        });
        return (React.createElement("ul", null, list));
    };
    ManifestViewer.prototype.renderObject = function (value) {
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
    ManifestViewer.prototype.render = function () {
        return this.renderObject(this.props.manifest);
    };
    return ManifestViewer;
}(React.Component));
exports.ManifestViewer = ManifestViewer;
//# sourceMappingURL=manifest-viewer.js.map