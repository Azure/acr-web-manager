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
var repository_tag_list_1 = require("./repository-tag-list");
var manifest_viewer_1 = require("./manifest-viewer");
var Button_1 = require("office-ui-fabric-react/lib/Button");
var react_router_1 = require("react-router");
var RepositoryTagViewer = (function (_super) {
    __extends(RepositoryTagViewer, _super);
    function RepositoryTagViewer(props) {
        var _this = _super.call(this, props) || this;
        _this.cancel = null;
        _this.state = {
            manifest: null,
            manifestError: null,
            tagsLoadError: null
        };
        return _this;
    }
    RepositoryTagViewer.prototype.onTagSelected = function (tag) {
        var _this = this;
        if (this.cancel) {
            this.cancel.cancel("select new tag");
        }
        this.cancel = this.props.service.createCancelToken();
        this.props.service.getManifest(this.props.repositoryName, tag, this.cancel.token)
            .then(function (value) {
            _this.cancel = null;
            if (!value)
                return;
            _this.setState({
                manifest: value.manifest,
                manifestError: null
            });
        }).catch(function (err) {
            _this.cancel = null;
            try {
                err.config.headers.Authorization = "Removed for privacy";
            }
            catch (err) { }
            _this.setState({
                manifest: null,
                manifestError: err
            });
        });
    };
    RepositoryTagViewer.prototype.onLoadFailure = function (err) {
        this.setState({
            tagsLoadError: err
        });
    };
    RepositoryTagViewer.prototype.componentWillUnmount = function () {
        if (this.cancel) {
            this.cancel.cancel("component unmounting");
            this.cancel = null;
        }
    };
    RepositoryTagViewer.prototype.render = function () {
        return (React.createElement("div", null,
            React.createElement("div", { className: "ms-Grid" }, this.state.tagsLoadError ?
                React.createElement("span", { className: "ms-font-xxl" }, this.state.tagsLoadError.toString())
                :
                    React.createElement("div", { className: "ms-Grid-row" },
                        React.createElement("div", { className: "tag-viewer-list ms-Grid-col ms-u-sm3" },
                            React.createElement(repository_tag_list_1.RepositoryTagList, { service: this.props.service, repositoryName: this.props.repositoryName, onTagClick: this.onTagSelected.bind(this), onLoadFailure: this.onLoadFailure.bind(this) }),
                            React.createElement("br", null),
                            React.createElement(Button_1.Button, { disabled: false, buttonType: Button_1.ButtonType.primary, onClick: this.multiArch.bind(this) }, "MultiArch")),
                        React.createElement("div", { className: "tag-viewer-panel ms-Grid-col ms-u-sm9" },
                            this.state.manifest == null ?
                                null
                                :
                                    (this.state.manifest instanceof String ?
                                        this.state.manifest
                                        :
                                            React.createElement(manifest_viewer_1.ManifestViewer, { manifest: this.state.manifest })),
                            this.state.manifestError == null ?
                                null
                                :
                                    React.createElement("pre", null,
                                        "An error occurred while loading manifest:\n",
                                        this.state.manifestError instanceof Error ?
                                            this.state.manifestError.toString() +
                                                this.state.manifestError.stack
                                            :
                                                JSON.stringify(this.state.manifestError, null, 4)))))));
    };
    RepositoryTagViewer.prototype.multiArch = function () {
        react_router_1.browserHistory.push("/" + this.props.params.registryName + "/" + this.props.params.repositoryName + "/multiarch");
    };
    return RepositoryTagViewer;
}(React.Component));
exports.RepositoryTagViewer = RepositoryTagViewer;
//# sourceMappingURL=repository-tag-viewer.js.map