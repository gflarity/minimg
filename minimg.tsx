/** @jsxImportSource https://esm.sh/preact */

import {render} from "https://esm.sh/preact-render-to-string@5.2.6";
import { serve } from "https://deno.land/std@0.180.0/http/mod.ts";
import { contentType }from "https://deno.land/std@0.180.0/media_types/mod.ts";
import { dirname } from "https://deno.land/std@0.180.0/path/mod.ts";

const CWD = Deno.cwd();

// get the files in the CWD to viewed
const iter = Deno.readDir(CWD);

// turn AsyncIterable into an array
let dirEntries = [] as Deno.DirEntry[];
for await (const dirEntry of iter) {
  dirEntries.push(dirEntry);
}

// filter any files that aren't .jpg
const files = dirEntries.filter((dirEntry) => dirEntry.name.endsWith(".JPG") ||  dirEntry.name.endsWith(".jpg")).map(dirEntry => dirEntry.name);

// the location of the this tsx file, we use readLinkSync incase it's a symlink
const tsxPath = dirname(new URL(import.meta.url).pathname);

// package the javascript and CSS into the HTML file to save precious milliseconds :)
const script = `
let files = ${JSON.stringify(files)};
${await Deno.readTextFile(tsxPath + "/client.js")}
`;
const style = await Deno.readTextFile(tsxPath + "/style.css");

// pre generate the index.html (/) as it never changes once launched
const indexBody = render(
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

// here's the request handler used by serve below
async function reqHandler(req: Request) {
  const filePath = CWD + new URL(req.url).pathname;

  if (filePath === CWD + "/") {
    return new Response(indexBody, {
      headers: {
        "content-length": `${indexBody.length}`,
        "content-type": contentType("html")
      },
    });
  }

  // if we're not serving static files, images probably
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
}

// start the service
serve(reqHandler, { port: 8080 });

// launch the browser
let command = [] as string[];
if (Deno.build.os == "darwin") {
  // this will open a new window with no ui
  command = ["open", "-na", "Google Chrome", "--args", "--new-window", "--app=http://localhost:8080"];    
} else if (Deno.build.os === "windows") {
  // open default browser
  command = ["explorer", "http://localhost:8080"]
}

await Deno.run({cmd: command});