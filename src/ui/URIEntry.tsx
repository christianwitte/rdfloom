// Chapter 1 -- URIEntry
//
// Let's start by defining a component for entering URIs. We'll base this component on a text-input, and add
// a drop-down for "auto-suggest." The component must be provided a lookup function that should expect the
// current value of
import React, {useState} from "react";
import '../assets/URIEntry.css';
import {UEProps} from "../model/EntryModel.ts";
import {NamedNode} from "n3";
import SetURIEvent from "../events/SetURIEvent.ts";
import {Logger} from "tslog";
import {shrink, expand} from "@zazuko/vocabularies";

function URIEntry(props: UEProps): JSX.Element {
    const log = new Logger({stylePrettyLogs: false});
    const [currentText, setCurrentText] = useState('');
    const [currentURI, setCurrentURI] = useState<NamedNode | undefined>();
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const userInput = event.target.value;
        const newSuggestions = props.lookup(userInput);

        setCurrentText(userInput);
        setFilteredSuggestions(newSuggestions.map((uri: NamedNode) => uri.value));
        setActiveSuggestionIndex(0);
        setShowSuggestions(true);
    };

    const onClick = (event: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
        setFilteredSuggestions([]);
        setCurrentText("");
        setURISafe(event.currentTarget.innerText);
        setActiveSuggestionIndex(0);
        setShowSuggestions(false);
    };

    // The Javascript URL constructor will accept strings of the form "rdf:type" -- we want to pass these to the
    // expansion function first. So, let's validate the URL that's generated and throw an Error if it doesn't
    // have a hostname and a path (we might want to refine this algorithm in the future).
    const validateURL = (url: URL) => {
        if (expand(url.toString())) {
            url = new URL(expand(url.toString()));
        }
        if (!url.hostname || !url.pathname) throw new Error("expand this first");
        return url;
    };

    function setURISafe(value: string): NamedNode | undefined {
        let uri: NamedNode | undefined;
        log.trace(`setURISafe(${value})`);
        try {
            const url = validateURL(new URL(value));
            uri = new NamedNode(url.toString());
            log.debug("new NamedNode(value): ", uri.toJSON());
        } catch (_e) {
            // do we need to do anything here?
            const e: Error = _e as Error;
            log.fatal(e);
        }
        if (uri) {
            log.debug("Dispatching new SetURIEvent("+uri.value+")");
            document.dispatchEvent(new SetURIEvent(uri));
            setCurrentURI(uri);
            setFilteredSuggestions([]);
            setCurrentText("");
            setActiveSuggestionIndex(0);
            setShowSuggestions(false);
        }
        return uri;
    }

    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            if (activeSuggestionIndex > 0) {
                setURISafe(filteredSuggestions[activeSuggestionIndex]);
            }
            else
                setURISafe(event.currentTarget.value);
        } else if (event.key === 'ArrowUp') {
            if(activeSuggestionIndex > 0) {
                setActiveSuggestionIndex(activeSuggestionIndex - 1);
            }
        } else if (event.key === 'ArrowDown') {
            if(activeSuggestionIndex < (filteredSuggestions.length - 1)) {
                setActiveSuggestionIndex(activeSuggestionIndex + 1);
            }
        }
    };

    const SuggestionListComponent = () => {
        return filteredSuggestions.length ? (
            <ul className="urientry-suggestions">
                {[...new Set(filteredSuggestions)].map((suggestion, index) => {
                    let className;
                    if (index === activeSuggestionIndex) {
                        className = "urientry-suggestion-active";
                    } else {
                        className ="urientry-suggestion-inactive";
                    }
                    return (
                        <li className={className} key={suggestion} onClick={onClick}>
                            {suggestion}
                        </li>
                    );
                })}
            </ul>
        ) : (
            <div className="urientry-no-suggestions">
                <em>No suggestions</em>
            </div>
        );
    };

    return <>
        { currentURI ? <div className='urientry-current-uri'> {shrink(currentURI.value) ? <span className='urientry-current-uri-shrunk'>{shrink(currentURI.value)}</span> : <></>} <span className='urientry-current-uri-full'>{"<"+currentURI.value+">"}</span></div> : <></>}
    <input type="text"
    onChange={onChange}
    onKeyDown={onKeyDown}
    value={currentText}
    />
        {showSuggestions && currentText && <SuggestionListComponent />}
    </>
}

export default URIEntry;