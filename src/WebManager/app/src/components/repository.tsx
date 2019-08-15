import * as React from "react";
import history from "./history";
import { Breadcrumb, IBreadcrumbItem } from "office-ui-fabric-react/lib/Breadcrumb";

import { Docker } from "../services/docker";
import { AuthBanner } from "./auth-banner";
import { RepositoryTagViewer } from "./repository-tag-viewer";

export interface IRepositoryProps { match: any }
interface IRepositoryState { isLoggedIn: boolean, service: Docker }

export class Repository extends React.Component<IRepositoryProps, IRepositoryState> {
    constructor(props: IRepositoryProps) {
        super(props);

        this.state = {
            service: new Docker(this.props.match.params.registryName),
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
                    service={this.state.service} />
                <div id="page" className="page">
                    <Breadcrumb items={[
                        {
                            text: "Home",
                            key: "1",
                            onClick: () => history.push("/")
                        },
                        {
                            text: this.state.service.registryName,
                            key: "2",
                            onClick: () => history.push("/" + this.props.match.params.registryName)
                        },
                        {
                            text: this.props.match.params.repositoryName,
                            key: "3"
                        }
                    ]} className="breadcrumb" />
                    {
                        !this.state.isLoggedIn ?
                            null :
                            <div>
                                <RepositoryTagViewer
                                    service={this.state.service}
                                    repositoryName={this.props.match.params.repositoryName}
                                    />
                            </div>
                    }
                </div>
            </div>
        );
    }
}
