# Pocketbase+

Pocketbase is great as a backend, but why stopping here?
Programm like in PHP but with Javascript and a powerful backend named [Pocketbase](https://pocketbase.io/)
to power your next web-application.

Compiles html to an webserver powered by [Fastify](https://fastify.dev/).

## Requirements

- `python` for compiling the files
- `nodejs` for running the webserver produced
- `pocketbase` must be installed and run by you (for now)

## Process

- `build-server.sh` for building the web-server from the files
  - parses the file within www-folder
  - creates an node.js based server
  - includes public folder for static serving of images and co.
- `start-server.sh` for starting the built web-server

## TODO

- [ ] Markdown rendering

## Usage / Example

Put files into the `/www` folder to serve them with pocketbase+ features.
Static served files go into the `/public` folder.

Every file within your `/www` folder is going to be compiled and imbedded into the new generated webserver.
After your ran `./build-server.sh`, the generated server can be found under the `/target` folder.
To start the server, just enter `./start-server.sh` into your terminal.

On default it will run on `http://127.0.0.1:3000`, but you can customize this by configuring the `.env` file (Not yet implemented).

Rest-API
```json
<script pocketbase>
    if(!pb.authStore.isValid) {
        return 401;
    }

    const username = pb.authStore.model.username;
</script>

{
    "username": "<script pocketbase>echo(username);</script>"
}

```

HTML-Side
```html
<!DOCTYPE html>

<script pocketbase>
    if (!pb.authStore.isValid)
        return 401;
</script>

<html>
    <head>
        <title> <script pocketbase>
            const username = pb.authStore.model.username;
            echo(<h1>Hello ${username}!</h1>);
        </script> </title>
    </head>
</html>
```