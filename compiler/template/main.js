// Import the framework and instantiate it
const Fastify = require("fastify")
const PocketBase = require('pocketbase/cjs')
const path = require('node:path')
const crypto = require("node:crypto")

const fastify = Fastify({
    logger: true
})

fastify.register(require('@fastify/formbody'));

fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, 'public'),
    prefix: '/public/',
});

function responseBuilder(t, f) {
    return async function (request, reply) {
        // Connecting to Pocketbase
        const pb = new PocketBase("http://127.0.0.1:8090");
        pb.authStore.loadFromCookie(request.headers.cookie);

        // Custom-Function
        let content = "";
        let statusCode = await f(pb, (html) => content += html, request, reply);

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
                    document.getElementById(${JSON.stringify(uuid)}).replaceWith(div.firstChild);
                })
            </script>
            `;

            content = content.replace(foundComponent[0], componentLoaderScript);

            foundComponent = content.match(componentRegex);
        }


        // Return content
        return content;
    }
}

/*{{Paths}}*/

// Run the server!
(async () => {
    try {
        await fastify.listen({ port: 3000 })
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
})()
