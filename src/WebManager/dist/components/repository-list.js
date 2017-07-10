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
var repository_list_entry_1 = require("./repository-list-entry");
var RepositoryList = (function (_super) {
    __extends(RepositoryList, _super);
    function RepositoryList(props) {
        var _this = _super.call(this, props) || this;
        _this.cancel = null;
        _this.state = {
            repositories: null,
            hasMoreRepositories: true
        };
        return _this;
    }
    RepositoryList.prototype.componentDidMount = function () {
        this.getMoreRepos();
    };
    RepositoryList.prototype.componentWillUnmount = function () {
        if (this.cancel) {
            this.cancel.cancel("component unmounting");
            this.cancel = null;
        }
    };
    RepositoryList.prototype.getMoreRepos = function () {
        var _this = this;
        if (this.cancel) {
            return;
        }
        if (!this.state.hasMoreRepositories) {
            return;
        }
        var lastRepo = null;
        if (this.state.repositories != null) {
            lastRepo = this.state.repositories[this.state.repositories.length - 1];
        }
        this.cancel = this.props.service.createCancelToken();
        this.props.service.getRepos(10, lastRepo, this.cancel.token)
            .then(function (value) {
            _this.cancel = null;
            if (!value)
                return;
            _this.setState(function (prevState, props) {
                if (prevState.repositories == null) {
                    prevState.repositories = [];
                }
                for (var _i = 0, _a = value.repositories; _i < _a.length; _i++) {
                    var repository = _a[_i];
                    prevState.repositories.push(repository);
                }
                prevState.hasMoreRepositories = value.httpLink !== undefined;
                return prevState;
            });
        }).catch(function (err) {
            _this.cancel = null;
        });
    };
    RepositoryList.prototype.renderRepositories = function () {
        var _this = this;
        return this.state.repositories.map(function (repository) { return (React.createElement(repository_list_entry_1.RepositoryListEntry, { key: repository, repositoryName: repository, service: _this.props.service, onClick: function () { _this.props.onRepositoryClick(repository); } })); });
    };
    RepositoryList.prototype.render = function () {
        if (this.state.repositories != null) {
            if (this.state.repositories.length > 0) {
                return (React.createElement("ul", { className: "ms-List" },
                    this.renderRepositories(),
                    this.state.repositories == null || !this.state.hasMoreRepositories ?
                        null
                        :
                            React.createElement("li", { key: "<showmore>", className: "ms-ListItem is-selectable repo-list-item clickable" },
                                React.createElement("span", { className: "ms-ListItem-primaryText", onClick: this.getMoreRepos.bind(this) }, "Show more repositories"))));
            }
            else {
                return (React.createElement("span", { className: "ms-font-l" }, "There are no repositories under this registry."));
            }
        }
        else {
            return null;
        }
    };
    return RepositoryList;
}(React.Component));
exports.RepositoryList = RepositoryList;
//# sourceMappingURL=repository-list.js.map