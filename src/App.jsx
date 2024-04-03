import { useEffect, useState } from "react";
import { Avatar, Box, Button, TextField } from "@mui/material";
import "./App.css";
import bg from "./assets/bg.jpg";
import icon from "./assets/icon.png";
import jsonData from "./dataset.json";
import nationalitiesJson from "./nationalities.json";
import teamsJson from "./teams.json"; // Import teams.json
import errorImg from "./assets/error.png"; // Import teams.json

function App() {
  const [gridAndPlayers, setGridAndPlayers] = useState({ grid: [], players: [] });
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [playerCountVer, setPlayerCountVer] = useState(1);
  const [playerCountHor, setPlayerCountHor] = useState(1);
  const [count, setCount] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [counter, setCounter] = useState(120);
  const [gameStarted, setGameStarted] = useState(false);
  const [shake, setShake] = useState(false); // State for controlling shake animation
  const [teams, setTeams] = useState(null); // State for controlling shake animation
  const [nationalities, setNationalities] = useState(null); // State for controlling shake animation
  const [currentNationalities, setCurrentNationalities] = useState(null); // State for controlling shake animation
  const [currentTeams, setCurrentTeams] = useState(null); // State for controlling shake animation
  const [columnIndices, setColumnIndices] = useState([]); // State for holding column indices
  const [guessedPlayers, setGuessedPlayers] = useState([]); // State to hold guessed players

  const [attempt,setAttempt]=useState(0)
  var guessed = [];

  useEffect(() => {
    setTeams(teamsJson.data);
    setNationalities(nationalitiesJson.data);
    startGame();
  }, [currentLevel]);

  useEffect(() => {
       const timer = counter > 0 && setInterval(() => setCounter(counter - 1), 1000);
      if (counter === 0) {
        clearInterval(timer);
        if (playerCountHor === 3 && playerCountVer === 3) {
          setCurrentLevel(currentLevel + 1);
          setCounter(120);
          setPlayerCountVer(1);
          setPlayerCountHor(1);
          setCount(0);
        } else {
          setGameStarted(false);
          setPlayerCountVer(1);
          setPlayerCountHor(1);
           setCurrentLevel(1);
        }
      }
      return () => clearInterval(timer);
   

  }, [counter, currentLevel, playerCountHor, playerCountVer]);

  const startGame = () => {
    const createdGridAndPlayers = createGridAndPlayers(jsonData);
    setGridAndPlayers(createdGridAndPlayers);
   setCounter(120); 
    
  };

    const createGridAndPlayers = (jsonData) => {
      const data = jsonData.data;
    
      let grid = [];
      let players = [];
      let found = false;
    
      while (!found) {
        // Extract all unique nationalities
        const nationalities = data.map(entry => Object.keys(entry)[0]);
    
        // Shuffle the nationalities and select the first 3
        const shuffledNationalities = getRandomSubset(nationalities, 3);
    
        // Extract three unique teams for each selected nationality
        const teamsForSelectedNationalities = shuffledNationalities.map(nat => {
          const playersForNationality = data.find(entry => Object.keys(entry)[0] === nat)[nat].flatMap(player => player.teams.map(team => team.t_name));
          const uniqueTeams = [...new Set(playersForNationality)];
          return getRandomSubset(uniqueTeams, 3); // Limit to 3 unique teams
        }).flat();
    
        // Shuffle the selected teams and select the first 3
        const shuffledTeams = getRandomSubset(teamsForSelectedNationalities, 3);
    
        grid = [];
        players = [];
    
        for (let i = 0; i < 4; i++) {
          const row = [];
          for (let j = 0; j < 4; j++) {
            if (i === 0 && j === 0) {
              row.push("Nationalities");
            } else if (i === 0) {
              row.push(shuffledNationalities[j - 1]);
            } else if (j === 0) {
              row.push(shuffledTeams[i - 1]);
            } else {
              const team = shuffledTeams[i - 1];
              const nationality = shuffledNationalities[j - 1];
              const playersForTeamAndNationality = data.find(entry => Object.keys(entry)[0] === nationality)[nationality].flatMap(player =>
                player.teams.filter(t => t.t_name === team).map(t => player.p_name)
              );
              if (playersForTeamAndNationality.length > 0) {
                // Randomly select a player from the filtered players for the given team and nationality
                const randomPlayer = playersForTeamAndNationality[Math.floor(Math.random() * playersForTeamAndNationality.length)];
                players.push(randomPlayer);
                row.push(randomPlayer);
              } else {
                row.push(""); // Push an empty string if no player exists for the combination
              }
            }
          }
          grid.push(row);
        }
    
        // Set the column indices
        setColumnIndices(grid[0].slice(1));
    
        // Set current nationalities and teams
        setCurrentNationalities(shuffledNationalities);
        setCurrentTeams(shuffledTeams);
         // Check if there are exactly 9 players found
        if (players.length === 9) {
          found = true;
        }
      }
    
      return { grid, players };
    };
  

    const getRandomSubset = (arr, size) => {
      const shuffled = arr.sort(() => 0.5 - Math.random());
      const uniqueSubset = Array.from(new Set(shuffled)).slice(0, size);
      return uniqueSubset;
    };
    
    function isPlayerExists( ) {
      const currentNationality = currentNationalities[playerCountVer - 1]; // Get the current nationality
      const currentTeam = currentTeams[playerCountHor - 1];
      
      for (const countryData of jsonData.data) {
        if (countryData[currentNationality]) {
          for (const playerData of countryData[currentNationality]) {
            if (playerData.teams.some(team => team.t_name === currentTeam) && playerData.p_name.toLowerCase() === answer.toLowerCase()) {
              return true;
          }
          
          }
        }
      }
      return false;
    }
    function isNameMatches(cell){
       const playerName = cell.toLowerCase(); // Convert player name to lowercase for case-insensitive matching
        const answerLowerCase = answer.toLowerCase(); // Convert answer to lowercase for case-insensitive matching
         const minLength = Math.min(playerName.length, answerLowerCase.length); 
         // Get the minimum length of player name and answer 
         let matchingCount = 0; 
         // Check for matches from the start of the player's name 
         for (let i = 0; i < minLength; i++)
          { if (playerName[i] === answerLowerCase[i]) { matchingCount++; } 
          else { break; 
            // Exit loop if a character doesn't match 
          } } 
          // Check for matches from the end of the player's name
           for (let i = 1; i <= minLength; i++) 
           { if (playerName[playerName.length - i] === answerLowerCase[answerLowerCase.length - i]) { matchingCount++; } 
           else { break; // Exit loop if a character doesn't match 
          } } 
           const matchingPercentage = (matchingCount / playerName.length) * 100; return matchingPercentage >= 40
            && answer !== '' ? true : false; 
          }    
    
    

  const handleButtonClick = () => {
 

    const { grid, players } = gridAndPlayers;
    const currentNationality = currentNationalities[playerCountVer - 1]; // Get the current nationality
    const currentTeam = currentTeams[playerCountHor - 1]; // Get the current team
    console.log(grid[playerCountHor][playerCountVer])
    // Check if the answer matches the player in the current cell
    
      
      // Check if the player has played in the current team for the current nationality
      if (isPlayerExists()) {
        setGuessedPlayers(prevGuessedPlayers => [...prevGuessedPlayers, answer.toLowerCase()]);
        setScore(prevScore => prevScore + currentLevel); // Update score using previous state
        
        // Update player count and current level if needed
        if (playerCountHor === 3 && playerCountVer === 3) {
          if (count === 8) {
            setCurrentLevel(currentLevel + 1);
            setGuessedPlayers([]);
            setCounter(60);
            setPlayerCountVer(1);
            setPlayerCountHor(1);
            setCount(0);
          } else {
            setCount(count + 1);
          }
        } else if (playerCountVer === 3) {
          setPlayerCountVer(1);
          setPlayerCountHor(playerCountHor + 1);
          setCount(count + 1);
        } else {
          setPlayerCountVer(playerCountVer + 1);
          setCount(count + 1);
        }
        
        setError(""); // Clear any previous error message
        setAnswer(""); // Clear the answer field
        return;
      }
    
    
    // Player not found in dataset or doesn't match current nationality and team
    setAnswer(""); // Clear the answer field
    setError("Player not found in the current nationality and team, please try again!"); // Display error message
    setShake(true); // Trigger shake animation
    setTimeout(() => setShake(false), 500); // Reset shake animation after 500ms
  };
  
  return (
    <main className="p-2">
      <div className="background-container">
        <img src={bg} alt="Background" className="blur-bg" />
      </div>

      <div className="flex justify-between gap-6 w-full">
        <a href="/">
          <h1 className="text-lg sm:text-2xl font-bold md:text-left font-palanquin text-primary">
            PlayerGuess
          </h1>
        </a>
        <h1 className="text-lg sm:text-2xl font-bold text-center font-palanquin text-primary flex-grow">
          Level: {currentLevel}
        </h1>
        <h1 className="text-lg sm:text-2xl font-bold md:text-right font-palanquin text-primary">
          Score: {score}
        </h1>
      </div>

      {gameStarted ? (
       <main>
       <h1 className="text-lg sm:text-2xl font-bold  text-right font-palanquin text-white">
         Current score: {score}
       </h1>
       <div className="h-screen flex flex-col items-center justify-center space-y-4">
         {gridAndPlayers.grid.map((row, rowIndex) => (
           <div key={rowIndex} className="flex">
             {row.map((cell, colIndex) => (
      <Box
      sx={{
        width: { xs: "80px", sm: "128px", md: "96px", xl: "128px" },
        height: { xs: "80px", sm: "128px", md: "96px", xl: "128px" },
        fontSize: { xs: "12px" },
      }}
      key={`${rowIndex}-${colIndex}`}
      style={{
        fontSize: rowIndex === 0 && colIndex === 0 ? "2rem" : "",
        color: "#fff",
        backgroundColor: rowIndex === playerCountHor && colIndex === playerCountVer
          ? "#DE3163" : "rgba(255, 255, 255, 0.2)",
        backdropFilter: rowIndex === playerCountHor && colIndex === playerCountVer ? "" : "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.2)"
      }}
      className={`glass-effect flex items-center justify-center text-center font-bold border border-gray-300 rounded-md mx-1 ${
        rowIndex === playerCountHor && colIndex === playerCountVer
          ? "bg-primary text-white"
          : "bg-gray-200"
      } ${shake ? "shake-animation" : ""}`}
    >
      {rowIndex === 0 && colIndex === 0 ? (
        counter
      ) : rowIndex === 0 ? (
        <Avatar sx={{ borderRadius: "32px", width: "100%", height: "80%", p: 2, objectFit: "cover" }} src={nationalities.find(entry => entry.name === cell).img} alt={cell} />
      ) : colIndex === 0 ? (
<Avatar sx={{ borderRadius: 0, width: "100%", height: "100%", objectFit: "cover" }} src={teams.find(entry => entry.name === cell)?.imglink || {errorImg}} alt={cell} />
      ) : (
        count>=guessedPlayers.length&&guessedPlayers.includes(cell.toLowerCase()) ||
         (isNameMatches(cell.toLowerCase()) && !guessedPlayers.some((player, index) => player.toLowerCase() === answer.toLowerCase() && 
         (rowIndex < playerCountHor || (rowIndex === playerCountHor && colIndex <= playerCountVer) && index < count)))
          ? (cell.length>0?cell:"Right!") :""
      )}
    </Box>
    
     

       
             ))}
           </div>
         ))}
         <div className="flex items-center space-x-4">
           <TextField
             value={answer}
             onChange={(e) => setAnswer(e.target.value)}
             label="Enter a player..."
             variant="outlined"
             focused
             
             InputProps={{
               style: {
                 width: "100%",
                 color: "white", // Change text color here
                 outlineColor: "white", // Change outline color here
                 borderColor: "white", // Change outline color here
               },
             }}
           />
           <Button onClick={()=>{
            handleButtonClick()
           }} variant="contained" color="primary">
             Guess
           </Button>
         </div>
         {error && <div className="text-primary text-center">{error}</div>}
       </div>
     </main>
     
      ) : (
        <main>
          <div className="background-container">
            <img src={bg} alt="Background" className="blur-bg" />
          </div>

          <div className="h-screen flex flex-col items-center justify-center space-y-16">
            <Avatar
              src={icon}
              sx={{ width: { xs: "164px", sm: "360px", md: "300px" }, height: { xs: "164px", sm: "360px", md: "300px" }, borderRadius: 6 }}
              className="text-2xl font-bold text-left font-palanquin text-primary  "
            />
            <Button
              onClick={() => {
                setGameStarted(true);
                startGame();
              }}
              variant="contained"
              color="secondary"
              sx={{ width: { xs: "50%", md: "30%" }, fontSize: { xs: "14px", sm: "16px" } }}
            >
              Play Game
            </Button>
          </div>
        </main>
      )}
    </main>
  );
}

export default App;
