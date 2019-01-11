import React, { Component } from 'react';
import io from 'socket.io-client';
import logo from './logo.svg';
import './App.css';
import { deflateRaw } from 'zlib';

const socket = io();

let canvas, ctx;
let lastCoord = { x: 0, y: 0 };
let mousePressed = false;

class App extends Component {
  constructor() {
    super();
    socket.on('paint', (line) => {
      this.drawCoords(line)
    });
    socket.on('clear', () => {
      this.clearCanvas();
    });
  }
  state = {
    color: 'black',
  }
  connect = () => {
    socket.connect();
  }

  disconnect = () => {
    socket.disconnect()
  }
  getXY = (e) => {
    const x = e.layerX;
    const y = e.layerY;
    return { x, y };
  }

  paint = (e, first = false) => {
    const { x, y } = this.getXY(e);
    if (first) {
      lastCoord = { x, y };
    }
    const line = {
      start: lastCoord,
      end: { x, y },
    };
    this.drawCoords(line);
    socket.emit('paint', line);
    lastCoord = { x, y };
  }

  drawCoords = ({start, end}) => {
    ctx.beginPath();
    ctx.strokeStyle = this.state.color;
    ctx.lineWidth = '1';
    ctx.lineJoin = "round";
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.closePath();
    ctx.stroke();
  }

  endPaint = () => {
    mousePressed = false;
  }

  onClearButton = () => {
    this.clearCanvas();
    socket.emit('clear');
  }

  clearCanvas = () => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  componentDidMount = () => {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    canvas.addEventListener('mousedown', (e) => {
      mousePressed = true;
      this.paint(e, true);
    });
    canvas.addEventListener('mouseup', (e) => {
      this.endPaint();
    });
    canvas.addEventListener('mouseleave', (e) => {
      if (mousePressed) {
        this.endPaint();
      }
    })
    canvas.addEventListener('mousemove', (e) => {
      if (mousePressed) {
        this.paint(e);
      }
    });
    socket.emit('sync', (pointData) => {
      pointData.forEach(point => {
        this.drawCoords(point);
      });
    })
  }
  

  render() {
    return (
      <div className="App">
      <div className="buttons">
        <button onClick={this.onClearButton}>clear</button>
      </div>
        <canvas id="canvas"  width="1000" height="700" style={{ border: 'solid black' }} />
      </div>
    );
  }
}

export default App;
