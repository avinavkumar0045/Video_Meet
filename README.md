# Mann Ki Baat

A full-stack video meeting application built with React, Express, MongoDB, Socket.IO, and WebRTC. Mann Ki Baat lets users register, sign in, create or join meeting rooms, communicate through live audio/video, share screens, exchange chat messages, and review previous meeting activity.

> Built as a real-time collaboration platform with a separate Vite frontend and Node.js backend.

## Preview

Add your project screenshots inside a `docs/images/` folder and replace the placeholder paths below.

### Landing Page

![Landing page screenshot](docs/images/landing-page.png)

### Authentication

![Authentication screenshot](docs/images/authentication.png)

### Home Dashboard

![Home dashboard screenshot](docs/images/home-dashboard.png)

### Video Meeting Room

![Video meeting screenshot](docs/images/video-meeting.png)

### Meeting History

![Meeting history screenshot](docs/images/meeting-history.png)

## Features

- User registration and login with hashed passwords.
- Token-based session storage on the client.
- Protected home route for authenticated users.
- Join meetings using custom meeting codes.
- WebRTC-powered peer-to-peer audio and video calls.
- Socket.IO signaling for real-time meeting coordination.
- In-meeting chat with message broadcasting.
- Camera and microphone toggle controls.
- Screen sharing support where the browser allows it.
- Meeting activity history stored in MongoDB.
- Responsive React interface built with Material UI components.

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, Vite, React Router, Material UI, Axios, Socket.IO Client |
| Backend | Node.js, Express 5, Socket.IO, Mongoose |
| Database | MongoDB |
| Realtime | WebRTC, Socket.IO |
| Auth | bcrypt password hashing, generated session tokens |

## Project Structure

```text
Meeting/
├── FRONTEND/
│   ├── public/
│   ├── src/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── BACKEND/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── app.js
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm
- MongoDB Atlas account or a local MongoDB instance
- Modern browser with camera, microphone, and WebRTC support

### Installation

Clone the repository and install dependencies for both applications.

```bash
git clone <your-repository-url>
cd Meeting

cd BACKEND
npm install

cd ../FRONTEND
npm install
```

### Environment Variables

For production-quality setup, keep secrets outside source code.

Create `BACKEND/.env`:

```env
PORT=8000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>
CLIENT_URL=http://localhost:5173
```

Create `FRONTEND/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1/users
VITE_SOCKET_URL=http://localhost:8000
```

> Note: the current source uses local hardcoded URLs. If you move to environment variables, update the Axios client in `FRONTEND/src/contexts/AuthContext.jsx`, the Socket.IO URL in `FRONTEND/src/pages/videoMeet.jsx`, and the MongoDB connection in `BACKEND/src/app.js`.

## Running Locally

Start the backend server:

```bash
cd BACKEND
npm run dev
```

The backend runs on:

```text
http://localhost:8000
```

Start the frontend development server:

```bash
cd FRONTEND
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

Open the frontend URL in your browser, register a user, log in, and join a meeting code.

## Available Scripts

### Frontend

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

### Backend

| Command | Description |
| --- | --- |
| `npm run dev` | Start the backend with Nodemon |
| `npm start` | Start the backend with Node |
| `npm run prod` | Start the backend with PM2 |

## Application Routes

| Route | Description |
| --- | --- |
| `/` | Landing page |
| `/auth` | Login and registration page |
| `/home` | Authenticated dashboard for joining meetings |
| `/history` | User meeting history |
| `/:url` | Dynamic video meeting room |

## API Endpoints

Base URL:

```text
http://localhost:8000/api/v1/users
```

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/register` | Register a new user |
| `POST` | `/login` | Authenticate user and return a session token |
| `POST` | `/add_to_activity` | Save a meeting code to user history |
| `GET` | `/get_all_activity` | Fetch meeting history for a user |

## Realtime Events

The backend uses Socket.IO to coordinate WebRTC connections and meeting chat.

| Event | Direction | Purpose |
| --- | --- | --- |
| `join-call` | Client to server | Join a meeting room |
| `user-joined` | Server to client | Notify participants when a user joins |
| `user-left` | Server to client | Notify participants when a user leaves |
| `signal` | Both | Exchange WebRTC SDP and ICE candidate data |
| `chat-message` | Both | Send and receive meeting chat messages |

## Security Notes

- Move MongoDB credentials into environment variables before deploying.
- Restrict Socket.IO CORS origins in production.
- Replace plain stored session tokens with expiring JWTs or server-managed sessions for stronger authentication.
- Validate request bodies before writing data to MongoDB.
- Never commit `.env`, credentials, or generated secrets.

## Deployment Notes

- Deploy the backend to a Node.js hosting platform such as Render, Railway, Fly.io, or a VPS.
- Deploy the frontend to Vercel, Netlify, or any static hosting provider.
- Configure frontend environment variables to point to the deployed backend.
- Configure backend CORS to allow only the deployed frontend URL.
- Use HTTPS in production because camera, microphone, and screen sharing APIs require secure origins outside localhost.

## Roadmap

- Environment-based configuration.
- Stronger auth with JWT expiration and refresh flow.
- Meeting room waiting screen and participant names.
- Better responsive layout for mobile meetings.
- Persistent chat history per meeting.
- Unit and integration tests.
- Deployment-ready Docker setup.

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes with clear messages.
4. Open a pull request with a short description and screenshots when UI changes are included.

## License

This project is licensed under the ISC License.

## Author

Developed by Avinav Kumar.
