import * as React from "react";
import { CancelTokenSource } from "axios";
import { Docker } from "../services/docker";
import { MultiTagList } from "./multi-tag-list"
import {
    Button,
    ButtonType
} from "office-ui-fabric-react/lib/Button";

export interface IMultiTagViewerProps {
    service: Docker,
    repositoryName: string,
    params: any
}
interface IMultiTagViewerState {
    tagsLoadError: string
}

export class MultiTagViewer extends React.Component<IMultiTagViewerProps, IMultiTagViewerState>{
    private cancel: CancelTokenSource = null;
    constructor(props: IMultiTagViewerProps) {
        super(props);
        this.state = {
            tagsLoadError: null
        };
    }
    onLoadFailure(err: any) {
        this.setState({
            tagsLoadError: err
        } as IMultiTagViewerState);
    }
    componentWillUnmount(): void {
        if (this.cancel) {
            this.cancel.cancel("component unmounting");
            this.cancel = null;
        }
    }

    render(): JSX.Element {
        return (
            this.state.tagsLoadError ?
                <span className="ms-font-xxl">
                    {this.state.tagsLoadError.toString()}
                </span>
                :
                <div>
                    <MultiTagList
                        service={this.props.service}
                        repositoryName={this.props.repositoryName}
                        params={this.props.params}
                        onLoadFailure={this.onLoadFailure.bind(this)}
                    />
                </div>);
    }

}