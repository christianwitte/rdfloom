import {NamedNode} from "n3";

class SetURIEvent extends Event {
    private _uri: NamedNode;
    constructor(value: NamedNode) {
        super("SetURIEvent");
        this._uri = value;
    }

    public getUri = () => this._uri;
}

export default SetURIEvent;