import * as React from "react";
import { CancelTokenSource } from "axios";
import { Docker } from "../services/docker";
import { RepositoryTagList } from "./repository-tag-list";
import { ManifestViewer } from "./manifest-viewer";
import {
    Button,
    ButtonType
} from "office-ui-fabric-react/lib/Button";
import { browserHistory } from "react-router";

export interface IRepositoryTagViewerProps {
    repositoryName: string,
    service: Docker
    params: any
}
interface IRepositoryTagViewerState {
    manifest: any,
    manifestError: any,
    tagsLoadError: any
}

export class RepositoryTagViewer extends React.Component<IRepositoryTagViewerProps, IRepositoryTagViewerState> {
    private cancel: CancelTokenSource = null;
    constructor(props: IRepositoryTagViewerProps) {
        super(props);
        this.state = {
            manifest: null,
            manifestError: null,
            tagsLoadError: null
        };
    }

    onTagSelected(tag: string): void {
        if (this.cancel) {
            this.cancel.cancel("select new tag");
        }
        this.cancel = this.props.service.createCancelToken();

        this.props.service.getManifest(this.props.repositoryName, tag, this.cancel.token)
            .then(value => {
                this.cancel = null;
                if (!value) return;

                this.setState({
                    manifest: value.manifest,
                    manifestError: null
                } as IRepositoryTagViewerState);
            }).catch(err => {
                this.cancel = null;

                try {
                    err.config.headers.Authorization = "Removed for privacy";
                }
                catch (err) { }

                this.setState({
                    manifest: null,
                    manifestError: err
                } as IRepositoryTagViewerState);
            });
    }

    onLoadFailure(err: any) {
        this.setState({
            tagsLoadError: err
        } as IRepositoryTagViewerState);
    }

    componentWillUnmount(): void {
        if (this.cancel) {
            this.cancel.cancel("component unmounting");
            this.cancel = null;
        }
    }

    render(): JSX.Element {
  
        return (
            <div>
                <div className="ms-Grid">
                    {
                        this.state.tagsLoadError ?
                            <span className="ms-font-xxl">
                                {this.state.tagsLoadError.toString()}
                            </span>
                            :
                            <div className="ms-Grid-row">
                                <div className="tag-viewer-list ms-Grid-col ms-u-sm3">
                  
                                    <RepositoryTagList
                                        service={this.props.service}
                                        repositoryName={this.props.repositoryName}
                                        onTagClick={this.onTagSelected.bind(this)}
                                        onLoadFailure={this.onLoadFailure.bind(this)} />
                                    <br/>
                                    <Button disabled={false}
                                        buttonType={ButtonType.primary}
                                        onClick={this.multiArch.bind(this)}>
                                        MultiArch
                                        </Button>
                                </div>
                                    
                                
                                <div className="tag-viewer-panel ms-Grid-col ms-u-sm9">
                                    {
                                        this.state.manifest == null ?
                                            null
                                            :
                                            (this.state.manifest instanceof String ?
                                                this.state.manifest
                                                :
                                                <ManifestViewer
                                                    manifest={this.state.manifest} />
                                            )
                                    }
                                    {
                                        this.state.manifestError == null ?
                                            null
                                            :
                                            <pre>
                                                {"An error occurred while loading manifest:\n"}
                                                {
                                                    this.state.manifestError instanceof Error ?
                                                        this.state.manifestError.toString() +
                                                            this.state.manifestError.stack
                                                        :
                                                        JSON.stringify(this.state.manifestError, null, 4)
                                                }
                                            </pre>
                                    }
                                </div>
                            </div>
                    }
                </div>
            </div>

        );
    }

    multiArch(): void {
        browserHistory.push(`/${this.props.params.registryName}/${this.props.params.repositoryName}/multiarch`);
    }
 
}
