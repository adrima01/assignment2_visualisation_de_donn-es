import './App.css';
import { useEffect} from 'react';

// here import other dependencies

// a component is a piece of code which render a part of the user interface
function App() {
  // every time the component re-render
  useEffect(()=>{
      console.log("App useEffect (called each time App re-renders)");
  }); // if no second parameter, useEffect is called at each re-render

  return (
    <div className="App">
        <div id={"MultiviewContainer"} className={"row"}>
          
        </div>
    </div>
  );
}

export default App;
