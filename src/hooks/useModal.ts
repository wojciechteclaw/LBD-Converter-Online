import { useState } from "react";

export const useModal = (initialState:boolean) => {
    const [isOpen, setisOpen] = useState<boolean>(initialState);

    const toggle = () => {
        setisOpen(!isOpen);
    };

    return {
        isOpen,
        toggle,
    };
};
