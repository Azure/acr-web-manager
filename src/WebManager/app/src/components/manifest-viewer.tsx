import * as React from "react";
import { Docker } from "../services/docker";

export interface IManifestViewerProps {
    manifest: any
}
interface IManifestViewerState { }

export class ManifestViewer extends React.Component<IManifestViewerProps, IManifestViewerState> {
    renderPrimitive(value: any): JSX.Element {
        return (
            <pre>
                {value.toString()}
            </pre>
        );
    }

    renderArray(value: any[]): JSX.Element {
        return (
            <ul>
                {value.map((e, i) => <li key={i}>{this.renderValue(e)}</li>)}
            </ul>
        );
    }

    renderJson(value: any): JSX.Element {
        return (
            <pre>
                {JSON.stringify(JSON.parse(value), null, 4)}
            </pre>
        );
    }

    renderValue(value: any): JSX.Element {
        if (typeof (value) === "string") {
            try {
                value = JSON.parse(value);
            }
            catch (err) { }
        }
        if (typeof (value) === "number" ||
            typeof (value) === "string" ||
            typeof (value) === "boolean") {
            return this.renderPrimitive(value);
        }
        else if (Array.isArray(value)) {
            return this.renderArray(value);
        }
        else {
            return this.renderObject(value);
        }
    }

    renderHistoryEntry(value: any): JSX.Element {
        let pairs: { key: string, value: any }[] = [];

        for (let key in value) {
            if (value.hasOwnProperty(key)) {
                pairs.push({ key: key, value: this.renderValue(value[key]) });
            }
        }

        return (
            <div>
                {
                    pairs.map((e, i) => (
                        <div key={e.key}>
                            <span>{e.key}</span>
                            <pre>
                                {e.value}
                            </pre>
                        </div>
                    ))
                }
            </div>
        );
    }

    renderHistory(value: any[]): JSX.Element {
        let list: JSX.Element[] = value.map((e, i) =>
            <li key={i}>
                {this.renderHistoryEntry(e)}
            </li>
        );

        return (
            <ul>{list}</ul>
        );
    }

    renderObject(value: any): JSX.Element {
        let props: { key: string, value: JSX.Element }[] = [];

        for (let key in value) {
            if (value.hasOwnProperty(key)) {
                if (key == "v1Compatibility") {
                    props.push({ key: key, value: this.renderJson(value[key]) });
                }
                else {
                    props.push({ key: key, value: this.renderValue(value[key]) });
                }
            }

        }

        let el = (

            <div>
                <div className="ms-Grid ms-font-m">
                    {props.map(x => (
                        <div className="ms-Grid-row manifest-entry" key={x.key}>
                            <div className="ms-Grid-col ms-u-sm2">
                                <span>{x.key}</span>
                            </div>
                            <div className="ms-Grid-col ms-u-sm10">
                                {x.value}
                            </div>
                        </div>
                    ))}
                </div>

            </div>




        );

        return el;
    }


    render(): JSX.Element {
        return this.renderObject(this.props.manifest);
    }
}