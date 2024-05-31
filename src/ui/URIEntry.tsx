import React, {useState} from "react";
import {UEProps} from "../model/EntryModel.ts";
import {NamedNode} from "n3";
import SetURIEvent from "../events/SetURIEvent.ts";

function URIEntry(props: UEProps): JSX.Element {
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
        setCurrentText(event.currentTarget.innerText);
        setURISafe(event.currentTarget.innerText);
        setActiveSuggestionIndex(0);
        setShowSuggestions(false);
    };

    function setURISafe(value: string): NamedNode | undefined {
        let uri: NamedNode | undefined;
        try {
            uri = new NamedNode(value)
        } catch (_e) {
            // do we need to do anything here?
            let e: Error = _e as Error;
            e.message;
        }
        setCurrentURI(uri);
        if (uri)
            document.dispatchEvent(new SetURIEvent(uri));
        return uri;
    }

    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
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
            <ul className="suggestions">
                {filteredSuggestions.map((suggestion, index) => {
                    let className;
                    if (index === activeSuggestionIndex) {
                        className = "suggestion-active";
                    }
                    return (
                        <li className={className} key={suggestion} onClick={onClick}>
                            {suggestion}
                        </li>
                    );
                })}
            </ul>
        ) : (
            <div className="no-suggestions">
                <em>No suggestions  </em>
            </div>
        );
    };

    return <>
        {currentURI ? "<div class='current-uri' >" + currentURI.value + "</div>" : ""}
    <input type="text"
    onChange={onChange}
    onKeyDown={onKeyDown}
    value={currentText}
    />
        {showSuggestions && currentText && <SuggestionListComponent />}
    </>
}

export default URIEntry;