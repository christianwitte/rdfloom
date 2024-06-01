import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
// import StatementEntry from "./ui/StatementEntry.tsx";
// @ts-ignore
// eslint-disable-next-line no-unused-vars
import { prefixes, expand } from "@zazuko/vocabularies";
import URIEntry from "./ui/URIEntry.tsx";
import {NamedNode} from "n3";
import SetURIEvent from "./events/SetURIEvent.ts";

function App() {
    const [uriList, setUriList] = useState<NamedNode[]>([]);

    // The Javascript URL constructor will accept strings of the form "rdf:type" -- we want to pass these to the
    // expansion function first. So, let's validate the URL that's generated and throw an Error if it doesn't
    // have a hostname and a path (we might want to refine this algorithm in the future).
    const validateURL = (url: URL) => {
        if (!url.hostname || !url.pathname) throw new Error("expand this first");
    };

    const handleSetURIEvent = (e: Event) => {
        const evt: SetURIEvent = e as SetURIEvent;
        console.log("Received SetURIEvent("+evt.getUri().value+")");
        uriList.push(evt.getUri());
        setUriList(uriList);
    }

    const lookupFunction = (key: string): NamedNode[] => {
        console.log("Testing "+key);
        try {
            const url = new URL(key);
            console.log(url);
            validateURL(url);
            const uri = new NamedNode(key);
            const current = uriList.filter((uri: NamedNode) => uri.value.includes(key));
            current.unshift(uri);
            return current;
        } catch (_e) {
            const e: Error = _e as Error;
            console.log(e.message);
            console.log("Expanding...");
            const test = expand(key);
            console.log("expand("+key+") = "+test);
            if (test) { // is this a valid check for a no-op or error on "expand"?
                const current = uriList.filter((uri: NamedNode) => uri.value.includes(test));
                current.unshift(new NamedNode(test));
                return current;
            } else {
                return uriList.filter((uri: NamedNode) => uri.value.includes(key));
            }
        }
    };

    document.removeEventListener("SetURIEvent", handleSetURIEvent);
    document.addEventListener("SetURIEvent", handleSetURIEvent);
    return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="urientry-test">
          <h2>URIEntry Test</h2>
          <URIEntry lookup={lookupFunction}>
          </URIEntry>
      </div>
        <div className='uriList'>
            {uriList.length ? (<ul className='uriList'> {uriList.map((uri: NamedNode) => <li className='uriList-entry' key={uri.value}>{uri.value}</li>)} </ul>) : <></> }
        </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
