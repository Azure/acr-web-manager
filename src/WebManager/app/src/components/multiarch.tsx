import * as React from "react";
import { Docker } from "../services/docker";
import { AuthBanner } from "./auth-banner";
import { Breadcrumb, IBreadcrumbItem } from "office-ui-fabric-react/lib/Breadcrumb";
import { browserHistory } from "react-router";
import { RepositoryTagViewer } from "./repository-tag-viewer";
import { CancelTokenSource } from "axios";
import { MultiTagViewer} from "./multi-tag-viewer"
export interface IMultiArchProps {
    params: any
}
interface IMultiArchState { isLoggedIn: boolean, service: Docker}

export class MultiArch extends React.Component<IMultiArchProps, IMultiArchState> {
    

    constructor(props: IMultiArchProps) {
        super(props);

        this.state = {
            service: new Docker(this.props.params.registryName),
            isLoggedIn: false,
        };
    }
    onLogout(): void {
        this.setState({
            isLoggedIn: false
        } as IMultiArchState);
    }

    onLogin(): void {
        this.setState({
            isLoggedIn: true
        } as IMultiArchState);
    }

    




    

    render(): JSX.Element {
        //var xmlHttp = new XMLHttpRequest();
        //xmlHttp.open("GET", "https://golang.org/", false); 
        //xmlHttp.send(null);
        
              

      
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
                            text: this.state.service.registryName,
                            key: "2",
                            onClick: () => browserHistory.push("/" + this.props.params.registryName)
                        },
                        {
                            text: this.props.params.repositoryName,
                            key: "3",
                            onClick: () => browserHistory.push("/" + this.props.params.registryName + "/" + this.props.params.repositoryName)
                        },
                        {
                            text: "MultiArch",
                            key: "4"
                        }
                    ]} className="breadcrumb" />
                 
                    {
                        !this.state.isLoggedIn ?
                            null :
                            <div>
                                <MultiTagViewer
                                    service={this.state.service}
                                    repositoryName={this.props.params.repositoryName}
                                />
                                
                                
                            </div>
                    }

                </div>
                   
            </div>
        );
    }
}