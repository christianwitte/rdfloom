import React, {useState} from "react";
import {DataFactory, Quad_Graph, Quad_Object, Quad_Predicate, Quad_Subject} from "n3";
import {SEProps} from "../model/EntryModel.ts";
import namedNode = DataFactory.namedNode;
import literal = DataFactory.literal;
import blankNode = DataFactory.blankNode;

function StatementEntry(props: SEProps): JSX.Element {

    let lookupPrefix = props.lookupPrefix;
    const emptyListRegex = new RegExp("\\w*\(\\w*\)\\w*");
    const [currentText, setCurrentText] = useState('');
    const [savedText, setSavedText] = useState<string[]>()
    const [baseUri, setBaseUri] = useState("https://resource.phostix.dev/rdfloom/");
    const [subject, setSubject] = useState<Quad_Subject | undefined>();
    const [predicate, setPredicate] = useState<Quad_Predicate | undefined>();
    const [object, setObject] = useState<Quad_Object | undefined>();
    const [graph, setGraph] = useState<Quad_Graph | undefined>();

    const currentTextHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
        console.log(event.key);
        if (event.key === 'Enter') {
            validateNextEntry(currentText);
            setCurrentText("");
        } else if (event.key === 'Backspace' && currentText === '') {
            handleBackspace();
        }
    };
    const currentTextInputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = event.target.value;
        setCurrentText(value);
    }
    const handleBackspace = () => {
        if(savedText && savedText.length > 0) {
            setSavedText(savedText.slice(0, -1));
        }
    }

    const validateNextEntry = (value: string) => {
        var valid = false;
        if (value.length > 0) {
            if (subject) {
                if (predicate) {
                    if (validateUri(value)) {
                        setObject(namedNode(value));
                        valid = true;
                    } else {
                        setObject(literal(value));
                        valid = true;
                    }
                } else if (validateUri(value)) {
                    setPredicate(namedNode(value));
                    valid=true;
                }
            } else if (validateUri(value)) {
                setSubject(namedNode(value));
                valid=true;
            } else if (value.startsWith("[")) {
                setSubject(blankNode());
                valid=true;
            } else if (emptyListRegex.test(value)) {
                setSubject(namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"));
                valid = true;
            }
            if (valid) {
                if (!savedText)
                    setSavedText([value]);
                else
                    setSavedText(savedText.concat(value))
            }
        }
    }

    const decodePrefix = (value: string): string => {
        let [prefix, reference] = value.split(":", 2);
        if (prefix.length == 0) {
            return baseUri + reference;
        } else {
            let base = lookupPrefix(prefix);
            return base + reference;
        }
    }

    const validateUri = (value: string) => {
        const _vu = (v: string, stop: boolean): boolean => {
            try {
                const url = new URL(value);
                return isValidURL(url);
            } catch (TypeError) {
                if (!stop)
                    return _vu(decodePrefix(v), true);
                else
                    return false;
            }
        };
        return _vu(value, false);
    };

    const isValidURL = (value: URL): boolean => {
        return true;
    }

    return (
    <>
        <div className="statement">
            <span className="subject">{subject?.value}</span>
            <span className="predicate">{predicate?.value}</span>
            <span className="object">{object?.value}</span>
        </div>
        <div className="savedText">
            {savedText && savedText.length > 0 ? (
                savedText.map((text) => (
                    <li key={text} className="sText"><span>{text}</span></li>
                ))
            ) : ( <h3>no saved items</h3> )}
        </div>
        <input value={currentText} onKeyDown={currentTextHandler} onInput={currentTextInputHandler}/>
    </>
    )
}

export default StatementEntry