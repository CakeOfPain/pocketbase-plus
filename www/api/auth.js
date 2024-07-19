
if(request.method !== "POST") {
    echo(JSON.stringify({
        "code": 400,
        "status": "Bad Request",
        "message": "Expected the method POST"
    }));
    reply.code(400);
    return;
}

const username = request.body.username;
const password = request.body.password;
const authData = await pb.collections("users").authWithPassword(username, password);