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
var Checkbox = (function (_super) {
    __extends(Checkbox, _super);
    function Checkbox(props) {
        return _super.call(this, props) || this;
    }
    Checkbox.prototype.render = function () {
        return (React.createElement("input", { type: "checkbox", id: this.props.id, value: this.props.value, onChange: this.props.onChange }));
    };
    return Checkbox;
}(React.Component));
exports.Checkbox = Checkbox;
//# sourceMappingURL=checkbox.js.map