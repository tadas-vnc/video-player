import logo from './logo.svg';
import './App.css';

import React, { useState, useRef } from 'react';
import "../node_modules/bootstrap/dist/css/bootstrap.css";

import { Card, Form, Button, Container, Row, Col, Image } from 'react-bootstrap';

const VideoPlayer = () => {
  const [videoFile, setVideoFile] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [currentFrameImage, setCurrentFrameImage] = useState(null);

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

  return (
    <Container>
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <Card>
            <Card.Body>
              <Card.Title>Video Player</Card.Title>
              <Form>
                <Form.Group controlId="formFile" className="mb-3">
                  <Form.Label>Select a video file</Form.Label>
                  <Form.Control type="file" onChange={handleVideoChange} />
                </Form.Group>
                {videoFile && (
                  <div className="mb-3">
                    <video ref={videoRef} controls width="100%">
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
