# WebWatcher

A simple website monitoring tool that checks if your websites are up and running.

## Features

- Monitor multiple websites
- Automatic checks every 5 minutes
- Simple web interface
- Response time tracking
- SQLite database for data storage

## Installation

```bash
npm install
```

## Usage

```bash
npm start
```

Then open http://localhost:3000 in your browser.

## API Endpoints

- `GET /api/websites` - Get all monitored websites
- `POST /api/websites` - Add a new website to monitor
- `POST /api/check/:id` - Manually check a specific website

## Technologies

- Node.js
- Express
- SQLite3
- Vanilla JavaScript frontend