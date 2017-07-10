import * as React from "react";
import { CancelTokenSource } from "axios";
import { Docker } from "../services/docker";
import { MultiManifest } from "./multimanifest";
import {
    Button,
    ButtonType
} from "office-ui-fabric-react/lib/Button";

export interface IMultiTagListProps {
    service: Docker,
    params: any,
    onLoadFailure?: (err: any) => void
}

interface IMultiTagListState {
    tags: string[],
    hasMoreTags: boolean,
    error: string,
    checkedTags: string[],
    multiManifestTags: string[],
    targetTag: string
}

export class MultiTagList extends React.Component<IMultiTagListProps, IMultiTagListState> {
    private cancel: CancelTokenSource = null;
    private hash: { [key: string]: string } = {};
   
    constructor(props: IMultiTagListProps) {
        super(props);
        this.state = {
            tags: null,
            hasMoreTags: true,
            error: null,
            checkedTags: [],
            multiManifestTags: [],
            targetTag: null
        };
    }

    changeToggle(e: React.FormEvent<HTMLInputElement>) {
        let tempArray = this.state.checkedTags;
        if (e.target.checked) {
            if (this.followsConvention(e.target.value) && this.hash[e.target.value] !== "") {
                var aux = e.target.value.split("-");
                this.hash[e.target.value] = `${aux[1]}-${aux[2]}`;
            }
            tempArray.push(e.target.value);
            this.setState({
                checkedTags: tempArray
            } as IMultiTagListState);

        } else {
            this.hash[e.target.value] = "";
            let valueIndex = tempArray.indexOf(e.target.value);
            tempArray.splice(valueIndex, 1);
            this.setState({
                checkedTags: tempArray
            } as IMultiTagListState);
        }
    }

    componentDidMount(): void {
        this.getMoreTags();
    }

    componentWillUnmount(): void {
        if (this.cancel) {
            this.cancel.cancel("component unmounting");
            this.cancel = null;
        }
    }

    getMoreTags(): void {
        if (this.cancel) {
            return;
        }
        if (!this.state.hasMoreTags) {
            return;
        }

        let last: string = null;
        if (this.state.tags != null) {
            last = this.state.tags[this.state.tags.length - 1];
        }
        this.cancel = this.props.service.createCancelToken();
        this.props.service.getTagsForRepo(this.props.params.repositoryName, 10, last, this.cancel.token)
            .then(value => {
                this.cancel = null;
                if (!value) return;

                this.setState((prevState, props) => {
                    if (prevState.tags == null) {
                        prevState.tags = [];
                    }
                    for (let tag of value.tags) {
                        prevState.tags.push(tag);
                    }

                    prevState.hasMoreTags = value.httpLink !== undefined;

                    return prevState;
                });
            }).catch(err => {
                this.cancel = null;
                this.setState({
                    error: err.toString()
                } as IMultiTagListState);

                if (this.props.onLoadFailure) {
                    this.props.onLoadFailure(err);
                }
            });
    }

    getDigestAndSize(name: string): void {
        this.cancel = this.props.service.createCancelToken();
        this.props.service.getManifestHeaders(this.props.params.repositoryName, name, this.cancel.token)
            .then(value => {
                this.cancel = null;
                if (!value) return

                this.setState((prevState, props) => {
                    if (prevState.multiManifestTags == null) {
                        prevState.multiManifestTags = [];
                    }
                    var tet = this.hash[name];
                    if (tet == undefined || tet == null || tet == "") {
                        if (this.followsConvention(name)) {
                            var aux = name.split("-");
                            var arch = aux[2];
                            var opS = aux[1];
                        }
                        else {
                            alert("Please specify the architecture and os");
                        }
                    }
                    else {
                        var aux2 = tet.split("-");
                        var arch = aux2[1];
                        var opS = aux2[0];
                        if (arch == undefined || opS == undefined) {
                            alert("Please use the following format os-architecture");
                        }
                    }

                    prevState.multiManifestTags.push("architecture:" + arch + ";os:" + opS + ";" + this.process(value));

                    return prevState;
                });
            }).catch(err => {
                this.cancel = null;
                this.setState({
                    error: err.toString()
                } as IMultiTagListState);

                if (this.props.onLoadFailure) {
                    this.props.onLoadFailure(err);
                }
            });
    }

    followsConvention(name: string): boolean {
        return name.split("-").length >= 3;
    }

    makeManifest(): void {
        this.setState({
            multiManifestTags: []
        } as IMultiTagListState);
        for (let i: number = 0; i < this.state.checkedTags.length; i++)
            this.getDigestAndSize(this.state.checkedTags[i]);
    }

    process(value: any): string {
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
    }

    renderObject(value: any): string {
        var cad: string = "";
        for (let key in value) {
            if (value.hasOwnProperty(key)) {
                if (key == "v1Compatibility") {
                    cad += key + ":" + this.renderJson(value[key]);
                } else {
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
    }

    renderJson(value: any): string {
        return JSON.stringify(JSON.parse(value), null, 4);
    }


    renderArray(value: any[]): string {
        var cad: string = "";
        for (let x in value) {
            cad += this.process(x) + " ";
        }
        return cad
    }

    renderPrimitive(value: any): string {
        return value.toString();
    }

    changeText(e: React.FormEvent<HTMLInputElement>) {
        if (this.followsConvention(e.target.id) && e.target.value == "") {
            this.hash[e.target.id] = e.target.id.split("-")[1] + "-" + e.target.id.split("-")[2];
        } else {
            this.hash[e.target.id] = e.target.value;
        }
    }

    changeTag(e: React.FormEvent<HTMLInputElement>) {
        //Here the replace function removes all Non-US-ASCII characters
        this.setState({
            targetTag: e.target.value.replace(/[^\x00-\x7F]/g, ""),
        } as IMultiTagListState);
    }
    render(): JSX.Element {
        if (this.state.tags == null) {
            return null;
        }
        let checkTags = this.state.tags.map((tag, i) => {
            return (
                <div>
                    <input type="checkbox" value={tag} id={"" + i} key={tag} onChange={this.changeToggle.bind(this)} />
                    <label>{tag}</label>
                </div>);
        }, this);
        let nameTags = this.state.checkedTags.map(function (string, i) {
            return (<div>
                {string}
                <br /><input className="ms-TextField-field" type="text"
                    id={string}
                    placeholder={this.hash[string]}
                    onChange={this.changeText.bind(this)}
                    list="archs"
                />
                <datalist id="archs">
                    <option value="windows-amd64" />
                    <option value="windows-386" />
                    <option value="linux-amd64" />
                    <option value="linux-386" />
                    <option value="linux-arm" />
                    <option value="linux-arm64" />
                    <option value="linux-s390x" />
                    <option value="linux-ppc64le" />
                </datalist>
            </div>)
        }, this);

        return (
            <div>
                <div className="ms-Grid">
                    {
                        this.state.tags == null ?
                            null
                            :
                            <div className="ms-Grid-row">
                                <div className="tag-viewer-list ms-Grid-col ms-u-sm3">
                                    Choose a name for the multi-arch tag
                                    <input className="ms-TextField-field" type="text"
                                        id="NewName"
                                        placeholder="Default Tag is Multi-Arch"
                                        onChange={this.changeTag.bind(this)}
                                    />
                                    <br />
                                    <br />
                                    {checkTags}
                                    <br />
                                    {nameTags}
                                    <br />
                                    <Button disabled={false}
                                        buttonType={ButtonType.primary}
                                        onClick={this.makeManifest.bind(this)}>
                                        MultiArch
                                    </Button>
                                </div>
                                <div className="tag-viewer-panel ms-Grid-col ms-u-sm9">
                                    {
                                        this.state.multiManifestTags == null || this.state.multiManifestTags.length <= 0 ?
                                            null
                                            :
                                            <div>
                                                <MultiManifest
                                                    digests={this.state.multiManifestTags}
                                                    service={this.props.service}
                                                    params={this.props.params}
                                                    targetTag={this.state.targetTag} />
                                            </div>
                                    }
                                </div>
                            </div>
                    }
                </div>
            </div>
        );
    }
}

