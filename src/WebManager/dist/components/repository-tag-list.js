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
var RepositoryTagList = (function (_super) {
    __extends(RepositoryTagList, _super);
    function RepositoryTagList(props) {
        var _this = _super.call(this, props) || this;
        _this.cancel = null;
        _this.state = {
            tags: null,
            showTags: _this.props.collapsable ? false : true,
            hasMoreTags: true,
            error: null
        };
        return _this;
    }
    RepositoryTagList.prototype.componentDidMount = function () {
        this.getMoreTags();
    };
    RepositoryTagList.prototype.componentWillUnmount = function () {
        if (this.cancel) {
            this.cancel.cancel("component unmounting");
            this.cancel = null;
        }
    };
    RepositoryTagList.prototype.renderTagListItems = function () {
        var _this = this;
        if (this.state.tags == null || !this.state.showTags) {
            return null;
        }
        else {
            return this.state.tags.map(function (tag) { return (React.createElement("li", { key: tag, className: "ms-ListItem is-selectable repo-list-item-tags-item", onClick: function () { _this.props.onTagClick(tag); } },
                React.createElement("i", { className: "ms-Icon ms-Icon--Tag repo-list-item-tags-icon", "aria-hidden": "true" }),
                tag)); });
        }
    };
    RepositoryTagList.prototype.setRepoTagsVisible = function (visible) {
        var _this = this;
        return function () {
            _this.setState({
                showTags: visible
            });
        };
    };
    RepositoryTagList.prototype.getMoreTags = function () {
        var _this = this;
        if (this.cancel) {
            return;
        }
        if (!this.state.hasMoreTags) {
            return;
        }
        var last = null;
        if (this.state.tags != null) {
            last = this.state.tags[this.state.tags.length - 1];
        }
        this.cancel = this.props.service.createCancelToken();
        this.props.service.getTagsForRepo(this.props.repositoryName, 10, last, this.cancel.token)
            .then(function (value) {
            _this.cancel = null;
            if (!value)
                return;
            _this.setState(function (prevState, props) {
                if (prevState.tags == null) {
                    prevState.tags = [];
                }
                for (var _i = 0, _a = value.tags; _i < _a.length; _i++) {
                    var tag = _a[_i];
                    prevState.tags.push(tag);
                }
                prevState.hasMoreTags = value.httpLink !== undefined;
                return prevState;
            });
        }).catch(function (err) {
            _this.cancel = null;
            _this.setState({
                error: err.toString()
            });
            if (_this.props.onLoadFailure) {
                _this.props.onLoadFailure(err);
            }
        });
    };
    RepositoryTagList.prototype.render = function () {
        return (React.createElement("div", null,
            this.state.tags == null || !this.props.collapsable ?
                null
                :
                    (this.state.showTags ?
                        React.createElement("span", { className: "ms-ListItem-secondaryText repo-list-item-tags-showhide", onClick: this.setRepoTagsVisible(false) }, "Hide tags")
                        :
                            React.createElement("span", { className: "ms-ListItem-secondaryText repo-list-item-tags-showhide", onClick: this.setRepoTagsVisible(true) },
                                "Show",
                                " " + this.state.tags.length.toString() + " ",
                                "tags")),
            this.state.tags == null ?
                (this.state.error == null ?
                    React.createElement("span", { className: "ms-ListItem-secondaryText" }, "Loading tags...")
                    :
                        React.createElement("span", { className: "ms-ListItem-secondaryText" }, this.state.error))
                :
                    React.createElement("ul", { className: "ms-List" },
                        this.renderTagListItems(),
                        this.state.tags == null || !this.state.hasMoreTags ?
                            null
                            :
                                React.createElement("li", { key: "<showmore>", className: "ms-ListItem is-selectable repo-list-item-tags-item", onClick: this.getMoreTags.bind(this) }, "Show more tags"))));
    };
    return RepositoryTagList;
}(React.Component));
RepositoryTagList.defaultProps = {
    service: null,
    repositoryName: null,
    collapsable: false,
    onTagClick: null,
    onLoadFailure: null
};
exports.RepositoryTagList = RepositoryTagList;
//# sourceMappingURL=repository-tag-list.js.map