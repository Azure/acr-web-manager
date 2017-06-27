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
}

interface IMultiTagViewerState {
  
    error: string
}





export class MultiTagViewer extends React.Component<IMultiTagViewerProps, IMultiTagViewerState>{
    private cancel: CancelTokenSource = null;

    onLoadFailure(err: any) {
        this.setState({
            error: err
        } as IMultiTagViewerState);
    }
    componentWillUnmount(): void {
        if (this.cancel) {
            this.cancel.cancel("component unmounting");
            this.cancel = null;
        }
    }

   



    render(): JSX.Element {
        return (<div>
            <MultiTagList
                service={this.props.service}
                repositoryName={this.props.repositoryName}
                onLoadFailure={this.onLoadFailure.bind(this)}
            />
            </div>)


    }

}