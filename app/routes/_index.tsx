import {
  ActionArgs,
  LoaderArgs,
  V2_MetaFunction,
  json,
  redirect,
} from "@remix-run/cloudflare";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useId } from "react";
import { DeviceCombobox } from "~/components/deviceCombobox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

import { z } from "zod";
import { Checkbox } from "~/components/ui/checkbox";
import { Button } from "~/components/ui/button";
import { nanoid } from "nanoid";

export const meta: V2_MetaFunction = () => {
  return [{ title: "Screenshot Page" }];
};

const EnvSchema = z.object({ SCREENSHOT_API_URL: z.string().url() });

const DeviceSchema = z.array(z.object({ name: z.string(), id: z.string() }));

export async function loader({ context }: LoaderArgs) {
  const env = EnvSchema.parse(context.env);
  const deviceUrl = new URL("/devices", env.SCREENSHOT_API_URL);

  const res = await fetch(deviceUrl.toString());

  const devices = DeviceSchema.parse(await res.json());

  return json(devices);
}

const GenerateScreenshotFormSchema = z.object({
  url: z
    .string({
      invalid_type_error: "Invalid url",
      required_error: "Url is required",
    })
    .url(),
  deviceType: z
    .string({
      invalid_type_error: "Invalid device type ",
      required_error: "Device type is required",
    })
    .nonempty(),
  fullPage: z.literal("on").nullable().optional(),
});
export async function action({ request, context }: ActionArgs) {
  const env = EnvSchema.parse(context.env);
  const formData = await request.formData();

  const parsedRes = GenerateScreenshotFormSchema.safeParse({
    url: formData.get("url"),
    deviceType: formData.get("deviceType"),
    fullPage: formData.get("fullPage"),
  });

  if (!parsedRes.success) {
    const urlErrors: string[] = [];
    const deviceTypeErrors: string[] = [];
    const fullPageErrors: string[] = [];

    parsedRes.error.errors.map((issue) => {
      if (issue.path.includes("url")) {
        urlErrors.push(issue.message);
      }

      if (issue.path.includes("deviceType")) {
        deviceTypeErrors.push(issue.message);
      }

      if (issue.path.includes("fullPage")) {
        fullPageErrors.push(issue.message);
      }
    });

    return json(
      {
        submissionErrors: {
          url: urlErrors,
          deviceType: deviceTypeErrors,
          fullPage: fullPageErrors,
        },
        ok: false,
      } as const,
      { status: 400 }
    );
  }

  const { deviceType, url, fullPage } = parsedRes.data;
  const screenshotAPIUrl = new URL("/", env.SCREENSHOT_API_URL);

  screenshotAPIUrl.searchParams.set("url", url);
  screenshotAPIUrl.searchParams.set("deviceType", deviceType);
  screenshotAPIUrl.searchParams.set("key", nanoid());
  screenshotAPIUrl.searchParams.set("fullPage", `${fullPage === "on"}`);

  return redirect(screenshotAPIUrl.toString());
}

export default function Index() {
  const devices = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <main className="grid place-items-center py-10">
      <Card className="min-w-[500px]">
        <CardHeader>
          <CardTitle>Take Screenshot of any website</CardTitle>
          <CardDescription>
            Make sure website is publically avaliable{" "}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form className="flex flex-col gap-y-5" method="POST">
            <Field
              labelProps={{ children: "Page URL:" }}
              inputProps={{ type: "url", name: "url" }}
              errors={actionData?.submissionErrors.url}
            />
            <DeviceCombobox
              devices={devices}
              name="deviceType"
              errors={actionData?.submissionErrors.deviceType}
            />
            <div className="flex gap-x-2">
              <Checkbox id="checkbox" name="fullPage" />
              <Label>Take full page as screenshot</Label>
              {actionData?.submissionErrors.fullPage
                ? actionData.submissionErrors.fullPage.map((error) => {
                    return (
                      <p key={error} className="text-destructive">
                        {error}
                      </p>
                    );
                  })
                : null}
            </div>
            <Button type="submit">Generate Screenshot</Button>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}

type FieldProps = {
  id?: string;
  labelProps: Omit<React.LabelHTMLAttributes<HTMLLabelElement>, "htmlFor">;
  inputProps: Omit<React.InputHTMLAttributes<HTMLInputElement>, "id">;
  errors?: Array<string>;
};

function Field({ inputProps, labelProps, id, errors }: FieldProps) {
  const idFromReact = useId();
  const fieldId = id || idFromReact;

  return (
    <div className="flex flex-col gap-y-2">
      <Label htmlFor={fieldId} {...labelProps} />
      <Input id={fieldId} {...inputProps} />
      {errors
        ? errors.map((error) => {
            return (
              <p key={error} className="text-destructive">
                {error}
              </p>
            );
          })
        : null}
    </div>
  );
}
