# Real-Time Chat Application Client - Starter Project

This is the client-side application for a real-time chat system built with Next.js and Socket.IO.

## Features

- Real-time messaging
- User-friendly interface
- Responsive design
- Easy integration with the chat server

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)

## Installation

To install the chat client, follow these steps:

1. Clone the repository:
```
git clone <repository-url>
cd chat-client-starter
```

2. Install the dependencies:
```
npm install
```

3. Create a `.env.local` file in the root directory and add the following:
```
NEXT_PUBLIC_SOCKET_SERVER_URL=http://localhost:3001
```
Replace the URL with your actual server URL in production.

## Running the Application

To run the chat client locally, use the following command:

```
npm run dev
```

The application will be available at `http://localhost:3000`.

## Building for Production

To create a production build, run:

```
npm run build
```

To start the production server, run:

```
npm start
```

## Deployment

This application is designed to be deployed on Vercel. To deploy:

1. Push your code to a GitHub repository.
2. Connect your repository to Vercel.
3. Set the `NEXT_PUBLIC_SOCKET_SERVER_URL` environment variable in your Vercel project settings.
4. Deploy your project.

## Contact

Feel free to reach out for collaborations or inquiries:
* Email: [jrorio.dev@zohomail.com](mailto:jrorio.dev@zohomail.com)
* LinkedIn: [Jerome Orio](https://www.linkedin.com/in/jerome-orio-dev)