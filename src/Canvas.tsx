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

  const placeTile = (canvasRef: any, event: any) => {
    const rect = canvasRef.getBoundingClientRect()
    const ctx = canvasRef.getContext("2d");
    const x = Math.floor((event.clientX - rect.left - 10) / 100)
    const y = Math.floor((event.clientY - rect.top - 10) / 100)

    if (props.imgurl !== "") {
      const image = new Image()
      image.src = props.imgurl[0]

      console.log(image)
      image.onload = () => {
        ctx.save()
        ctx.translate(x * 100 + 60, y * 100 + 60); // move to center of the cell

        ctx.rotate(props.rotate[0] * Math.PI / 180)
        ctx.drawImage(image, -50, -50, 100, 100) // draw image centered
        ctx.restore()
      }

      props.imgurl[1]("")
      props.rotate[1](90)
    }
  }

  return (
    <canvas
      ref={canvasRef}
      {...props}
      onClick={(event) => placeTile(canvasRef.current, event)}
    />
  );
};

export default Canvas