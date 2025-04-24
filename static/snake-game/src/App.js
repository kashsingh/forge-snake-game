import React, { useState, useEffect, useRef } from 'react';
import {view} from '@forge/bridge';

view.theme.enable();

const gridSize = 20;
const initialSnake = [{ x: 5, y: 5 }];
const directions = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

export default function App() {
  const [snake, setSnake] = useState(initialSnake);
  const [food, setFood] = useState({ x: 10, y: 10 });
  const [dir, setDir] = useState(directions.ArrowRight);
  const [canvasWidth, setCanvasWidth] = useState(600);
  const [canvasHeight, setCanvasHeight] = useState(400);
  const [isGameOver, setIsGameOver] = useState(false);
  const canvasRef = useRef();

  // Canvas resize
  useEffect(() => {
    const updateSize = () => {
      setCanvasWidth(Math.floor(window.innerWidth * 0.8));
      setCanvasHeight(Math.floor(window.innerHeight * 0.8));
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Handle keyboard
  useEffect(() => {
    const handleKey = e => {
      if (directions[e.key]) {
        setDir(directions[e.key]);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Game loop
  useEffect(() => {
    if (isGameOver) return;

    const interval = setInterval(() => {
      setSnake(prev => {
        const newHead = {
          x: prev[0].x + dir.x,
          y: prev[0].y + dir.y,
        };

        const maxX = Math.floor(canvasWidth / gridSize);
        const maxY = Math.floor(canvasHeight / gridSize);

        if (
          newHead.x < 0 || newHead.y < 0 ||
          newHead.x >= maxX || newHead.y >= maxY ||
          prev.some(p => p.x === newHead.x && p.y === newHead.y)
        ) {
          setIsGameOver(true);
          return prev;
        }

        const newSnake = [newHead, ...prev];

        if (newHead.x === food.x && newHead.y === food.y) {
          setFood({
            x: Math.floor(Math.random() * maxX),
            y: Math.floor(Math.random() * maxY),
          });
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [dir, food, canvasWidth, canvasHeight, isGameOver]);

  // Draw
  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = 'green';
    snake.forEach(p => {
      ctx.fillRect(p.x * gridSize, p.y * gridSize, gridSize, gridSize);
    });
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
  }, [snake, food, canvasWidth, canvasHeight]);

  const score = snake.length - 1;

  const restartGame = () => {
    setSnake(initialSnake);
    setFood({ x: 10, y: 10 });
    setDir(directions.ArrowRight);
    setIsGameOver(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 20, position: 'relative' }}>
      <div style={{
        top: 10,
        right: 20,
        margin: '20px',
        fontSize: '18px',
        fontWeight: 'bold',
        backgroundColor: '#000',
        color: '#fff',
        padding: '8px 16px',
        borderRadius: '8px',
      }}>
        🏆 Score: {score}
      </div>

      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{ border: '2px solid #333', backgroundColor: '#f0f0f0' }}
      />

      {isGameOver && (
        <div style={{
          position: 'absolute',
          top: canvasHeight / 2 - 100,
          width: canvasWidth,
          height: 200,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: 'white',
          borderRadius: 10,
        }}>
          <h1>💀 Game Over</h1>
          <p>Final Score: {score}</p>
          <button
            onClick={restartGame}
            style={{
              marginTop: 10,
              padding: '10px 20px',
              fontSize: '16px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              backgroundColor: '#4CAF50',
              color: 'white',
            }}
          >
            🔄 Restart Game
          </button>
        </div>
      )}
    </div>
  );
}
