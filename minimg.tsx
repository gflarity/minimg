/** @jsxImportSource https://esm.sh/preact */

import { render } from "https://esm.sh/preact-render-to-string@5.2.6";
import { serve } from "https://deno.land/std@0.180.0/http/mod.ts";
import { contentType } from "https://deno.land/std@0.180.0/media_types/mod.ts";
import { dirname } from "https://deno.land/std@0.180.0/path/mod.ts";

const CWD = Deno.cwd();

// get the files in the CWD to viewed
const iter = Deno.readDir(CWD);

// turn AsyncIterable into an array
let dirEntries = [] as Deno.DirEntry[];
for await (const dirEntry of iter) {
  dirEntries.push(dirEntry);
}

// this is were the static route goes
const staticRoot = "/static/";

// filter any files that aren't .jpg
const files = dirEntries.filter((dirEntry) =>
  dirEntry.name.endsWith(".JPG") || dirEntry.name.endsWith(".jpg")
).map((dirEntry) => staticRoot + dirEntry.name);

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
      <title id="title"/>
      <style dangerouslySetInnerHTML={{ __html: style }}></style>
      <script dangerouslySetInnerHTML={{ __html: script }}></script>
    </head>
    <body>
      <img id="viewer" />
    </body>
  </html>,
);

// extensions load here
const extensionWorkers = Deno.args.map((value) => new Worker(new URL(value, import.meta.url).href, { type: "module" })) as Worker[]

// here's the request handler used by serve below
async function reqHandler(req: Request): Promise<Response> {
  const urlPath = new URL(req.url).pathname;

  if (urlPath === "/") {
    extensionWorkers.forEach((worker) => worker.postMessage({ url: req.url }));
    return new Response(indexBody, {
      headers: {
        "content-length": `${indexBody.length}`,
        "content-type": contentType("html"),
      },
    });
}

  // keyDownEvents from browser go here
  if (urlPath === "/keydown") { 
    // tell extensions about get down
    const formData =  Object.fromEntries(await req.formData());
    const file = new URL(formData!.src as string).pathname.replace("/static/", "");
    extensionWorkers.forEach((worker) => worker.postMessage({ url: req.url, file: file, key: formData.key }));
    // just a boring 200, the extension would have seen the keydown event and req with the key
    return new Response("");
  }

  if (urlPath.startsWith("/static/")) {
    const filePath = CWD + urlPath.replace("/static", ""); 

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
        "content-type": contentType(filePath) || "",
      },      
    });
  }

  return new Response(null, { status: 404 });
}

// start the service
serve(reqHandler, { port: 8080 });

// launch the browser
let command = [] as string[];
if (Deno.build.os == "darwin") {
  // this will open a new window with no ui
  command = [
    "open",
    "-na",
    "Google Chrome",
    "--args",
    "--new-window",
    "--app=http://localhost:8080",
  ];
} else if (Deno.build.os === "windows") {
  // open default browser
  command = ["explorer", "http://localhost:8080"];
}

await Deno.run({ cmd: command });
