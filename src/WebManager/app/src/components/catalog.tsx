import * as React from "react";
import history from './history'
import { Breadcrumb, IBreadcrumbItem } from "office-ui-fabric-react/lib/Breadcrumb";

import { Docker } from "../services/docker";
import { AuthBanner } from "./auth-banner";
import { RepositoryList } from "./repository-list";

export interface ICatalogProps { match: any }
interface ICatalogState { isLoggedIn: boolean, service: Docker }

export class Catalog extends React.Component<ICatalogProps, ICatalogState> {
    constructor(props: ICatalogProps) {
        super(props);
        
        this.state = {
            service: new Docker(this.props.match.params.registryName),
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
        history.push(`/${this.props.match.params.registryName}/${repository}`);
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
                            text: this.props.match.params.registryName,
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