import * as React from "react";
import { CancelTokenSource } from "axios";
import { Docker } from "../services/docker";

export interface IRepositoryListEntryProps {
    repositoryName: string,
    service: Docker,
    onClick?: () => void
}
interface IRepositoryListEntryState { }

export class RepositoryListEntry extends React.Component<IRepositoryListEntryProps, IRepositoryListEntryState> {
    static defaultProps: IRepositoryListEntryProps = {
        repositoryName: null,
        service: null,
        onClick: null
    };

    render(): JSX.Element {
        return (
            <li className="ms-ListItem is-selectable repo-list-item"
                onClick={this.props.onClick} >
                <div className="repo-list-icon">
                    <img className="repo-list-icon-svg" src="/res/registry-icon.svg" />
                </div>
                <div className="repo-list-content">
                    <span className="ms-ListItem-primaryText">
                        {this.props.repositoryName}
                    </span>
                    <span className="ms-ListItem-secondaryText">
                        Click to view repository info
                    </span>
                </div>
            </li>
        );
    }
}
