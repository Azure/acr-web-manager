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
var checkbox_1 = require("./checkbox");
var multimanifest_1 = require("./multimanifest");
var Button_1 = require("office-ui-fabric-react/lib/Button");
var MultiTagList = (function (_super) {
    __extends(MultiTagList, _super);
    function MultiTagList(props) {
        var _this = _super.call(this, props) || this;
        _this.cancel = null;
        _this.hash = {};
        _this.state = {
            tags: null,
            hasMoreTags: true,
            error: null,
            optionsChecked: [],
            multiManifestTags: [],
        };
        return _this;
    }
    MultiTagList.prototype.changeEvent = function (event) {
        var checkedArray = this.state.optionsChecked;
        var selectedValue = event.target.value;
        if (event.target.checked === true) {
            if (this.followsConvention(selectedValue) && this.hash[selectedValue] != "")
                this.hash[selectedValue] = selectedValue.split("-")[1] + "-" + selectedValue.split("-")[2];
            checkedArray.push(selectedValue);
            this.setState({
                optionsChecked: checkedArray
            });
        }
        else {
            this.hash[selectedValue] = "";
            var valueIndex = checkedArray.indexOf(selectedValue);
            checkedArray.splice(valueIndex, 1);
            this.setState({
                optionsChecked: checkedArray
            });
        }
    };
    MultiTagList.prototype.componentDidMount = function () {
        this.getMoreTags();
    };
    MultiTagList.prototype.componentWillUnmount = function () {
        if (this.cancel) {
            this.cancel.cancel("component unmounting");
            this.cancel = null;
        }
    };
    MultiTagList.prototype.getMoreTags = function () {
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
    MultiTagList.prototype.getDigestAndSize = function (name) {
        var _this = this;
        this.cancel = this.props.service.createCancelToken();
        this.props.service.getManifest2(this.props.repositoryName, name, this.cancel.token)
            .then(function (value) {
            _this.cancel = null;
            if (!value)
                return;
            _this.setState(function (prevState, props) {
                if (prevState.multiManifestTags == null) {
                    prevState.multiManifestTags = [];
                }
                var tet = _this.hash[name];
                if (tet == undefined || tet == null || tet == "") {
                    if (_this.followsConvention(name)) {
                        var arch = name.split("-")[2];
                        var opS = name.split("-")[1];
                    }
                    else {
                        alert("Non valid names");
                    }
                }
                else {
                    var arch = tet.split("-")[1];
                    var opS = tet.split("-")[0];
                }
                prevState.multiManifestTags.push("architecture:" + arch + ";os:" + opS + ";" + _this.process(value));
                return prevState;
            });
        }).catch(function (err) {
            _this.cancel = null;
            if (_this.props.onLoadFailure) {
                _this.props.onLoadFailure(err);
            }
        });
    };
    MultiTagList.prototype.followsConvention = function (name) {
        return name.split("-").length == 3;
    };
    MultiTagList.prototype.makeManifest = function () {
        this.setState({
            multiManifestTags: []
        });
        for (var i = 0; i < this.state.optionsChecked.length; i++)
            this.getDigestAndSize(this.state.optionsChecked[i]);
    };
    MultiTagList.prototype.process = function (value) {
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
    MultiTagList.prototype.renderObject = function (value) {
        var cad = "";
        for (var key in value) {
            if (value.hasOwnProperty(key)) {
                if (key == "v1Compatibility") {
                    cad += key + ":" + this.renderJson(value[key]) + "\n";
                }
                else {
                    if (key == "manifest") {
                        cad += this.process(value[key]);
                    }
                    else {
                        if (key == "content-length" || key == "docker-content-digest") {
                            cad += key + ":" + this.process(value[key]) + ";";
                        }
                    }
                }
            }
        }
        return cad;
    };
    MultiTagList.prototype.renderJson = function (value) {
        return JSON.stringify(JSON.parse(value), null, 4);
    };
    MultiTagList.prototype.renderArray = function (value) {
        var cad = "";
        for (var x in value) {
            cad += this.process(x) + " ";
        }
        return cad;
    };
    MultiTagList.prototype.renderPrimitive = function (value) {
        return value.toString();
    };
    MultiTagList.prototype.changeText = function (e) {
        if (this.followsConvention(e.target.id) && e.target.value == "") {
            this.hash[e.target.id] = e.target.id.split("-")[1] + "-" + e.target.id.split("-")[2];
        }
        else {
            this.hash[e.target.id] = e.target.value;
        }
    };
    MultiTagList.prototype.render = function () {
        if (this.state.tags == null) {
            return null;
        }
        var outputCheckboxes = this.state.tags.map(function (string, i) {
            return (React.createElement("div", null,
                React.createElement(checkbox_1.Checkbox, { value: string, key: string + i, id: 'string_' + i, onChange: this.changeEvent.bind(this) }),
                React.createElement("label", { htmlFor: 'string_' + i }, string)));
        }, this);
        var selectTags = this.state.optionsChecked.map(function (string, i) {
            return (React.createElement("div", null,
                string,
                React.createElement("br", null),
                React.createElement("input", { className: "ms-TextField-field", type: "text", id: string, placeholder: this.hash[string], onChange: this.changeText.bind(this), list: "archs" }),
                React.createElement("datalist", { id: "archs" },
                    React.createElement("option", { value: "windows-amd64" }),
                    React.createElement("option", { value: "windows-386" }),
                    React.createElement("option", { value: "linux-amd64" }),
                    React.createElement("option", { value: "linux-386" }),
                    React.createElement("option", { value: "linux-arm" }),
                    React.createElement("option", { value: "linux-s390x" }),
                    React.createElement("option", { value: "linux-ppc64le" }))));
        }, this);
        return (React.createElement("div", null,
            React.createElement("div", { className: "ms-Grid" }, this.state.tags == null ?
                null
                :
                    React.createElement("div", { className: "ms-Grid-row" },
                        React.createElement("div", { className: "tag-viewer-list ms-Grid-col ms-u-sm3" },
                            outputCheckboxes,
                            React.createElement("br", null),
                            selectTags,
                            React.createElement("br", null),
                            React.createElement(Button_1.Button, { disabled: false, buttonType: Button_1.ButtonType.primary, onClick: this.makeManifest.bind(this) }, "MultiArch")),
                        React.createElement("div", { className: "tag-viewer-panel ms-Grid-col ms-u-sm9" }, this.state.multiManifestTags == null || this.state.multiManifestTags.length <= 0 ?
                            null
                            :
                                React.createElement("div", null,
                                    React.createElement(multimanifest_1.MultiManifest, { digests: this.state.multiManifestTags, service: this.props.service, repositoryName: this.props.repositoryName })))))));
    };
    return MultiTagList;
}(React.Component));
exports.MultiTagList = MultiTagList;
//# sourceMappingURL=multi-tag-list.js.map