import { useEffect, useRef } from "react";

const Canvas = (props: any) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const { tiles } = props 

    useEffect(() => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            ctx!.strokeStyle = "black"
            ctx!.lineWidth = 1
            for (let x = 0; x < 5; x++) {
                for (let y = 0; y < 8; y++) {
                    ctx?.strokeRect(100 * x + 10, 100 * y + 10, 100, 100)
                }
            }
        }
    }, [tiles]);

    return (
        <canvas
            ref={canvasRef}
            {...props}
        />
    );
};

export default Canvas