import React from 'react';
import styles from './serviceButton.module.css'

export default function ServiceButton(props) {
    const {
        service,
        onSelect,
        onConnect
    } = props;

    function handleClick() {
        onSelect(service.id);
        onConnect(service.id);
    }

    return (
        <button
            key={`serviceBtn_${service.id}`}
            id={service.id}
            onClick={handleClick}
        >
            {service.name}
        </button>
    )
}