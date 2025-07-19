# Screenshot Page

**Demo URL: https://screenshot.nivekithan.com/**

Screenshot any website using this free tool. It uses Cloudflare browser engine to generate high-quality screenshots of web pages.

## Features

- Take screenshots of any publicly accessible website
- Multiple device types support (mobile, tablet, desktop)
- Full page screenshot option
- Built with Remix and deployed on Cloudflare Pages
- Fast and reliable using Cloudflare Workers

## Tech Stack

- **Frontend**: Remix (React framework)
- **Styling**: Tailwind CSS with Radix UI components
- **Platform**: Cloudflare Pages + Workers
- **API**: Cloudflare Workers with Browser API
- **Storage**: Cloudflare R2 for screenshot storage

## Deployment

This project is configured for deployment on Cloudflare Pages with the following setup:

### Prerequisites

- Node.js 20.4.0 or higher
- pnpm package manager
- Cloudflare account with Pages and Workers enabled

### Local Development

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd screenshot-page
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm run dev
   ```

4. Open http://localhost:3000 in your browser

### Build

To build the project for production:

```bash
pnpm run build
```

### Deployment to Cloudflare Pages

The project is configured to deploy automatically to Cloudflare Pages:

1. **Build Settings**:
   - Build command: `pnpm run build`
   - Build output directory: `public`
   - Node.js version: 20.4.0+

2. **Environment Variables**:
   - `SCREENSHOT_API_URL`: URL of the screenshot API worker

3. **Files Configuration**:
   - Routes are configured in `public/_routes.json`
   - Headers are set in `public/_headers`

### Screenshot API Worker

The screenshot functionality is powered by a separate Cloudflare Worker located in the `screenshot_api_sdk/` directory:

- **Worker Name**: `screenshot_api_sdk`
- **Configuration**: `screenshot_api_sdk/wrangler.toml`
- **Browser API**: Uses Cloudflare's browser rendering
- **Storage**: Cloudflare R2 bucket for screenshot storage

To deploy the worker:

```bash
cd screenshot_api_sdk
wrangler deploy
```

## Scripts

- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run start` - Start production server locally
- `pnpm run typecheck` - Run TypeScript type checking

## Project Structure

```
├── app/                    # Remix application
│   ├── components/         # React components
│   ├── routes/            # Remix routes
│   └── lib/               # Utility functions
├── screenshot_api_sdk/    # Cloudflare Worker for screenshots
├── public/                # Static assets and configuration
└── functions/             # Cloudflare Pages Functions
```

## License

MIT License - see the [LICENSE](LICENSE) file for details.