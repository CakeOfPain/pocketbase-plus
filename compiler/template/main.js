// Import the framework and instantiate it
const Fastify = require("fastify");
const PocketBase = require("pocketbase/cjs");
const path = require("node:path");
const fs = require("node:fs");
const crypto = require("node:crypto");

const fastify = Fastify({
  logger: true,
});

fastify
  .register(require("@fastify/formbody"))
  .register(require("@fastify/static"), {
    root: path.join(__dirname, "public"),
    prefix: "/public/",
  })
  .register(require("fastify-markdown"), { data: true });

class Echo {
  constructor(echo) {
    this.echo = echo;

    // The handler for the proxy
    const handler = {
      apply: (target, thisArg, argumentsList) => {
        return target.apply(thisArg, argumentsList);
      },
      get: (target, prop) => {
        return target[prop].bind(target);
      },
    };

    // Creating a function that can be called directly
    const proxyFunction = (...args) => {
      return this.call(...args);
    };

    // Binding the methods of Echo to proxyFunction
    proxyFunction.call = this.call.bind(this);
    proxyFunction.table = this.table.bind(this);
    proxyFunction.mermaid = this.mermaid.bind(this);
    proxyFunction.form = this.form.bind(this);
    proxyFunction.banner = this.banner.bind(this);

    return new Proxy(proxyFunction, handler);
  }

  call(content) {
    this.echo(content);
  }

  table(data, keys, titles) {
    titles = titles ?? keys;
    data =
      data.length < 1
        ? [keys.reduce((a, v) => ({ ...a, [v]: "-" }), {})]
        : data;
    this.echo("|" + titles.join("|") + "|");
    this.echo("|" + titles.map((_) => "---").join("|") + "|");
    this.echo(
      data
        .map((item) => `|${keys.map((key) => item[key]).join("|")}|`)
        .join("\n")
    );
  }

  mermaid(code) {
    this.echo('<pre class="mermaid">');
    this.echo(code);
    this.echo("</pre>");
  }

  banner(type, message) {
    this.echo(`<div class="banner ${type}">${message}</div>`)
  }

  form(target, fields, options) {
    options = options ?? {
      method: "POST",
      submitMessage: "Submit",
    };
    const { method = "POST", submitMessage = "Submit" } = options;

    this.echo(`<div class="form-container">`);
    this.echo(`<form action="${target}" method="${method}">`);

    this.echo(`<div class="form-group-container">`);
    fields.forEach((field) => {
      const [name, type, placeholder, param, options = []] = field;
      this.echo(
        `<div class="form-group" ${
          type === "textarea" ? 'style="width: 100%"' : ""
        }>` + `<label for="${param}">${name}</label>`
      );

      switch (type) {
        case "textarea":
          this.echo(
            `<textarea id="${param}" name="${param}" placeholder="${placeholder}"></textarea>`
          );
          break;
        case "select":
          this.echo(
            `<select id="${param}" name="${param}">
              ${
                options.map(option => `<option value="${option[0]}">${option[1]}</option>`)
              }
            </select>`
          );
          break;
        default:
          this.echo(
            `<input type="${type}" id="${param}" name="${param}" placeholder="${placeholder}">`
          );
      }

      this.echo(`</div>`);
    });
    this.echo(`</div>`);

    this.echo(
      `<div class="form-button"><input type="submit" value="${submitMessage}"></div>`
    );

    this.echo("</form></div>");
  }
}

function responseBuilder(t, f, isMarkdown) {
  return async function (request, reply) {
    // Connecting to Pocketbase
    const pb = new PocketBase("http://127.0.0.1:8090");
    pb.authStore.loadFromCookie(request.headers.cookie);

    // Create Echo
    const echo = new Echo((html) => (content += html + "\n"));

    // Custom-Function
    let content = "";
    let statusCode = await f(pb, echo, request, reply);

    // Export cookies for Pocketbase
    const cookie = pb.authStore.exportToCookie();

    // Configure Reply
    if (cookie !== undefined) reply.header("Set-Cookie", cookie);
    if (statusCode !== undefined) reply.status(statusCode);
    reply.type(t);

    const componentRegex = /{{GET ([^\s]+?)\s*}}/;
    let foundComponent = content.match(componentRegex);
    while (foundComponent != null) {
      const path = foundComponent[1];
      const uuid = crypto.randomUUID();
      const componentLoaderScript = `
            <div id=${JSON.stringify(uuid)}></div>
            <script>
                fetch(${JSON.stringify(path)}).then(function(response) {
                    return response.text();
                }).then(function(content) {
                    const div = document.createElement('div');
                    div.innerHTML = content.trim();
                    document.getElementById(${JSON.stringify(
                      uuid
                    )}).replaceWith(div.firstChild);
                })
            </script>
            `;

      content = content.replace(foundComponent[0], componentLoaderScript);

      foundComponent = content.match(componentRegex);
    }

    // Return content
    if (isMarkdown) {
      function getTopHeading(markdown) {
        const headingRegex = /^# (.+)$/m;
        const match = markdown.match(headingRegex);
        return match ? match[1] : null;
      }

      const mdTemplate = fs.readFileSync(
        "./public/markdown-template.html",
        "utf8"
      );

      return mdTemplate
        .replace("{{#markdown}}", reply.markdown(content))
        .replace("{{#title}}", getTopHeading(content) ?? "Unnamed Page");
    }

    return content;
  };
}

/*{{Paths}}*/

// Run the server!
(async () => {
  try {
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
})();
