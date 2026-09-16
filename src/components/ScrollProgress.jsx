import { useEffect, useState } from "react";

function ScrollProgress() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;

            const documentHeight =
                document.documentElement.scrollHeight - window.innerHeight;

            const scrollPercentage =
                documentHeight > 0
                    ? (scrollTop / documentHeight) * 100
                    : 0;

            setProgress(scrollPercentage);
        };

        window.addEventListener("scroll", handleScroll);

        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: `${progress}%`,
                height: "4px",
                backgroundColor: "#2563eb",
                zIndex: 99999,
                transition: "width 0.1s ease-out",
            }}
        />
    );
}

export default ScrollProgress;
