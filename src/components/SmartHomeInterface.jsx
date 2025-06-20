// import React, { useState, useEffect, useRef } from 'react';
// import { database } from '../firebase';
// import { ref, set, onValue } from "firebase/database";
// import './SmartHomeInterface.css';

// const SmartHomeInterface = () => {
//   // Room value mapping for Firebase
//   const FIREBASE_VALUES = {
//     ALL_OFF: 0,
//     ALL_ON: 1,
//     BEDROOM_ON: 2,
//     BEDROOM_OFF: 3,
//     BATHROOM_ON: 4,
//     BATHROOM_OFF: 5,
//     KITCHEN_ON: 6,
//     KITCHEN_OFF: 7,
//     OTHER_ON: 8,
//     OTHER_OFF: 9
//   };

//   // State for each room's light status
//   const [lights, setLights] = useState({
//     bedroom: false,
//     bathroom: false,
//     kitchen: false,
//     other: false
//   });

//   // State for voice recognition
//   const [isListening, setIsListening] = useState(false);
//   const [notification, setNotification] = useState('');
//   const [speechSupported, setSpeechSupported] = useState(false);

//   // State for temperature
//   const [temperature, setTemperature] = useState(null);

//   // State for gesture detection
//   const [isGestureDetecting, setIsGestureDetecting] = useState(false);
//   const [detectedFingers, setDetectedFingers] = useState(null);
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const handModelRef = useRef(null);

//   // Check if speech recognition is supported
//   useEffect(() => {
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (SpeechRecognition) {
//       setSpeechSupported(true);
//     } else {
//       setNotification('Speech recognition is not supported in this browser.');
//     }
//   }, []);

//   // Connect to Firebase and listen for changes
//   useEffect(() => {
//     const lightsRef = ref(database, 'lights');

//     // Listen for changes in Firebase and update local state
//     onValue(lightsRef, (snapshot) => {
//       const value = snapshot.val();

//       // Only update UI if the value is defined
//       if (value !== null && value !== undefined) {
//         console.log("Firebase value received:", value);

//         // Update local state based on the Firebase value
//         switch (parseInt(value)) {
//           case FIREBASE_VALUES.ALL_ON:
//             console.log("Setting all lights ON");
//             setLights({
//               bedroom: true,
//               bathroom: true,
//               kitchen: true,
//               other: true
//             });
//             break;
//           case FIREBASE_VALUES.ALL_OFF:
//             console.log("Setting all lights OFF");
//             setLights({
//               bedroom: false,
//               bathroom: false,
//               kitchen: false,
//               other: false
//             });
//             break;
//           case FIREBASE_VALUES.BEDROOM_ON:
//             setLights(prev => ({ ...prev, bedroom: true }));
//             break;
//           case FIREBASE_VALUES.BEDROOM_OFF:
//             setLights(prev => ({ ...prev, bedroom: false }));
//             break;
//           case FIREBASE_VALUES.BATHROOM_ON:
//             setLights(prev => ({ ...prev, bathroom: true }));
//             break;
//           case FIREBASE_VALUES.BATHROOM_OFF:
//             setLights(prev => ({ ...prev, bathroom: false }));
//             break;
//           case FIREBASE_VALUES.KITCHEN_ON:
//             setLights(prev => ({ ...prev, kitchen: true }));
//             break;
//           case FIREBASE_VALUES.KITCHEN_OFF:
//             setLights(prev => ({ ...prev, kitchen: false }));
//             break;
//           case FIREBASE_VALUES.OTHER_ON:
//             setLights(prev => ({ ...prev, other: true }));
//             break;
//           case FIREBASE_VALUES.OTHER_OFF:
//             setLights(prev => ({ ...prev, other: false }));
//             break;
//           default:
//             console.log("Unknown value from Firebase:", value);
//         }
//       }
//     });

//     // Listen for temperature updates
//     const temperatureRef = ref(database, 'sensorData/temperature');
//     onValue(temperatureRef, (snapshot) => {
//       const value = snapshot.val();
//       if (value !== null && value !== undefined) {
//         console.log("Temperature value received:", value);
//         setTemperature(value);
//       }
//     });

//     // Clean up listeners
//     return () => {
//       // Clean up listeners
//     };
//   }, []);

//   // Load HandPose model
//   useEffect(() => {
//     const loadHandPoseModel = async () => {
//       try {
//         // Dynamically import TensorFlow.js and HandPose
//         const tf = await import('@tensorflow/tfjs');
//         const handpose = await import('@tensorflow-models/handpose');

//         // Load the HandPose model
//         handModelRef.current = await handpose.load();
//         console.log("Handpose model loaded");
//       } catch (error) {
//         console.error("Error loading handpose model:", error);
//         setNotification("Error: Could not load hand detection model");
//       }
//     };

//     loadHandPoseModel();
//   }, []);

//   // Toggle light function for individual rooms
//   const toggleLight = (room) => {
//     const newStatus = !lights[room];

//     // Update local state (will be overwritten when Firebase updates)
//     setLights(prevState => ({
//       ...prevState,
//       [room]: newStatus
//     }));

//     // Determine which Firebase value to send
//     let valueToSend;
//     if (room === 'bedroom') {
//       valueToSend = newStatus ? FIREBASE_VALUES.BEDROOM_ON : FIREBASE_VALUES.BEDROOM_OFF;
//     } else if (room === 'bathroom') {
//       valueToSend = newStatus ? FIREBASE_VALUES.BATHROOM_ON : FIREBASE_VALUES.BATHROOM_OFF;
//     } else if (room === 'kitchen') {
//       valueToSend = newStatus ? FIREBASE_VALUES.KITCHEN_ON : FIREBASE_VALUES.KITCHEN_OFF;
//     } else if (room === 'other') {
//       valueToSend = newStatus ? FIREBASE_VALUES.OTHER_ON : FIREBASE_VALUES.OTHER_OFF;
//     }

//     // Update Firebase
//     set(ref(database, 'lights'), valueToSend)
//       .then(() => {
//         setNotification(`${room.charAt(0).toUpperCase() + room.slice(1)} light turned ${newStatus ? 'on' : 'off'}`);
//       })
//       .catch((error) => {
//         console.error("Error updating database: ", error);
//         setNotification(`Error: Could not update ${room} light status`);
//       });

//     // Clear notification after 3 seconds
//     setTimeout(() => {
//       setNotification('');
//     }, 3000);
//   };

//   // Function to turn all lights on
//   const turnAllOn = () => {
//     // Update local state immediately
//     setLights({
//       bedroom: true,
//       bathroom: true,
//       kitchen: true,
//       other: true
//     });

//     // Update Firebase
//     set(ref(database, 'lights'), FIREBASE_VALUES.ALL_ON)
//       .then(() => {
//         setNotification('All lights turned on');
//       })
//       .catch((error) => {
//         console.error("Error updating database: ", error);
//         setNotification('Error: Could not turn all lights on');

//         // Revert local state if Firebase update fails
//         setLights(prevState => ({...prevState}));
//       });

//     // Clear notification after 3 seconds
//     setTimeout(() => {
//       setNotification('');
//     }, 3000);
//   };

//   // Function to turn all lights off
//   const turnAllOff = () => {
//     // Update local state immediately
//     setLights({
//       bedroom: false,
//       bathroom: false,
//       kitchen: false,
//       other: false
//     });

//     // Update Firebase
//     set(ref(database, 'lights'), FIREBASE_VALUES.ALL_OFF)
//       .then(() => {
//         setNotification('All lights turned off');
//       })
//       .catch((error) => {
//         console.error("Error updating database: ", error);
//         setNotification('Error: Could not turn all lights off');

//         // Revert local state if Firebase update fails
//         setLights(prevState => ({...prevState}));
//       });

//     // Clear notification after 3 seconds
//     setTimeout(() => {
//       setNotification('');
//     }, 3000);
//   };

//   // Process voice command
//   const processCommand = (command) => {
//     if (!command) return;

//     command = command.toLowerCase();

//     // Check for "all" commands first
//     if (command.includes('all') || command.includes('every')) {
//       if (command.includes('on')) {
//         turnAllOn();
//         return;
//       } else if (command.includes('off')) {
//         turnAllOff();
//         return;
//       }
//     }

//     // Process commands for individual rooms
//     if (command.includes('turn on') || command.includes('turn off')) {
//       const isOn = command.includes('turn on');

//       // Check which room is mentioned
//       const rooms = ['bedroom', 'bathroom', 'kitchen', 'other'];
//       const mentionedRoom = rooms.find(room => command.includes(room));

//       if (mentionedRoom) {
//         // Only toggle if the current state is different
//         if (lights[mentionedRoom] !== isOn) {
//           toggleLight(mentionedRoom);
//         } else {
//           setNotification(`${mentionedRoom.charAt(0).toUpperCase() + mentionedRoom.slice(1)} light is already ${isOn ? 'on' : 'off'}`);

//           // Clear notification after 3 seconds
//           setTimeout(() => {
//             setNotification('');
//           }, 3000);
//         }
//       } else {
//         setNotification('Sorry, I didn\'t recognize which room you meant');

//         // Clear notification after 3 seconds
//         setTimeout(() => {
//           setNotification('');
//         }, 3000);
//       }
//     } else if (command.includes('hello') || command.includes('hi')) {
//       setNotification('Hello! How can I help you with the lights?');

//       // Clear notification after 3 seconds
//       setTimeout(() => {
//         setNotification('');
//       }, 3000);
//     } else {
//       setNotification('Try saying "Turn on bedroom light" or "Turn all lights off"');

//       // Clear notification after 3 seconds
//       setTimeout(() => {
//         setNotification('');
//       }, 3000);
//     }
//   };

//   // Start voice recognition
//   const startListening = () => {
//     if (!speechSupported) return;

//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     const recognition = new SpeechRecognition();

//     recognition.lang = 'en-US';
//     recognition.interimResults = false;
//     recognition.maxAlternatives = 1;

//     setIsListening(true);
//     setNotification('Listening...');

//     recognition.start();

//     recognition.onresult = (event) => {
//       const speechResult = event.results[0][0].transcript;
//       setNotification(`You said: "${speechResult}"`);
//       processCommand(speechResult);
//     };

//     recognition.onerror = (event) => {
//       console.error('Speech recognition error', event.error);
//       setNotification(`Error: ${event.error}`);
//       setIsListening(false);
//     };

//     recognition.onend = () => {
//       setIsListening(false);
//     };
//   };

//   // Start gesture detection
//   const startGestureDetection = async () => {
//     if (!handModelRef.current) {
//       console.log("Model not loaded yet");
//       setNotification('Hand detection model is not loaded yet. Please try again in a moment.');
//       return;
//     }

//     console.log("Starting gesture detection");

//     try {
//       // Access webcam with more specific constraints
//       const stream = await navigator.mediaDevices.getUserMedia({ 
//         video: { 
//           width: { ideal: 640 },
//           height: { ideal: 480 },
//           facingMode: 'user'
//         } 
//       });

//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         videoRef.current.play();

//         // Start detection loop
//         setIsGestureDetecting(true);
//         setNotification('Gesture detection started. Show your hand with fingers extended.');

//         // Setup canvas
//         if (canvasRef.current) {
//           canvasRef.current.width = videoRef.current.clientWidth;
//           canvasRef.current.height = videoRef.current.clientHeight;

//           // Start the detection loop
//           console.log("Gesture detection loop started");
//           detectGestures();
//         }
//       }
//     } catch (error) {
//       console.error('Error accessing webcam:', error);
//       setNotification('Error: Could not access webcam. Please check camera permissions.');
//       setIsGestureDetecting(false);
//     }
//   };

//   // Stop gesture detection
//   const stopGestureDetection = () => {
//     setIsGestureDetecting(false);

//     // Stop the webcam stream
//     if (videoRef.current && videoRef.current.srcObject) {
//       const tracks = videoRef.current.srcObject.getTracks();
//       tracks.forEach(track => track.stop());
//       videoRef.current.srcObject = null;
//     }

//     setNotification('Gesture detection stopped');
//   };

//   // Improved helper function to count extended fingers
//   const countExtendedFingers = (landmarks) => {
//     // Get key points
//     const wrist = landmarks[0];
//     const thumbTip = landmarks[4];
//     const indexTip = landmarks[8];
//     const middleTip = landmarks[12];
//     const ringTip = landmarks[16];
//     const pinkyTip = landmarks[20];

//     // Get base points
//     const indexBase = landmarks[5];
//     const middleBase = landmarks[9];
//     const ringBase = landmarks[13];
//     const pinkyBase = landmarks[17];

//     let count = 0;

//     // SIMPLE DETECTION ALGORITHM that prioritizes reliability over accuracy

//     // Special case for just one finger (index) - very lenient detection
//     // Many users just point with index finger, so we make this especially easy to detect
//     const indexRaised = indexTip[1] < indexBase[1] - 15; // Vertical check with smaller threshold

//     if (indexRaised &&
//         // Make sure other fingers are not clearly extended
//         middleTip[1] > middleBase[1] - 10 &&
//         ringTip[1] > ringBase[1] - 10 &&
//         pinkyTip[1] > pinkyBase[1] - 10) {

//       console.log("INDEX FINGER CLEARLY DETECTED");
//       return 1; // Directly return 1 for clear index finger pointing
//     }

//     // More general detection for other cases
//     // Thumb (simplified)
//     if (Math.abs(thumbTip[0] - wrist[0]) > 30) {
//       count++;
//       console.log("Thumb detected");
//     }

//     // Index finger
//     if (indexTip[1] < indexBase[1] - 25) {
//       count++;
//       console.log("Index finger detected");
//     }

//     // Middle finger
//     if (middleTip[1] < middleBase[1] - 25) {
//       count++;
//       console.log("Middle finger detected");
//     }

//     // Ring finger
//     if (ringTip[1] < ringBase[1] - 25) {
//       count++;
//       console.log("Ring finger detected");
//     }

//     // Pinky
//     if (pinkyTip[1] < pinkyBase[1] - 25) {
//       count++;
//       console.log("Pinky detected");
//     }

//     console.log(`Total fingers detected: ${count}`);
//     return count;
//   };


//   // Process detected finger count and execute command
//   const processGestureCommand = (fingerCount) => {
//     console.log(`PROCESSING COMMAND: ${fingerCount} fingers`);

//     // Always log to debugData for verification
//     set(ref(database, 'debugData/fingerCount'), fingerCount)
//       .then(() => console.log(`Debug data updated with count ${fingerCount}`))
//       .catch(error => console.error("Debug update error:", error));

//     // Explicitly process each count
//     switch (fingerCount) {
//       case 1:
//         console.log("*** SENDING VALUE 1 TO FIREBASE ***");

//         // Direct update to Firebase - no conditional logic
//         set(ref(database, 'lights'), FIREBASE_VALUES.ALL_ON)
//           .then(() => {
//             console.log("SUCCESS: Firebase value set to 1 (ALL_ON)");
//             setNotification('All lights turned ON via gesture');
//           })
//           .catch((error) => {
//             console.error("Firebase error:", error);
//             setNotification('Error sending to Firebase');
//           });
//         break;

//       // Handle other finger counts similarly
//       case 0:
//         set(ref(database, 'lights'), FIREBASE_VALUES.ALL_OFF);
//         break;
//       case 2:
//         set(ref(database, 'lights'), FIREBASE_VALUES.BEDROOM_ON);
//         break;
//       case 3:
//         set(ref(database, 'lights'), FIREBASE_VALUES.BATHROOM_ON);
//         break;
//       case 4:
//         set(ref(database, 'lights'), FIREBASE_VALUES.KITCHEN_ON);
//         break;
//       case 5:
//         set(ref(database, 'lights'), FIREBASE_VALUES.OTHER_ON);
//         break;
//     }

//     // Stop detection after successfully processing command
//     setTimeout(() => {
//       stopGestureDetection();
//     }, 2000);
//   };

//   // Improved gesture detection with consistency check
//   const detectGestures = async () => {
//     if (!isGestureDetecting || !handModelRef.current || !videoRef.current || !canvasRef.current) return;

//     try {
//       // Get hand predictions
//       const predictions = await handModelRef.current.estimateHands(videoRef.current);

//       const ctx = canvasRef.current.getContext('2d');
//       ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

//       // Draw video
//       ctx.drawImage(
//         videoRef.current, 
//         0, 0, 
//         canvasRef.current.width, 
//         canvasRef.current.height
//       );

//       // Add detection readings history for stability
//       const readingsHistory = [];

//       if (predictions.length > 0) {
//         // Get hand and count fingers
//         const hand = predictions[0];
//         const fingerCount = countExtendedFingers(hand.landmarks);

//         // Update UI
//         setDetectedFingers(fingerCount);
//         setNotification(`Detected ${fingerCount} finger${fingerCount !== 1 ? 's' : ''}`);

//         // Log to console for debugging
//         console.log(`Current finger count: ${fingerCount}`);

//         // Draw landmarks
//         for (const landmark of hand.landmarks) {
//           ctx.beginPath();
//           ctx.arc(
//             landmark[0] * canvasRef.current.width / videoRef.current.videoWidth,
//             landmark[1] * canvasRef.current.height / videoRef.current.videoHeight,
//             5, 0, 2 * Math.PI
//           );
//           ctx.fillStyle = 'red';
//           ctx.fill();
//         }

//         // Draw finger count prominently
//         ctx.font = 'bold 100px Arial';
//         ctx.fillStyle = 'white';
//         ctx.strokeStyle = 'black';
//         ctx.lineWidth = 5;
//         ctx.textAlign = 'center';
//         ctx.textBaseline = 'middle';
//         ctx.strokeText(
//           fingerCount.toString(),
//           canvasRef.current.width / 2,
//           canvasRef.current.height / 2
//         );
//         ctx.fillText(
//           fingerCount.toString(),
//           canvasRef.current.width / 2,
//           canvasRef.current.height / 2
//         );

//         // Send directly to Firebase after detection
//         if (fingerCount >= 0 && fingerCount <= 5) {
//           // Immediately send to Firebase - no delay for better responsiveness
//           // In a real app you might want a small delay, but for debugging immediate feedback helps
//           processGestureCommand(fingerCount);
//         }
//       } else {
//         setDetectedFingers(null);
//         setNotification('No hand detected. Please show your hand to the camera.');
//       }

//       // Continue loop
//       if (isGestureDetecting) {
//         requestAnimationFrame(detectGestures);
//       }
//     } catch (error) {
//       console.error('Error in hand detection:', error);
//       setNotification('Error in hand detection');
//       setIsGestureDetecting(false);
//     }
//   };

//   // Custom Switch component
//   const Switch = ({ isOn, onToggle }) => {
//     return (
//       <label className="switch">
//         <input 
//           type="checkbox" 
//           checked={isOn} 
//           onChange={onToggle} 
//         />
//         <span className={`slider ${isOn ? 'active' : ''}`}>
//           <span className={`slider-thumb ${isOn ? 'active' : ''}`}></span>
//         </span>
//       </label>
//     );
//   };

//   return (
//     <div className="container">
//       <div className="header">
//         <div className='smart'>
//           <div className="assistant-icon">G</div>
//           <h1 className="title">Smart Home Controls</h1>
//         </div>
//         {/* Temperature and Fan Status Display */}
//         {temperature !== null && (
//           <div className="temperature-display">
//             <span className="temp-icon">🌡️</span>
//             <span className="temp-value">{temperature}°C</span>
//             <div className={`fan-status ${temperature >= 29 ? 'fan-on' : 'fan-off'}`}>
//               <span className="fan-icon">{temperature >= 29 ? '🔄' : '⏹️'}</span>
//               <span className="fan-text">Fan {temperature >= 29 ? 'ON' : 'OFF'}</span>
//             </div>
//           </div>
//         )}
//       </div>

//       <div className="master-controls">
//         <button 
//           className="master-button on" 
//           onClick={turnAllOn}
//         >
//           All Lights On
//         </button>
//         <button 
//           className="master-button off" 
//           onClick={turnAllOff}
//         >
//           All Lights Off
//         </button>
//       </div>

//       <div className="controls">
//         {Object.entries(lights).map(([room, isOn]) => (
//           <div key={room} className={`room ${isOn ? 'active' : ''}`}>
//             <h2 className="room-name">{room.charAt(0).toUpperCase() + room.slice(1)}</h2>
//             <Switch isOn={isOn} onToggle={() => toggleLight(room)} />
//           </div>
//         ))}
//       </div>

//       {/* Gesture Detection Section */}
//       <div className="gesture-section">
//         <h2>Gesture Control</h2>
//         <p>Control your lights with hand gestures:</p>
//         <ul className="gesture-examples">
//           <li><strong>0 fingers:</strong> Turn all lights off</li>
//           <li><strong>1 finger:</strong> Turn all lights on</li>
//           <li><strong>2 fingers:</strong> Toggle bedroom light</li>
//           <li><strong>3 fingers:</strong> Toggle bathroom light</li>
//           <li><strong>4 fingers:</strong> Toggle kitchen light</li>
//           <li><strong>5 fingers:</strong> Toggle other lights</li>
//         </ul>

//         <div className="gesture-controls">
//           <button 
//             onClick={isGestureDetecting ? stopGestureDetection : startGestureDetection} 
//             className={`gesture-button ${isGestureDetecting ? 'detecting' : ''}`}
//           >
//             <span className="camera-icon">📷</span>
//             {isGestureDetecting ? 'Stop Gesture Detection' : 'Start Gesture Detection'}
//           </button>
//         </div>

//         <div className="gesture-display">
//           <video 
//             ref={videoRef} 
//             className={`gesture-video ${isGestureDetecting ? 'active' : ''}`}
//             playsInline
//             muted
//           />
//           <canvas 
//             ref={canvasRef} 
//             className={`gesture-canvas ${isGestureDetecting ? 'active' : ''}`}
//           />
//         </div>
//       </div>

//       <div className="voice-section">
//         <h2>Voice Commands</h2>
//         <p>Click the microphone button and try saying:</p>
//         <ul className="command-examples">
//           <li>"Turn on bedroom light"</li>
//           <li>"Turn off kitchen light"</li>
//           <li>"Turn all lights on"</li>
//           <li>"Turn all lights off"</li>
//         </ul>

//         <button 
//           onClick={startListening} 
//           className={`voice-button ${isListening ? 'listening' : ''} ${!speechSupported ? 'disabled' : ''}`}
//           disabled={!speechSupported || isListening}
//         >
//           <span className="mic-icon">🎤</span>
//           {isListening ? 'Listening...' : 'Start Voice Command'}
//         </button>
//       </div>

//       {notification && (
//         <div className="notification">
//           {notification}
//         </div>
//       )}
//     </div>
//   );
// };

// export default SmartHomeInterface;


// import React, { useState, useEffect, useRef } from 'react';
// import { database } from '../firebase';
// import { ref, set, onValue } from "firebase/database";
// import './SmartHomeInterface.css';

// const SmartHomeInterface = () => {
//   // State for each room's light status - using "0" and "1" strings
//   const [lights, setLights] = useState({
//     bedroom_light: "0",
//     bathroom_light: "0",
//     hall_light: "0",
//     fan: "0"
//   });

//   // State for voice recognition
//   const [isListening, setIsListening] = useState(false);
//   const [speechSupported, setSpeechSupported] = useState(false);
//   const recognitionRef = useRef(null);

//   // State for notifications
//   const [notificationQueue, setNotificationQueue] = useState([]);
//   const [currentNotification, setCurrentNotification] = useState('');

//   // State for health data
//   const [healthData, setHealthData] = useState({
//     diastolic: 0,
//     gas_detected: false,
//     heart_rate: 0,
//     humidity: 0,
//     spo2: 0,
//     systolic: 0,
//     temperature: 0
//   });

//   // Check if speech recognition is supported
//   useEffect(() => {
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (SpeechRecognition) {
//       setSpeechSupported(true);
//     } else {
//       setNotificationQueue(prev => [...prev, 'Speech recognition is not supported in this browser.']);
//     }
//   }, []);

//   // Manage notification queue
//   useEffect(() => {
//     if (notificationQueue.length > 0) {
//       setCurrentNotification(notificationQueue[0]);
//       const timer = setTimeout(() => {
//         setNotificationQueue(prev => prev.slice(1));
//       }, 3000);
//       return () => clearTimeout(timer);
//     } else {
//       setCurrentNotification('');
//     }
//   }, [notificationQueue]);

//   // Connect to Firebase and listen for changes
//   useEffect(() => {
//     if (!database) {
//       setNotificationQueue(prev => [...prev, 'Error: Firebase database not initialized']);
//       return;
//     }

//     const bedroomLightRef = ref(database, '3_Health_Smart_Home/bedroom_light');
//     const bathroomLightRef = ref(database, '3_Health_Smart_Home/bathroom_light');
//     const hallLightRef = ref(database, '3_Health_Smart_Home/hall_light');
//     const fanRef = ref(database, '3_Health_Smart_Home/facedetection');
//     const healthDataRef = ref(database, '3_Health_Smart_Home/health_data');

//     const bedroomListener = onValue(bedroomLightRef, (snapshot) => {
//       const value = snapshot.val();
//       if (value !== null && value !== undefined) {
//         setLights(prev => ({ ...prev, bedroom_light: value }));
//       }
//     });

//     const bathroomListener = onValue(bathroomLightRef, (snapshot) => {
//       const value = snapshot.val();
//       if (value !== null && value !== undefined) {
//         setLights(prev => ({ ...prev, bathroom_light: value }));
//       }
//     });

//     const hallListener = onValue(hallLightRef, (snapshot) => {
//       const value = snapshot.val();
//       if (value !== null && value !== undefined) {
//         setLights(prev => ({ ...prev, hall_light: value }));
//       }
//     });
//     const fanListener = onValue(fanRef, (snapshot) => {
//       const value = snapshot.val();
//       if (value !== null && value !== undefined) {
//         setLights(prev => ({ ...prev, fan: value }));
//       }
//     });

//     const healthListener = onValue(healthDataRef, (snapshot) => {
//       const value = snapshot.val();
//       console.log("Health data from Firebase:", value);
//       if (value !== null && value !== undefined) {
//         setHealthData(value);
//       } else {
//         console.log("Health data is null or undefined");
//       }
//     });

//     return () => {
//       bedroomListener();
//       bathroomListener();
//       hallListener();
//       fanListener();
//       healthListener();
//     };
//   }, []);

//   // Clean up speech recognition on unmount
//   useEffect(() => {
//     return () => {
//       if (recognitionRef.current) {
//         recognitionRef.current.stop();
//       }
//     };
//   }, []);

//   // Helper function to update lights
//   const updateLights = (updates) => {
//   setLights(prev => ({ ...prev, ...updates }));
//   Object.entries(updates).forEach(([room, status]) => {
//     // Special case for fan - map to facedetection in Firebase
//     const firebasePath = room === 'fan' ? 'facedetection' : room;
    
//     set(ref(database, `3_Health_Smart_Home/${firebasePath}`), status)
//       .then(() => {
//         setNotificationQueue(prev => [...prev, `${formatRoomName(room)} turned ${status === "1" ? 'on' : 'off'}`]);
//       })
//       .catch((error) => {
//         console.error("Error updating database: ", error);
//         setNotificationQueue(prev => [...prev, `Error: Could not update ${formatRoomName(room)} status`]);
//       });
//   });
// };

//   // Toggle light function for individual rooms
//   const toggleLight = (room) => {
//     const newStatus = lights[room] === "0" ? "1" : "0";
//     updateLights({ [room]: newStatus });
//   };

//   // Function to turn all lights on
//   const turnAllOn = () => {
//     const updates = {
//       bedroom_light: "1",
//       bathroom_light: "1",
//       hall_light: "1",
//       fan: "1"
//     };
//     updateLights(updates);
//     setNotificationQueue(prev => [...prev, 'All lights turned on']);
//   };

//   // Function to turn all lights off
//   const turnAllOff = () => {
//     const updates = {
//       bedroom_light: "0",
//       bathroom_light: "0",
//       hall_light: "0",
//       fan: "0"
//     };
//     updateLights(updates);
//     setNotificationQueue(prev => [...prev, 'All lights turned off']);
//   };

//   // Process voice command
// const processCommand = (command) => {
//   if (!command) return;

//   command = command.toLowerCase();

//   if (command.includes('all') || command.includes('every')) {
//     if (command.includes('on')) {
//       turnAllOn();
//       return;
//     } else if (command.includes('off')) {
//       turnAllOff();
//       return;
//     }
//   }

//   if (command.includes('turn on') || command.includes('turn off')) {
//     const isOn = command.includes('turn on');
//     const targetStatus = isOn ? "1" : "0";
//     let roomKey = null;

//     if (command.includes('bedroom')) {
//       roomKey = 'bedroom_light';
//     } else if (command.includes('bathroom')) {
//       roomKey = 'bathroom_light';
//     } else if (command.includes('hall')) {
//       roomKey = 'hall_light';
//     } else if (command.includes('fan')) {
//       // When user says "fan", update "facedetection" in Firebase
//       set(ref(database, '3_Health_Smart_Home/facedetection'), targetStatus)  // Updated to use facedetection
//         .then(() => {
//           setNotificationQueue(prev => [...prev, `Fan turned ${isOn ? 'on' : 'off'}`]);
//         })
//         .catch((error) => {
//           console.error("Error updating fan status: ", error);
//           setNotificationQueue(prev => [...prev, 'Error: Could not update fan status']);
//         });
//       return;
//     }

//     if (roomKey) {
//       if (lights[roomKey] !== targetStatus) {
//         toggleLight(roomKey);
//       } else {
//         setNotificationQueue(prev => [...prev, `${formatRoomName(roomKey)} is already ${isOn ? 'on' : 'off'}`]);
//       }
//     } else {
//       setNotificationQueue(prev => [...prev, 'Sorry, I didn\'t recognize which device you meant']);
//     }
//   } else if (command.includes('hello') || command.includes('hi')) {
//     setNotificationQueue(prev => [...prev, 'Hello! How can I help you with the lights or fan?']);
//   } else {
//     setNotificationQueue(prev => [...prev, 'Try saying "Turn on bedroom light", "Turn on fan" or "Turn all lights off"']);
//   }
// };

//   // Start voice recognition
//   const startListening = () => {
//     if (!speechSupported) return;

//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     recognitionRef.current = new SpeechRecognition();

//     recognitionRef.current.lang = 'en-US';
//     recognitionRef.current.interimResults = false;
//     recognitionRef.current.maxAlternatives = 1;

//     setIsListening(true);
//     setNotificationQueue(prev => [...prev, 'Listening...']);

//     recognitionRef.current.start();

//     recognitionRef.current.onresult = (event) => {
//       const speechResult = event.results[0][0].transcript;
//       setNotificationQueue(prev => [...prev, `You said: "${speechResult}"`]);
//       processCommand(speechResult);
//     };

//     recognitionRef.current.onerror = (event) => {
//       console.error('Speech recognition error', event.error);
//       setNotificationQueue(prev => [...prev, `Error: ${event.error}`]);
//       setIsListening(false);
//     };

//     recognitionRef.current.onend = () => {
//       setIsListening(false);
//     };
//   };

//   // Custom Switch component
//   const Switch = ({ isOn, onToggle }) => {
//     return (
//       <label className="switch">
//         <input
//           type="checkbox"
//           checked={isOn === "1"}
//           onChange={onToggle}
//         />
//         <span className={`slider ${isOn === "1" ? 'active' : ''}`}>
//           <span className={`slider-thumb ${isOn === "1" ? 'active' : ''}`}></span>
//         </span>
//       </label>
//     );
//   };

//   // Helper function to format room name for display
//   const formatRoomName = (roomKey) => {
//     if (roomKey === 'fan') return 'Fan';
//     return roomKey.replace('_light', '').charAt(0).toUpperCase() + roomKey.replace('_light', '').slice(1);
//   };


//   // Helper function to render health data safely
//   const renderHealthValue = (value, unit, defaultValue = 'N/A') => {
//     return value !== null && value !== undefined ? `${value}${unit}` : defaultValue;
//   };

//   return (
//     <div className="container">
//       <div className="header">
//         <div className='smart'>
//           <div className="assistant-icon">G</div>
//           <h1 className="title">Smart Home Controls</h1>
//         </div>
//         {/* Temperature Display */}
//         {healthData.temperature !== null && (
//           <div className="temperature-display">
//             <span className="temp-icon">🌡️</span>
//             <span className="temp-value">{renderHealthValue(healthData.temperature, '°C')}</span>
//             <div className={`fan-status ${healthData.temperature >= 29 ? 'fan-on' : 'fan-off'}`}>
//               <span className="fan-icon">{healthData.temperature >= 29 ? '🔄' : '⏹️'}</span>
//               <span className="fan-text">Fan {healthData.temperature >= 29 ? 'ON' : 'OFF'}</span>
//             </div>
//           </div>
//         )}
//       </div>

//       <div className="master-controls">
//         <button
//           className="master-button on"
//           onClick={turnAllOn}
//         >
//           All Lights On
//         </button>
//         <button
//           className="master-button off"
//           onClick={turnAllOff}
//         >
//           All Lights Off
//         </button>
//       </div>

//       <div className="controls">
//         {Object.entries(lights).map(([room, isOn]) => (
//           <div key={room} className={`room ${isOn === "1" ? 'active' : ''}`}>
//             <h2 className="room-name">{formatRoomName(room)}</h2>
//             <Switch isOn={isOn} onToggle={() => toggleLight(room)} />
//           </div>
//         ))}
//       </div>

//       {/* Health Data Section */}
//       <div className="voice-section">
//         <h2>Health Monitoring</h2>
//         <div className="health-grid">
//           <div className="health-item">
//             <div className="health-icon">❤️</div>
//             <div className="health-label">Blood Pressure</div>
//             <div className="health-value">
//               {renderHealthValue(healthData.systolic, '')}/{renderHealthValue(healthData.diastolic, ' mmHg')}
//             </div>
//           </div>
//           <div className="health-item">
//             <div className="health-icon">💓</div>
//             <div className="health-label">Heart Rate</div>
//             <div className="health-value">{renderHealthValue(healthData.heart_rate, ' BPM')}</div>
//           </div>
//           <div className="health-item">
//             <div className="health-icon">💧</div>
//             <div className="health-label">Humidity</div>
//             <div className="health-value">{renderHealthValue(healthData.humidity, '%')}</div>
//           </div>
//           <div className="health-item">
//             <div className="health-icon">🫁</div>
//             <div className="health-label">SpO2</div>
//             <div className="health-value">{renderHealthValue(healthData.spo2, '%')}</div>
//           </div>
//           <div className="health-item">
//             <div className={`health-icon ${healthData.gas_detected ? 'alert' : ''}`}>🌫️</div>
//             <div className="health-label">Gas Detector</div>
//             <div className={`health-value ${healthData.gas_detected ? 'alert' : ''}`}>
//               {healthData.gas_detected ? 'ALERT: Gas Detected!' : 'Normal'}
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="voice-section">
//         <h2>Voice Commands</h2>
//         <p>Click the microphone button and try saying:</p>
//         <ul className="command-examples">
//           <li>"Turn on bedroom light"</li>
//           <li>"Turn off bathroom light"</li>
//           <li>"Turn on hall light"</li>
//           <li>"Turn on fan"</li>
//           <li>"Turn off fan"</li>
//         </ul>

//         <button
//           onClick={startListening}
//           className={`voice-button ${isListening ? 'listening' : ''} ${!speechSupported ? 'disabled' : ''}`}
//           disabled={!speechSupported || isListening}
//         >
//           <span className="mic-icon">🎤</span>
//           {isListening ? 'Listening...' : 'Start Voice Command'}
//         </button>
//       </div>

//       {currentNotification && (
//         <div className="notification">
//           {currentNotification}
//         </div>
//       )}
//     </div>
//   );
// };

// export default SmartHomeInterface;



import React, { useState, useEffect, useRef } from 'react';
import { database } from '../firebase';
import { ref, set, onValue } from "firebase/database";
import * as faceapi from 'face-api.js';
import './SmartHomeInterface.css';

const SmartHomeInterface = () => {
  // State for each room's light status - using "0" and "1" strings
  const [lights, setLights] = useState({
    bedroom_light: "0",
    bathroom_light: "0",
    hall_light: "0"
  });

  // State for face detection
  const [faceDetectionStatus, setFaceDetectionStatus] = useState("0");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceCount, setFaceCount] = useState(0);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  
  // Refs for camera and face detection
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const detectionIntervalRef = useRef(null);

  // State for voice recognition
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);

  // State for notifications
  const [notificationQueue, setNotificationQueue] = useState([]);
  const [currentNotification, setCurrentNotification] = useState('');

  // State for health data
  const [healthData, setHealthData] = useState({
    diastolic: 0,
    gas_detected: false,
    heart_rate: 0,
    humidity: 0,
    spo2: 0,
    systolic: 0,
    temperature: 0
  });

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setNotificationQueue(prev => [...prev, 'Loading face detection models...']);
        
        // Load models from CDN (since we can't use local files in this environment)
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model';
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        
        setModelsLoaded(true);
        setNotificationQueue(prev => [...prev, 'Face detection models loaded successfully!']);
      } catch (error) {
        console.error('Error loading face-api models:', error);
        setNotificationQueue(prev => [...prev, 'Error loading face detection models. Using basic detection.']);
        setModelsLoaded(false);
      }
    };

    loadModels();
  }, []);

  // Check if speech recognition is supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
    } else {
      setNotificationQueue(prev => [...prev, 'Speech recognition is not supported in this browser.']);
    }
  }, []);

  // Manage notification queue
  useEffect(() => {
    if (notificationQueue.length > 0) {
      setCurrentNotification(notificationQueue[0]);
      const timer = setTimeout(() => {
        setNotificationQueue(prev => prev.slice(1));
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setCurrentNotification('');
    }
  }, [notificationQueue]);

  // Connect to Firebase and listen for changes
  useEffect(() => {
    if (!database) {
      setNotificationQueue(prev => [...prev, 'Error: Firebase database not initialized']);
      return;
    }

    const bedroomLightRef = ref(database, '3_Health_Smart_Home/bedroom_light');
    const bathroomLightRef = ref(database, '3_Health_Smart_Home/bathroom_light');
    const hallLightRef = ref(database, '3_Health_Smart_Home/hall_light');
    const faceDetectionRef = ref(database, '3_Health_Smart_Home/facedetection');
    const healthDataRef = ref(database, '3_Health_Smart_Home/sensor_data');

    const bedroomListener = onValue(bedroomLightRef, (snapshot) => {
      const value = snapshot.val();
      if (value !== null && value !== undefined) {
        setLights(prev => ({ ...prev, bedroom_light: value }));
      }
    });

    const bathroomListener = onValue(bathroomLightRef, (snapshot) => {
      const value = snapshot.val();
      if (value !== null && value !== undefined) {
        setLights(prev => ({ ...prev, bathroom_light: value }));
      }
    });

    const hallListener = onValue(hallLightRef, (snapshot) => {
      const value = snapshot.val();
      if (value !== null && value !== undefined) {
        setLights(prev => ({ ...prev, hall_light: value }));
      }
    });

    const faceDetectionListener = onValue(faceDetectionRef, (snapshot) => {
      const value = snapshot.val();
      if (value !== null && value !== undefined) {
        setFaceDetectionStatus(value);
      }
    });

    const healthListener = onValue(healthDataRef, (snapshot) => {
      const value = snapshot.val();
      console.log("Health data from Firebase:", value);
      if (value !== null && value !== undefined) {
        setHealthData(value);
      } else {
        console.log("Health data is null or undefined");
      }
    });

    return () => {
      bedroomListener();
      bathroomListener();
      hallListener();
      faceDetectionListener();
      healthListener();
    };
  }, []);

  // Enhanced Face Detection Functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
        setNotificationQueue(prev => [...prev, 'Camera started for face detection']);
        
        // Start face detection after video loads
        videoRef.current.onloadedmetadata = () => {
          startFaceDetection();
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setNotificationQueue(prev => [...prev, 'Error: Could not access camera']);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    setIsCameraActive(false);
    setFaceDetected(false);
    setFaceCount(0);
    updateFaceDetectionStatus("0");
    setNotificationQueue(prev => [...prev, 'Camera stopped']);
  };

  const startFaceDetection = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Start detection loop
    detectionIntervalRef.current = setInterval(async () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        if (modelsLoaded) {
          // Use face-api.js for accurate detection
          await detectFacesWithFaceAPI(video, canvas, ctx);
        } else {
          // Fallback to basic detection if models failed to load
          detectFacesBasic(video, canvas, ctx);
        }
      }
    }, 300); // Check every 300ms for better performance
  };

  // Enhanced face detection using face-api.js
  const detectFacesWithFaceAPI = async (video, canvas, ctx) => {
    try {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw current video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Detect faces using TinyFaceDetector (fastest option)
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({
          inputSize: 320,
          scoreThreshold: 0.5
        }));

      const faceCount = detections.length;
      const detected = faceCount > 0;
      
      // Draw bounding boxes around detected faces
      if (detected) {
        detections.forEach(detection => {
          const { x, y, width, height } = detection.box;
          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, width, height);
          
          // Add confidence score
          ctx.fillStyle = '#00ff00';
          ctx.font = '16px Arial';
          ctx.fillText(`Face (${Math.round(detection.score * 100)}%)`, x, y - 10);
        });
      }
      
      // Update state if detection status changed
      if (detected !== faceDetected || faceCount !== faceCount) {
        setFaceDetected(detected);
        setFaceCount(faceCount);
        updateFaceDetectionStatus(detected ? "1" : "0");
        
        if (detected) {
          setNotificationQueue(prev => [...prev, `${faceCount} face(s) detected!`]);
        }
      }
      
    } catch (error) {
      console.error('Face detection error:', error);
      // Fallback to basic detection
      detectFacesBasic(video, canvas, ctx);
    }
  };

  // Fallback basic detection (improved version of your original)
  const detectFacesBasic = (video, canvas, ctx) => {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const detected = detectFaceInImageData(imageData);
    
    if (detected !== faceDetected) {
      setFaceDetected(detected);
      setFaceCount(detected ? 1 : 0);
      updateFaceDetectionStatus(detected ? "1" : "0");
    }
  };

  // Improved basic face detection algorithm
  const detectFaceInImageData = (imageData) => {
    const data = imageData.data;
    let skinPixels = 0;
    const totalPixels = data.length / 4;
    
    // Sample every 8th pixel for better performance
    for (let i = 0; i < data.length; i += 32) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Improved skin color detection
      if (isSkinColor(r, g, b)) {
        skinPixels++;
      }
    }
    
    const skinRatio = skinPixels / (totalPixels / 8);
    
    // More conservative threshold for better accuracy
    return skinRatio > 0.12 && skinRatio < 0.4;
  };

  // Improved skin color detection with better thresholds
  const isSkinColor = (r, g, b) => {
    // More inclusive skin color detection
    const isYCbCrSkin = (
      r > 80 && g > 85 && b > 20 &&
      r > b && (r - b) > 15 &&
      Math.max(r, g, b) - Math.min(r, g, b) > 15
    );
    
    const isRGBSkin = (
      r > 95 && g > 40 && b > 20 &&
      Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
      Math.abs(r - g) > 15 && r > g && r > b
    );
    
    return isYCbCrSkin || isRGBSkin;
  };

  const updateFaceDetectionStatus = (status) => {
    set(ref(database, '3_Health_Smart_Home/facedetection'), status)
      .then(() => {
        console.log(`Face detection status updated: ${status}`);
      })
      .catch((error) => {
        console.error("Error updating face detection status: ", error);
        setNotificationQueue(prev => [...prev, 'Error: Could not update face detection status']);
      });
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopCamera();
    };
  }, []);

  // Helper function to update lights
  const updateLights = (updates) => {
    setLights(prev => ({ ...prev, ...updates }));
    Object.entries(updates).forEach(([room, status]) => {
      set(ref(database, `3_Health_Smart_Home/${room}`), status)
        .then(() => {
          setNotificationQueue(prev => [...prev, `${formatRoomName(room)} turned ${status === "1" ? 'on' : 'off'}`]);
        })
        .catch((error) => {
          console.error("Error updating database: ", error);
          setNotificationQueue(prev => [...prev, `Error: Could not update ${formatRoomName(room)} status`]);
        });
    });
  };

  // Toggle light function for individual rooms
  const toggleLight = (room) => {
    const newStatus = lights[room] === "0" ? "1" : "0";
    updateLights({ [room]: newStatus });
  };

  // Function to turn all lights on
  const turnAllOn = () => {
    const updates = {
      bedroom_light: "1",
      bathroom_light: "1",
      hall_light: "1"
    };
    updateLights(updates);
    setNotificationQueue(prev => [...prev, 'All lights turned on']);
  };

  // Function to turn all lights off
  const turnAllOff = () => {
    const updates = {
      bedroom_light: "0",
      bathroom_light: "0",
      hall_light: "0"
    };
    updateLights(updates);
    setNotificationQueue(prev => [...prev, 'All lights turned off']);
  };

  // Process voice command
  const processCommand = (command) => {
    if (!command) return;

    command = command.toLowerCase();

    if (command.includes('all') || command.includes('every')) {
      if (command.includes('on')) {
        turnAllOn();
        return;
      } else if (command.includes('off')) {
        turnAllOff();
        return;
      }
    }

    if (command.includes('turn on') || command.includes('turn off')) {
      const isOn = command.includes('turn on');
      const targetStatus = isOn ? "1" : "0";
      let roomKey = null;

      if (command.includes('bedroom')) {
        roomKey = 'bedroom_light';
      } else if (command.includes('bathroom')) {
        roomKey = 'bathroom_light';
      } else if (command.includes('hall')) {
        roomKey = 'hall_light';
      } else if (command.includes('camera') || command.includes('face detection')) {
        if (isOn) {
          startCamera();
        } else {
          stopCamera();
        }
        return;
      }

      if (roomKey) {
        if (lights[roomKey] !== targetStatus) {
          toggleLight(roomKey);
        } else {
          setNotificationQueue(prev => [...prev, `${formatRoomName(roomKey)} is already ${isOn ? 'on' : 'off'}`]);
        }
      } else {
        setNotificationQueue(prev => [...prev, 'Sorry, I didn\'t recognize which device you meant']);
      }
    } else if (command.includes('start camera') || command.includes('start face detection')) {
      startCamera();
    } else if (command.includes('stop camera') || command.includes('stop face detection')) {
      stopCamera();
    } else if (command.includes('hello') || command.includes('hi')) {
      setNotificationQueue(prev => [...prev, 'Hello! How can I help you with the lights or face detection?']);
    } else {
      setNotificationQueue(prev => [...prev, 'Try saying "Turn on bedroom light", "Start face detection" or "Turn all lights off"']);
    }
  };

  // Start voice recognition
  const startListening = () => {
    if (!speechSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.interimResults = false;
    recognitionRef.current.maxAlternatives = 1;

    setIsListening(true);
    setNotificationQueue(prev => [...prev, 'Listening...']);

    recognitionRef.current.start();

    recognitionRef.current.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setNotificationQueue(prev => [...prev, `You said: "${speechResult}"`]);
      processCommand(speechResult);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setNotificationQueue(prev => [...prev, `Error: ${event.error}`]);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };
  };

  // Custom Switch component
  const Switch = ({ isOn, onToggle }) => {
    return (
      <label className="switch">
        <input
          type="checkbox"
          checked={isOn === "1"}
          onChange={onToggle}
        />
        <span className={`slider ${isOn === "1" ? 'active' : ''}`}>
          <span className={`slider-thumb ${isOn === "1" ? 'active' : ''}`}></span>
        </span>
      </label>
    );
  };

  // Helper function to format room name for display
  const formatRoomName = (roomKey) => {
    return roomKey.replace('_light', '').charAt(0).toUpperCase() + roomKey.replace('_light', '').slice(1);
  };

  // Helper function to render health data safely
  const renderHealthValue = (value, unit, defaultValue = 'N/A') => {
    return value !== null && value !== undefined ? `${value}${unit}` : defaultValue;
  };

  return (
    <div className="container">
      <div className="header">
        <div className='smart'>
          <div className="assistant-icon">G</div>
          <h1 className="title">Smart Home Controls</h1>
        </div>
        {/* Temperature Display */}
        {healthData.temperature !== null && (
          <div className="temperature-display">
            <span className="temp-icon">🌡️</span>
            <span className="temp-value">{renderHealthValue(healthData.temperature, '°C')}</span>
          </div>
        )}
      </div>

      <div className="master-controls">
        <button
          className="master-button on"
          onClick={turnAllOn}
        >
          All Lights On
        </button>
        <button
          className="master-button off"
          onClick={turnAllOff}
        >
          All Lights Off
        </button>
      </div>

      <div className="controls">
        {Object.entries(lights).map(([room, isOn]) => (
          <div key={room} className={`room ${isOn === "1" ? 'active' : ''}`}>
            <h2 className="room-name">{formatRoomName(room)}</h2>
            <Switch isOn={isOn} onToggle={() => toggleLight(room)} />
          </div>
        ))}
      </div>

      {/* Enhanced Face Detection Section */}
      <div className="face-detection-section">
        <h2>Enhanced Face Detection System</h2>
        <div className="model-status">
          <span className={`status-indicator ${modelsLoaded ? 'loaded' : 'loading'}`}>
            {modelsLoaded ? '✅ AI Models Loaded' : '⏳ Loading AI Models...'}
          </span>
        </div>
        
        <div className="face-detection-controls">
          <div className="camera-controls">
            <button
              onClick={isCameraActive ? stopCamera : startCamera}
              className={`camera-button ${isCameraActive ? 'active' : ''}`}
            >
              📹 {isCameraActive ? 'Stop Camera' : 'Start Camera'}
            </button>
            <div className={`detection-status ${faceDetected ? 'detected' : 'not-detected'}`}>
              <span className="status-icon">{faceDetected ? '😊' : '👤'}</span>
              <span className="status-text">
                {faceDetected ? `${faceCount} Face(s) Detected` : 'No Face Detected'}
              </span>
              <span className="firebase-status">
                Firebase: {faceDetectionStatus === "1" ? "1" : "0"}
              </span>
            </div>
          </div>
          
          <div className="camera-preview">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '300px',
                height: '225px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                display: isCameraActive ? 'block' : 'none'
              }}
            />
            <canvas
              ref={canvasRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '300px',
                height: '225px',
                border: '2px solid #00ff00',
                borderRadius: '8px',
                display: isCameraActive ? 'block' : 'none',
                pointerEvents: 'none'
              }}
            />
            {!isCameraActive && (
              <div className="camera-placeholder">
                <span style={{ fontSize: '48px' }}>📷</span>
                <p>Click "Start Camera" to begin enhanced face detection</p>
                <p style={{ fontSize: '12px', color: '#666' }}>
                  {modelsLoaded ? 'AI models ready!' : 'Loading AI models...'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Health Data Section */}
      <div className="voice-section">
        <h2>Health Monitoring</h2>
        <div className="health-grid">
          {/* <div className="health-item">
            <div className="health-icon">❤️</div>
            <div className="health-label">Blood Pressure</div>
            <div className="health-value">
              {renderHealthValue(healthData.systolic, '')}/{renderHealthValue(healthData.diastolic, ' mmHg')}
            </div>
          </div>
          <div className="health-item">
            <div className="health-icon">💓</div>
            <div className="health-label">Heart Rate</div>
            <div className="health-value">{renderHealthValue(healthData.heart_rate, ' BPM')}</div>
          </div>
          <div className="health-item">
            <div className="health-icon">💧</div>
            <div className="health-label">Humidity</div>
            <div className="health-value">{renderHealthValue(healthData.humidity, '%')}</div>
          </div>
          <div className="health-item">
            <div className="health-icon">🫁</div>
            <div className="health-label">SpO2</div>
            <div className="health-value">{renderHealthValue(healthData.spo2, '%')}</div>
          </div> */}
          <div className="health-item">
            <div className={`health-icon ${healthData.gas_detected ? 'alert' : ''}`}>🌫️</div>
            <div className="health-label">Gas Detector</div>
            <div className={`health-value ${healthData.gas_detected ? 'alert' : ''}`}>
              {healthData.gas_detected ? 'ALERT: Gas Detected!' : 'Normal'}
            </div>
          </div>
        </div>
      </div>

      <div className="voice-section">
        <h2>Voice Commands</h2>
        <p>Click the microphone button and try saying:</p>
        <ul className="command-examples">
          <li>"Turn on bedroom light"</li>
          <li>"Turn off bathroom light"</li>
          <li>"Turn on hall light"</li>
          <li>"Start face detection"</li>
          <li>"Stop camera"</li>
          <li>"Turn all lights on"</li>
        </ul>

        <button
          onClick={startListening}
          className={`voice-button ${isListening ? 'listening' : ''} ${!speechSupported ? 'disabled' : ''}`}
          disabled={!speechSupported || isListening}
        >
          <span className="mic-icon">🎤</span>
          {isListening ? 'Listening...' : 'Start Voice Command'}
        </button>
      </div>

      {currentNotification && (
        <div className="notification">
          {currentNotification}
        </div>
      )}
    </div>
  );
};

export default SmartHomeInterface;