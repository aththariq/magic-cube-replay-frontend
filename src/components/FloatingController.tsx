import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import styled from "styled-components";
import { Button, Select, Slider, Modal, Table, Typography } from "antd";
import { PauseIcon, PlayIcon, ArrowPathIcon } from "@heroicons/react/24/solid";

const { Text } = Typography;

const GlassContainer = styled(motion.div)`
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.06);
  width: 500px;
  cursor: grab;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 10px;
`;

const ControlRow = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  gap: 20px;
  align-items: center;
`;

const algorithms = [
  { label: "Steepest Ascent Hill-Climbing", value: "steepest_ascent" },
  {
    label: "Hill-Climbing with Sideways Move",
    value: "sideways_hill_climbing",
  },
  { label: "Random Restart Hill-Climbing", value: "random_restart" },
  { label: "Stochastic Hill-Climbing", value: "stochastic_hill_climbing" },
  { label: "Simulated Annealing", value: "simulated_annealing" },
  { label: "Genetic Algorithm", value: "genetic_algorithm" },
];

interface FloatingControllerProps {
  isPlaying: boolean;
  currentIndex: number;
  replayData: number[][];
  playbackSpeed: number;
  handlePlayPause: () => void;
  handleProgressChange: (value: number) => void;
  handleSpeedChange: (value: number) => void;
  handleReset: () => void;
  gap: number;
  handleGapChange: (value: number) => void;
  initialGap: number;
  setReplayData: (data: number[][]) => void;
  initialCube: number[];
  selectedAlgorithm: string; 
  setSelectedAlgorithm: (alg: string) => void;
}

const FloatingController: React.FC<FloatingControllerProps> = ({
  isPlaying,
  currentIndex,
  replayData,
  playbackSpeed,
  handlePlayPause,
  handleProgressChange,
  handleSpeedChange,
  handleReset,
  gap,
  handleGapChange,
  initialGap,
  selectedAlgorithm, 
  setSelectedAlgorithm, 
}) => {
  const [selectedIteration, setSelectedIteration] = useState(currentIndex);
  const [detailVisible, setDetailVisible] = useState(false);

  useEffect(() => {
    setSelectedIteration(currentIndex);
  }, [currentIndex]);

  const handleGapSliderChange = (value: number) => {
    const normalizedGap = value === 0 ? initialGap : initialGap + value * 0.2;
    handleGapChange(normalizedGap);
  };

  const onAlgorithmChange = (algorithmKey: string) => {
    setSelectedAlgorithm(algorithmKey);
  };

  return (
    <GlassContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      drag
      dragConstraints={{
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      }}
      dragElastic={0.05} 
      dragSnapToOrigin={true}
    >
      <Text className="mb-2 text-white text-left w-full">
        Select Algorithm:
      </Text>
      <ControlRow>
        <Select
          value={selectedAlgorithm}
          onChange={onAlgorithmChange}
          className="w-[80%]"
        >
          {algorithms.map((alg) => (
            <Select.Option key={alg.value} value={alg.value}>
              {alg.label}
            </Select.Option>
          ))}
        </Select>

        <div className="flex gap-2">
          <Button
            type="primary"
            onClick={handlePlayPause}
            icon={
              isPlaying ? (
                <PauseIcon className="w-4 h-4" />
              ) : (
                <PlayIcon className="w-4 h-4" />
              )
            }
          >
            {isPlaying ? "Pause" : "Play"}
          </Button>
          <Button
            type="default"
            onClick={handleReset}
            icon={<ArrowPathIcon className="w-4 h-4" />}
          />
        </div>
      </ControlRow>

      <ControlRow>
        <Text style={{ color: "#FFFFFF", textAlign: "left", width: "30%" }}>
          Progress Slider:
        </Text>
        <Text style={{ color: "#FFFFFF", textAlign: "left", width: "30%" }}>
          Playback Speed:
        </Text>
        <Text style={{ color: "#FFFFFF", textAlign: "left", width: "30%" }}>
          Gap Between Cubes:
        </Text>
      </ControlRow>
      <ControlRow>
        <Slider
          min={0}
          max={replayData.length - 1}
          value={currentIndex}
          onChange={handleProgressChange}
          style={{ width: "30%" }}
          handleStyle={{ touchAction: "none" }}
        />
        <Slider
          min={1}
          max={10}
          step={1}
          value={playbackSpeed}
          onChange={handleSpeedChange}
          style={{ width: "30%" }}
        />
        <Slider
          min={0}
          max={10}
          step={1}
          value={(gap - initialGap) * 10}
          onChange={handleGapSliderChange}
          style={{ width: "30%" }}
        />
      </ControlRow>

      <Text className="mb-2 text-white text-left w-full">
        Select Iteration:
      </Text>
      <ControlRow>
        <Select
          value={selectedIteration}
          onChange={setSelectedIteration}
          className="w-[80%]"
        >
          {replayData.map((_, index) => (
            <Select.Option key={index} value={index}>
              Iteration {index + 1}
            </Select.Option>
          ))}
        </Select>
        <Button
          type="default"
          onClick={() => setDetailVisible(true)}
          className="w-[40]"
        >
          Show Details
        </Button>
      </ControlRow>

      <Modal
        title={`Iteration ${selectedIteration + 1} Details`}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
      >
        <Table
          dataSource={replayData[selectedIteration]?.map((value, index) => ({
            index: index + 1,
            value,
          }))}
          columns={[
            { title: "Index", dataIndex: "index" },
            { title: "Value", dataIndex: "value" },
          ]}
          rowKey="index"
          pagination={false}
        />
      </Modal>
    </GlassContainer>
  );
};

export default FloatingController;
