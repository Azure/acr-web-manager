import * as React from "react";
import { browserHistory } from "react-router";
import { CancelTokenSource } from "axios";
import { Breadcrumb, IBreadcrumbItem } from "office-ui-fabric-react/lib/Breadcrumb";

import { Docker } from "../services/docker";
import { AuthBanner } from "./auth-banner";
import { RepositoryTagViewer } from "./repository-tag-viewer";

export interface IRepositoryProps { params: any }
interface IRepositoryState { isLoggedIn: boolean }

export class Repository extends React.Component<IRepositoryProps, IRepositoryState> {
    private service: Docker;
    private cancel: CancelTokenSource;

    constructor(props: IRepositoryProps) {
        super(props);
        this.service = new Docker(this.props.params.registryName);

        this.state = {
            isLoggedIn: false
        };
    }

    onLogout(): void {
        this.setState({
            isLoggedIn: false
        } as IRepositoryState);
    }

    onLogin(): void {
        this.setState({
            isLoggedIn: true
        } as IRepositoryState);
    }

    render(): JSX.Element {
        return (
            <div>
                <AuthBanner
                    onLogin={this.onLogin.bind(this)}
                    onLogout={this.onLogout.bind(this)}
                    service={this.service} />
                <div id="page" className="page">
                    <Breadcrumb items={[
                        {
                            text: "Home",
                            key: "1",
                            onClick: () => browserHistory.push("/")
                        },
                        {
                            text: this.service.registryName,
                            key: "2",
                            onClick: () => browserHistory.push("/" + this.props.params.registryName)
                        },
                        {
                            text: this.props.params.repositoryName,
                            key: "3"
                        }
                    ]} className="breadcrumb" />
                    {
                        !this.state.isLoggedIn ?
                            null :
                            <div>
                                <RepositoryTagViewer
                                    service={this.service}
                                    repositoryName={this.props.params.repositoryName}
                                    />
                            </div>
                    }
                </div>
            </div>
        );
    }
}
