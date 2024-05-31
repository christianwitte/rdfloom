// @ts-ignore
import {NamedNode, Quad_Graph, Quad_Object, Quad_Predicate, Quad_Subject} from "n3";


// @ts-ignore
class EntryModel {

    constructor(currentText: string, subject: Quad_Subject, predicate: Quad_Predicate, object: Quad_Object, graph: Quad_Graph) {
        this.currentText = currentText;
        this.subject = subject;
        this.predicate = predicate;
        this.object = object;
        this.graph = graph;
    }

    currentText: string;
    subject: Quad_Subject;
    predicate: Quad_Predicate;
    object: Quad_Object;
    graph: Quad_Graph;

    validateCurrentText() {
        //let currentText = this.currentText;

    }
}

export type SEProps = {
    lookupPrefix: LookupFunction
}
export type UEProps = {
    lookup: AutoSuggestURI
}
type LookupFunction = (key: string) => string;
type AutoSuggestURI = (text: string) => NamedNode[];