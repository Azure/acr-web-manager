import * as React from "react"
import { CancelTokenSource } from "axios";
import {
    Button,
    ButtonType
} from "office-ui-fabric-react/lib/Button";
import { Docker } from "../services/docker";

export interface IMultiManifestProps {
    digests: string[],
    service: Docker,
    repositoryName: string
}

interface IMultiManifestState { }

class MultiArchManifest {
    schemaVersion: number
    mediaType: string
    manifests: SingleManifest[]
}

class SingleManifest {
    mediaType: string
    size: number
    digest: string
    platform: Platform
}

class Platform {
    architecture: string
    os: string
}
export class MultiManifest extends React.Component<IMultiManifestProps, IMultiManifestState>{
    private cancel: CancelTokenSource = null;

    createSingleManifest(info: string): SingleManifest {
        var allInfo: string[] = info.split(";", 3)
        var digestM: string, sizeM: string, osM: string, architectureM: string
        digestM = ""
        sizeM = ""
        osM = ""
        architectureM=""

        for (let i: number = 0; i < 3; i++) {
            if (allInfo[i].split(":")[0] === "docker-content-digest") {
                digestM = allInfo[i].split(":")[1] + ":" + allInfo[i].split(":")[2]
                
            }
            if (allInfo[i].split(":")[0] === "content-length") {
                
                sizeM = allInfo[i].split(":")[1]
            }
            if (allInfo[i].split(":")[0] === "tag") {
                osM = allInfo[i].split(":")[1].split("-")[1]
                architectureM = allInfo[i].split(":")[1].split("-")[2]
            }
            
        }

        var plat: Platform = {
            architecture: architectureM,
            os:osM
        }

        var man: SingleManifest = {
            mediaType: "application/vnd.docker.distribution.manifest.v2+json",
            size: +sizeM,
            digest: digestM,
            platform: plat
        }
        return man
    }

    createMultiArchManifest(): MultiArchManifest {
        if (this.props.digests == null || this.props.digests.length <= 0) return
        var singleManifests: SingleManifest[] = []
        for (let i: number = 0; i < this.props.digests.length; i++) {
            singleManifests[i] = this.createSingleManifest(this.props.digests[i])
        }

        var multiMan: MultiArchManifest = {
            schemaVersion: 2,
            mediaType: "application/vnd.docker.distribution.manifest.list.v2+json",
            manifests: singleManifests
        }

        return multiMan
    }

    render(): JSX.Element {

        return (
            <div>
                {this.renderValue(this.createMultiArchManifest())}
                <br />
                <Button disabled={false}
                    buttonType={ButtonType.primary}
                    onClick={this.pushManifest.bind(this)}>
                    MultiArch
                </Button>

            </div>
        );
    }
    escapeSpecialChars(s: string) {
        return s.replace(/\\n/g, "\\n")
            .replace(/\\'/g, "\\'")
            .replace(/"/g, '\\"')
            .replace(/\\&/g, "\\&")
            .replace(/\\r/g, "\\r")
            .replace(/\\t/g, "\\t")
            .replace(/\\b/g, "\\b")
            .replace(/\\f/g, "\\f");
    };

    pushManifest(): void {
        if (this.cancel) {
            return;
        }
        this.cancel = this.props.service.createCancelToken();

        this.props.service.putMultiArch(this.props.repositoryName, "Multi-Tag", this.cancel.token, '"' + JSON.stringify(this.createMultiArchManifest()).replace(/"/g,'\\"') + '"')
            .then(value => {
                this.cancel = null
                if (!value) return
            })

        
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

    
}