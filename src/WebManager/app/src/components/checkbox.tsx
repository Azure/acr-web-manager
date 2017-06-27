import * as React from 'react';


export interface ICheckboxProps {
    id: any
    value: any
    onChange: () => void
}
interface ICheckboxState {

}



export class Checkbox extends React.Component<ICheckboxProps, ICheckboxState>{
    constructor(props: ICheckboxProps) {
        super(props);
    }
    render() {
        return (
            <input type="checkbox" id={this.props.id} value={this.props.value} onChange={this.props.onChange} />
        )
    }

}

