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
var multi_tag_list_1 = require("./multi-tag-list");
var MultiTagViewer = (function (_super) {
    __extends(MultiTagViewer, _super);
    function MultiTagViewer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.cancel = null;
        return _this;
    }
    MultiTagViewer.prototype.onLoadFailure = function (err) {
        this.setState({
            error: err
        });
    };
    MultiTagViewer.prototype.componentWillUnmount = function () {
        if (this.cancel) {
            this.cancel.cancel("component unmounting");
            this.cancel = null;
        }
    };
    MultiTagViewer.prototype.render = function () {
        return (React.createElement("div", null,
            React.createElement(multi_tag_list_1.MultiTagList, { service: this.props.service, repositoryName: this.props.repositoryName, onLoadFailure: this.onLoadFailure.bind(this) })));
    };
    return MultiTagViewer;
}(React.Component));
exports.MultiTagViewer = MultiTagViewer;
//# sourceMappingURL=multi-tag-viewer.js.map