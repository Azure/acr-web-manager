import * as React from "react";
import { Docker } from "../services/docker";
import { AuthBanner } from "./auth-banner";
import { Breadcrumb, IBreadcrumbItem } from "office-ui-fabric-react/lib/Breadcrumb";
import { browserHistory } from "react-router";
import { RepositoryTagViewer } from "./repository-tag-viewer";
import { Checkbox } from "./checkbox"
import {
    Button,
    ButtonType
} from "office-ui-fabric-react/lib/Button";
export interface IMultiArchProps { params: any }
interface IMultiArchState { isLoggedIn: boolean, service: Docker, optionsChecked: any }

export class MultiArch extends React.Component<IMultiArchProps, IMultiArchState> {
    constructor(props: IMultiArchProps) {
        super(props);

        this.state = {
            service: new Docker(this.props.params.registryName),
            isLoggedIn: false,
            optionsChecked: [],
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

    changeEvent(event: any) {
        let checkedArray = this.state.optionsChecked;
        let selectedValue = event.target.value;
        if (event.target.checked === true) {
            checkedArray.push(selectedValue);
            this.setState({
                optionsChecked: checkedArray
            } as IMultiArchState);

        } else {
            let valueIndex = checkedArray.indexOf(selectedValue);
            checkedArray.splice(valueIndex, 1);
            this.setState({
                optionsChecked: checkedArray
            } as IMultiArchState);
        }


    }
    makeManifest() {

    }


    render(): JSX.Element {
        let outputCheckBoxes = (
            <div>
                <div>
                    <Checkbox value={"Linux"} id={'string_'} onChange={this.changeEvent.bind(this)} /><label> Linux </label>
                </div>
                <div>
                    <Checkbox value={"Windows"} id={'string_'} onChange={this.changeEvent.bind(this)} /><label> Windows </label>
                </div>
            </div>)
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
                            text: this.props.params.repositoryName+ " MultiArch",
                            key: "3"
                        }
                    ]} className="breadcrumb" />
                 
                    {
                        !this.state.isLoggedIn ?
                            null :
                            <div>
                                <div>
                                    {outputCheckBoxes}
                                </div>
                                <div>
                                    {JSON.stringify(this.state.optionsChecked)}
                                </div>
                                <div className="multi-button">
                                    <Button disabled={false}
                                        buttonType={ButtonType.primary}
                                        onClick={this.makeManifest.bind(this)}>
                                        Make Manifest
                                        </Button>
                                </div>
                            </div>
                    }

                </div>
                   
            </div>
        );
    }
}