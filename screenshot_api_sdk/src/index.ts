import puppeteer from "@cloudflare/puppeteer";
import { Buffer } from "node:buffer";

/*
 * Without this line, code throws error
 * {
 *   "name": "ReferenceError",
 *   "message": "Buffer is not defined",
 *   "stack": "ReferenceError: Buffer is not defined\n    at Page._Page_screenshotTask2 (index.js:7510:64)"
 *  }
 */

globalThis.Buffer = Buffer;

/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler deploy src/index.ts --name my-worker` to deploy your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
  BROWSER: Fetcher;
  BUCKET: R2Bucket;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const requestUrl = new URL(request.url);

    if (requestUrl.pathname === "/devices") {
      return getDeviceHandler();
    }

    const searchParams = requestUrl.searchParams;

    const screenshotPageUrl = searchParams.get("url");
    const key = searchParams.get("key");
    const deviceType = searchParams.get("deviceType");
    const isFullPage = searchParams.get("fullPage") === "true";

    if (!screenshotPageUrl) {
      return Response.json(
        { ok: false, error: "Url is required" },
        { status: 400 }
      );
    }

    if (!key) {
      return Response.json(
        { ok: false, error: "key is required" },
        { status: 400 }
      );
    }

    if (!deviceType || !devices.find((device) => device.id === deviceType)) {
      return Response.json(
        { ok: false, error: "Invalid device type" },
        { status: 400 }
      );
    }

    const device = devices.find((device) => device.id === deviceType)!;

    const width = device.width;
    const height = device.height;
    const scale = device.scale;

    const objectName = `${screenshotPageUrl}:${width}:${key}:${height}:${scale}:${isFullPage}`;

    const objectDigest = Buffer.from(
      await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(objectName)
      )
    ).toString("hex");

    let r2Object = await env.BUCKET.get(objectDigest);

    if (!r2Object) {
      const browser = await puppeteer.launch(env.BROWSER);
      const page = await browser.newPage();

      await page.setViewport({ width, height, deviceScaleFactor: scale });

      await page.goto(screenshotPageUrl);

      console.log(typeof isFullPage);
      console.log({ isFullPage });
      const img = await page.screenshot({
        fullPage: isFullPage,
        captureBeyondViewport: false,
      });

      await browser.close();

      await env.BUCKET.put(objectDigest, img);

      const r2Object2 = await env.BUCKET.get(objectDigest);

      if (!r2Object2) {
        return new Response("Internal Server Error", { status: 500 });
      }

      r2Object = r2Object2;
    }

    return new Response(r2Object.body, {
      headers: {
        "content-type": "image/png",
        "cache-control": `public, max-age=${60 * 60 * 24 * 360}`,
      },
    });
  },
};

type Device = {
  name: string;
  id: string;
  height: number;
  width: number;
  scale: number;
};

const devices: Array<Device> = [
  {
    name: "Blackberry Playbook",
    id: "blackberry_playbook",
    width: 600,
    height: 1024,
    scale: 1,
  },
  {
    name: "Blackberry PlayBook landscape",
    id: "blackberry_playbook_landscape",
    width: 1024,
    height: 600,
    scale: 1,
  },
  {
    name: "iPad Pro",
    id: "ipad_pro",
    width: 1024,
    height: 1366,
    scale: 2,
  },
  {
    name: "iPad Pro landscape",
    id: "ipad_pro_landscape",
    width: 1366,
    height: 1024,
    scale: 2,
  },
  {
    name: "iPhone 6",
    id: "iphone_6",
    width: 375,
    height: 667,
    scale: 2,
  },
  {
    name: "iPhone 6 landscape",
    id: "iphone_6_landscape",
    width: 667,
    height: 375,
    scale: 2,
  },
  {
    name: "iPhone 13 Pro Max",
    id: "iPhone 13 Pro Max",
    width: 428,
    height: 926,
    scale: 3,
  },
  {
    name: "Pixel 5",
    id: "pixel_5",
    width: 393,
    height: 851,
    scale: 3,
  },
  {
    name: "Desktop",
    id: "desktop",
    width: 1920,
    height: 1080,
    scale: 1,
  },
];

async function getDeviceHandler() {
  return Response.json(devices);
}
