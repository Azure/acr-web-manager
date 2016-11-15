import * as React from "react";
import { browserHistory } from "react-router";
import { Breadcrumb, IBreadcrumbItem } from "office-ui-fabric-react/lib/Breadcrumb";

import { Docker } from "../services/docker";
import { AuthBanner } from "./auth-banner";
import { RepositoryList } from "./repository-list";

export interface ICatalogProps { params: any }
interface ICatalogState { isLoggedIn: boolean, service: Docker }

export class Catalog extends React.Component<ICatalogProps, ICatalogState> {
    constructor(props: ICatalogProps) {
        super(props);

        this.state = {
            service: new Docker(this.props.params.registryName),
            isLoggedIn: false
        };
    }

    onLogout(): void {
        this.setState({
            isLoggedIn: false
        } as ICatalogState);
    }

    onLogin(): void {
        this.setState({
            isLoggedIn: true
        } as ICatalogState);
    }

    onRepositoryClick(repository: string): void {
        browserHistory.push(`/${this.props.params.registryName}/${repository}`);
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
                            onClick: () => browserHistory.push("/")
                        },
                        {
                            text: this.props.params.registryName,
                            key: "2"
                        }
                    ]} className="breadcrumb" />
                    {
                        !this.state.isLoggedIn ?
                            null :
                            <div>
                                <RepositoryList
                                    service={this.state.service}
                                    onRepositoryClick={this.onRepositoryClick.bind(this)} />
                            </div>
                    }
                </div>
            </div>
        );
    }
}