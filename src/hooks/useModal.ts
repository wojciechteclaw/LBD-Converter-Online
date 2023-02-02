import { useState } from "react";

export const useModal = (initialState:boolean) => {
    const [isOpen, setIsOpen] = useState<boolean>(initialState);

    const toggle = () => {
        setIsOpen(!isOpen);
    };

    return {
        isOpen,
        toggle,
    };
};
