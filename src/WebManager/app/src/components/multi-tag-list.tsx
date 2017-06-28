import * as React from "react";
import { CancelTokenSource } from "axios";
import { Docker } from "../services/docker";
import { Checkbox } from "./checkbox"

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
}

export class MultiTagList extends React.Component < IMultiTagListProps, IMultiTagListState > {
    private cancel: CancelTokenSource = null;

    constructor(props: IMultiTagListProps) {
        super(props)
        this.state = {
            tags: null,
			hasMoreTags: true,
            error: null,
			optionsChecked: []
        }
    }

    changeEvent(event: any) {
        
        let checkedArray = this.state.optionsChecked;
        let selectedValue = event.target.value;
        if (event.target.checked === true) {
            checkedArray.push(selectedValue);
            this.setState({
                optionsChecked: checkedArray
            } as IMultiTagListState);

        } else {
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
    makeManifest(): void {
        for (let i: number = 0; i < this.state.optionsChecked.length;i++)
            this.getDigestAndSize(i)
    }

    getDigestAndSize(tag: number): void{
        
        this.cancel = this.props.service.createCancelToken();
        var name: string = this.state.optionsChecked[tag]
        this.props.service.getManifest2(this.props.repositoryName, name, this.cancel.token)
            .then(value => {
                this.cancel = null
                if (!value) return null
                alert(name +";"+this.process(value))
            })


        
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



    render(): JSX.Element{
        if (this.state.tags == null) {
            return null
        }
       
        let outputCheckboxes = this.state.tags.map(function (string, i) {
            return (<div><Checkbox value={string} key={string+i} id={'string_' + i} onChange={this.changeEvent.bind(this)} /><label htmlFor={'string_' + i}>{string}</label></div>)
        }, this);

        return (
            <div>
                {
                    this.state.tags == null ?
                        null
                        :
                        (
							<div>
								<div>
									{outputCheckboxes}
								</div>
                                <div className="multi-button">
									<br/>
                                    <Button disabled={false}
                                        buttonType={ButtonType.primary}
                                        onClick={this.makeManifest.bind(this)}>
                                        Make Manifest
                                        </Button>
                                </div>
                            </div>
							)
                }                       
            </div>
            )
    }
}

