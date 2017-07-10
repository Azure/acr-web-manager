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
var RepositoryListEntry = (function (_super) {
    __extends(RepositoryListEntry, _super);
    function RepositoryListEntry() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RepositoryListEntry.prototype.render = function () {
        return (React.createElement("li", { className: "ms-ListItem is-selectable repo-list-item", onClick: this.props.onClick },
            React.createElement("div", { className: "repo-list-icon" },
                React.createElement("img", { className: "repo-list-icon-svg", src: "/res/registry-icon.svg" })),
            React.createElement("div", { className: "repo-list-content" },
                React.createElement("span", { className: "ms-ListItem-primaryText" }, this.props.repositoryName),
                React.createElement("span", { className: "ms-ListItem-secondaryText" }, "Click to view repository info"))));
    };
    return RepositoryListEntry;
}(React.Component));
RepositoryListEntry.defaultProps = {
    repositoryName: null,
    service: null,
    onClick: null
};
exports.RepositoryListEntry = RepositoryListEntry;
//# sourceMappingURL=repository-list-entry.js.map