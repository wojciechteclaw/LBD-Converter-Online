import { FC } from "react";

interface CheckboxProps {
    value: boolean;
    label: string;
    onStateChange: (value: boolean) => void;
}

const Checkbox: FC<CheckboxProps> = ({ value, label, onStateChange }) => {
    return (
        <div className="field">
            <div className="ui toggle checkbox">
                <input
                    type="checkbox"
                    name="public"
                    checked={value}
                    onChange={() => {
                        onStateChange(!value);
                    }}
                />
                <label>{label}</label>
            </div>
        </div>
    );
};

export { Checkbox };
