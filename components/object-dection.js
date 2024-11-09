"use client";

import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { load as cocoSSDload } from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";
import { renderPredictions } from "@/utils/render-predictions";

let detectInterval;

const ObjectionDetection = () => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);

    const runCoco = async () => {
        setIsLoading(true);
        const net = await cocoSSDload();
        setIsLoading(false);

        detectInterval = setInterval(() => {
            runObjectDetection(net);
        }, 10);
    };

    async function runObjectDetection(net) {
        if (canvasRef.current &&
            webcamRef.current !== null &&
            webcamRef.current.video?.readyState === 4
        ) {
            canvasRef.current.width = webcamRef.current.video.videoWidth;
            canvasRef.current.height = webcamRef.current.video.videoHeight;

            // Find detected objects
            const detectedObject = await net.detect(webcamRef.current.video, undefined, 0.6);
            const context = canvasRef.current.getContext("2d");
            renderPredictions(detectedObject, context);
        }
    }

    const showMyVideo = () => {
        if (webcamRef.current !== null && webcamRef.current.video?.readyState === 4) {
            const myVideoWidth = webcamRef.current.video.videoWidth;
            const myVideoHeight = webcamRef.current.video.videoHeight;

            webcamRef.current.video.width = myVideoWidth;
            webcamRef.current.video.height = myVideoHeight;
        }
    };

    useEffect(() => {
        runCoco();
        showMyVideo();
        return () => clearInterval(detectInterval); // Clear interval on component unmount
    }, []);

    return (
        <div className="mt-8">
            {isLoading ? (
                <div className="gradient-text">Loading AI Models...</div>
            ) : (
                <div className="relative flex justify-center items-center gradient rounded-md p-1.5">
                    {/* Webcam */}
                    <Webcam ref={webcamRef} className="rounded-md w-full lg:h-[600px]" muted />
                    {/* Canvas */}
                    <canvas ref={canvasRef} className="absolute top-0 left-0 z-99999 w-full lg:h-[600px]" />
                </div>
            )}
        </div>
    );
};

export default ObjectionDetection;
