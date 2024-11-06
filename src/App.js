import './App.css';
import React, { useState, useRef, useEffect } from 'react';
import "../node_modules/bootstrap/dist/css/bootstrap.css";
import { Card, Form, Button, Container, Row, Col, Image } from 'react-bootstrap';
import GIF from 'gif.js';

function DarkModeButton(props){
  const [isDarkMode, setIsDarkMode] = useState( useState(localStorage.getItem("dark-mode") == null ? (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) : localStorage.getItem("dark-mode") == "true"));
  useEffect(()=>{ 
    localStorage.setItem("dark-mode", isDarkMode);
    document.body.setAttribute("data-bs-theme", isDarkMode ? "dark" : "light")
  },[isDarkMode])
  return (<>
    <Button onClick={(e)=>{setIsDarkMode(!isDarkMode);}} variant='secondary' style={isDarkMode ? {backgroundColor:"#ede31f"} : {backgroundColor:"#141417"}}>
      {!isDarkMode && <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Zm0-80q88 0 158-48.5T740-375q-20 5-40 8t-40 3q-123 0-209.5-86.5T364-660q0-20 3-40t8-40q-78 32-126.5 102T200-480q0 116 82 198t198 82Zm-10-270Z"/></svg>}
      {isDarkMode && <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#46464d"><path d="M480-360q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Zm0 80q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Zm326-268Z"/></svg>}
    </Button>
  </>)
}

const VideoPlayer = () => {
  const [videoFile, setVideoFile] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [currentFrameImage, setCurrentFrameImage] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const handleVideoChange = (event) => {
    setVideoFile(event.target.files[0]);
  };

  const downloadCurrentFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'video-frame.png';
      link.href = imageUrl;
      link.click();
    }
  };

  const exportCurrentFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageUrl = canvas.toDataURL('image/png');
      setCurrentFrameImage(imageUrl);
    }
  };

  const clearCurrentFrame = () => {
    setCurrentFrameImage(null);
  };

  const convertToGif = async () => {
    if (!videoRef.current) return;
    setIsConverting(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: video.videoWidth,
      height: video.videoHeight
    });
    video.currentTime = 0;
    const frameRate = 10; 
    const frameDuration = 1000 / frameRate;
    const totalFrames = Math.floor(video.duration * frameRate);
    let currentFrame = 0;

    const captureFrame = () => {
      if (currentFrame < totalFrames) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        gif.addFrame(canvas, { delay: frameDuration, copy: true });
        video.currentTime = (currentFrame + 1) / frameRate;
        currentFrame++;
        video.addEventListener('seeked', captureFrame, { once: true });
      } else {
        gif.render();
      }
    };

    gif.on('finished', (blob) => {
      console.log('finished')
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'video.gif';
      link.click();
      URL.revokeObjectURL(url);
      setIsConverting(false);
    });
    captureFrame();
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <Card>
            <Card.Body>
              <DarkModeButton />
              <Card.Title>Video Player</Card.Title>
              <Form>
                <Form.Group controlId="formFile" className="mb-3">
                  <Form.Label>Select a video file</Form.Label>
                  <Form.Control type="file" onChange={handleVideoChange} accept="video/*" />
                </Form.Group>
                {videoFile && (
                  <div className="mb-3">
                    <video className='video-js' data-setup="{}" preload="auto" ref={videoRef} controls width="100%">
                      <source src={URL.createObjectURL(videoFile)} type={videoFile.type} />
                      Your browser does not support the video tag.
                    </video>
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    <div className="text-center mt-3">
                      <Button variant="primary" onClick={downloadCurrentFrame}>
                        Download Current Frame
                      </Button>
                      <Button variant="secondary" onClick={exportCurrentFrame} className="ms-2">
                        Export Current Frame
                      </Button>
                      <Button 
                        variant="success" 
                        onClick={convertToGif} 
                        className="ms-2"
                        disabled={isConverting}
                      >
                        {isConverting ? 'Converting...' : 'Convert to GIF'}
                      </Button>
                      {currentFrameImage && (
                        <div className="mt-3">
                          <Image src={currentFrameImage} fluid />
                          <div className="text-center mt-2">
                            <Button variant="danger" onClick={clearCurrentFrame}>
                              Clear Current Frame
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {!videoFile && (
                  <div className="text-center">
                    <Button variant="primary">Upload Video</Button>
                  </div>
                )}
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};


function App() {
  return (
    <div className="App">
      <VideoPlayer></VideoPlayer>
    </div>
  );
}

export default App;
