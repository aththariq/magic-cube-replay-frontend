import { useState, useEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import FloatingController from "./FloatingController";
import * as THREE from "three";
import axios from "axios";

const createNumberTexture = (number: number) => {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = "black";
    context.fillRect(0, 0, size, size);
    context.fillStyle = "white";
    context.font = `${size / 2}px Arial`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(number.toString(), size / 2, size / 2);
  }
  return new THREE.CanvasTexture(canvas);
};

const MagicCubeReplayPlayer = () => {
  const initialCube = useState(
    Array.from({ length: 125 }, () => Math.floor(Math.random() * 125) + 1)
  )[0];
  const [replayData, setReplayData] = useState([initialCube]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [gap, setGap] = useState(0.1);
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("steepest_ascent");

  const textures = useMemo(
    () => Array.from({ length: 125 }, (_, i) => createNumberTexture(i + 1)),
    []
  );

  useEffect(() => {
    setIsRequestSent(false);
    setReplayData([initialCube]);
    setCurrentIndex(0);
  }, [selectedAlgorithm, initialCube]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && replayData.length > 0) {
      interval = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          if (prevIndex < replayData.length - 1) return prevIndex + 1;
          clearInterval(interval);
          setIsPlaying(false);
          return prevIndex;
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, replayData]);

  const handlePlayPause = async () => {
    if (!isPlaying && !isRequestSent) {
      const requestParams: {
        initial_cube: number[];
        objective_function: string;
        algorithm: string;
        max_iterations?: number;
        is_value?: boolean;
        value_objective?: number;
      } = {
        initial_cube: initialCube,
        objective_function: "var",
        algorithm: selectedAlgorithm,
      };

      switch (selectedAlgorithm) {
        case "random_restart":
          requestParams.max_iterations = 100;
          break;
        case "steepest_ascent":
          requestParams.is_value = true;
          break;
        case "stochastic_hill_climbing":
          requestParams.value_objective = 0;
          requestParams.max_iterations = 100;
          break;
        case "simulated_annealing":
          requestParams.value_objective = 0;
          requestParams.max_iterations = 100;
          break;
        case "genetic_algorithm":
          requestParams.max_iterations = 100;
          requestParams.is_value = false;
          break;
        case "sideways_hill_climbing":
          requestParams.value_objective = 0;
          break;
        default:
          break;
      }

      try {
        const response = await axios.post(
          "http://127.0.0.1:8001/run-algorithm/",
          requestParams
        );
        console.log("Data fetched:", response.data.replay_data);

        if (response.data.replay_data) {
          setReplayData(response.data.replay_data);
          setIsRequestSent(true);
        } else {
          console.warn("Replay data not found in response:", response.data);
        }
      } catch (error) {
        console.error("Error fetching initial replay data:", error);
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleSpeedChange = (value: number) => setPlaybackSpeed(value);
  const handleProgressChange = (value: number) => setCurrentIndex(value);
  const handleReset = () => setCurrentIndex(0);
  const handleGapChange = (value: number) => setGap(value);

  return (
    <div className="relative w-full min-h-screen bg-slate-600 overflow-hidden">
      <div className="flex justify-center items-center w-full h-screen overflow-hidden">
        <Canvas
          className="h-full w-full"
          camera={{ position: [10, 10, 10], fov: 40 }}
        >
          <ZoomOrbitControls gap={gap} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />

          {replayData.length > 0 && replayData[currentIndex] && (
            <group>
              {replayData[currentIndex].map((value, index) => {
                const x = (index % 5) * (1 + gap) - 2 * (1 + gap);
                const y =
                  Math.floor((index % 25) / 5) * (1 + gap) - 2 * (1 + gap);
                const z = Math.floor(index / 25) * (1 + gap) - 2 * (1 + gap);

                return (
                  <mesh
                    key={index}
                    position={[x, y, z]}
                    onPointerOver={(e) => {
                      e.stopPropagation();
                      document.body.style.cursor = "grab";
                    }}
                    onPointerOut={() => {
                      document.body.style.cursor = "default";
                    }}
                  >
                    <boxGeometry args={[0.9, 0.9, 0.9]} />
                    <meshStandardMaterial map={textures[value - 1]} />
                  </mesh>
                );
              })}
            </group>
          )}
        </Canvas>
      </div>

      {replayData.length > 0 && (
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-10 cursor-grab">
          <FloatingController
            isPlaying={isPlaying}
            currentIndex={currentIndex}
            replayData={replayData}
            setReplayData={setReplayData}
            playbackSpeed={playbackSpeed}
            initialCube={initialCube}
            handlePlayPause={handlePlayPause}
            handleProgressChange={handleProgressChange}
            handleSpeedChange={handleSpeedChange}
            handleReset={handleReset}
            gap={gap}
            handleGapChange={handleGapChange}
            initialGap={0.1}
            selectedAlgorithm={selectedAlgorithm}
            setSelectedAlgorithm={setSelectedAlgorithm}
          />
        </div>
      )}
    </div>
  );
};

function ZoomOrbitControls({ gap }: { gap: number }) {
  const { camera, gl } = useThree();

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (gap === 10) {
        const zoomFactor = event.deltaY * 0.002;
        const vector = new THREE.Vector3().set(0, 0, 0.5).unproject(camera);
        const direction = vector.sub(camera.position).normalize();
        camera.position.addScaledVector(direction, zoomFactor);
        camera.updateProjectionMatrix();
      }
    };

    gl.domElement.addEventListener("wheel", handleWheel);
    return () => gl.domElement.removeEventListener("wheel", handleWheel);
  }, [camera, gl, gap]);

  return (
    <OrbitControls
      target={[0, 0, 0]}
      enableZoom
      enablePan
      maxDistance={50}
      enableRotate
      mouseButtons={{
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.PAN,
        RIGHT: THREE.MOUSE.DOLLY,
      }}
    />
  );
}

export default MagicCubeReplayPlayer;
