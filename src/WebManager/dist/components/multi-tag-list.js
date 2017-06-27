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
var Button_1 = require("office-ui-fabric-react/lib/Button");
var MultiTagList = (function (_super) {
    __extends(MultiTagList, _super);
    function MultiTagList(props) {
        var _this = _super.call(this, props) || this;
        _this.cancel = null;
        _this.state = {
            tags: null,
            hasMoreTags: true,
            error: null,
            optionsChecked: []
        };
        return _this;
    }
    MultiTagList.prototype.changeEvent = function (event) {
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
    MultiTagList.prototype.makeManifest = function () {
        alert("The tags you selected are: \n" + this.state.optionsChecked);
    };
    MultiTagList.prototype.render = function () {
        if (this.state.tags == null) {
            return null;
        }
        var outputCheckboxes = this.state.tags.map(function (string, i) {
            return (React.createElement("div", null,
                React.createElement(checkbox_1.Checkbox, { value: string, id: 'string_' + i, onChange: this.changeEvent.bind(this) }),
                React.createElement("label", { htmlFor: 'string_' + i }, string)));
        }, this);
        return (React.createElement("div", null, this.state.tags == null ?
            null
            :
                (React.createElement("div", null,
                    React.createElement("div", null, outputCheckboxes),
                    React.createElement("div", { className: "multi-button" },
                        React.createElement(Button_1.Button, { disabled: false, buttonType: Button_1.ButtonType.primary, onClick: this.makeManifest.bind(this) }, "Make Manifest"))))));
    };
    return MultiTagList;
}(React.Component));
exports.MultiTagList = MultiTagList;
//# sourceMappingURL=multi-tag-list.js.map