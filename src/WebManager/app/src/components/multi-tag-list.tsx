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
    optionsChecked: any 
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
        alert("The tags you selected are: \n"+this.state.optionsChecked)
    }

    render(): JSX.Element{
        if (this.state.tags == null) {
            return null
        }
       
        let outputCheckboxes = this.state.tags.map(function (string, i) {
            return (<div><Checkbox value={string} id={'string_' + i} onChange={this.changeEvent.bind(this)} /><label htmlFor={'string_' + i}>{string}</label></div>)
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

