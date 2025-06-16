# Song Spinner for The 8-Bit Drummer

I was watching The 8-Bit Drummer's stream on June 14th, 2024, when he mentioned wanting a random way to pick the next song from his request list. This is my take on that project!

## Live Demo

> [!CAUTION]
> This live demo **DOES NOT** pull live song data from `the8bitdrummer.com`.

A live demo of the spinner is hosted on GitHub Pages for you to try out instantly: [Try 8Bit Song Spinner here](https://pidogs.github.io/8BitSpinner/)


**Why?**
- For security reasons, web browsers prevent scripts on one website (like GitHub Pages) from fetching data directly from another website. This is known as the Cross-Origin Resource Sharing (CORS) policy.
- The Python server (`8bitSpinnerServer.py`) is included in this project specifically to get around this issue.
- Since GitHub Pages can only host static files and cannot run a Python server, it cannot fetch the live data.

## Features
* **Live Data**: Connects directly to `the8bitdrummer.com`'s public song list.
* **Simple Local Server**: Comes with a Python server that handles serving the files and bypassing browser cross-origin (CORS) security restrictions when fetching the song list.

## How to Get it Running

You'll need Python 3 installed on your computer to run the local server.

1.  **Download the Files**
  - Place `index.html`, `style.css`, `script.js`, and `8bitSpinnerServer.py` into a new folder on your computer.

2.  **Start the Server**
  - Open a terminal or command prompt in that folder.
  - Run the following command:
  ```bash
  python 8bitSpinnerServer.py
  ```
  - You should see a message that says `Starting server on port 8000`. Keep this terminal window open!

3.  **Open in Browser**
  - Open your web browser and go to the following address: http://localhost:8000

That's it! The spinner should load, fetch the current unplayed songs from The 8-Bit Drummer's queue, and be ready to spin.

## OBS

Here's how to set up the spinner in OBS Studio:

1.  **Configure the Browser Capture**
  - In OBS Studio, in the "Sources" dock, click the "+" button.
  - Select "Window Capture".
  - Create a new source or add an existing one.
  - In the properties for the "Window Capture" source:
  - Set "Window" to the browser window displaying `http://localhost:8000`.  Make sure the local server is running and the page is open in your browser.

2.  **Identify Key Color**
  - The background color of the spinner is displayed as a hex value in the top left corner, click to copy.
  - In OBS, right click on the Browser Source and select "Properties".
  - Copy the hex value displayed in the top left corner of the spinner.

3.  **Apply Color Key Filter**
  - Right-click on the Browser Source in the "Sources" dock.
  - Select "Filters".
  - Click the "+" button in the "Effects Filters" section.
  - Choose "Color Key".
  - In the Color Key properties:
  - Set the "Key Color Type" to "Custom Color".
  - Click the "Select Color" box and enter the hex color code you identified earlier.
  - Adjust the setting to the following:
    - Similarity: 1
    - Smoothness: 1
    - Spill Reduction: 1
    - Opacity: 1.00
    - Contrast: 0.00

4. **Crop Source**
  - Right-click on the Browser Source in the "Sources" dock.
  - Select "Properties".
  - Adjust "Crop" until external elements are no longer visable.

## File Overview

* `8bitSpinnerServer.py`: A simple Python web server. Its main job is to serve the local files and act as a proxy for the song list API, which is necessary to avoid browser security errors.
* `index.html`: The basic structure of the webpage.
* `style.css`: Contains all the styles that create the retro, pixelated look and feel. You can edit the color variables at the top of this file to change the theme!
* `script.js`: This is the brain of the project. It fetches the song list, builds the spinner, handles the animation logic, and manages the button clicks.

## Disclaimer

I am not responsible for your use of this code and not responsible for consequences of misuse of `the8bitdrummer.com`.