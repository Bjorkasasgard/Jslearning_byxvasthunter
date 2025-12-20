# AI Security Incident Assistant

A web application for reporting and analyzing cybersecurity incidents using AI-powered analysis + cybernews by adam bastian

## Features

-  User authentication (register/login)
-  Incident reporting with AI analysis
-  OpenAI-powered incident classification and recommendations (API Integration)
-  Cybersecurity news feed (NewsAPI Integration)
-  Admin dashboard for system monitoring
-  Statistics and reporting

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite with Prisma ORM
- **AI**: OpenAI GPT-4o-mini
- **News**: NewsAPI
- **Frontend**: EJS templates with Tailwind CSS
- **Authentication**: Express sessions

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd implementation_api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your API keys:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   NEWS_API_KEY=your_newsapi_key_here  # Optional
   ```

4. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Create Admin User**
   ```bash
   node createAdmin.js
   ```

### Running the Application

```bash
npm start
```

The application will be available at `http://localhost:3001`

### API Keys Setup

#### OpenAI API Key (Required)
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add it to your `.env` file

#### NewsAPI Key (Optional)
1. Go to [NewsAPI](https://newsapi.org/register)
2. Sign up and get your API key
3. Add it to your `.env` file

## Usage

### User Features
- Register/Login
- Report security incidents
- View AI analysis results
- Browse cybersecurity news

### Admin Features
- View all incident reports
- System-wide statistics
- User management

## Project Structure

```
├── bin/
│   └── www                 # Server startup
├── controllers/            # Route handlers
├── lib/                    # Utility libraries
│   ├── openai.js          # OpenAI integration
│   ├── news.js            # NewsAPI integration
│   └── prisma.js          # Database client
├── middlewares/           # Express middlewares
├── prisma/                # Database schema
├── public/                # Static assets
├── routes/                # Route definitions
├── views/                 # EJS templates
├── .env.example          # Environment template
├── app.js                # Express app setup
├── createAdmin.js        # Admin user creation
└── package.json          # Dependencies
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes.

## Security Note

Never commit API keys or sensitive information to version control. Always use `.env` files and add them to `.gitignore`.