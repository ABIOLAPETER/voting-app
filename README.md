Voting App Backend (Node.js & Express)

A backend REST API for a Voting Application, built with Node.js, Express.js, and MongoDB.
This project handles the core logic for managing elections, candidates, and voters.
No frontend has been implemented yet — this repository focuses entirely on backend functionality.

FEATURES
JWT-based authentication and authorization
Election creation and management
Candidate registration and management
Voter registration and voting logic
Secure password hashing with bcrypt
Image upload support via Cloudinary
MongoDB data persistence using Mongoose
Request logging with Morgan
Environment-based configuration


TECH STACK
| Technology | Purpose                 |
| ---------- | ----------------------- |
| Node.js    | Runtime environment     |
| Express.js | Web framework           |
| MongoDB    | Database                |
| Mongoose   | ODM                     |
| JWT        | Authentication          |
| bcryptjs   | Password hashing        |
| Cloudinary | Image storage           |
| dotenv     | Environment variables   |
| Morgan     | HTTP request logging    |
| Nodemon    | Development auto-reload |

PROJECT STRUCTURE
voting-app/
│
├── controllers/        # Request handling logic
├── models/             # Mongoose models
│   ├── Election.js
│   ├── Voter.js
│   └── Candidate.js
│
├── routes/             # API routes
├── middleware/         # Auth & custom middleware
├── utils/              # Helper functions
│
├── index.js            # App entry point
├── package.json
├── .env.example
└── README.md



