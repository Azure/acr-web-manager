import * as React from "react";
import { CancelTokenSource } from "axios";
import { Docker } from "../services/docker";
import { RepositoryListEntry } from "./repository-list-entry";

export interface IRepositoryListProps {
    service: Docker,
    onRepositoryClick?: (repository: string) => void
}
interface IRepositoryListState {
    repositories: string[],
    hasMoreRepositories: boolean
}

export class RepositoryList extends React.Component<IRepositoryListProps, IRepositoryListState> {
    private cancel: CancelTokenSource = null;

    constructor(props: IRepositoryListProps) {
        super(props);
        this.state = {
            repositories: null,
            hasMoreRepositories: true
        };
    }

    componentDidMount(): void {
        this.getMoreRepos();
    }

    componentWillUnmount(): void {
        if (this.cancel) {
            this.cancel.cancel("component unmounting");
            this.cancel = null;
        }
    }

    getMoreRepos(): void {
        if (this.cancel) {
            return;
        }

        if (!this.state.hasMoreRepositories) {
            return;
        }

        let lastRepo: string = null;
        if (this.state.repositories != null) {
            lastRepo = this.state.repositories[this.state.repositories.length - 1];
        }

        this.cancel = this.props.service.createCancelToken();

        this.props.service.getRepos(10, lastRepo, this.cancel.token)
            .then(value => {
                this.cancel = null;

                if (!value) return;

                this.setState((prevState, props) => {
                    if (prevState.repositories == null) {
                        prevState.repositories = [];
                    }

                    for (let repository of value.repositories) {
                        prevState.repositories.push(repository);
                    }

                    prevState.hasMoreRepositories = value.httpLink !== undefined;

                    return prevState;
                });
            }).catch((err: any) => {
                this.cancel = null;
            });
    }

    renderRepositories(): JSX.Element[] {
        return this.state.repositories.map((repository: string) => (
            <RepositoryListEntry
                key={repository}
                repositoryName={repository}
                service={this.props.service}
                onClick={() => { this.props.onRepositoryClick(repository); } } />
        ));
    }

    render(): JSX.Element {
        if (this.state.repositories != null) {
            if (this.state.repositories.length > 0) {
                return (
                    <ul className="ms-List">
                        {this.renderRepositories()}
                        {
                            this.state.repositories == null || !this.state.hasMoreRepositories ?
                                null
                                :
                                <li key="<showmore>" className="ms-ListItem is-selectable repo-list-item clickable">
                                    <span className="ms-ListItem-primaryText" onClick={this.getMoreRepos.bind(this)}>
                                        Show more repositories
                                    </span>
                                </li>
                        }
                    </ul>
                );
            }
            else {
                return (
                    <span className="ms-font-l">
                        There are no repositories under this registry.
                    </span>
                );
            }
        }
        else {
            return null;
        }
    }
}

