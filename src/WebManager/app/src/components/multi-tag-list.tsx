import * as React from "react";
import { CancelTokenSource } from "axios";
import { Docker } from "../services/docker";
import { Checkbox } from "./checkbox"
import { MultiManifest } from "./multimanifest"
import {
    Button,
    ButtonType
} from "office-ui-fabric-react/lib/Button";

export interface IMultiTagListProps {
    service: Docker,
    repositoryName: string,
    onLoadFailure?: (err: any) => void
}

interface IMultiTagListState {
    tags: string[],
    hasMoreTags: boolean,
    error: string,
    optionsChecked: string[] 
    multiManifestTags: string[]
}



export class MultiTagList extends React.Component < IMultiTagListProps, IMultiTagListState > {
    private cancel: CancelTokenSource = null;
    private hash: { [key: string]: string } = {};
    constructor(props: IMultiTagListProps) {
        super(props)
        this.state = {
            tags: null,
			hasMoreTags: true,
            error: null,
            optionsChecked: [],
            multiManifestTags: [],
           
        }
    }

    changeEvent(event: any) {
        
        let checkedArray = this.state.optionsChecked;
        let selectedValue = event.target.value;
        if (event.target.checked === true) {
            if (this.followsConvention(selectedValue) && this.hash[selectedValue]!="")
                this.hash[selectedValue] = selectedValue.split("-")[1] + "-" + selectedValue.split("-")[2]
            checkedArray.push(selectedValue);
            this.setState({
                optionsChecked: checkedArray
            } as IMultiTagListState);

        } else {
            this.hash[selectedValue]=""
            let valueIndex = checkedArray.indexOf(selectedValue);
            checkedArray.splice(valueIndex, 1);
            this.setState({
                optionsChecked: checkedArray
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

        let last: string = null
        if (this.state.tags != null) {
            last = this.state.tags[this.state.tags.length - 1];
        }
        this.cancel = this.props.service.createCancelToken();
        this.props.service.getTagsForRepo(this.props.repositoryName, 10, last, this.cancel.token)
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
        this.props.service.getManifest2(this.props.repositoryName, name, this.cancel.token)
            .then(value => {
                this.cancel = null
                if (!value) return 

                this.setState((prevState, props) => {
                    if (prevState.multiManifestTags == null) {
                        prevState.multiManifestTags = [];
                    }

                    var tet = this.hash[name]
                    if (tet == undefined || tet == null || tet == "") {
                        if (this.followsConvention(name)) {
                            var arch = name.split("-")[2]
                            var opS = name.split("-")[1]
                        }
                        else {
                            alert("Non valid names")
                        }
                    }
                    else {
                        var arch = tet.split("-")[1]
                        var opS = tet.split("-")[0]
                       
                    }
      
                    prevState.multiManifestTags.push("architecture:" + arch + ";os:" + opS + ";" + this.process(value));
                    return prevState;
                });



            
            }).catch(err => {
                this.cancel = null
                if (this.props.onLoadFailure) {
                    this.props.onLoadFailure(err);
                }
            })


    }

    followsConvention(name: string): boolean {
        return name.split("-").length==3
    }
    makeManifest(): void {
        this.setState({
            multiManifestTags: []
        } as IMultiTagListState);
        for (let i: number = 0; i < this.state.optionsChecked.length; i++)
            this.getDigestAndSize(this.state.optionsChecked[i])
        
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
        var cad:   string=""
        for (let key in value) {
            if (value.hasOwnProperty(key)) {
                if (key == "v1Compatibility") {
                    cad+=key+":"+this.renderJson(value[key])+"\n"
                } else {
                    if (key == "manifest") {
                        cad +=  this.process(value[key]) 
                    }
                    else {
                        if (key == "content-length" || key == "docker-content-digest") {
                            cad += key + ":" + this.process(value[key]) + ";"
                        }
                    }
                    
                }
            }
        }
        

        
        return cad
    }

    renderJson(value: any): string {
        return JSON.stringify(JSON.parse(value), null, 4)
            
    }


    renderArray(value: any[]): string {
        var cad: string =""
        for (let x in value) {
            cad+=this.process(x)+" "
        }

        return cad
            
                
            
        
    }

    renderPrimitive(value: any): string {
        return value.toString()
    }


    changeText(e: React.FormEvent<HTMLInputElement>) {
        
        if (this.followsConvention(e.target.id) && e.target.value == "") {
            this.hash[e.target.id] = e.target.id.split("-")[1]+"-"+e.target.id.split("-")[2]
        } else {
            this.hash[e.target.id] = e.target.value

        }
    }
    render(): JSX.Element {
        if (this.state.tags == null) {
            return null
        }
        let outputCheckboxes = this.state.tags.map(function (string, i) {
            return (<div><Checkbox value={string} key={string + i} id={'string_' + i} onChange={this.changeEvent.bind(this)} /><label htmlFor={'string_' + i}>{string}</label>
            </div>)
        }, this);
        let selectTags = this.state.optionsChecked.map(function (string, i) {
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
                    <option value="linux-s390x" />
                    <option value="linux-ppc64le" />
                </datalist>
                    </div>)
        }, this)

        return (
            <div>
             
                      <div className="ms-Grid">
                    {
                        this.state.tags == null ?
                            null
                            :
                            <div className="ms-Grid-row">
                                <div className="tag-viewer-list ms-Grid-col ms-u-sm3">
                                    {outputCheckboxes}
                                    <br />
                                    {selectTags}
                                    <br />
                                    <Button disabled={false}
                                        buttonType={ButtonType.primary}
                                        onClick={this.makeManifest.bind(this)}>
                                        MultiArch
                                    </Button>
                                </div>
                                    
                                
                                <div className="tag-viewer-panel ms-Grid-col ms-u-sm9">
                                    {
                                        this.state.multiManifestTags == null || this.state.multiManifestTags.length<=0 ?
                                            null
                                            :
                                            <div>
                                                <MultiManifest
                                                    digests={this.state.multiManifestTags}
                                                    service={this.props.service}
                                                    repositoryName={this.props.repositoryName} />
                                                

                                            </div>
                                            
                                    }
                                    
                                </div>
                            </div>
                    }
                </div>
            </div>
            )
    }
}

