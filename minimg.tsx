/** @jsxImportSource https://esm.sh/preact */

import {render} from "https://esm.sh/preact-render-to-string@5.2.6";
import { serve } from "https://deno.land/std@0.180.0/http/mod.ts";
import { contentType }from "https://deno.land/std@0.180.0/media_types/mod.ts";
import { dirname } from "https://deno.land/std@0.180.0/path/mod.ts";

const BASE_PATH = Deno.cwd();

async function index(req: Request) {
  
  const iter = Deno.readDir(BASE_PATH);

  // turn AsyncIterable into an array
  let dirEntries = [] as Deno.DirEntry[];
  for await (const dirEntry of iter) {
    dirEntries.push(dirEntry);
  }

  // filter any files that aren't .jpg
  const files = dirEntries.filter((dirEntry) => dirEntry.name.endsWith(".JPG") ||  dirEntry.name.endsWith(".jpg")).map(dirEntry => dirEntry.name);

  // the location of the this tsx file
  const tsxPath = dirname(new URL(import.meta.url).pathname)

  // passing in the files by JSON without quotas
  const script = `
  let files = ${JSON.stringify(files)};
  ${await Deno.readTextFile(tsxPath + "/client.js")}
  `;

  const style = await Deno.readTextFile(tsxPath + "/style.css");

  const body = render(
    <html lang="en">
    <head>
      <title>title</title>
      <style dangerouslySetInnerHTML={{__html: style}}></style>
      <script dangerouslySetInnerHTML={{__html: script}}></script>
    </head>
    <body>
    <img id="viewer"/>
    </body>
  </html> 
  );

  return new Response(body, {
    headers: {
      "content-length": `${body.length}`,
      "content-type": contentType("html")
    },
  });
}

const reqHandler = async (req: Request) => {
  const filePath = BASE_PATH + new URL(req.url).pathname;

  if (filePath === BASE_PATH + "/") {

    return await index(req);
  }

  let fileSize;
  try {
    fileSize = (await Deno.stat(filePath)).size;
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      return new Response(null, { status: 404 });
    }
    return new Response(null, { status: 500 });
  }
  const body = (await Deno.open(filePath)).readable;
  return new Response(body, {
    headers: {
      "content-length": fileSize.toString(),
      "content-type": contentType(filePath) || ""
    },
  });
};

function launchChrome() {
  let command = [] as string[];
  if (Deno.build.os == "darwin") {
    // this will open a new window with no ui
    command = ["open", "-na", "Google Chrome", "--args", "--new-window", "--app=http://localhost:8080"];    
  } else if (Deno.build.os === "windows") {
    // open default browser
    command = ["explorer", "http://localhost:8080"]
  }
  
  return Deno.run({cmd: command});
}

const minimg = async () : Promise<void> => { 
  serve(reqHandler, { port: 8080 });
  await launchChrome().status();
}
export default minimg;
