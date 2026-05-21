1. Created a folder called src/ . 
    - This follows a modern React structure
    - Helps manage all the different files (that were once html files) better, as you break them down into react components.
    - The following files were created:
    a. index.html (root folder ,outside src/, which is the main entry point for the browser)
    b. main.jsx (grabs React, my global styles, injects entire application into the empty #root div indie index.html)
    c. App.jsx (file (main coordinator) where you import all individual sections & arrange them in preferred order that it should appear on the screen)
    d. Navbar.jsx (modular, isolated component file handling only the navbar layout & logic)
    e. Hero.jsx (modular component file handling hero section)
    

2. Moved HTML into React component
    - JSX: a component is just a JavaScript function that returns HTML layout code
    - In each file I have to
        a. import React (so that the file understands the component structure)
        b. create a standard js function  & export it
        c. Ensure the function returns my layout code using a "return" block & Insert my html code with some tweaks:
            1. change class to className (because the word class is already a strictly reserved keyword in JavaScript (used for creating object-oriented classes))
        
*Environment Migration*
- When you run a modern web framework like React, my browser cannot read .jsx files directly. 
- It needs a local background engine to continuously translate my code into standard HTML and JavaScript.

1. Ensured my system is equipped with Node.js (a runtime engine) to run JS programs
    - Used the command node -v to check 
2. Bypassed Windows built-in security feature designed to stop malicious background scripts from running automatically on my computer
    - Used the command Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
    - This ensures that permission is restricted exclusively to the single, active terminal window 
3. Initialized the project directory using NPM (Node Package Manager)
    - This generated the file pacakage.json in the root folder
    - package.json keeps track of the project's name, version, shortcuts, and every single third-party library or package my application needs to function.
4. Installed the dependencies using "npm install vite react react-dom"
    - brought about node_modules/ folder (this is where npm downloads and stores the actual code for Vite and React npm downloads and stores the actual code for Vite and React.)
    - brought about package-lock.json (locks down the exact version numbers of the packages installed so that if i share with another developer, their computer downloads the exact same versions.)
5. Set up a launch shortcut ("scripts")
    - Added this shortcut in package.json by adding 
    "dev": "vite" which means that Instead of typing out complex backend paths to find the Vite compiler engine every single time,i just type a clean, simple command npm run dev.
