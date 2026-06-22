# ✈️ Airline Booking Application

A modern React-based airline booking application built with Vite, featuring comprehensive testing, CI/CD pipeline, and deployment configuration.

## Features

- **Modern UI**: Clean and responsive design with Tailwind CSS styling
- **Flight Booking**: Search and book flights with flexible trip options
- **Form Validation**: Comprehensive input validation with error handling
- **Testing**: Complete test coverage with Vitest and React Testing Library
- **CI/CD Pipeline**: Automated testing, linting, and deployment workflows
- **Performance**: Optimized build process with Vite

## Project Structure

```
airline-booking-app/
├── src/
│   ├── components/
│   │   ├── BookingForm.jsx
│   │   └── BookingForm.test.jsx
│   ├── styles/
│   │   └── BookingForm.css
│   ├── tests/
│   │   └── setup.js
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── public/
│   └── index.html
├── .github/
│   └── workflows/
│       ├── ci-cd.yml
│       └── deploy.yml
├── package.json
├── vite.config.js
├── .eslintrc.json
├── .env.example
└── README.md
```

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd airline-booking-app
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Testing

Run tests:
```bash
npm test
```

Run tests with UI:
```bash
npm run test:ui
```

Generate coverage report:
```bash
npm run test:coverage
```

## Linting

Check code quality:
```bash
npm run lint
```

Fix linting issues:
```bash
npm run lint:fix
```

## Building

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## CI/CD Pipeline

The application uses GitHub Actions for:
- **Testing**: Runs tests on Node 18.x and 20.x
- **Linting**: Checks code quality with ESLint
- **Coverage**: Generates and uploads coverage reports
- **Building**: Creates optimized production build
- **Deployment**: Automated deployment to production

### Workflow Files

- `.github/workflows/ci-cd.yml`: Main CI/CD pipeline (test, lint, build)
- `.github/workflows/deploy.yml`: Deployment workflow (triggered after successful CI/CD)

### Environment Variables for Deployment

Add the following secrets to your GitHub repository:
- `VERCEL_TOKEN`: Token for Vercel deployment

## Technologies

- **React**: UI library
- **Vite**: Modern build tool and dev server
- **Vitest**: Unit testing framework
- **React Testing Library**: Component testing utilities
- **ESLint**: Code linting
- **GitHub Actions**: CI/CD automation

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit your changes: `git commit -am 'Add new feature'`
3. Push to the branch: `git push origin feature/your-feature`
4. Submit a pull request

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues and questions, please create an issue in the repository.
