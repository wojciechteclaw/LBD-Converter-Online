import { FC, useState } from "react";
import { ParserSettings, SerializationFormat } from "ifc-lbd";
import { Checkbox } from "@components/buttons/checkbox/Checkbox";
import { filesService } from "@services/dependency_injection";
import "./ParserSettingsForm.css";

interface ParserSettingsProps {
    visibilityToggle: () => void;
    modelID: number;
}

const ParserSettingsForm: FC<ParserSettingsProps> = ({ visibilityToggle, modelID }) => {
    let defaultParserSettings = filesService.getParserSettings(modelID);

    const [bot, setBot] = useState<boolean>(defaultParserSettings.subsets.BOT);
    const [fso, setFso] = useState<boolean>(defaultParserSettings.subsets.FSO);
    const [products, setProducts] = useState<boolean>(defaultParserSettings.subsets.PRODUCTS);
    const [properties, setProperties] = useState<boolean>(defaultParserSettings.subsets.PROPERTIES);
    const [normalizeToSIUnits, setNormalizeToSIUnits] = useState<boolean>(defaultParserSettings.normalizeToSIUnits);
    const [verbose, setVerbose] = useState<boolean>(defaultParserSettings.verbose);
    const [namespace, setNamespace] = useState<string>(defaultParserSettings.namespace);

    const getParserSettings = () => {
        let newSettings: ParserSettings = {
            namespace: namespace.endsWith("/") ? namespace : namespace + "/",
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
        defaultParserSettings = newSettings;
        filesService.overrideParserSettings(modelID, newSettings);
        visibilityToggle();
    };

    const restoreDefaultConfig = () => {
        setBot(defaultParserSettings.subsets.BOT);
        setFso(defaultParserSettings.subsets.FSO);
        setProducts(defaultParserSettings.subsets.PRODUCTS);
        setProperties(defaultParserSettings.subsets.PROPERTIES);
        setNormalizeToSIUnits(defaultParserSettings.normalizeToSIUnits);
        setVerbose(defaultParserSettings.verbose);
        setNamespace(defaultParserSettings.namespace);
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
