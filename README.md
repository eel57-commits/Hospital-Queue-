# Hospital Patient Waiting System (Queue DSA)

A full-stack web application built to demonstrate the **Queue (First-In, First-Out)** Data Structure and Algorithms concept.

Unlike standard web applications, the core DSA logic for this project is written entirely in **C** using a Linked List. A Node.js server acts as a bridge, spawning the C program as a background process and communicating with it via Standard Input/Output to serve a modern web frontend.

## Architecture

* **Backend (Core DSA):** C (`backend.c`) - Implements the Queue using pointers and memory allocation.
* **API Bridge:** Node.js / Express (`api/index.js`) - Translates HTTP web requests into standard CLI commands for the C program.
* **Frontend:** HTML, Vanilla JavaScript, Tailwind CSS (`index.html`, `script.js`) - Provides a responsive Hospital Doctor's Desk interface.

## How it Works

The project demonstrates the core principles of a Queue:
1. **Enqueue:** When a patient is registered, they are added to the *rear* (tail) of the queue.
2. **Dequeue:** When the doctor calls the next patient, the patient at the *front* (head) of the queue is removed and returned.
3. **FIFO:** First-In, First-Out. The patient who has been waiting the longest is always seen first.

## Running the Project Locally

### Prerequisites
* [Node.js](https://nodejs.org/) installed.
* A C compiler (like GCC or MinGW) installed and added to your system PATH.

### 1. Compile the C Backend
Open your terminal in the project directory and compile `backend.c`:
```bash
gcc backend.c -o backend.exe
```

### 2. Install Node Dependencies
```bash
npm install
```

### 3. Start the Server
Run the Express server, which will automatically spawn the compiled C executable:
```bash
node api/index.js
```

### 4. Open the App
Visit [http://localhost:4000](http://localhost:4000) in your web browser.

## File Structure
* `backend.c` - The pure C implementation of the Queue.
* `backend.exe` - The compiled C executable (ignored in git).
* `api/index.js` - The Node.js Express server bridge.
* `index.html` - The frontend UI.
* `script.js` - The frontend logic connecting the UI to the API.
