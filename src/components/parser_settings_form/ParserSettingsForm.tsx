import { ParserSettings, SerializationFormat } from "ifc-lbd";
import { FC, useState } from "react";
import { Checkbox } from "../buttons/checkbox/Checkbox";
import "./ParserSettingsForm.css";

interface ParserSettingsProps {
    parserSettings: ParserSettings;
    onParserSettingsChange: (parserSettings: ParserSettings) => void;
    visibilityToggle: () => void;
}

const ParserSettingsForm: FC<ParserSettingsProps> = ({ parserSettings, onParserSettingsChange, visibilityToggle }) => {
    const [bot, setBot] = useState<boolean>(parserSettings.subsets.BOT);
    const [fso, setFso] = useState<boolean>(parserSettings.subsets.FSO);
    const [products, setProducts] = useState<boolean>(parserSettings.subsets.PRODUCTS);
    const [properties, setProperties] = useState<boolean>(parserSettings.subsets.PROPERTIES);
    const [normalizeToSIUnits, setNormalizeToSIUnits] = useState<boolean>(parserSettings.normalizeToSIUnits);
    const [verbose, setVerbose] = useState<boolean>(parserSettings.verbose);
    const [namespace, setNamespace] = useState<string>(parserSettings.namespace);

    const getParserSettings = () => {
        let newSettings: ParserSettings = {
            namespace: namespace,
            subsets: {
                BOT: bot,
                FSO: fso,
                PRODUCTS: products,
                PROPERTIES: properties,
            },
            outputFormat: SerializationFormat.JSONLD,
            normalizeToSIUnits: normalizeToSIUnits,
            verbose: verbose,
        };
        return newSettings;
    };

    const onSubmit = (e: any) => {
        e.preventDefault();
        let newSettings: ParserSettings = getParserSettings();
        onParserSettingsChange(newSettings);
        visibilityToggle();
    };

    const restoreDefaultConfig = () => {
        setBot(parserSettings.subsets.BOT);
        setFso(parserSettings.subsets.FSO);
        setProducts(parserSettings.subsets.PRODUCTS);
        setProperties(parserSettings.subsets.PROPERTIES);
        setNormalizeToSIUnits(parserSettings.normalizeToSIUnits);
        setVerbose(parserSettings.verbose);
        setNamespace(parserSettings.namespace);
        visibilityToggle();
    };

    return (
        <div className="">
            <form className="ui form" onSubmit={onSubmit}>
                <p className="ifc-file-parser-section-title">project namespace</p>
                <div className="field">
                    <input
                        type="text"
                        name="first-name"
                        placeholder="Namespace"
                        value={namespace}
                        onChange={(e) => setNamespace(e.target.value)}
                    />
                </div>
                <p className="ifc-file-parser-section-title">Parsers</p>
                <div className="two fields">
                    <Checkbox value={bot} label="bot" onStateChange={setBot} />
                    <Checkbox value={fso} label="fso" onStateChange={setFso} />
                </div>
                <div className="two fields">
                    <Checkbox value={products} label="products" onStateChange={setProducts} />
                    <Checkbox value={properties} label="properties" onStateChange={setProperties} />
                </div>
                <p className="ifc-file-parser-section-title">Other options</p>
                <div className="two fields">
                    <Checkbox
                        value={normalizeToSIUnits}
                        label="normalizeToSIUnits"
                        onStateChange={setNormalizeToSIUnits}
                    />
                    <Checkbox value={verbose} label="verbose" onStateChange={setVerbose} />
                </div>
                <div className="ifc-file-buttons parse-settings-form-buttons">
                    <button className="ui green button" type="submit">
                        Continue
                    </button>
                    <button className="ui red button" onClick={restoreDefaultConfig}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export { ParserSettingsForm };
